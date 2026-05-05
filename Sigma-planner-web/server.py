import os
import re
import unicodedata
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from pymongo.collation import Collation
from bson import ObjectId

PORTFOLIO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app = Flask(__name__, static_folder=PORTFOLIO_DIR, static_url_path="")

MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://M10:TQJoYBfodCDAZWxF@cluster0.t74ecjo.mongodb.net/?appName=Cluster0")
MONGO_DB = os.environ.get("MONGO_DB", "Sigma-Planner")


def _get_db():
    client = MongoClient(MONGO_URI)
    return client, client[MONGO_DB]


def _to_jsonable(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, dict):
        return {k: _to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_to_jsonable(v) for v in obj]
    return obj


def _get_codigos_aprobados(aprobadas):
    codigos = set()
    for item in aprobadas or []:
        if not item:
            continue
        if isinstance(item, str):
            if " - " in item:
                codigos.add(item.split(" - ", 1)[0].strip())
            else:
                codigos.add(item.strip())
    return codigos


def _normalize(s):
    return "".join(ch for ch in str(s or "").lower() if ch.isalnum() or ch.isspace()).strip()

def _strip_accents(s):
    """Elimina tildes y diacríticos: 'ECONOMÍA' -> 'ECONOMIA'."""
    return "".join(
        ch for ch in unicodedata.normalize("NFD", str(s or ""))
        if unicodedata.category(ch) != "Mn"
    )

def _normalize_coll(s):
    """Normaliza para comparar nombre de carrera con nombre de colección.
    Elimina tildes, convierte a minúsculas, reemplaza guiones bajos por espacios.
    Ejemplo: '[00110]_ECONOMIA' -> '[00110] economia'
             '[00110] ECONOMÍA' -> '[00110] economia'
    """
    return _strip_accents(s).lower().replace("_", " ")

def _roman_to_int(token):
    roman_map = {"i": 1, "ii": 2, "iii": 3, "iv": 4, "v": 5, "vi": 6, "vii": 7, "viii": 8, "ix": 9, "x": 10}
    return roman_map.get(token.lower())


def _extract_level(nombre):
    for token in str(nombre or "").replace("-", " ").split():
        if token.isdigit():
            return token
        roman = _roman_to_int(token)
        if roman is not None:
            return str(roman)
    return ""


def _is_english_like(nombre):
    n = _normalize(nombre)
    return ("ingles" in n) or ("intensivo" in n) or ("virtual" in n)


def _approved_has_same_level(aprobadas, nombre):
    nivel = _extract_level(nombre)
    if not nivel:
        return False
    for item in aprobadas or []:
        if not item:
            continue
        # item can be "COD - Nombre" or just code/name
        if isinstance(item, str) and " - " in item:
            _, nom = item.split(" - ", 1)
        else:
            nom = item
        n = _normalize(nom)
        if ("ingles" in n) or ("intensivo" in n) or ("virtual" in n) or ("ing" in n):
            if f" {nivel}" in f" {n} ":
                return True
            # Try roman level in approved name
            roman_level = _roman_to_int(nivel)
            if roman_level is not None:
                if f" {roman_level}" in f" {n} ":
                    return True
    return False


def _has_english_approved(aprobadas):
    for item in aprobadas or []:
        raw = str(item or "")
        if not raw:
            continue
        norm = _normalize(raw)
        if any(token in norm for token in ("ingles", "intensivo", "virtual")):
            return True
        if "ing" in norm:
            return True
    return False


def _debug_preview(value, max_len=120):
    text = str(value or "")
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."


def _slug_token(value):
    text = _strip_accents(str(value or "")).upper()
    text = re.sub(r"[^A-Z0-9]+", "_", text)
    text = re.sub(r"_+", "_", text)
    return text.strip("_")


def _universidad_abbrev(fuente, universidad):
    fuente_key = str(fuente or "").strip().lower()
    if fuente_key == "unal":
        return "UNAL"
    if fuente_key == "udea":
        return "UDEA"
    uni_norm = _normalize_coll(universidad)
    if uni_norm in {"udea", "universidad de antioquia"}:
        return "UDEA"
    if uni_norm in {"unal", "universidad nacional"}:
        return "UNAL"
    return _slug_token(universidad)


def _sede_token(sede):
    text = _strip_accents(str(sede or "")).upper().strip()
    text = re.sub(r"^\d+\s+", "", text)
    text = re.sub(r"^SEDE\s+", "", text)
    return _slug_token(text)


def _split_carrera(carrera):
    text = str(carrera or "").strip()
    match = re.match(r"^\[?([A-Za-z0-9]+)\]?\s*(.*)$", text)
    if not match:
        return "", _slug_token(text)
    codigo = match.group(1).strip().upper()
    nombre = match.group(2).strip()
    nombre = re.sub(r"^[\-_:]+", "", nombre).strip()
    return codigo, _slug_token(nombre)


def _build_collection_name(fuente, universidad, sede, carrera):
    universidad_token = _universidad_abbrev(fuente, universidad)
    sede_value = _sede_token(sede)
    carrera_codigo, carrera_nombre = _split_carrera(carrera)
    parts = [universidad_token, sede_value, carrera_codigo, carrera_nombre]
    return "_".join(part for part in parts if part)


def _universidad_candidates(fuente, universidad):
    explicit = str(universidad or "").strip()
    if explicit:
        return [explicit]
    fuente_key = str(fuente or "").strip().lower()
    mapping = {
        "unal": ["UNAL", "Universidad Nacional"],
        "udea": ["UdeA", "UDEA", "Universidad de Antioquia"],
    }
    return mapping.get(fuente_key, [])


@app.route("/api/materias", methods=["POST"])
def api_materias():
    payload = request.get_json(silent=True) or {}
    carrera = (payload.get("carrera") or "").strip()
    fuente = (payload.get("fuente") or "").strip().lower()
    universidad = (payload.get("universidad") or "").strip()
    sede = (payload.get("sede") or "").strip()
    facultad = (payload.get("facultad") or "").strip()
    aprobadas = payload.get("aprobadas") or []
    historial = payload.get("historial")

    if not carrera:
        return jsonify({"error": "carrera requerida"}), 400

    print(
        "[api/materias] request "
        f"fuente={fuente!r} universidad={universidad!r} sede={sede!r} facultad={facultad!r} carrera={carrera!r} "
        f"aprobadas={len(aprobadas or [])} historial_len={len(str(historial or ''))}"
    )

    try:
        client, db = _get_db()
    except Exception as e:
        return jsonify({"error": f"No se pudo conectar a la base de datos: {e}"}), 503

    codigos_aprobados = _get_codigos_aprobados(aprobadas)
    has_english_approved = _has_english_approved(aprobadas)

    collection_name = _build_collection_name(fuente, universidad, sede, carrera)
    query = {}
    if codigos_aprobados:
        query["codigo"] = {"$nin": sorted(codigos_aprobados)}
    if has_english_approved:
        query.setdefault("$nor", []).append({"nombre": {"$regex": re.compile(r"(ingles|ingl[eé]s|intensivo|virtual)", re.IGNORECASE)}})

    collation = Collation(locale="es", strength=1)

    print(
        "[api/materias] mongo_query "
        f"db={db.name!r} collection={collection_name!r} query={_debug_preview(query)}"
    )

    resultados = []
    stats = {
        "docs_total": 0,
        "query_codigo_nin": len(codigos_aprobados),
        "query_english_excluded": int(has_english_approved),
        "docs_agregados": 0,
    }
    try:
        if not collection_name:
            return jsonify({"error": "No se pudo resolver la colección para la carrera seleccionada"}), 400
        if collection_name not in db.list_collection_names():
            print(f"[api/materias] collection_missing collection={collection_name!r}")
            return jsonify([])
        coll = db[collection_name]
        cursor = coll.find(query, projection=None, limit=10000, collation=collation)
        for doc in cursor:
            if not isinstance(doc, dict):
                continue
            stats["docs_total"] += 1
            nombre = doc.get("nombre") or doc.get("Nombre") or ""
            item = _to_jsonable(doc)
            tipologia = str(doc.get("tipologia", "")).strip().lower()
            item["obligatoria"] = "obligatoria" in tipologia
            if isinstance(item.get("grupos"), list):
                for grupo in item["grupos"]:
                    grupo["creditos"] = item.get("creditos", 0)
                    if isinstance(grupo.get("horarios"), list):
                        for horario in grupo["horarios"]:
                            horario["materia"] = item.get("nombre", nombre)
            resultados.append(item)
            stats["docs_agregados"] += 1
    finally:
        try:
            client.close()
        except Exception:
            pass

    print(
        "[api/materias] summary "
        f"docs_total={stats['docs_total']} "
        f"query_codigo_nin={stats['query_codigo_nin']} "
        f"query_english_excluded={stats['query_english_excluded']} "
        f"returned={stats['docs_agregados']}"
    )
    if not resultados:
        print(
            "[api/materias] empty_result "
            f"fuente={fuente!r} universidad={universidad!r} sede={sede!r} facultad={facultad!r} carrera={carrera!r} "
            f"collection={collection_name!r} query={_debug_preview(query)}"
        )

    return jsonify(resultados)


@app.route("/")
def index():
    return send_from_directory(PORTFOLIO_DIR, "index.html")


@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(PORTFOLIO_DIR, path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)

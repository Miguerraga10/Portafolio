const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || '';
const MONGO_DB = process.env.MONGO_DB || 'Sigma-Planner';

let cachedClientPromise;

function getDb() {
  if (!MONGO_URI) {
    throw new Error('Falta la variable de entorno MONGO_URI');
  }

  if (!cachedClientPromise) {
    cachedClientPromise = MongoClient.connect(MONGO_URI);
  }

  return cachedClientPromise.then((client) => ({ client, db: client.db(MONGO_DB) }));
}

function toJsonable(value) {
  if (value instanceof ObjectId) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(toJsonable);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, toJsonable(nested)]));
  }
  return value;
}

function getCodigosAprobados(aprobadas) {
  const codigos = new Set();
  for (const item of aprobadas || []) {
    if (!item || typeof item !== 'string') {
      continue;
    }
    if (item.includes(' - ')) {
      codigos.add(item.split(' - ', 1)[0].trim());
    } else {
      codigos.add(item.trim());
    }
  }
  return codigos;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .split('')
    .filter((char) => /[\p{L}\p{N}\s]/u.test(char))
    .join('')
    .trim();
}

function stripAccents(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function normalizeColl(value) {
  return stripAccents(value).toLowerCase().replace(/_/g, ' ');
}

function romanToInt(token) {
  const romanMap = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
    x: 10,
  };
  return romanMap[String(token || '').toLowerCase()];
}

function extractLevel(nombre) {
  for (const token of String(nombre || '').replace(/-/g, ' ').split(/\s+/)) {
    if (/^\d+$/.test(token)) {
      return token;
    }
    const roman = romanToInt(token);
    if (roman !== undefined) {
      return String(roman);
    }
  }
  return '';
}

function approvedHasSameLevel(aprobadas, nombre) {
  const nivel = extractLevel(nombre);
  if (!nivel) {
    return false;
  }

  for (const item of aprobadas || []) {
    if (!item) {
      continue;
    }
    const nombreMateria = typeof item === 'string' && item.includes(' - ')
      ? item.split(' - ', 2)[1]
      : item;
    const normalized = normalize(nombreMateria);
    if (/(ingles|intensivo|virtual|ing)/.test(normalized)) {
      if (new RegExp(`(^|\\s)${nivel}(\\s|$)`).test(normalized)) {
        return true;
      }
      const romanLevel = romanToInt(nivel);
      if (romanLevel !== undefined && new RegExp(`(^|\\s)${romanLevel}(\\s|$)`).test(normalized)) {
        return true;
      }
    }
  }

  return false;
}

function hasEnglishApproved(aprobadas) {
  for (const item of aprobadas || []) {
    const normalized = normalize(item);
    if (/(ingles|intensivo|virtual|ing)/.test(normalized)) {
      return true;
    }
  }
  return false;
}

function debugPreview(value, maxLen = 120) {
  const text = String(value || '');
  if (text.length <= maxLen) {
    return text;
  }
  return `${text.slice(0, maxLen - 3)}...`;
}

function slugToken(value) {
  return stripAccents(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function universidadAbbrev(fuente, universidad) {
  const fuenteKey = String(fuente || '').trim().toLowerCase();
  if (fuenteKey === 'unal') {
    return 'UNAL';
  }
  if (fuenteKey === 'udea') {
    return 'UDEA';
  }

  const uniNorm = normalizeColl(universidad);
  if (['udea', 'universidad de antioquia'].includes(uniNorm)) {
    return 'UDEA';
  }
  if (['unal', 'universidad nacional'].includes(uniNorm)) {
    return 'UNAL';
  }
  return slugToken(universidad);
}

function sedeToken(sede) {
  return stripAccents(sede)
    .toUpperCase()
    .trim()
    .replace(/^\d+\s+/, '')
    .replace(/^SEDE\s+/, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function splitCarrera(carrera) {
  const text = String(carrera || '').trim();
  const match = text.match(/^\[?([A-Za-z0-9]+)\]?\s*(.*)$/);
  if (!match) {
    return ['', slugToken(text)];
  }
  const codigo = match[1].trim().toUpperCase();
  const nombre = match[2].trim().replace(/^[\-_:]+/, '').trim();
  return [codigo, slugToken(nombre)];
}

function buildCollectionName(fuente, universidad, sede, carrera) {
  const universidadToken = universidadAbbrev(fuente, universidad);
  const sedeValue = sedeToken(sede);
  const [carreraCodigo, carreraNombre] = splitCarrera(carrera);
  return [universidadToken, sedeValue, carreraCodigo, carreraNombre].filter(Boolean).join('_');
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        allow: 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Metodo no permitido' });
  }

  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (_error) {
    return json(400, { error: 'JSON invalido' });
  }

  const carrera = String(payload.carrera || '').trim();
  const fuente = String(payload.fuente || '').trim().toLowerCase();
  const universidad = String(payload.universidad || '').trim();
  const sede = String(payload.sede || '').trim();
  const facultad = String(payload.facultad || '').trim();
  const aprobadas = Array.isArray(payload.aprobadas) ? payload.aprobadas : [];
  const historial = payload.historial;

  if (!carrera) {
    return json(400, { error: 'carrera requerida' });
  }

  console.log(
    '[api/materias] request',
    JSON.stringify({
      fuente,
      universidad,
      sede,
      facultad,
      carrera,
      aprobadas: aprobadas.length,
      historialLen: String(historial || '').length,
    })
  );

  let db;
  try {
    ({ db } = await getDb());
  } catch (error) {
    return json(503, { error: `No se pudo conectar a la base de datos: ${error.message}` });
  }

  const codigosAprobados = getCodigosAprobados(aprobadas);
  const hasEnglish = hasEnglishApproved(aprobadas);
  const collectionName = buildCollectionName(fuente, universidad, sede, carrera);
  const query = {};

  if (codigosAprobados.size) {
    query.codigo = { $nin: [...codigosAprobados].sort() };
  }
  if (hasEnglish) {
    query.$nor = [
      { nombre: { $regex: /(ingles|ingl[eé]s|intensivo|virtual)/i } },
    ];
  }

  console.log(
    '[api/materias] mongo_query',
    JSON.stringify({
      db: MONGO_DB,
      collection: collectionName,
      query: debugPreview(JSON.stringify(query)),
    })
  );

  const stats = {
    docsTotal: 0,
    queryCodigoNin: codigosAprobados.size,
    queryEnglishExcluded: Number(hasEnglish),
    docsAgregados: 0,
  };

  try {
    if (!collectionName) {
      return json(400, { error: 'No se pudo resolver la colección para la carrera seleccionada' });
    }

    const collectionExists = await db.listCollections({ name: collectionName }, { nameOnly: true }).hasNext();
    if (!collectionExists) {
      console.log('[api/materias] collection_missing', collectionName);
      return json(200, []);
    }

    const cursor = db.collection(collectionName).find(query, {
      limit: 10000,
      collation: { locale: 'es', strength: 1 },
    });

    const resultados = [];
    for await (const doc of cursor) {
      if (!doc || typeof doc !== 'object') {
        continue;
      }
      stats.docsTotal += 1;
      const nombre = doc.nombre || doc.Nombre || '';
      const item = toJsonable(doc);
      const tipologia = String(doc.tipologia || '').trim().toLowerCase();
      item.obligatoria = tipologia.includes('obligatoria');

      if (approvedHasSameLevel(aprobadas, nombre) && /(ingles|intensivo|virtual)/i.test(normalize(nombre))) {
        continue;
      }

      if (Array.isArray(item.grupos)) {
        for (const grupo of item.grupos) {
          grupo.creditos = item.creditos || 0;
          if (Array.isArray(grupo.horarios)) {
            for (const horario of grupo.horarios) {
              horario.materia = item.nombre || nombre;
            }
          }
        }
      }

      resultados.push(item);
      stats.docsAgregados += 1;
    }

    console.log('[api/materias] summary', JSON.stringify(stats));
    if (!resultados.length) {
      console.log(
        '[api/materias] empty_result',
        JSON.stringify({ fuente, universidad, sede, facultad, carrera, collection: collectionName, query })
      );
    }

    return json(200, resultados);
  } catch (error) {
    return json(500, { error: `Error consultando materias: ${error.message}` });
  }
};
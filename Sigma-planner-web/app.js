// Sigma Planner — app.js
// Implementa una versión del planificador en JS y usa Web Workers para paralelizar

// Cargaremos el scheduler dinámicamente para capturar y mostrar errores de carga
let generarHorarioOptimoJS = null;

const API_BASE = (localStorage.getItem('api_base') || window.location.origin).replace(/\/$/, '');

function hashString(s){
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++){
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

function cacheKeyForMaterias(fuente, carrera, aprobadas, historial){
  const base = `${fuente || 'na'}:${carrera || 'na'}`;
  const ap = Array.isArray(aprobadas) ? aprobadas.slice().sort().join('|') : '';
  const hist = historial ? hashString(historial) : '';
  return `cache:materias:${base}:${ap}:${hist}`;
}

function fuenteToUniversidad(fuente){
  const key = String(fuente || '').trim().toLowerCase();
  if (key === 'unal') return 'UNAL';
  if (key === 'udea') return 'UdeA';
  return '';
}

function normalizeFuenteKey(value){
  const key = String(value || '').trim().toLowerCase();
  if (key === 'universidad nacional' || key === 'unal') return 'unal';
  if (key === 'universidad de antioquia' || key === 'udea') return 'udea';
  return key;
}

async function fetchMateriasFromApi({fuente, universidad, sede, facultad, carrera, aprobadas, historial}){
  const url = `${API_BASE}/api/materias`;
  const body = {
    carrera,
    aprobadas: aprobadas || [],
    fuente: fuente || '',
    universidad: universidad || fuenteToUniversidad(fuente),
    sede: sede || '',
    facultad: facultad || '',
    historial: historial || ''
  };
  console.warn('[fetchMateriasFromApi] request', { url, fuente, universidad: body.universidad, sede: body.sede, facultad: body.facultad, carrera, aprobadas: (aprobadas || []).length, historialLen: String(historial || '').length });
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const errorBody = await res.json();
      if (errorBody && typeof errorBody.error === 'string' && errorBody.error.trim()) {
        errorMessage = errorBody.error.trim();
      }
    } catch (_error) {
      try {
        const errorText = await res.text();
        if (errorText && errorText.trim()) {
          errorMessage = errorText.trim();
        }
      } catch (_textError) {}
    }
    throw new Error(errorMessage);
  }
  const data = await res.json();
  console.warn('[fetchMateriasFromApi] response', { fuente, universidad: body.universidad, sede: body.sede, facultad: body.facultad, carrera, total: Array.isArray(data) ? data.length : -1 });
  return { data, fromCache: false };
}

function readFileAsText(file){
  return new Promise((res,rej)=>{
    const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsText(file);
  });
}

console.log('app.js module executing');
// Fallback handler expuesto inmediatamente para que el botón inline siempre invoque algo
try{ window.processTextHandler = function(){ console.log('processTextHandler fallback: aún no inicializado.'); }; }catch(_){ }
window.addEventListener('error', (e)=>{
  try{ if (errorsEl) { errorsEl.classList.remove('hidden'); errorsEl.classList.add('error'); errorsEl.textContent = 'Runtime error: '+(e.message||e.toString()); } }catch(_){ }
  console.error('Runtime error', e);
});

// Clases ligeras (plain objects sufficient)

function cartesian(arrays){
  return arrays.reduce((a,b)=> a.flatMap(x=> b.map(y=> x.concat([y]))), [[]]);
}

function combinations(arr, k){
  const res=[];
  function helper(start, cur){
    if (cur.length===k){ res.push(cur.slice()); return; }
    for(let i=start;i<arr.length;i++){ cur.push(arr[i]); helper(i+1,cur); cur.pop(); }
  }
  helper(0,[]); return res;
}

// Parseador de texto plano inspirado en Metodos.extraer_informacion (UNAL / UdeA)
function parsePlainTextMaterias(text, universidad){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const uni = (universidad||'').toString().toLowerCase();

  if (uni === 'udea'){
    const reNombreMateria = /Materia: \[\d+\] (.+)/;
    const reGrupo = /GRUPO: (\d+)/;
    const reHorario = /HORARIO: (.+)/;
    const reCupos = /CUPO MÁXIMO: \d+\. CUPO DISPONIBLE: (\d+)/;

    let nombreMateria = null;
    for (const linea of lines) {
      const matchNombre = linea.match(reNombreMateria);
      if (matchNombre) {
        nombreMateria = matchNombre[1].trim();
        break;
      }
      if (linea === linea.toUpperCase() && !reGrupo.test(linea) && !reHorario.test(linea) && linea.length > 3) {
        nombreMateria = linea.trim();
        break;
      }
    }
        if (!nombreMateria){
          return [];
        }

    const grupos = [];
    let grupo_actual = null;
    let clases_actuales = [];
    let cupos_disponibles = 0;

    const dividirClaseUdea = (horario) => {
      const dias = {"L": "LUNES", "M": "MARTES", "W": "MIÉRCOLES", "J": "JUEVES", "V": "VIERNES", "S": "SÁBADO", "D": "DOMINGO"};
      const resultado = [];
      const diasHoras = horario.match(/([LMJWVS]+)(\d+)-(\d+)/);
      if (diasHoras) {
        const [, grupo_dias, inicio, fin] = diasHoras;
        const inicioF = `${parseInt(inicio, 10).toString().padStart(2, '0')}:00`;
        const finF = `${parseInt(fin, 10).toString().padStart(2, '0')}:00`;
        for (const letra_dia of grupo_dias) {
          resultado.push({ dia: dias[letra_dia], inicio: inicioF, fin: finF, lugar: "UdeA" });
        }
      }
      return resultado;
    };

    for (const linea of lines) {
      const match_grupo = linea.match(reGrupo);
      if (match_grupo) {
        if (grupo_actual !== null) {
          grupos.push({
            grupo: `Grupo ${grupo_actual}`,
            horarios: clases_actuales,
            creditos: 0,
            cupos: cupos_disponibles,
            profesor: "NO DISPONIBLE",
          });
        }
        grupo_actual = parseInt(match_grupo[1], 10);
        clases_actuales = [];
        cupos_disponibles = 0;
        continue;
      }
      const match_horario = linea.match(reHorario);
      if (match_horario) {
        const horarios = match_horario[1].split(";");
        for (const horario of horarios) {
          const clases_divididas = dividirClaseUdea(horario.trim());
          for (const clase of clases_divididas) {
            clases_actuales.push({ nombre: nombreMateria, dia: clase.dia, hora_inicio: clase.inicio, hora_fin: clase.fin, lugar: clase.lugar });
          }
        }
        continue;
      }
      const match_cupos = linea.match(reCupos);
      if (match_cupos) {
        cupos_disponibles = parseInt(match_cupos[1], 10);
      }
    }

    if (grupo_actual !== null) {
      grupos.push({
        grupo: `Grupo ${grupo_actual}`,
        horarios: clases_actuales,
        creditos: 0,
        cupos: cupos_disponibles,
        profesor: "NO DISPONIBLE",
      });
    }

    return [{
      nombre: nombreMateria,
      codigo: "UdeA",
      creditos: 3,
      obligatoria: false,
      grupos: grupos,
    }];
  }

  if (uni === 'unal'){
  const nombre = lines[0].replace(/\s?\(.*\)\s?/, '').trim();
  const codigoMatch = lines[0].match(/\(([^)]+)\)/);
  const codigo = codigoMatch ? codigoMatch[1] : '';
  let creditos = 0;
  let facultad = '';
  let carrera = '';
  let tipologia = '';

  const grupos = [];
  let grupo_actual = null;
  let horarios_actuales = [];
  let cupos_actual = 0;
  let profesor_actual = '';
  let duracion_actual = '';
  let jornada_actual = '';
  let historial = '';

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^créditos:/i.test(l)) {
      const m = l.match(/(\d+)/);
      if (m) creditos = parseInt(m[1], 10);
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !/^(facultad|clase|\(|tipología|créditos|fecha|profesor|duración|jornada|cupos|prerrequisitos)/i.test(nextLine)) {
          carrera = nextLine;
        }
      }
    } else if (/^tipología:/i.test(l)) {
      tipologia = l.split(':')[1].trim();
    } else if (/^facultad:/i.test(l)) {
      facultad = l.split(':')[1].trim();
    } else if (/^\(\d+\)\s*(GRUPO|Grupo)/i.test(l)) {
      if (grupo_actual !== null) {
        grupos.push({ grupo: grupo_actual, cupos: cupos_actual, horarios: horarios_actuales, creditos: creditos, profesor: profesor_actual, duracion: duracion_actual, jornada: jornada_actual });
      }
      const m = l.match(/\((\d+)\)/);
      grupo_actual = m ? `Grupo ${l.split('Grupo')[1].trim() || m[1]}` : `Grupo ${grupos.length + 1}`;
      horarios_actuales = [];
      cupos_actual = 0;
      profesor_actual = '';
      duracion_actual = '';
      jornada_actual = '';
    } else if (/^profesor:/i.test(l)) {
      profesor_actual = (l.split(':', 2)[1] || '').trim().replace(/\.+$/, '');
    } else if (/^duración:/i.test(l)) {
      duracion_actual = l.split(':')[1].trim();
    } else if (/^jornada:/i.test(l)) {
      jornada_actual = l.split(':')[1].trim();
    } else if (/^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i.test(l)) {
      const mhor = l.match(/^(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\s+de\s+(\d{2}:\d{2})\s+a\s+(\d{2}:\d{2})/i);
      if (mhor) {
        const [, dia, inicio, fin] = mhor;
        let lugar = '';
        let j = i + 1;
        while (j < lines.length) {
          const sig = lines[j].trim();
          if (/(bloque|aula|sala|salón)/i.test(sig)) {
            lugar = sig.replace(/\.+$/, '');
            j++;
          } else {
            break;
          }
        }
        horarios_actuales.push({ hora_inicio: inicio, hora_fin: fin, dia: dia.toUpperCase(), lugar: lugar });
      }
    } else if (/cupos disponibles:/i.test(l)) {
      const m = l.match(/(\d+)/);
      if (m) cupos_actual = parseInt(m[1], 10);
    }
  }

  if (grupo_actual !== null) {
    grupos.push({ grupo: grupo_actual, cupos: cupos_actual, horarios: horarios_actuales, creditos: creditos, profesor: profesor_actual, duracion: duracion_actual, jornada: jornada_actual });
  }
    
  if (!grupos.length && horarios_actuales.length > 0) {
    grupos.push({ grupo: 'Grupo 1', cupos: cupos_actual, horarios: horarios_actuales, creditos: creditos, profesor: profesor_actual, duracion: duracion_actual, jornada: jornada_actual });
  }

    return [{ nombre, codigo, creditos, facultad, carrera, tipologia, obligatoria: !/optativa|libre/i.test(tipologia), grupos }];
  }
  return [];
}

async function processTextHandlerGlobal(){
  const materiasTextInput = document.getElementById('materiasText');
  const universidadSelect = document.getElementById('universidadSelect');
  const statusEl = document.getElementById('status') || { textContent: '', innerHTML: '', classList: { add: ()=>{}, remove: ()=>{} }, style: {} };
  const errorsEl = document.getElementById('errors');
  if (!materiasTextInput || !universidadSelect){
  console.warn('No se encontraron elementos de UI para procesar texto.');
  if (errorsEl){ errorsEl.classList.remove('hidden'); errorsEl.classList.add('error'); errorsEl.textContent = 'No se pudo inicializar la UI para procesar el texto.'; }
  return;
  }
  let uni = universidadSelect.value || '';
  const raw = materiasTextInput.value || '';
  if (!uni){ statusEl.textContent = 'Selecciona la universidad antes de procesar el texto.'; return; }
  if (!raw.trim()){ statusEl.textContent = 'Pega el contenido de materias antes de procesar.'; return; }
  statusEl.textContent = 'Procesando texto...';
  try{
  let parsed = null;
  try{ parsed = JSON.parse(raw); }
  catch(e){
    const m = raw.match(/(\[\s*\{[\s\S]*\}\s*\])/m);
    if (m && m[1]) parsed = JSON.parse(m[1]);
  }
  let materias = [];
  if (parsed){
    const mapOptions = { fuente: normalizeFuenteKey(uni) };
    if (Array.isArray(parsed)) materias = mapRepoMaterias(parsed, mapOptions);
    else if (parsed.materias && Array.isArray(parsed.materias)) materias = mapRepoMaterias(parsed.materias, mapOptions);
    else {
    const arr = Object.values(parsed).find(v=> Array.isArray(v) && v.length && typeof v[0] === 'object');
    if (arr) materias = mapRepoMaterias(arr, mapOptions);
    else materias = mapRepoMaterias([parsed], mapOptions);
    }
    applyDefaultExcludedGroupsForFuente(materias, mapOptions.fuente);
  } else {
    let uniKey = (uni||'').toString();
    if (uniKey.toLowerCase() === 'unal') uniKey = 'UNAL';
    else if (uniKey.toLowerCase() === 'udea') uniKey = 'UdeA';
    let materiasPlain = [];
    try{ materiasPlain = parsePlainTextMaterias(raw, uniKey); }
    catch(e){ console.error('parsePlainTextMaterias threw', e); materiasPlain = []; }
    if (materiasPlain && materiasPlain.length){
      const sourceKey = normalizeFuenteKey(uniKey);
      materias = mapRepoMaterias(materiasPlain, { fuente: sourceKey });
      applyDefaultExcludedGroupsForFuente(materias, sourceKey);
    }
    else {
    if (errorsEl){ errorsEl.classList.remove('hidden'); errorsEl.classList.add('error'); errorsEl.textContent = 'No se extrajeron materias del texto pegado. Asegúrate de seleccionar la universidad correcta y pegar el bloque de la materia completo.'; }
    throw new Error('No se pudo parsear el texto como JSON ni como texto plano reconocido.');
    }
  }
  const manualTagged = (materias||[]).map(m=> ({...m, __manual: true}));
  const existingManual = window.__manualCache || loadManualMateriasCache();
  const mergedManual = mergeMateriasLists(existingManual, manualTagged);
  saveManualMateriasCache(mergedManual);
  window.__manualCache = mergedManual;
  window.__hasManualCache = mergedManual.length > 0;

  window.__lastLoaded = mergeMateriasLists(window.__lastLoaded || [], manualTagged);
  window.__lastLoadedFiltered = (window.__lastLoadedFiltered || []).filter(x => !manualTagged.some(m => m.nombre === x.nombre));
  if (typeof window.renderLoadedMaterias === 'function') window.renderLoadedMaterias();
  else renderLoadedMateriasCommon();
  try{ materiasTextInput.value = ''; materiasTextInput.focus(); }catch(_){ }
  if (errorsEl){ errorsEl.classList.add('hidden'); errorsEl.classList.remove('error'); errorsEl.textContent = ''; }
  statusEl.textContent = `Texto procesado: ${materias.length} materias.`;
  }catch(err){
  statusEl.textContent = 'Error procesando texto: '+(err && err.message?err.message:String(err));
  showError('Error procesando texto de materias', err);
  }
}

try{ window.processTextHandler = processTextHandlerGlobal; }catch(_){ }

function loadExcludedGruposCache(){
  try{ const raw=localStorage.getItem('excluded_grupos'); if(!raw) return {}; const d=JSON.parse(raw); const out={}; for(const k of Object.keys(d||{})){ out[k]=new Set(d[k]||[]); } return out; }catch(_){ return {}; }
}
function saveExcludedGruposCache(){
  try{ const out={}; const eg=window.__excludedGrupos||{}; for(const k of Object.keys(eg)){ out[k]=Array.from(eg[k]||[]); } localStorage.setItem('excluded_grupos', JSON.stringify(out)); }catch(_){ }
}
function isGrupoExcluded(materiaNombre, grupoKey){
  const eg=window.__excludedGrupos; return !!(eg && eg[materiaNombre] && eg[materiaNombre].has(grupoKey));
}
function toggleGrupoExcluded(materiaNombre, grupoKey){
  if(!window.__excludedGrupos) window.__excludedGrupos={};
  if(!window.__excludedGrupos[materiaNombre]) window.__excludedGrupos[materiaNombre]=new Set();
  const s=window.__excludedGrupos[materiaNombre];
  if(s.has(grupoKey)) s.delete(grupoKey); else s.add(grupoKey);
  saveExcludedGruposCache();
}

function resetCompactMateriaView(){
  window.__expandedMaterias = new Set();
  window.__expandedSelected = new Set();
  window.__resetCollapsedMateriaFolders = true;
}

function getDefaultUnalExcludedGroupKeys(materia){
  const grupos = Array.isArray(materia && materia.grupos) ? materia.grupos : [];
  const cutoffIndex = grupos.findIndex(grupo => {
    const digits = String(grupo && grupo.grupo ? grupo.grupo : '').match(/\d+/);
    return !!(digits && digits[0] && digits[0].startsWith('0'));
  });
  if (cutoffIndex === -1) return [];
  return grupos.slice(cutoffIndex).map(grupo => grupo && grupo.grupo).filter(Boolean);
}

function applyDefaultExcludedGroupsForFuente(materias, fuente){
  if (normalizeFuenteKey(fuente) !== 'unal') return;
  if (!window.__excludedGrupos) window.__excludedGrupos = loadExcludedGruposCache();
  let changed = false;
  for (const materia of (materias || [])){
    if (!materia || !materia.nombre) continue;
    const defaultExcluded = getDefaultUnalExcludedGroupKeys(materia);
    if (!defaultExcluded.length) continue;
    if (!window.__excludedGrupos[materia.nombre]) window.__excludedGrupos[materia.nombre] = new Set();
    const excludedSet = window.__excludedGrupos[materia.nombre];
    for (const grupoKey of defaultExcluded){
      if (!excludedSet.has(grupoKey)){
        excludedSet.add(grupoKey);
        changed = true;
      }
      if (window.__currentScheduleSelections && window.__currentScheduleSelections[materia.nombre] === grupoKey){
        delete window.__currentScheduleSelections[materia.nombre];
      }
    }
  }
  if (changed) saveExcludedGruposCache();
}

function computeOccupiedSlots(groupObjects){
  const slots={};
  for(const g of groupObjects){
    for(const clase of(g.horarios||[])){
      const dia=(clase.dia||'').toUpperCase();
      if(!slots[dia]) slots[dia]=new Set();
      const h0=parseInt((clase.hora_inicio||clase.inicio||'00:00').split(':')[0],10);
      const h1=parseInt((clase.hora_fin||clase.fin||'00:00').split(':')[0],10);
      for(let h=h0;h<h1;h++) slots[dia].add(`${String(h).padStart(2,'0')}:00`);
    }
  }
  return slots;
}

function groupConflictsWithSlots(group,slots){
  for(const clase of(group.horarios||[])){
    const dia=(clase.dia||'').toUpperCase();
    if(!slots[dia]) continue;
    const h0=parseInt((clase.hora_inicio||clase.inicio||'00:00').split(':')[0],10);
    const h1=parseInt((clase.hora_fin||clase.fin||'00:00').split(':')[0],10);
    for(let h=h0;h<h1;h++){
      if(slots[dia].has(`${String(h).padStart(2,'0')}:00`)) return true;
    }
  }
  return false;
}

function getCurrentSelectedGroupObjects(excludeMateriaNombre){
  const sels=window.__currentScheduleSelections||{};
  const result=[];
  for(const mat of(window.__lastLoaded||[])){
    if(mat.nombre===excludeMateriaNombre) continue;
    const key=sels[mat.nombre];
    if(!key) continue;
    const g=(mat.grupos||[]).find(gr=>(gr.grupo||'')=== key);
    if(g) result.push(g);
  }
  return result;
}

function updateScheduleWithNewSelection(){
  const newComb=[];
  const selectedUniverse = mergeMateriasLists(window.__lastLoaded || [], window.__lastLoadedFiltered || []);
  for(const mat of selectedUniverse){
    const selKey=(window.__currentScheduleSelections||{})[mat.nombre];
    if(!selKey) continue;
    const grp=(mat.grupos||[]).find(gr=>(gr.grupo||'')=== selKey);
    if(grp) newComb.push({...grp,materiaNombre:mat.nombre});
  }

  const hasMarkedMaterias = selectedUniverse.length > 0;
  let activeTab=(window.__scheduleTabs||[]).find(t=>t.id===window.__activeScheduleId);

  if (!activeTab && hasMarkedMaterias){
    const tabs = window.__scheduleTabs || [];
    const id = `tab-${Date.now()}-${Math.random().toString(16).slice(2,6)}`;
    activeTab = {
      id,
      label: `Horario ${tabs.length + 1}`,
      best: { horarioMap: null, materias: [], comb: [], total_materias: 0, creditos: 0 },
      customComb: [],
      opts: null,
      createdAt: Date.now(),
      __auto: false
    };
    tabs.push(activeTab);
    window.__scheduleTabs = tabs;
    window.__activeScheduleId = id;
  }

  if (!activeTab){
    try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest({ materias: [] }); }catch(_){ }
    return;
  }

  if (!activeTab.best){
    activeTab.best = { horarioMap: null, materias: [], comb: [], total_materias: 0, creditos: 0 };
  }

  activeTab.customComb = newComb;
  saveScheduleTabsCache(window.__scheduleTabs,window.__activeScheduleId);
  const resultEl = document.getElementById('result');
  if (resultEl && hasMarkedMaterias) resultEl.classList.remove('hidden');
  if (typeof window.__renderScheduleTabUI === 'function') window.__renderScheduleTabUI();
  const renderableBest = getRenderableScheduleBest(activeTab);
  try{ renderScheduleSVG(renderableBest,activeTab.opts||{}); }catch(_){ }
  try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest(renderableBest); }catch(_){ }
}

function getRenderableScheduleBest(tab){
  if (!tab || !tab.best) return null;
  if (!Array.isArray(tab.customComb)) return tab.best;
  return { ...tab.best, comb: tab.customComb };
}

function resultRespectsSchedulerLimits(result, opts){
  if (!result || !opts) return false;

  const comb = Array.isArray(result.comb) ? result.comb : [];
  const totalMaterias = comb.length || Number(result.total_materias) || 0;
  const creditos = comb.length
    ? comb.reduce((sum, group) => sum + (Number(group && group.creditos) || 0), 0)
    : (Number(result.creditos) || 0);
  const dias = result.horarioMap && result.horarioMap.dias
    ? Object.keys(result.horarioMap.dias).filter(day => {
        const slots = result.horarioMap.dias[day];
        return slots && Object.keys(slots).length > 0;
      }).length
    : null;

  if (totalMaterias > opts.maxmaterias) return false;
  if (creditos > opts.maxcreditos) return false;
  if (dias != null && dias > opts.maxdias) return false;
  return true;
}

function sanitizeScheduleTabs(tabs){
  return (Array.isArray(tabs) ? tabs : []).filter(tab => {
    if (!tab || !tab.best) return !!tab;
    return resultRespectsSchedulerLimits(tab.best, tab.opts || {});
  });
}

function syncQuickMateriaSelection(items, options = {}){
  const { deselect = false, label = 'materias' } = options;
  const currentFiltered = window.__lastLoadedFiltered || [];
  const byKey = new Map(currentFiltered.map(item => [getMateriaKey(item), item]));
  let changed = false;

  if (deselect){
    for (const item of items || []){
      const key = getMateriaKey(item);
      if (!byKey.has(key)) continue;
      byKey.delete(key);
      if (window.__currentScheduleSelections && window.__currentScheduleSelections[item.nombre]){
        delete window.__currentScheduleSelections[item.nombre];
      }
      changed = true;
    }
    window.__lastLoadedFiltered = Array.from(byKey.values());
    if (changed) updateScheduleWithNewSelection();
    return { changed, limited: false };
  }

  for (const item of items || []){
    const key = getMateriaKey(item);
    if (byKey.has(key)) continue;
    byKey.set(key, item);
    changed = true;
  }

  window.__lastLoadedFiltered = Array.from(byKey.values());
  return { changed, limited: false };
}

function renderLoadedMateriasCommon(){
  const loadedEl = document.getElementById('loadedMaterias');
  const selectedAnalysisCountEl = document.getElementById('selectedAnalysisCount');
  if (!loadedEl) return;
  const list = window.__lastLoaded || [];
  const selectedCount = Array.isArray(window.__lastLoadedFiltered) ? window.__lastLoadedFiltered.length : 0;
  if (selectedAnalysisCountEl){
    selectedAnalysisCountEl.textContent = `${selectedCount} seleccionadas`;
    selectedAnalysisCountEl.classList.remove('is-limit');
  }
  if (!list || list.length===0){ loadedEl.innerHTML = '<div class="muted">No hay materias cargadas.</div>'; return; }
  if (!window.__lastLoadedFiltered) window.__lastLoadedFiltered = [];
  if (!window.__expandedMaterias) window.__expandedMaterias = new Set();
  if (!window.__excludedGrupos) window.__excludedGrupos = loadExcludedGruposCache();
  loadedEl.innerHTML = '';
  // Sort: materias con grupo seleccionado van primero
  const sels = window.__currentScheduleSelections || {};
  const sortedList = list.slice().sort((a,b)=>{
    if (Object.keys(sels).length === 0) return 0;
    const aS = !!sels[a.nombre], bS = !!sels[b.nombre];
    if (aS && !bS) return -1; if (!aS && bS) return 1; return 0;
  });
  function renderMateriaCard(targetEl, m){
    const wrap = document.createElement('div'); wrap.className='materia-row-wrap';
    const row = document.createElement('div'); row.className='materia-row';
    const left = document.createElement('div'); left.className='materia-row-left';
    const right = document.createElement('div'); right.className='materia-row-right';
    const isChecked = (window.__lastLoadedFiltered||[]).some(x=> x.nombre===m.nombre);
    const hasSelectedGroup = !!sels[m.nombre];
    wrap.classList.toggle('is-checked', isChecked);
    wrap.classList.toggle('has-selected-group', hasSelectedGroup);
    row.classList.toggle('is-checked', isChecked);
    row.classList.toggle('has-selected-group', hasSelectedGroup);

    const cb = document.createElement('button');
    cb.type = 'button';
    cb.className = 'loaded-folder-select loaded-materia-select';
    cb.classList.toggle('checked', isChecked);
    cb.setAttribute('aria-pressed', isChecked ? 'true' : 'false');
    cb.setAttribute('aria-label', isChecked ? `Deseleccionar ${m.nombre}` : `Seleccionar ${m.nombre}`);
    cb.dataset.materia = m.nombre;
    cb.onclick = (e)=>{
      e.stopPropagation();
      const nombre = cb.dataset.materia;
      const item = (window.__lastLoaded||[]).find(x=>x.nombre===nombre);
      if (!item) return;
      clearSchedulerMessage();
      const willCheck = !cb.classList.contains('checked');
      if (willCheck){
        if (!(window.__lastLoadedFiltered||[]).some(x=> x.nombre===nombre)){
          window.__lastLoadedFiltered = (window.__lastLoadedFiltered||[]).concat([item]);
        }
      } else {
        window.__lastLoadedFiltered = (window.__lastLoadedFiltered||[]).filter(x=> x.nombre !== nombre);
        if (window.__currentScheduleSelections && window.__currentScheduleSelections[nombre]){
          delete window.__currentScheduleSelections[nombre];
          updateScheduleWithNewSelection();
        }
      }
      try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest((window.__scheduleTabs||[]).find(t=>t.id===window.__activeScheduleId)?.best || { materias: [] }); }catch(_){ }
      renderLoadedMateriasCommon();
    };

    const badge = document.createElement('span'); badge.className = 'badge ' + (m.obligatoria? 'red':'blue'); badge.textContent = m.obligatoria? 'OBL':'OPT'; badge.style.cursor = 'pointer'; badge.title = 'Alternar obligatoria/optativa';
    badge.addEventListener('click', (e)=>{ e.stopPropagation(); m.obligatoria = !m.obligatoria;
      if (Array.isArray(window.__lastLoadedFiltered)){
        window.__lastLoadedFiltered.forEach(it=>{ if (it.nombre === m.nombre) it.obligatoria = m.obligatoria; });
      }
      renderLoadedMateriasCommon();
    });

    const titleSpan = document.createElement('span'); titleSpan.style.marginLeft='6px'; titleSpan.innerHTML = `<strong>${escapeXml(m.nombre)}</strong>`;
    const grupos = m.grupos || [];
    const exclSet = (window.__excludedGrupos||{})[m.nombre] || new Set();
    const activeCount = grupos.length - exclSet.size;
    const countBadge = document.createElement('span'); countBadge.className='grupo-count-badge'; countBadge.dataset.materia=m.nombre;
    countBadge.textContent = `${activeCount}/${grupos.length}`;
    const expandArrow = document.createElement('span'); expandArrow.className='expand-arrow'; expandArrow.textContent='›';

    left.appendChild(cb); left.appendChild(badge); left.appendChild(titleSpan); left.appendChild(countBadge);

    const credSpan = document.createElement('span'); credSpan.className='meta'; credSpan.textContent=`${m.creditos||0} cr`;
    const delBtn = document.createElement('button');
    delBtn.type='button'; delBtn.className='materia-remove'; delBtn.textContent='×'; delBtn.title='Eliminar materia';
    delBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const key = getMateriaKey(m);
      window.__lastLoaded = (window.__lastLoaded||[]).filter(x=> getMateriaKey(x) !== key);
      window.__lastLoadedFiltered = (window.__lastLoadedFiltered||[]).filter(x=> getMateriaKey(x) !== key);
      if (window.__currentScheduleSelections && window.__currentScheduleSelections[m.nombre]){
        delete window.__currentScheduleSelections[m.nombre];
      }
      updateScheduleWithNewSelection();
      if (window.__manualCache && window.__manualCache.length){
        const updatedManual = window.__manualCache.filter(x=> getMateriaKey(x) !== key);
        window.__manualCache = updatedManual;
        window.__hasManualCache = updatedManual.length > 0;
        saveManualMateriasCache(updatedManual);
      }
      window.__expandedMaterias?.delete(m.nombre);
      try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest((window.__scheduleTabs||[]).find(t=>t.id===window.__activeScheduleId)?.best || { materias: [] }); }catch(_){ }
      try{ renderLoadedMateriasCommon(); }catch(_){ }
    });
    right.appendChild(credSpan); right.appendChild(expandArrow); right.appendChild(delBtn);
    row.appendChild(left); row.appendChild(right);

    const gruposPanel = document.createElement('div'); gruposPanel.className='grupos-panel';
    const wasExpanded = window.__expandedMaterias.has(m.nombre);
    if (!wasExpanded){ gruposPanel.classList.add('hidden'); }
    else { row.classList.add('expanded'); expandArrow.classList.add('rotated'); }

    if (grupos.length === 0){
      const noG = document.createElement('div'); noG.className='grupo-item'; noG.style.color='var(--muted)'; noG.style.gridColumn='1/-1'; noG.textContent='Sin grupos';
      gruposPanel.appendChild(noG);
    } else {
      for (const g of grupos){
        const grupoKey = g.grupo || 'Grupo ?';
        const grupoNumMatch = grupoKey.match(/(\d+)/);
        const grupoLabel = grupoNumMatch ? `G${grupoNumMatch[1]}` : grupoKey;
        const excluded = isGrupoExcluded(m.nombre, grupoKey);
        const isSelected = sels[m.nombre] === grupoKey;
        let isIncompatible = false;
        if (!isSelected && !excluded){
          const otherGroups = getCurrentSelectedGroupObjects(m.nombre);
          if (otherGroups.length > 0){
            const otherSlots = computeOccupiedSlots(otherGroups);
            isIncompatible = groupConflictsWithSlots(g, otherSlots);
          }
        }
        let gClasses = 'grupo-item';
        if (excluded) gClasses += ' excluded';
        else if (isSelected) gClasses += ' selected';
        else if (isIncompatible) gClasses += ' incompatible';
        const gItem = document.createElement('div'); gItem.className=gClasses;

        const diasAbrevCard = {LUNES:'LU',MARTES:'MA','MIÉRCOLES':'MI',JUEVES:'JU',VIERNES:'VI','SÁBADO':'SA',DOMINGO:'DO'};
        const horarioStr = (g.horarios||[]).map(h=>{
          const d = diasAbrevCard[(h.dia||'').toUpperCase()] || (h.dia||'').slice(0,2).toUpperCase();
          const hi = (h.hora_inicio||'').slice(0,5);
          return `${d} ${hi}`;
        }).join(' ');

        const profe = g.profesor && g.profesor !== 'NO DISPONIBLE' ? g.profesor : '';
        const cupos = (g.cupos != null) ? g.cupos : '';

        const headerDiv = document.createElement('div'); headerDiv.className='grupo-header';
        const labelSpan = document.createElement('span'); labelSpan.className='grupo-label'; labelSpan.textContent=grupoLabel;
        const cuposSpan = document.createElement('span'); cuposSpan.className='grupo-cupos'; cuposSpan.textContent=String(cupos);
        headerDiv.appendChild(labelSpan); headerDiv.appendChild(cuposSpan);

        const profeTitle = profe ? profe.toLowerCase().replace(/\b\w/g, c=>c.toUpperCase()) : '';
        const profeDiv = document.createElement('div'); profeDiv.className='grupo-profe'; profeDiv.textContent=profeTitle||'Sin profesor';
        const horDiv = document.createElement('div'); horDiv.className='grupo-horario'; horDiv.textContent=horarioStr;

        const exclBtn = document.createElement('button');
        exclBtn.type='button';
        exclBtn.className='grupo-exclude-btn';
        exclBtn.title=excluded?'Incluir grupo':'Excluir grupo';
        exclBtn.innerHTML = excluded ? '<span style="color:#2ecc40;font-size:18px;">✔</span>' : '<span style="color:#ff3555;font-size:18px;">×</span>';
        exclBtn.addEventListener('click', (e)=>{
          e.stopPropagation();
          toggleGrupoExcluded(m.nombre, grupoKey);
          const nowExcl = isGrupoExcluded(m.nombre, grupoKey);
          gItem.classList.toggle('excluded', nowExcl);
          exclBtn.title = nowExcl ? 'Incluir grupo' : 'Excluir grupo';
          exclBtn.innerHTML = nowExcl ? '<span style="color:#2ecc40;font-size:18px;">✔</span>' : '<span style="color:#ff3555;font-size:18px;">×</span>';
          const exclSetNow = (window.__excludedGrupos||{})[m.nombre] || new Set();
          countBadge.textContent = `${grupos.length - exclSetNow.size}/${grupos.length}`;
        });

        gItem.addEventListener('click', (e)=>{
          if (e.target === exclBtn || exclBtn.contains(e.target)) return;
          if (excluded || isIncompatible || isSelected) return;
          window.__currentScheduleSelections = window.__currentScheduleSelections || {};
          window.__currentScheduleSelections[m.nombre] = grupoKey;
          updateScheduleWithNewSelection();
          renderLoadedMateriasCommon();
        });

        gItem.appendChild(headerDiv);
        gItem.appendChild(profeDiv);
        gItem.appendChild(horDiv);
        gItem.appendChild(exclBtn);
        gruposPanel.appendChild(gItem);
      }
    }

    row.addEventListener('click', (e)=>{
      if (e.target.tagName==='BUTTON' || e.target.classList.contains('badge')) return;
      const willExpand = gruposPanel.classList.contains('hidden');
      gruposPanel.classList.toggle('hidden');
      row.classList.toggle('expanded', willExpand);
      expandArrow.classList.toggle('rotated', willExpand);
      if (willExpand) window.__expandedMaterias.add(m.nombre);
      else window.__expandedMaterias.delete(m.nombre);
    });

    wrap.appendChild(row); wrap.appendChild(gruposPanel);
    targetEl.appendChild(wrap);
  }

  function getTipoMateriaLabel(materia){
    const tipologia = String(materia && materia.tipologia ? materia.tipologia : '').trim().toLowerCase();
    if (!tipologia) return materia && materia.obligatoria ? 'Obligatoria' : 'Optativa';
    if (tipologia.includes('fund') && tipologia.includes('optativa')) return 'Fund. optativa';
    if (tipologia.includes('fund') && tipologia.includes('obligatoria')) return 'Fund. obligatoria';
    if (tipologia.includes('disc') && tipologia.includes('obligatoria')) return 'Disc. obligatoria';
    if (tipologia.includes('disc') && tipologia.includes('optativa')) return 'Disc. optativa';
    if (tipologia.includes('libre')) return 'Libre elección';
    if (tipologia.includes('nivel')) return 'Nivelación';
    return materia && materia.obligatoria ? 'Obligatoria' : 'Optativa';
  }

  const groupedSectionsMap = new Map();
  for (const materia of sortedList){
    const sectionTitle = getTipoMateriaLabel(materia);
    if (!groupedSectionsMap.has(sectionTitle)) groupedSectionsMap.set(sectionTitle, []);
    groupedSectionsMap.get(sectionTitle).push(materia);
  }
  const sectionOrder = ['Fund. obligatoria', 'Fund. optativa', 'Disc. obligatoria', 'Disc. optativa', 'Libre elección', 'Nivelación', 'Obligatoria', 'Optativa'];
  const groupedSections = Array.from(groupedSectionsMap.entries())
    .sort((left, right) => {
      const leftIdx = sectionOrder.indexOf(left[0]);
      const rightIdx = sectionOrder.indexOf(right[0]);
      const l = leftIdx === -1 ? Number.MAX_SAFE_INTEGER : leftIdx;
      const r = rightIdx === -1 ? Number.MAX_SAFE_INTEGER : rightIdx;
      if (l !== r) return l - r;
      return left[0].localeCompare(right[0], 'es');
    })
    .map(([title, items]) => ({ title, items }));

  if (!window.__collapsedMateriaFolders || window.__resetCollapsedMateriaFolders){
    window.__collapsedMateriaFolders = new Set(groupedSections.map(section => section.title));
    window.__resetCollapsedMateriaFolders = false;
  }

  for (const section of groupedSections){
    const folder = document.createElement('section');
    folder.className = 'loaded-folder';

    const header = document.createElement('div');
    header.className = 'loaded-folder-header';
    header.innerHTML = `<span class="loaded-folder-icon">▸</span><strong>${escapeXml(section.title)}</strong><span class="loaded-folder-count">${section.items.length}</span>`;

    const selectedCount = section.items.filter(item => (window.__lastLoadedFiltered || []).some(selected => getMateriaKey(selected) === getMateriaKey(item))).length;
    const allSelected = section.items.length > 0 && selectedCount === section.items.length;
    folder.classList.toggle('is-complete', allSelected);
    folder.classList.toggle('is-partial', selectedCount > 0 && !allSelected);
    const folderSelect = document.createElement('button');
    const hasSelection = selectedCount > 0;
    folderSelect.type = 'button';
    folderSelect.className = 'loaded-folder-select';
    folderSelect.classList.toggle('checked', allSelected);
    folderSelect.classList.toggle('partial', hasSelection && !allSelected);
    folderSelect.title = allSelected ? `Deseleccionar ${section.title}` : `Seleccionar ${section.title}`;
    folderSelect.setAttribute('aria-label', folderSelect.title);
    folderSelect.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
    folderSelect.addEventListener('click', (e)=>{
      e.stopPropagation();
      clearSchedulerMessage();
      syncQuickMateriaSelection(section.items, { deselect: allSelected, label: section.title });
      try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest((window.__scheduleTabs||[]).find(t=>t.id===window.__activeScheduleId)?.best || { materias: [] }); }catch(_){ }
      renderLoadedMateriasCommon();
    });
    header.insertBefore(folderSelect, header.children[1] || null);

    const removeSetBtn = document.createElement('button');
    removeSetBtn.type = 'button';
    removeSetBtn.className = 'loaded-folder-remove';
    removeSetBtn.textContent = '×';
    removeSetBtn.title = 'Eliminar todas las materias de esta carpeta';
    removeSetBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const sectionKeys = new Set(section.items.map(item => getMateriaKey(item)));
      window.__lastLoaded = (window.__lastLoaded || []).filter(item => !sectionKeys.has(getMateriaKey(item)));
      window.__lastLoadedFiltered = (window.__lastLoadedFiltered || []).filter(item => !sectionKeys.has(getMateriaKey(item)));
      for (const item of section.items) {
        if (window.__currentScheduleSelections && window.__currentScheduleSelections[item.nombre]) {
          delete window.__currentScheduleSelections[item.nombre];
        }
      }
      updateScheduleWithNewSelection();
      if (window.__manualCache && window.__manualCache.length){
        const updatedManual = window.__manualCache.filter(item => !sectionKeys.has(getMateriaKey(item)));
        window.__manualCache = updatedManual;
        window.__hasManualCache = updatedManual.length > 0;
        saveManualMateriasCache(updatedManual);
      }
      for (const item of section.items) window.__expandedMaterias?.delete(item.nombre);
      try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest((window.__scheduleTabs||[]).find(t=>t.id===window.__activeScheduleId)?.best || { materias: [] }); }catch(_){ }
      renderLoadedMateriasCommon();
    });
    header.appendChild(removeSetBtn);

    const body = document.createElement('div');
    body.className = 'loaded-folder-body';
    const icon = header.querySelector('.loaded-folder-icon');
    const isCollapsed = window.__collapsedMateriaFolders.has(section.title);
    if (isCollapsed){
      body.classList.add('hidden');
      icon?.classList.add('collapsed');
    }

    header.addEventListener('click', ()=>{
      const willCollapse = !body.classList.contains('hidden');
      body.classList.toggle('hidden');
      icon?.classList.toggle('collapsed', willCollapse);
      if (willCollapse) window.__collapsedMateriaFolders.add(section.title);
      else window.__collapsedMateriaFolders.delete(section.title);
    });

    if (!section.items.length){
      body.innerHTML = '<div class="muted loaded-folder-empty">Sin materias en esta sección.</div>';
    } else {
      for (const materia of section.items){
        renderMateriaCard(body, materia);
      }
    }

    folder.appendChild(header);
    folder.appendChild(body);
    loadedEl.appendChild(folder);
  }
  saveMateriasCache();
}

function getMateriaKey(m){
  const codigo = (m && m.codigo) ? String(m.codigo).trim().toLowerCase() : '';
  const nombre = (m && m.nombre) ? String(m.nombre).trim().toLowerCase() : '';
  const grupos = Array.isArray(m && m.grupos) ? m.grupos.length : 0;
  if (codigo) {
    return `${codigo}::${nombre}::${grupos}`;
  }
  return `${nombre}::${grupos}`;
}

function mergeMateriasLists(base, extra){
  const out = [];
  const seen = new Set();
  for (const m of (base||[])){
    const k = getMateriaKey(m);
    if (!seen.has(k)){ seen.add(k); out.push(m); }
  }
  for (const m of (extra||[])){
    const k = getMateriaKey(m);
    if (!seen.has(k)){ seen.add(k); out.push(m); }
  }
  return out;
}

function cumplePrereqsJS(asignatura, materiasAprobadas){
  const prereqs = (asignatura && asignatura.prerequisitos) || [];
  const aprobadasKeys = Object.keys(materiasAprobadas || {});
  const aprobadasNames = (materiasAprobadas && materiasAprobadas.__names) || [];
  for (const prereq of prereqs){
    let cumple = 0;
    for (const asig of (prereq.asignaturas || [])){
      const codigo = String(asig.codigo || '').toLowerCase();
      const nombre = String(asig.nombre || '').toLowerCase();
      if (nombre.includes('inglés') || nombre.includes('ingles') || nombre.includes('virtual')){
        if (aprobadasKeys.some(c=> c.toLowerCase().includes('ing')) || aprobadasNames.some(n=> n.includes('ingles') || n.includes('inglés') || n.includes('intensivo') || n.includes('virtual'))){
          cumple += 1;
          continue;
        }
      }
      if (codigo && materiasAprobadas[codigo]) cumple += 1;
    }
    if (prereq.isTodas){
      if (cumple < (prereq.cantidad || 0)) return false;
    } else {
      if (cumple === 0) return false;
    }
  }
  return true;
}

function saveManualMateriasCache(materias){
  try{ localStorage.setItem('manual_materias', JSON.stringify(materias||[])); }catch(_){ }
}

function loadManualMateriasCache(){
  try{
    const raw = localStorage.getItem('manual_materias');
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  }catch(_){ return []; }
}

function saveMateriasCache(){
  try{
    localStorage.setItem('materias_cache', JSON.stringify(window.__lastLoaded || []));
    localStorage.setItem('materias_filtered_cache', JSON.stringify(window.__lastLoadedFiltered || []));
  }catch(_){ }
}

function loadMateriasCache(){
  try{
    const raw = localStorage.getItem('materias_cache');
    const rawFiltered = localStorage.getItem('materias_filtered_cache');
    const all = raw ? JSON.parse(raw) : [];
    const filtered = rawFiltered ? JSON.parse(rawFiltered) : [];
    return {
      all: Array.isArray(all) ? all : [],
      filtered: Array.isArray(filtered) ? filtered : []
    };
  }catch(_){ return { all: [], filtered: [] }; }
}

function loadScheduleTabsCache(){
  try{
    const raw = localStorage.getItem('schedule_tabs');
    if (!raw) return { tabs: [], activeId: null };
    const data = JSON.parse(raw);
    return {
      tabs: Array.isArray(data.tabs) ? data.tabs : [],
      activeId: data.activeId || null
    };
  }catch(_){ return { tabs: [], activeId: null }; }
}

function saveScheduleTabsCache(tabs, activeId){
  try{ localStorage.setItem('schedule_tabs', JSON.stringify({ tabs, activeId })); }catch(_){ }
}

// Read manual cache early so it can be restored even if later flows overwrite state.
try{
  const cachedEarly = loadManualMateriasCache();
  if (cachedEarly && cachedEarly.length){
    window.__manualCache = cachedEarly;
    window.__hasManualCache = true;
  }
}catch(_){ }
// Load excluded grupos cache
try{ window.__excludedGrupos = loadExcludedGruposCache(); }catch(_){ window.__excludedGrupos = {}; }

async function generarHorariosJS(materias, opts){
  const BRUTE_FORCE_LIMIT = 20000000;
  const HEURISTIC_BEAM_WIDTH = 160;
  const startedAt = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  // Implementación equivalente a Python: prefiltrar, asignar obligatorias únicas, generar combinaciones viables y paralelizar evaluación
  const materiasC = materias.map((m,mi)=> ({...m, __id: mi, grupos: (m.grupos||[]).map((g,gi)=> ({...g, __id:`${mi}-${gi}`, materiaNombre: m.nombre })) }));
  // Filtrar grupos según cupos, virtuales y existencia de horarios
  for (const m of materiasC){
    m.grupos = (m.grupos||[]).filter(g=> (g.horarios && g.horarios.length>0) && (!opts.usarVirtuales || g.horarios.every(h=> (h.lugar||'').toLowerCase()!=='virtual')) && (!opts.usarCupos || (g.cupos && g.cupos>0)) );
  }

  const faltantes = materiasC.filter(m=> m.obligatoria && (!m.grupos || m.grupos.length===0)).map(m=>m.nombre);
  if (faltantes.length) throw new Error('Faltan grupos obligatorios: '+faltantes.join(', '));

  const materias_obligatorias = materiasC.filter(m=> m.obligatoria);
  const materias_optativas = materiasC.filter(m=> !m.obligatoria);

  // Horario local para verificar incompatibilidades como en python
  class HorarioJS{
    constructor(){
      this.dias = { LUNES:{}, MARTES:{}, MIERCOLES:{}, JUEVES:{}, VIERNES:{}, SABADO:{}, DOMINGO:{} };
      this.grupos = [];
    }
    _hoursFor(clase){
      const h0 = parseInt((clase.hora_inicio||clase.inicio||'00:00').split(':')[0],10);
      const h1 = parseInt((clase.hora_fin||clase.fin||'00:00').split(':')[0],10);
      const res = [];
      for(let h=h0; h<h1; h++) res.push(`${String(h).padStart(2,'0')}:00`);
      return res;
    }
    verificar_grupo(grupo){
      for (const clase of (grupo.horarios||[])){
        const dia = (clase.dia||'').toUpperCase();
        const horas = this._hoursFor(clase);
        for (const h of horas){
          if (this.dias[dia] && this.dias[dia][h]) return false;
        }
      }
      return true;
    }
    agregar_grupo(grupo){
      if (!this.verificar_grupo(grupo)) return false;
      for (const clase of (grupo.horarios||[])){
        const dia = (clase.dia||'').toUpperCase();
        const horas = this._hoursFor(clase);
        if (!this.dias[dia]) this.dias[dia] = {};
        for (const h of horas) this.dias[dia][h] = `${clase.nombre||''} (${clase.lugar||''})`;
      }
      this.grupos.push(grupo);
      return true;
    }
    contar_huecos(){
      let huecos=0;
      for (const dia in this.dias){
        const horasConClase = Object.keys(this.dias[dia]);
        if (horasConClase.length){
          const min = Math.min(...horasConClase.map(h=>parseInt(h.split(':')[0],10)));
          const max = Math.max(...horasConClase.map(h=>parseInt(h.split(':')[0],10)));
          for (let h=min; h<=max; h++) if (!this.dias[dia][`${String(h).padStart(2,'0')}:00`]) huecos++;
        }
      }
      return huecos;
    }
  }

  function contarDiasOcupadosFromHorario(horario){
    return Object.values(horario.dias || {}).filter(day => Object.keys(day || {}).length > 0).length;
  }

  function buildHorarioMapFromHorario(horario){
    const out = {};
    for (const [dia, horas] of Object.entries(horario.dias || {})) out[dia] = {...horas};
    return out;
  }

  function summarizeComb(comb){
    const horario = new HorarioJS();
    let totalCreditos = 0;
    for (const grupo of (comb || [])){
      if (!horario.agregar_grupo(grupo)) return null;
      totalCreditos += grupo.creditos || 0;
    }
    return {
      comb,
      horario,
      horarioMap: buildHorarioMapFromHorario(horario),
      total_materias: (comb || []).length,
      creditos: totalCreditos,
      dias_ocup: contarDiasOcupadosFromHorario(horario),
      huecos: horario.contar_huecos(),
      sel: Array.from(new Set((comb || []).map(grupo => grupo.materiaNombre))).filter(Boolean)
    };
  }

  function isBetterSummary(candidate, best){
    if (!candidate) return false;
    if (!best) return true;
    if (candidate.total_materias !== best.total_materias) return candidate.total_materias > best.total_materias;
    if (candidate.creditos !== best.creditos) return candidate.creditos > best.creditos;
    if (candidate.dias_ocup !== best.dias_ocup) return candidate.dias_ocup < best.dias_ocup;
    return candidate.huecos < best.huecos;
  }

  function scorePartialState(state){
    return (state.creditos * 1000) - (state.dias_ocup * 100) - (state.huecos * 10) - state.grupos.length;
  }

  function estimateOptionalCombinationCount(materiasOptativasSeleccionadas){
    if (!materiasOptativasSeleccionadas || !materiasOptativasSeleccionadas.length) return 1;
    let total = 1;
    for (const materia of materiasOptativasSeleccionadas){
      const gruposCount = Array.isArray(materia.grupos) ? materia.grupos.length : 0;
      if (gruposCount === 0) return 0;
      total *= gruposCount;
      if (total > BRUTE_FORCE_LIMIT) return total;
    }
    return total;
  }

  function estimateTotalCombinationCount(requiredCount, optionalSets){
    if (!requiredCount || !optionalSets || !optionalSets.length) return requiredCount || 0;
    let total = 0;
    for (const set of optionalSets){
      total += requiredCount * estimateOptionalCombinationCount(set);
      if (total > BRUTE_FORCE_LIMIT) return total;
    }
    return total;
  }

  async function evaluateExactCombos(allCombinaciones){
    if (!allCombinaciones.length) return { best: null };
    const concurrency = navigator.hardwareConcurrency || 2;
    const chunks = Array.from({length:concurrency}, (_,i)=> allCombinaciones.filter((_,idx)=> idx%concurrency===i));
    const workerPromises = chunks.map((chunk,i)=> new Promise((res,rej)=>{
      if (chunk.length===0) return res(null);
      const w = new Worker('worker.js');
      w.onmessage = ev=>{ res(ev.data); w.terminate(); };
      w.onerror = e=>{ w.terminate(); rej(e); };
      w.postMessage({chunk, opts, workerIndex: i});
    }));
    const results = await Promise.all(workerPromises);
    const statsAgg = { evaluated:0, skipped_conflict:0, skipped_creditos:0, skipped_dias:0 };
    const diagnostics = [];
    let best = null;
    for (const r of results){
      if (!r) continue;
      if (r.error){
        diagnostics.push(r);
        if (r.stats) Object.keys(statsAgg).forEach(k=> statsAgg[k]+= (r.stats[k]||0));
        continue;
      }
      const resr = r.result || r;
      if (r.stats) Object.keys(statsAgg).forEach(k=> statsAgg[k]+= (r.stats[k]||0));
      if (isBetterSummary(resr, best)) best = resr;
    }
    return { best, diagnostics, statsAgg };
  }

  function runHeuristicSearch(requiredCombos, optionalSubjects, targetOptionalCount){
    const states = [];
    for (const required of requiredCombos){
      const summary = summarizeComb(required);
      if (!summary) continue;
      states.push({
        horario: summary.horario,
        grupos: required.slice(),
        selectedMaterias: new Set(summary.sel),
        creditos: summary.creditos,
        dias_ocup: summary.dias_ocup,
        huecos: summary.huecos
      });
    }
    if (!states.length) return null;
    let beam = states
      .sort((left, right) => scorePartialState(right) - scorePartialState(left))
      .slice(0, HEURISTIC_BEAM_WIDTH);

    const rankedOptionals = optionalSubjects
      .slice()
      .sort((left, right) => {
        const leftBest = Math.max(...left.grupos.map(g => g.creditos || left.creditos || 0), 0);
        const rightBest = Math.max(...right.grupos.map(g => g.creditos || right.creditos || 0), 0);
        if (leftBest !== rightBest) return rightBest - leftBest;
        return left.nombre.localeCompare(right.nombre, 'es');
      })
      .slice(0, targetOptionalCount);

    for (const materia of rankedOptionals){
      const nextBeam = [];
      for (const state of beam){
        nextBeam.push(state);
        for (const grupo of (materia.grupos || [])){
          if (!state.horario.verificar_grupo(grupo)) continue;
          const horario = new HorarioJS();
          for (const existing of state.grupos) horario.agregar_grupo(existing);
          if (!horario.agregar_grupo(grupo)) continue;
          const selectedMaterias = new Set(state.selectedMaterias);
          selectedMaterias.add(materia.nombre);
          nextBeam.push({
            horario,
            grupos: state.grupos.concat([grupo]),
            selectedMaterias,
            creditos: state.creditos + (grupo.creditos || materia.creditos || 0),
            dias_ocup: contarDiasOcupadosFromHorario(horario),
            huecos: horario.contar_huecos()
          });
        }
      }
      beam = nextBeam
        .sort((left, right) => {
          const rank = scorePartialState(right) - scorePartialState(left);
          if (rank !== 0) return rank;
          return right.selectedMaterias.size - left.selectedMaterias.size;
        })
        .slice(0, HEURISTIC_BEAM_WIDTH);
    }

    let best = null;
    for (const state of beam){
      const summary = {
        horarioMap: buildHorarioMapFromHorario(state.horario),
        materias: Array.from(state.selectedMaterias),
        comb: state.grupos,
        total_materias: state.selectedMaterias.size,
        creditos: state.creditos,
        dias_ocup: state.dias_ocup,
        huecos: state.huecos,
        sel: Array.from(state.selectedMaterias)
      };
      if (isBetterSummary(summary, best)) best = summary;
    }
    return best;
  }

  // Generar combinaciones viables solo con obligatorias (como Python)
  const incompat_cache = new Map();
  let cache_hits=0, cache_misses=0;

  function son_incompatibles_cache(g1,g2){
    const key = `${g1.__id}|${g2.__id}`;
    if (incompat_cache.has(key)){ cache_hits++; return incompat_cache.get(key); }
    cache_misses++;
    const h = new HorarioJS();
    h.agregar_grupo(g1);
    const res = !h.verificar_grupo(g2);
    incompat_cache.set(key,res);
    return res;
  }

  // construir producto de arrays auxiliar
  function producto(arrays){
    return arrays.reduce((a,b)=> a.flatMap(x=> b.map(y=> x.concat([y]))), [[]]);
  }

  const listasGruposOblig = materias_obligatorias.map(m=> m.grupos);
  const combinaciones_obligatorias_viables = [];
  for (const comb of producto(listasGruposOblig)){
    let horario = new HorarioJS();
    let es_viable = true;
    for (let i=0;i<comb.length;i++){
      const grupo = comb[i];
      if (!horario.verificar_grupo(grupo)){
        es_viable = false;
        for (let j=0;j<i;j++){
          const grupo_prev = comb[j];
          if (son_incompatibles_cache(grupo, grupo_prev)) incompat_cache.set(`${grupo.__id}|${grupo_prev.__id}`, true);
        }
        break;
      }
      horario.agregar_grupo(grupo);
    }
    if (es_viable) combinaciones_obligatorias_viables.push(comb);
  }

  if (combinaciones_obligatorias_viables.length===0) throw new Error('No hay forma de organizar un horario con todas las materias obligatorias.');

  // Evaluar combinaciones con optativas por tamaño descendente
  let mejor_horario = null;
  let mejor_comb = null;
  let max_materias = 0, max_creditos = 0, menor_dias_ocupados = Infinity, menor_huecos = Infinity;
  let materias_seleccionadas_final = null;
  let algorithmMode = 'exact';

  const maxOptStart = Math.min(materias_optativas.length, opts.maxmaterias - materias_obligatorias.length);
  for (let numOpt = maxOptStart; numOpt>=0; numOpt--){
    const elegidoSets = numOpt > 0 ? combinations(materias_optativas, numOpt) : [[]];
    const estimatedCombinations = estimateTotalCombinationCount(combinaciones_obligatorias_viables.length, elegidoSets);
    const useHeuristic = !opts.forceBrute && estimatedCombinations > BRUTE_FORCE_LIMIT;

    if (useHeuristic){
      algorithmMode = 'heuristic';
      let bestHeuristic = null;
      for (const set of elegidoSets){
        const candidate = runHeuristicSearch(combinaciones_obligatorias_viables, set, numOpt);
        if (isBetterSummary(candidate, bestHeuristic)) bestHeuristic = candidate;
      }
      if (bestHeuristic && isBetterSummary(bestHeuristic, { total_materias: max_materias, creditos: max_creditos, dias_ocup: menor_dias_ocupados, huecos: menor_huecos })){
        max_materias = bestHeuristic.total_materias;
        max_creditos = bestHeuristic.creditos;
        menor_dias_ocupados = bestHeuristic.dias_ocup;
        menor_huecos = bestHeuristic.huecos;
        materias_seleccionadas_final = bestHeuristic.sel || bestHeuristic.materias;
        mejor_horario = bestHeuristic.horarioMap;
        mejor_comb = bestHeuristic.comb;
      }
      if (max_materias>0) break;
      continue;
    }

    let combinaciones_optativas_viables = [[]];
    if (numOpt>0){
      combinaciones_optativas_viables = [];
      for (const set of elegidoSets){
        combinaciones_optativas_viables.push(...producto(set.map(m=> m.grupos)));
      }
    }

    const all_combinaciones = [];
    for (const a of combinaciones_obligatorias_viables) for (const b of combinaciones_optativas_viables) all_combinaciones.push(a.concat(b));
    if (all_combinaciones.length===0) continue;

    const { best, diagnostics, statsAgg } = await evaluateExactCombos(all_combinaciones);
    if (best && isBetterSummary(best, { total_materias: max_materias, creditos: max_creditos, dias_ocup: menor_dias_ocupados, huecos: menor_huecos })){
      max_materias = best.total_materias;
      max_creditos = best.creditos;
      menor_dias_ocupados = best.dias_ocup;
      menor_huecos = best.huecos;
      materias_seleccionadas_final = best.sel;
      mejor_horario = best.horarioMap;
      mejor_comb = best.comb;
    }

    if (diagnostics && diagnostics.length){
      try{
        errorsEl.classList.remove('hidden'); errorsEl.classList.add('error');
        errorsEl.innerHTML = '<strong>Diagnostics (workers):</strong><ul>' + diagnostics.map(d=>`<li>${d.error}${d.message?': '+d.message:''} — stats: ${JSON.stringify(d.stats||{})}</li>`).join('') + '</ul>';
      }catch(e){ console.warn('Error rendering diagnostics', e); }
      console.warn('Worker diagnostics:', diagnostics, 'aggStats:', statsAgg);
    } else if (errorsEl) {
      errorsEl.classList.add('hidden'); errorsEl.classList.remove('error'); errorsEl.innerHTML = '';
    }

    if (max_materias>0) break;
  }

  if (!mejor_horario) return null;
  const finishedAt = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  return {
    horarioMap: mejor_horario,
    materias: materias_seleccionadas_final,
    comb: mejor_comb,
    total_materias: max_materias,
    creditos: max_creditos,
    timings: {
      totalMs: finishedAt - startedAt,
      algorithmMode,
      bruteForceLimit: BRUTE_FORCE_LIMIT
    }
  };
}

// UI wiring (initialize after DOM ready to avoid missing elements)
function initBgDots() {
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
  document.body.insertBefore(canvas, document.body.firstChild);

  var W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  var ctx = canvas.getContext('2d');

  var staticDots = [];
  for (var i = 0; i < 80; i++) {
    staticDots.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.45 + 0.15,
      blue: Math.random() > 0.5
    });
  }

  function makeStar() {
    var angle = (Math.random() * 30 + 15) * Math.PI / 180;
    var speed = Math.random() * 0.8 + 0.4;
    return {
      x: Math.random() * 1.3 - 0.15, y: Math.random() * 0.6,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      len: Math.random() * 120 + 60,
      a: Math.random() * 0.55 + 0.3,
      r: Math.random() * 1.0 + 0.4,
      blue: Math.random() > 0.5,
      life: 1.0
    };
  }

  var stars = [];
  for (var j = 0; j < 5; j++) { var s = makeStar(); s.x = Math.random(); s.y = Math.random(); stars.push(s); }

  var lastTime = 0;
  function frame(ts) {
    var dt = Math.min((ts - lastTime) / 16.67, 3); lastTime = ts;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < staticDots.length; i++) {
      var d = staticDots[i];
      ctx.beginPath(); ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.blue ? 'rgba(43,139,255,' + d.a + ')' : 'rgba(255,35,77,' + d.a + ')';
      ctx.fill();
    }
    for (var k = stars.length - 1; k >= 0; k--) {
      var st = stars[k];
      st.x += st.vx * dt / W * 100; st.y += st.vy * dt / H * 100; st.life -= 0.0015 * dt;
      var px = st.x * W, py = st.y * H;
      var tailX = px - st.vx * st.len / W * 100 * W / 100;
      var tailY = py - st.vy * st.len / H * 100 * H / 100;
      var alpha = st.a * Math.max(0, st.life);
      var color = st.blue ? '43,139,255' : '255,35,77';
      var grad = ctx.createLinearGradient(tailX, tailY, px, py);
      grad.addColorStop(0, 'rgba(' + color + ',0)');
      grad.addColorStop(1, 'rgba(' + color + ',' + alpha + ')');
      ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(px, py);
      ctx.strokeStyle = grad; ctx.lineWidth = st.r * 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, st.r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + alpha + ')'; ctx.fill();
      if (st.life <= 0 || st.x > 1.2 || st.y > 1.2) stars[k] = makeStar();
    }
    while (stars.length < 4) stars.push(makeStar());
    if (stars.length > 6) stars.splice(0, 1);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.addEventListener('DOMContentLoaded', ()=>{
  // debug badge removido — solo se mantiene referencia para compatibilidad interna
  const dbg = { textContent: '' };
  initBgDots();
  try{

  const runBtn = document.getElementById('runBtn');
  let statusEl = document.getElementById('status');
  if (!statusEl){
    statusEl = { textContent: '', innerHTML: '', classList: { add: ()=>{}, remove: ()=>{} }, style: {} };
  }
  const resultEl = document.getElementById('result');
  const summaryEl = document.getElementById('summary');
  const selectedEl = document.getElementById('selected');
  const errorsEl = document.getElementById('errors');
  const cancelRunBtn = document.getElementById('cancelRunBtn');
  const generationProgressEl = document.getElementById('generationProgress');
  const generationProgressTextEl = document.getElementById('generationProgressText');
  const generationProgressPercentEl = document.getElementById('generationProgressPercent');
  const generationProgressFillEl = document.getElementById('generationProgressFill');
  const scheduleEl = document.getElementById('schedule');
  const scheduleTabsEl = document.getElementById('scheduleTabs');
  const addTabBtn = document.getElementById('addTabBtn');
  const sampleBtn = document.getElementById('sampleBtn');
  // loadRepoBtn removed from UI
  const materiasFileInput = document.getElementById('materiasFile');
  // loadFileBtn removed from UI
  const materiasTextInput = document.getElementById('materiasText');
  const universidadSelect = document.getElementById('universidadSelect');
  const sedeSelect = document.getElementById('sedeSelect');
  const facultadSelect = document.getElementById('facultadSelect');
  const carreraImportSelect = document.getElementById('carreraImportSelect');
  // `cargarCarreraBtn` eliminado: la carga se realizará al cambiar el select de carrera
  const historialText = document.getElementById('historialText');
  const histResult = document.getElementById('histResult');
  // `carreraSelect` removed — filtering by carrera manual no longer available
  const maxCredInput = document.getElementById('maxCred');
  const maxMateriasInput = document.getElementById('maxMaterias');
  const maxDiasInput = document.getElementById('maxDias');
  const topNInput = document.getElementById('topN');
  const horaInicioInput = document.getElementById('horaInicio');
  const horaFinInput = document.getElementById('horaFin');
  const usarCuposInput = document.getElementById('usarCupos');
  const usarVirtualesInput = document.getElementById('usarVirtuales');
  const forceBruteInput = document.getElementById('forceBrute');
  const intervalStart = document.getElementById('intervalStart');
  const intervalEnd = document.getElementById('intervalEnd');
  const addIntervalBtn = document.getElementById('addIntervalBtn');
  const intervalList = document.getElementById('intervalList');

  const OPTIONS_CACHE_KEY = 'planner_options';
  let estimarComplejidadSeleccionJS = null;
  let currentRunToken = null;
  let lastRunTimings = null;

  function clampInt(value, min, max, fallback){
    const n = parseInt(value, 10);
    if (isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function clampInputValue(inputEl, min, max, fallback){
    if (!inputEl) return fallback;
    const clamped = clampInt(inputEl.value, min, max, fallback);
    inputEl.value = String(clamped);
    return clamped;
  }

  function normalizeTimeInput(inputEl, fallback){
    if (!inputEl) return fallback;
    let v = String(inputEl.value || '').trim();
    if (!v) v = fallback;
    inputEl.value = v;
    return v;
  }

  function loadOptionsCache(){
    try{ return JSON.parse(localStorage.getItem(OPTIONS_CACHE_KEY) || 'null'); }catch(_){ return null; }
  }

  function saveOptionsCache(data){
    try{ localStorage.setItem(OPTIONS_CACHE_KEY, JSON.stringify(data)); }catch(_){ }
  }

  function syncOptionsFromUi(){
    const maxcreditos = clampInputValue(maxCredInput, 1, 30, 30);
    const maxmaterias = clampInputValue(maxMateriasInput, 1, 99, 8);
    const maxdias = clampInputValue(maxDiasInput, 1, 7, 3);
    const topN = clampInputValue(topNInput, 1, 3, 1);
    const hora_inicio = normalizeTimeInput(horaInicioInput, '06:00');
    const hora_fin = normalizeTimeInput(horaFinInput, '20:00');
    const forceBrute = !!(forceBruteInput && forceBruteInput.checked);
    const payload = { maxcreditos, maxmaterias, maxdias, topN, hora_inicio, hora_fin, forceBrute };
    saveOptionsCache(payload);
    return payload;
  }

  function setGenerationProgress(state){
    if (!generationProgressEl || !generationProgressFillEl || !generationProgressTextEl || !generationProgressPercentEl) return;
    const percent = Math.max(0, Math.min(100, parseInt(state && state.percent, 10) || 0));
    if ((state && (state.state === 'done' || state.state === 'cancelled' || state.state === 'error'))) {
      generationProgressEl.classList.add('hidden');
      return;
    }
    generationProgressEl.classList.remove('hidden');
    generationProgressEl.dataset.state = (state && state.state) || 'running';
    generationProgressEl.dataset.mode = state && state.exact === false ? 'indeterminate' : 'determinate';
    generationProgressFillEl.style.width = percent + '%';
    generationProgressTextEl.textContent = (state && state.text) || 'Calculando horario...';
    generationProgressPercentEl.textContent = state && state.exact === false ? '...' : (percent + '%');
  }

  function hideGenerationProgress(){
    if (!generationProgressEl) return;
    generationProgressEl.classList.add('hidden');
    generationProgressEl.dataset.state = 'running';
  }

  function handleGenerationProgress(progress){
    const analyzed = Number(progress && progress.analyzed) || 0;
    const total = Number(progress && progress.total) || 0;
    const percent = Number(progress && progress.percent) || 0;
    let text = 'Calculando horario...';
    if (progress && progress.timings) lastRunTimings = progress.timings;
    if (progress && progress.exact && total > 0) text = `${percent}% · ${analyzed} de ${total}`;
    else if (progress && progress.message) text = progress.message;
    setGenerationProgress({
      state: progress && progress.phase === 'done' ? 'done' : (progress && progress.phase === 'cancelled' ? 'cancelled' : 'running'),
      text,
      percent,
      exact: progress ? progress.exact !== false : true
    });
  }

  function showSchedulerMessage(title, body){
    if (!errorsEl) return;
    errorsEl.classList.remove('hidden');
    errorsEl.classList.add('error');
    errorsEl.innerHTML = `<strong>${escapeXml(title)}</strong><div>${body}</div>`;
  }

  function clearSchedulerMessage(){
    if (!errorsEl) return;
    errorsEl.classList.add('hidden');
    errorsEl.classList.remove('error');
    errorsEl.innerHTML = '';
  }

  function formatCompactNumber(value){
    const n = Number(value) || 0;
    if (!isFinite(n)) return '0';
    return new Intl.NumberFormat('es-CO', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n);
  }

  function formatDurationMs(value){
    const ms = Math.max(0, Number(value) || 0);
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(ms >= 10000 ? 0 : 2)} s`;
  }

  function renderTimingSummary(targetEl, estimate, timings){
    if (!targetEl) return;
    const items = [];
    if (timings && timings.algorithmMode) items.push(`<b>Algoritmo:</b> ${escapeXml(timings.algorithmMode === 'heuristic' ? 'Heurístico' : 'Fuerza bruta')}`);
    if (estimate && estimate.estimatedSeconds != null) items.push(`<b>Estimado:</b> ${escapeXml(formatDurationMs(estimate.estimatedSeconds * 1000))}`);
    if (timings && timings.filteringMs != null) items.push(`<b>Filtrado:</b> ${escapeXml(formatDurationMs(timings.filteringMs))}`);
    if (timings && timings.requiredMs != null) items.push(`<b>Obligatorias:</b> ${escapeXml(formatDurationMs(timings.requiredMs))}`);
    if (timings && timings.optionalPrepMs != null) items.push(`<b>Optativas:</b> ${escapeXml(formatDurationMs(timings.optionalPrepMs))}`);
    if (timings && timings.evaluationMs != null) items.push(`<b>Evaluación:</b> ${escapeXml(formatDurationMs(timings.evaluationMs))}`);
    if (timings && timings.totalMs != null) items.push(`<b>Total:</b> ${escapeXml(formatDurationMs(timings.totalMs))}`);
    if (!items.length){
      targetEl.innerHTML = '<div class="muted" style="margin-bottom:12px">No hay datos de tiempos disponibles.</div>';
      targetEl.style.display = '';
      return;
    }
    targetEl.innerHTML = `<div class="timing-summary-panel" style="background:rgba(43,139,255,0.07);border-radius:8px;padding:10px 14px 8px 14px;margin-bottom:12px;border:1px solid #7fc4ff33;box-shadow:0 2px 8px 0 #0001"><div style="font-weight:700;font-size:15px;color:#2b8bff;margin-bottom:6px;">Tiempos y estimaciones del cálculo</div><ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.7;color:#1a2b3c;">${items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
    targetEl.style.display = '';
  }

  function applyOptionsCache(){
    const cached = loadOptionsCache();
    if (cached && typeof cached === 'object'){
      if (maxCredInput && cached.maxcreditos != null) maxCredInput.value = cached.maxcreditos;
      if (maxMateriasInput && cached.maxmaterias != null) maxMateriasInput.value = cached.maxmaterias;
      if (maxDiasInput && cached.maxdias != null) maxDiasInput.value = cached.maxdias;
      if (topNInput && cached.topN != null) topNInput.value = cached.topN;
      if (horaInicioInput && cached.hora_inicio) horaInicioInput.value = cached.hora_inicio;
      if (horaFinInput && cached.hora_fin) horaFinInput.value = cached.hora_fin;
      if (forceBruteInput) forceBruteInput.checked = !!cached.forceBrute;
    } else {
      if (maxDiasInput) maxDiasInput.value = '3';
      if (horaInicioInput) horaInicioInput.value = '06:00';
      if (horaFinInput) horaFinInput.value = '20:00';
      if (forceBruteInput) forceBruteInput.checked = false;
    }
    syncOptionsFromUi();
  }

  applyOptionsCache();
  [maxCredInput, maxMateriasInput, maxDiasInput, topNInput, horaInicioInput, horaFinInput, forceBruteInput].forEach(el=>{
    if (!el) return;
    el.addEventListener('change', syncOptionsFromUi);
    el.addEventListener('blur', syncOptionsFromUi);
  });

  function loadIntervalos(){
    try{
      const arr = JSON.parse(localStorage.getItem('horas_libres')||'null');
      if (Array.isArray(arr)){
        renderIntervalList(arr);
        return arr;
      }
    }catch(e){}
    return [];
  }
  function saveIntervalos(arr){
    localStorage.setItem('horas_libres', JSON.stringify(arr));
    renderIntervalList(arr);
  }
  function renderIntervalList(arr){
    if (!intervalList) return;
    if (!arr || arr.length===0){ intervalList.textContent='No hay intervalos definidos.'; return; }
    intervalList.innerHTML = arr.map((it,idx)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px;border-radius:6px;background:rgba(255,255,255,0.01);margin-bottom:6px">${escapeXml(it.inicio)} - ${escapeXml(it.fin)} [${(it.dias||[]).join(', ')}] <button class="materia-remove" data-idx="${idx}" title="Eliminar intervalo">×</button></div>`).join('');
    Array.from(intervalList.querySelectorAll('button')).forEach(b=> b.addEventListener('click', ()=>{
      const i = parseInt(b.dataset.idx,10);
      const arr0 = JSON.parse(localStorage.getItem('horas_libres')||'[]');
      arr0.splice(i,1);
      saveIntervalos(arr0);
    }));
  }

  addIntervalBtn?.addEventListener('click', ()=>{
    const dias = Array.from(document.querySelectorAll('.diasChk:checked')).map(x=> x.value);
    const inicio = intervalStart.value || '00:00';
    const fin = intervalEnd.value || '00:00';
    if (!dias.length){ intervalList.textContent = 'Selecciona al menos un día.'; return; }
    if (!inicio || !fin){ intervalList.textContent = 'Selecciona inicio y fin.'; return; }
    const arr = loadIntervalos();
    const diasKey = dias.slice().sort().join('|');
    const exists = arr.some(it=>{
      const itDiasKey = (it.dias||[]).slice().sort().join('|');
      return it.inicio === inicio && it.fin === fin && itDiasKey === diasKey;
    });
    if (exists){ return; }
    arr.push({ inicio, fin, dias });
    saveIntervalos(arr);
    statusEl.textContent = 'Intervalo agregado.';
  });

  try{ loadIntervalos(); }catch(e){}

  // Renderizar materias cargadas con checkboxes y créditos (función global para ser usada por varios handlers)
  const loadedEl = document.getElementById('loadedMaterias');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  function renderLoadedMaterias(){
    renderLoadedMateriasCommon();
  }
  window.renderLoadedMaterias = renderLoadedMaterias;

  selectAllBtn?.addEventListener('click', ()=>{
    clearSchedulerMessage();
    syncQuickMateriaSelection(window.__lastLoaded || [], { label: 'las materias cargadas' });
    try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest((window.__scheduleTabs||[]).find(t=>t.id===window.__activeScheduleId)?.best || { materias: [] }); }catch(_){ }
    renderLoadedMaterias();
  });

  function renderSelectedFromBest(best){
    try{
      selectedEl.innerHTML = '';
      const selectedUniverse = mergeMateriasLists(window.__lastLoaded || [], window.__lastLoadedFiltered || []);
      const materiaMap = new Map(selectedUniverse.map(m=>[m.nombre, m]));
      const sels = window.__currentScheduleSelections || {};

      const checkedNames = (window.__lastLoadedFiltered || []).map(m => m.nombre);
      const materiaNames = Array.from(new Set([...checkedNames, ...Object.keys(sels).filter(nombre => !!sels[nombre])])).filter(nombre => materiaMap.has(nombre));
      const countedNames = materiaNames.filter(nombre => !!sels[nombre]);
      const totalCreds = countedNames.reduce((s, nombre) => {
        const mat = materiaMap.get(nombre);
        if (!mat) return s;
        const grupoSel = (mat.grupos||[]).find(g=>g.grupo === sels[nombre]);
        return s + (grupoSel ? (grupoSel.creditos||mat.creditos||0) : 0);
      }, 0);
      const totalMats = countedNames.length;
      if (!materiaNames.length){ selectedEl.innerHTML = '<div class="muted" style="padding:8px">Ninguna.</div>'; return; }

      const h3 = document.createElement('h3'); h3.textContent = `${totalMats} materias · ${totalCreds} créditos`; selectedEl.appendChild(h3);

      materiaNames.sort((a,b)=>{
        const matA = materiaMap.get(a);
        const matB = materiaMap.get(b);
        const obA = matA ? !!matA.obligatoria : false;
        const obB = matB ? !!matB.obligatoria : false;
        const selA = !!sels[a];
        const selB = !!sels[b];
        const rankA = obA ? 0 : (selA ? 1 : 2);
        const rankB = obB ? 0 : (selB ? 1 : 2);
        if (rankA !== rankB) return rankA - rankB;
        if (obA && !obB) return -1; if (!obA && obB) return 1;
        return a.localeCompare(b);
      });

      if (!window.__expandedSelected) window.__expandedSelected = new Set();
      const diasAbrevCard = {LUNES:'LU',MARTES:'MA','MIÉRCOLES':'MI',JUEVES:'JU',VIERNES:'VI','SÁBADO':'SA',DOMINGO:'DO'};

      for (const nombre of materiaNames){
        const mat = materiaMap.get(nombre);
        const grupos = mat
          ? (mat.grupos || []).filter(g => !isGrupoExcluded(nombre, g.grupo || 'Grupo ?'))
          : [];
        const obligatoria = mat ? !!mat.obligatoria : false;
        const selectedGrupoKey = sels[nombre] || '';
        const wrap = document.createElement('div'); wrap.className = 'materia-row-wrap';

        // Header row (clickable to expand/collapse)
        const headerRow = document.createElement('div');
        headerRow.className = 'materia-row';
        headerRow.style.cursor = 'pointer';

        const left = document.createElement('div'); left.className = 'materia-row-left';
        const right = document.createElement('div'); right.className = 'materia-row-right';

        const badge = document.createElement('span');
        badge.className = 'badge ' + (obligatoria ? 'red' : 'blue');
        badge.textContent = obligatoria ? 'OBL' : 'OPT';

        const nameEl = document.createElement('span'); nameEl.style.marginLeft = '6px';
        nameEl.innerHTML = `<strong>${escapeXml(nombre)}</strong>`;

        // Grupo seleccionado actual como hint
        if (selectedGrupoKey){
          const gNumMatch = selectedGrupoKey.match(/(\d+)/);
          const gLabel = gNumMatch ? `G${gNumMatch[1]}` : selectedGrupoKey;
          const selHint = document.createElement('span');
          selHint.style.cssText = 'margin-left:8px;font-size:11px;color:#7fc4ff;font-weight:600';
          selHint.textContent = gLabel;
          nameEl.appendChild(selHint);
        }

        const expandArrow = document.createElement('span'); expandArrow.className = 'expand-arrow'; expandArrow.textContent = '›';
        const credSpan = document.createElement('span'); credSpan.className = 'meta'; credSpan.textContent = `${mat ? (mat.creditos||0) : 0} cr`;

        left.appendChild(badge); left.appendChild(nameEl);
        right.appendChild(credSpan); right.appendChild(expandArrow);
        headerRow.appendChild(left); headerRow.appendChild(right);

        // Groups panel (collapsed by default, expanded if in set)
        const gruposPanel = document.createElement('div'); gruposPanel.className = 'grupos-panel';
        const wasExpanded = window.__expandedSelected.has(nombre);
        if (!wasExpanded){ gruposPanel.classList.add('hidden'); }
        else { headerRow.classList.add('expanded'); expandArrow.classList.add('rotated'); }

        headerRow.addEventListener('click', ()=>{
          const willExpand = gruposPanel.classList.contains('hidden');
          gruposPanel.classList.toggle('hidden');
          headerRow.classList.toggle('expanded', willExpand);
          expandArrow.classList.toggle('rotated', willExpand);
          if (willExpand) window.__expandedSelected.add(nombre);
          else window.__expandedSelected.delete(nombre);
        });

        if (grupos.length === 0){
          const noG = document.createElement('div'); noG.className='grupo-item'; noG.style.color='var(--muted)'; noG.style.gridColumn='1/-1'; noG.textContent='Sin grupos';
          gruposPanel.appendChild(noG);
        } else {
          const otherGroups = getCurrentSelectedGroupObjects(nombre);
          const otherSlots = otherGroups.length > 0 ? computeOccupiedSlots(otherGroups) : {};

          for (const g of grupos){
            const grupoKey = g.grupo || 'Grupo ?';
            const grupoNumMatch = grupoKey.match(/(\d+)/);
            const grupoLabel = grupoNumMatch ? `G${grupoNumMatch[1]}` : grupoKey;
            const isSelected = selectedGrupoKey === grupoKey;
            const isIncompatible = !isSelected && otherGroups.length > 0 && groupConflictsWithSlots(g, otherSlots);

            let cls = 'grupo-item';
            if (isSelected) cls += ' selected';
            else if (isIncompatible) cls += ' incompatible';

            const gItem = document.createElement('div'); gItem.className = cls;

            const horarioStr = (g.horarios||[]).map(h=>{
              const d = diasAbrevCard[(h.dia||'').toUpperCase()] || (h.dia||'').slice(0,2).toUpperCase();
              return `${d} ${(h.hora_inicio||'').slice(0,5)}`;
            }).join(' ');

            const hdrDiv = document.createElement('div'); hdrDiv.className = 'grupo-header';
            const labelSpan = document.createElement('span'); labelSpan.className = 'grupo-label'; labelSpan.textContent = grupoLabel;
            const cuposSpan = document.createElement('span'); cuposSpan.className = 'grupo-cupos'; cuposSpan.textContent = g.cupos != null ? String(g.cupos) : '';
            hdrDiv.appendChild(labelSpan); hdrDiv.appendChild(cuposSpan);

            const profe = g.profesor && g.profesor !== 'NO DISPONIBLE' ? g.profesor : '';
            const profeDiv = document.createElement('div'); profeDiv.className = 'grupo-profe'; profeDiv.textContent = profe || 'Sin profesor';
            const horDiv = document.createElement('div'); horDiv.className = 'grupo-horario'; horDiv.textContent = horarioStr;

            // Botón de exclusión/inclusión
            const exclBtn = document.createElement('button');
            exclBtn.type='button';
            exclBtn.className='grupo-exclude-btn';
            exclBtn.title='Excluir grupo';
            exclBtn.innerHTML = '<span style="color:#ff3555;font-size:18px;">×</span>';
            exclBtn.addEventListener('click', (e)=>{
              e.stopPropagation();
              toggleGrupoExcluded(nombre, grupoKey);
              renderSelectedFromBest((window.__scheduleTabs || []).find(t => t.id === window.__activeScheduleId)?.best || best);
              renderLoadedMateriasCommon();
            });

            gItem.appendChild(hdrDiv); gItem.appendChild(profeDiv); gItem.appendChild(horDiv); gItem.appendChild(exclBtn);

            gItem.addEventListener('click', (e)=>{
              e.stopPropagation();
              if (isIncompatible) return;
              if (isSelected){
                window.__currentScheduleSelections = window.__currentScheduleSelections || {};
                delete window.__currentScheduleSelections[nombre];
                updateScheduleWithNewSelection();
                renderSelectedFromBest((window.__scheduleTabs || []).find(t => t.id === window.__activeScheduleId)?.best || best);
                renderLoadedMateriasCommon();
                return;
              }
              window.__currentScheduleSelections = window.__currentScheduleSelections || {};
              window.__currentScheduleSelections[nombre] = grupoKey;
              updateScheduleWithNewSelection();
              renderSelectedFromBest((window.__scheduleTabs || []).find(t => t.id === window.__activeScheduleId)?.best || best);
              renderLoadedMateriasCommon();
            });

            gruposPanel.appendChild(gItem);
          }
        }

        wrap.appendChild(headerRow); wrap.appendChild(gruposPanel);
        selectedEl.appendChild(wrap);
      }
    }catch(e){
      selectedEl.innerHTML = '<ul>' + (best.materias||[]).map(s=>`<li>${escapeXml(s.nombre)} — Grupo ${escapeXml(s.grupo)}</li>`).join('') + '</ul>';
      console.error('renderSelectedFromBest error', e);
    }
  }
  window.__renderSelectedFromBest = renderSelectedFromBest;

  function renderScheduleTabUI(){
    if (!scheduleTabsEl) return;
    scheduleTabsEl.innerHTML = '';
    const tabs = window.__scheduleTabs || [];
    for (const tab of tabs){
      const wrapper = document.createElement('div');
      wrapper.className = 'schedule-tab-wrap';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'schedule-tab' + (tab.id === window.__activeScheduleId ? ' active' : '');
      btn.textContent = tab.label || 'Horario';
      btn.addEventListener('click', ()=>{
        if (wrapper._clickTimer) clearTimeout(wrapper._clickTimer);
        wrapper._clickTimer = setTimeout(()=>{
          setActiveSchedule(tab.id);
        }, 200);
      });
      btn.addEventListener('dblclick', ()=>{
        if (wrapper._clickTimer) clearTimeout(wrapper._clickTimer);
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'schedule-tab-input';
        input.value = tab.label || 'Horario';
        const commit = ()=>{
          const next = String(input.value || '').trim();
          if (next){ tab.label = next; }
          saveScheduleTabsCache(window.__scheduleTabs || [], window.__activeScheduleId);
          renderScheduleTabUI();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') commit(); });
        btn.replaceWith(input);
        input.focus();
        input.select();
      });
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'schedule-tab-close';
      del.textContent = '×';
      del.title = 'Eliminar horario';
      del.addEventListener('click', (e)=>{
        e.stopPropagation();
        window.__scheduleTabs = (window.__scheduleTabs || []).filter(t=> t.id !== tab.id);
        if (window.__activeScheduleId === tab.id){
          const next = (window.__scheduleTabs[0] && window.__scheduleTabs[0].id) || null;
          window.__activeScheduleId = next;
        }
        saveScheduleTabsCache(window.__scheduleTabs || [], window.__activeScheduleId);
        renderScheduleTabUI();
        if (window.__activeScheduleId) {
          setActiveSchedule(window.__activeScheduleId);
        } else {
          summaryEl.innerHTML = '';
          selectedEl.innerHTML = '';
          if (scheduleEl) { scheduleEl.classList.add('empty'); scheduleEl.innerHTML = ''; }
          // Solo limpiar selección de grupos, no desmarcar materias cargadas
          window.__currentScheduleSelections = {};
          renderLoadedMaterias();
        }
      });
      wrapper.appendChild(btn);
      wrapper.appendChild(del);
      scheduleTabsEl.appendChild(wrapper);
    }
    if (addTabBtn){
      scheduleTabsEl.appendChild(addTabBtn);
    }
  }
  window.__renderScheduleTabUI = renderScheduleTabUI;

  function setActiveSchedule(id){
    window.__activeScheduleId = id;
    saveScheduleTabsCache(window.__scheduleTabs || [], window.__activeScheduleId);
    renderScheduleTabUI();
    const tab = (window.__scheduleTabs || []).find(t=> t.id === id);
    if (tab && tab.best){
      const renderableBest = getRenderableScheduleBest(tab);
      summaryEl.innerHTML = '';
      // Restaurar selecciones ANTES de renderizar para que los hints aparezcan
      window.__currentScheduleSelections = {};
      if (renderableBest && renderableBest.comb){ for (const g of renderableBest.comb){ if (g.materiaNombre) window.__currentScheduleSelections[g.materiaNombre] = g.grupo || ''; } }
      renderSelectedFromBest(renderableBest);
      try{ renderScheduleSVG(renderableBest, tab.opts || {}); }catch(_){ }
      renderLoadedMaterias();
    } else {
      summaryEl.innerHTML = '';
      selectedEl.innerHTML = '';
      if (scheduleEl) { scheduleEl.classList.add('empty'); scheduleEl.innerHTML = ''; }
      window.__currentScheduleSelections = {};
      renderLoadedMaterias();
    }
  }

  function addScheduleTab(empty){
    const tabs = window.__scheduleTabs || [];
    const id = `tab-${Date.now()}-${Math.random().toString(16).slice(2,6)}`;
    const label = `Horario ${tabs.length + 1}`;
    const tab = { id, label, best: empty ? null : undefined, opts: null, createdAt: Date.now() };
    tabs.push(tab);
    window.__scheduleTabs = tabs;
    window.__activeScheduleId = id;
    saveScheduleTabsCache(tabs, id);
    renderScheduleTabUI();
    setActiveSchedule(id);
    return tab;
  }

  addTabBtn?.addEventListener('click', ()=>{
    addScheduleTab(true);
  });

  const deleteAllSchedulesBtn = document.getElementById('deleteAllSchedulesBtn');
  deleteAllSchedulesBtn?.addEventListener('click', ()=>{
    window.__scheduleTabs = [];
    window.__activeScheduleId = null;
    saveScheduleTabsCache([], null);
    renderScheduleTabUI();
    summaryEl.innerHTML = '';
    selectedEl.innerHTML = '';
    if (scheduleEl) { scheduleEl.classList.add('empty'); scheduleEl.innerHTML = ''; }
    // Solo limpiar selección de grupos, no desmarcar materias cargadas
    window.__currentScheduleSelections = {};
    renderLoadedMaterias();
    resultEl.classList.add('hidden');
  });

  // Restore schedule tabs from cache
  try{
    const cachedTabs = loadScheduleTabsCache();
    const safeTabs = sanitizeScheduleTabs(cachedTabs.tabs);
    if (safeTabs.length){
      window.__scheduleTabs = safeTabs;
      window.__activeScheduleId = safeTabs.some(tab => tab.id === cachedTabs.activeId) ? cachedTabs.activeId : safeTabs[0].id;
      renderScheduleTabUI();
      setActiveSchedule(window.__activeScheduleId);
      resultEl.classList.remove('hidden');
    } else if (cachedTabs.tabs && cachedTabs.tabs.length) {
      window.__scheduleTabs = [];
      window.__activeScheduleId = null;
      saveScheduleTabsCache([], null);
    }
  }catch(_){ }

  // Helper: re-renderiza el panel seleccionado con los datos de materias ya cargados
  function reRenderActiveSelected(){
    try{
      const tab = (window.__scheduleTabs||[]).find(t=>t.id===window.__activeScheduleId);
      if (tab && tab.best && typeof renderSelectedFromBest === 'function') renderSelectedFromBest(tab.best);
    }catch(_){ }
  }

  // Cargar materias manuales desde cache si existen
  try{
    const cached = window.__manualCache || loadManualMateriasCache();
    if (cached && cached.length){
      window.__lastLoaded = mergeMateriasLists(window.__lastLoaded || [], cached);
      window.__lastLoadedFiltered = mergeMateriasLists(window.__lastLoadedFiltered || [], cached);
      window.__hasManualCache = true;
      renderLoadedMaterias();
      reRenderActiveSelected();
    }
  }catch(_){ }

  // Cargar materias y selecciones desde cache local
  try{
    const cachedAll = loadMateriasCache();
    if (cachedAll.all && cachedAll.all.length){
      window.__lastLoaded = mergeMateriasLists(window.__lastLoaded || [], cachedAll.all);
      if (cachedAll.filtered && cachedAll.filtered.length){
        window.__lastLoadedFiltered = mergeMateriasLists(window.__lastLoadedFiltered || [], cachedAll.filtered);
      }
      renderLoadedMaterias();
      reRenderActiveSelected();
    }
  }catch(_){ }

  // Restablecer cache manual si algun flujo lo sobreescribe al iniciar
  try{
    setTimeout(()=>{
      if (window.__hasManualCache && (!window.__lastLoaded || window.__lastLoaded.length===0)){
        const cached2 = window.__manualCache || loadManualMateriasCache();
        if (cached2 && cached2.length){
          window.__lastLoaded = cached2;
          window.__lastLoadedFiltered = cached2.slice();
          renderLoadedMaterias();
          reRenderActiveSelected();
        }
      }
    }, 400);
  }catch(_){ }

  deselectAllBtn?.addEventListener('click', ()=>{
    window.__lastLoadedFiltered = [];
    window.__currentScheduleSelections = {};
    updateScheduleWithNewSelection();
    renderLoadedMaterias();
  });
  clearAllBtn?.addEventListener('click', ()=>{
    window.__lastLoaded = [];
    window.__lastLoadedFiltered = [];
    window.__currentScheduleSelections = {};
    window.__manualCache = [];
    window.__hasManualCache = false;
    window.__excludedGrupos = {};
    window.__expandedMaterias = new Set();
    saveManualMateriasCache([]);
    saveMateriasCache();
    localStorage.removeItem('excluded_grupos');
    renderLoadedMaterias();
    try{ if(typeof window.__renderSelectedFromBest==='function') window.__renderSelectedFromBest({ materias: [] }); }catch(_){ }
    if (statusEl) statusEl.textContent = 'Materias eliminadas.';
  });

  try{ dbg.textContent = 'app.js: enlaces creados'; }catch(e){}
  // intentar importar dinámicamente el scheduler para manejar errores de carga
  try{
    import('./scheduler.js').then(mod=>{ generarHorarioOptimoJS = mod.generarHorarioOptimoJS; estimarComplejidadSeleccionJS = mod.estimarComplejidadSeleccionJS; try{ document.getElementById('sp-debug-badge').textContent = 'app.js: scheduler cargado'; }catch(_){} }).catch(async err=>{
      console.error('Error importando scheduler.js:', err);
      try{ document.getElementById('sp-debug-badge').textContent = 'app.js: fallo al cargar scheduler'; }catch(_){}
      // intentar obtener detalles vía fetch
      try{
        const resp = await fetch('./scheduler.js');
        let txt = '';
        try{ txt = await resp.text(); txt = txt.slice(0,1000); }catch(_){ txt = '(no se pudo leer body)'; }
        const msg = `fetch ./scheduler.js => ${resp.status} ${resp.statusText}`;
        console.error(msg, txt);
        if (errorsEl) { errorsEl.classList.remove('hidden'); errorsEl.classList.add('error'); errorsEl.innerHTML = `<strong>Error cargando scheduler.js</strong><div>${msg}</div><pre style="max-height:200px;overflow:auto">${escapeXml(txt)}</pre>`; }
      }catch(fetchErr){
        console.error('Fetch fallo para scheduler.js', fetchErr);
        if (errorsEl) { errorsEl.classList.remove('hidden'); errorsEl.classList.add('error'); errorsEl.textContent = 'No se pudo cargar scheduler.js: '+(err && err.message?err.message:String(err)) + '\nFetch error: '+(fetchErr && fetchErr.message?fetchErr.message:String(fetchErr)); }
      }
    });
  }catch(e){ console.error('Import dinámico fallo', e); }

  if (sampleBtn) sampleBtn.onclick = ()=>{
  // pequeño ejemplo
  const sample = [
    { nombre:'Matemáticas', creditos:3, obligatoria:true, grupos:[{grupo:'A', creditos:3, cupos:10, horarios:[{nombre:'Mate',dia:'LUNES',hora_inicio:'08:00',hora_fin:'10:00',lugar:'Campus'}]}] },
    { nombre:'Física', creditos:3, obligatoria:true, grupos:[{grupo:'1', creditos:3, cupos:10, horarios:[{nombre:'Fis',dia:'MARTES',hora_inicio:'10:00',hora_fin:'12:00',lugar:'Campus'}]}] },
    { nombre:'Historia', creditos:2, obligatoria:false, grupos:[{grupo:'X', creditos:2, cupos:10, horarios:[{nombre:'Hist',dia:'MIÉRCOLES',hora_inicio:'09:00',hora_fin:'11:00',lugar:'Campus'}]}] }
  ];
  window.__lastLoaded = sample;
  try{ renderLoadedMaterias(); }catch(e){}
  statusEl.textContent = 'Ejemplo cargado.';
  try{ document.getElementById('sp-debug-badge').textContent = 'app.js: ejemplo cargado'; }catch(e){}
}

  // file/repo load buttons removed from UI — carga desde repo se realiza manualmente o via import

  // Procesar texto pegado en textarea (JSON o texto similar)
  async function processTextHandler(){
    return processTextHandlerGlobal();
  }
  window.processTextHandler = processTextHandler;
  try{
    if (materiasTextInput){
      let materiasDebounce = null;
      let lastProcessedMateriasText = '';
      materiasTextInput.addEventListener('input', ()=>{
        clearTimeout(materiasDebounce);
        materiasDebounce = setTimeout(async ()=>{
          const raw = (materiasTextInput.value || '').trim();
          if (!raw){
            lastProcessedMateriasText = '';
            if (errorsEl){
              errorsEl.classList.add('hidden');
              errorsEl.classList.remove('error');
              errorsEl.textContent = '';
            }
            return;
          }
          if (raw === lastProcessedMateriasText) return;
          lastProcessedMateriasText = raw;
          await processTextHandler();
        }, 700);
      });
      materiasTextInput.addEventListener('keydown', (event)=>{
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter'){
          event.preventDefault();
          processTextHandler();
        }
      });
    }
  }catch(e){ console.warn('auto process text handler failed', e); }

    // parsePlainTextMaterias moved to module scope

async function loadRepoFromRepo(){
  statusEl.textContent = 'Cargando materias.json desde el repo...';
  try{
    const res = await fetch('../materias.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
      const mapped = mapRepoMaterias(data, { fuente: 'unal' });
      applyDefaultExcludedGroupsForFuente(mapped, 'unal');
      window.__originalRepo = mapped;
      window.__lastLoaded = mapped;
      try{ renderLoadedMaterias(); }catch(e){}
      // removed populateCarreraOptions — no carrera filter select anymore
      statusEl.textContent = 'materias.json cargado.';
  }catch(err){
    statusEl.textContent = 'Error cargando materias.json: '+err.message + ' — Usa servidor local (p.ej. `python -m http.server`)';
    showError('Error cargando materias.json', err);
  }

  

  // Intervalos libres: inicializados fuera de loadRepoFromRepo
}

  // populateCarreraOptions removed — no UI filter for carrera

  // applyCarreraBtn removed (manual filter disabled)

  cancelRunBtn?.addEventListener('click', ()=>{
    if (!currentRunToken) return;
    currentRunToken.cancelled = true;
    cancelRunBtn.disabled = true;
    statusEl.textContent = 'Cancelando calculo...';
    setGenerationProgress({ state: 'cancelled', text: 'Cancelando calculo...', percent: Number(String(generationProgressPercentEl?.textContent || '0').replace('%','')) || 0 });
  });

  // Manejador de generar horario (colocado aquí para usar las referencias del DOM ya resueltas)
  runBtn.onclick = async ()=>{
    console.log('Generar horario: botón pulsado');
    const data = window.__lastLoadedFiltered && window.__lastLoadedFiltered.length ? window.__lastLoadedFiltered : window.__lastLoaded;
    if (!data){ statusEl.textContent='Carga primero un JSON o usa el ejemplo.'; return; }
    // Filtrar grupos excluidos individualmente
    const dataForRun = (data||[]).map(m=>{
      const excl = (window.__excludedGrupos||{})[m.nombre];
      if (!excl || excl.size===0) return m;
      return {...m, grupos: (m.grupos||[]).filter(g=> !excl.has(g.grupo||'Grupo ?'))};
    });
    const horasLibres = (()=>{ try{ const v = JSON.parse(localStorage.getItem('horas_libres')||'[]'); return Array.isArray(v)? v : []; }catch(e){ return []; } })();
    const baseOpts = syncOptionsFromUi();
    const opts = {
      ...baseOpts,
      usarCupos: usarCuposInput.checked,
      usarVirtuales: usarVirtualesInput ? usarVirtualesInput.checked : false,
      horas_libres: horasLibres
    };
    clearSchedulerMessage();
    if (!estimarComplejidadSeleccionJS){
      statusEl.textContent = 'El estimador de complejidad aún no está disponible.';
      return;
    }
    lastRunTimings = null;
    currentRunToken = { cancelled: false };
    const complexityEstimate = estimarComplejidadSeleccionJS(dataForRun, opts, currentRunToken);
    runBtn.disabled = true;
    if (cancelRunBtn){ cancelRunBtn.classList.remove('hidden'); cancelRunBtn.disabled = false; }
    statusEl.textContent = 'Generando...';
    setGenerationProgress({ state: 'running', text: 'Preparando calculo...', percent: 0, exact: false });
    resultEl.classList.add('hidden');
    summaryEl.innerHTML = '';
    try{
      console.log('Llamando a generarHorarioOptimoJS con opts', opts);
      if (!generarHorarioOptimoJS) throw new Error('generarHorarioOptimoJS no está disponible');
      const resultados = await generarHorarioOptimoJS(dataForRun, opts, handleGenerationProgress, currentRunToken);
      if (resultados && !Array.isArray(resultados) && resultados.timings) lastRunTimings = resultados.timings;
      const timedOut = !!(resultados && resultados.__timedOut);
      console.log('generarHorarioOptimoJS finalizó, resultado:', resultados);
      if (!resultados || (Array.isArray(resultados) && !resultados.length)){
        setGenerationProgress({ state: 'done', text: timedOut ? 'Tiempo agotado sin resultados parciales.' : 'Analisis completado. No se encontro un horario.', percent: 100 });
        statusEl.textContent = timedOut ? 'Tiempo agotado sin encontrar un horario viable.' : 'No se encontró horario.';
        renderTimingSummary(summaryEl, complexityEstimate, lastRunTimings);
        return;
      }

      const rawResultList = Array.isArray(resultados) ? resultados : [resultados];
      const resultList = rawResultList.filter(result => resultRespectsSchedulerLimits(result, opts));
      if (!resultList.length){
        setGenerationProgress({ state: 'done', text: timedOut ? 'Tiempo agotado, pero los parciales no cumplieron las restricciones.' : 'Analisis completado. No se encontro un horario valido.', percent: 100 });
        statusEl.textContent = timedOut
          ? 'Tiempo agotado y no se encontró un horario parcial que cumpla las restricciones.'
          : 'No se encontró un horario que cumpla las restricciones.';
        renderTimingSummary(summaryEl, complexityEstimate, lastRunTimings);
        return;
      }

      statusEl.textContent = timedOut
        ? `${resultList.length} horario(s) parcial(es) válido(s) encontrado(s) antes de interrumpir el cálculo.`
        : `${resultList.length} horario(s) válido(s) encontrado(s).`;
      setGenerationProgress({ state: 'done', text: timedOut ? `Tiempo agotado. ${resultList.length} resultado(s) parcial(es) válido(s).` : `Analisis completado. ${resultList.length} horario(s) válido(s) encontrado(s).`, percent: 100 });
      resultEl.classList.remove('hidden');
      renderTimingSummary(summaryEl, complexityEstimate, lastRunTimings);

      // Agregar los nuevos horarios como pestañas adicionales
      const newTabIds = [];
      const prevTabs = window.__scheduleTabs || [];
      let tabCount = prevTabs.length;
      for (let ri = 0; ri < resultList.length; ri++){
        const best = resultList[ri];
        const id = `tab-${Date.now()}-${Math.random().toString(16).slice(2,6)}-${ri}`;
        const label = resultList.length === 1
          ? `Horario ${tabCount + 1}`
          : `Horario ${tabCount + 1} (${ri+1}/${resultList.length})`;
        const tab = { id, label, best, customComb: null, opts, createdAt: Date.now(), __auto: true };
        prevTabs.push(tab);
        newTabIds.push(id);
        tabCount++;
      }
      window.__scheduleTabs = prevTabs;
      window.__activeScheduleId = newTabIds[0];
      saveScheduleTabsCache(window.__scheduleTabs, window.__activeScheduleId);
      renderScheduleTabUI();
      setActiveSchedule(window.__activeScheduleId);

      const downloadBtn = document.getElementById('downloadBtn');
      const downloadExcelBtn = document.getElementById('downloadExcelBtn');
      const activeBest = resultList[0];
      try{ renderScheduleSVG(activeBest, opts); if (downloadBtn) { downloadBtn.classList.remove('hidden'); downloadBtn.onclick = ()=> downloadScheduleSVG(activeBest, opts); } if (downloadExcelBtn) { downloadExcelBtn.classList.remove('hidden'); downloadExcelBtn.onclick = ()=> downloadScheduleExcel(); } }catch(e){ console.warn('No se pudo renderizar imagen del horario', e); if (scheduleEl) scheduleEl.innerHTML = ''; }
    }catch(err){
      if (err && err.name === 'SchedulerCancelledError'){
        setGenerationProgress({ state: 'cancelled', text: 'Calculo cancelado.', percent: 100 });
        statusEl.textContent = 'Calculo cancelado.';
        renderTimingSummary(summaryEl, complexityEstimate, lastRunTimings);
        clearSchedulerMessage();
      } else {
        setGenerationProgress({ state: 'error', text: 'Ocurrio un error durante la generacion.', percent: 100 });
        statusEl.textContent = 'Error: '+(err && err.message?err.message:String(err)); showError('Error generando horarios', err);
      }
    } finally {
      currentRunToken = null;
      runBtn.disabled = false;
      if (cancelRunBtn){ cancelRunBtn.classList.add('hidden'); cancelRunBtn.disabled = false; }
    }
  }

  // indicate ready
  try{ document.getElementById('sp-debug-badge').textContent = 'app.js: listo'; }catch(e){}

  // intentar autoload de materias.json (mejor esfuerzo)
  // autoload removed (botón de cargar repo eliminado)

  // Cargar recursos de Datos (UdeA / Antioquia) para poblar selects cuando el usuario lo pida
  const datosCache = {};
  async function loadDatosFuente(fuente){
    if (datosCache[fuente]) return datosCache[fuente];
    const candidates = [];
    if (fuente === 'unal'){
      // Priorizar el archivo UNAL.json (nuevo formato). Mantener fallback a carreras_por_facultad.json
      candidates.push('./Datos/UNAL.json','../Datos/UNAL.json','/Datos/UNAL.json','Datos/UNAL.json','./Datos/carreras_por_facultad.json','../Datos/carreras_por_facultad.json','/Datos/carreras_por_facultad.json','Datos/carreras_por_facultad.json');
    } else if (fuente === 'udea'){
      candidates.push('./Datos/UdeA.json','../Datos/UdeA.json','/Datos/UdeA.json','Datos/UdeA.json');
    } else if (fuente === 'antioquia'){
      candidates.push('./Datos/carreras.json','../Datos/carreras.json','/Datos/carreras.json','Datos/carreras.json');
    } else {
      candidates.push('./Datos/carreras_por_facultad.json','../Datos/carreras_por_facultad.json','/Datos/carreras_por_facultad.json','Datos/carreras_por_facultad.json');
    }
    let lastErr = null;
    for (const path of candidates){
      try{
        console.log('Intentando cargar', path, 'para fuente', fuente);
        const res = await fetch(path);
        if (!res.ok) { lastErr = new Error('HTTP '+res.status+' '+res.statusText+' ('+path+')'); console.warn('fetch', path, '=>', res.status); continue; }
        const data = await res.json();
        datosCache[fuente] = data;
        return data;
      }catch(e){ lastErr = e; console.warn('Error fetch', path, e); continue; }
    }
    // si falló todo
    console.warn('No se pudo cargar datos de fuente', fuente, lastErr);
    try{ if (statusEl) statusEl.textContent = `No se pudo cargar datos de ${fuente}: ${lastErr && lastErr.message ? lastErr.message : 'error desconocido' } — Asegura servir el sitio con un servidor local.`; }catch(_){ }
    try{ if (errorsEl) { errorsEl.classList.remove('hidden'); errorsEl.classList.add('error'); errorsEl.textContent = `Error cargando datos de ${fuente}: ${lastErr && lastErr.message ? lastErr.message : 'error desconocido' }`; } }catch(_){ }
    return null;
  }

  function normalizeCatalogKey(value){
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function cleanCatalogLabel(value){
    return String(value || '').replace(/^\s*\d+\s*/, '').trim();
  }

  function formatSedeLabel(value){
    return cleanCatalogLabel(value)
      .replace(/^SEDE\s+/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toLocaleUpperCase('es-CO') + word.slice(1).toLocaleLowerCase('es-CO'))
      .join(' ');
  }

  function formatFacultadLabel(value){
    return cleanCatalogLabel(value)
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toLocaleUpperCase('es-CO') + word.slice(1).toLocaleLowerCase('es-CO'))
      .join(' ');
  }

  function formatCarreraLabel(value){
    return String(value || '').trim();
  }

  function catalogValueMatches(selectedValue, candidateValue){
    const selected = normalizeCatalogKey(selectedValue);
    const candidate = normalizeCatalogKey(candidateValue);
    if (!selected) return true;
    return candidate === selected || candidate.includes(selected) || selected.includes(candidate);
  }

  function buildCatalogEntries(fuente, data){
    if (!data) return [];
    if (Array.isArray(data)){
      return data.map(item => ({
        universidad: item.universidad || fuente,
        sede: item.sede || '',
        facultad: item.facultad || '',
        carrera: item.carrera || ''
      })).filter(item => item.carrera);
    }
    if (fuente === 'unal'){
      return Object.entries(data).flatMap(([sede, facultades]) =>
        Object.entries(facultades || {}).flatMap(([facultad, carreras]) =>
          (Array.isArray(carreras) ? carreras : []).map(carrera => ({ universidad: 'Universidad Nacional', sede, facultad, carrera }))
        )
      );
    }
    if (fuente === 'udea'){
      return Object.entries(data).flatMap(([sede, facultades]) =>
        Object.entries(facultades || {}).flatMap(([facultad, carreras]) =>
          (Array.isArray(carreras) ? carreras : []).map(carrera => ({ universidad: 'Universidad de Antioquia', sede, facultad, carrera }))
        )
      );
    }
    return [];
  }

  function getUniqueCatalogValues(entries, field, filters = {}){
    return Array.from(new Set(
      entries
        .filter(entry => Object.entries(filters).every(([filterField, filterValue]) => catalogValueMatches(filterValue, entry[filterField] || '')))
        .map(entry => entry[field])
        .filter(Boolean)
    )).sort((left, right) => cleanCatalogLabel(left).localeCompare(cleanCatalogLabel(right), 'es'));
  }

  function fillSelect(selectEl, values, placeholder, formatLabel = cleanCatalogLabel){
    if (!selectEl) return;
    const previousValue = selectEl.value;
    selectEl.innerHTML = `<option value="">${placeholder}</option>`;
    for (const value of values){
      const option = document.createElement('option');
      option.value = value;
      option.textContent = formatLabel(value);
      selectEl.appendChild(option);
    }
    if (values.some(value => value === previousValue)) selectEl.value = previousValue;
  }

  function setSelectEnabled(selectEl, enabled){
    if (!selectEl) return;
    selectEl.disabled = !enabled;
  }

  async function refreshCatalogSelectors(){
    const fuente = universidadSelect ? universidadSelect.value : '';
    fillSelect(facultadSelect, [], '-- --');
    fillSelect(carreraImportSelect, [], '-- --');
    setSelectEnabled(sedeSelect, false);
    setSelectEnabled(facultadSelect, false);
    setSelectEnabled(carreraImportSelect, false);
    if (!fuente) return;

    const rawData = await loadDatosFuente(fuente);
    if (!rawData){ try{ if (statusEl) statusEl.textContent = 'No se pudieron cargar los datos de la fuente.'; }catch(_){}; return; }

    const entries = buildCatalogEntries(fuente, rawData);
    if (!entries.length){
      try{ if (statusEl) statusEl.textContent = 'No se encontraron carreras válidas en el catálogo.'; }catch(_){ }
      return;
    }

    if (sedeSelect){
      const sedes = getUniqueCatalogValues(entries, 'sede');
      const shouldPopulateSede = sedes.length > 0;
      if (shouldPopulateSede){
        fillSelect(sedeSelect, sedes, '-- --', formatSedeLabel);
        setSelectEnabled(sedeSelect, true);
        if (!sedeSelect.value && sedes.length === 1) sedeSelect.value = sedes[0];
      } else {
        fillSelect(sedeSelect, [], '-- --');
      }
    }

    if (sedeSelect && !sedeSelect.disabled && !sedeSelect.value) return;

    const filters = {};
    if (sedeSelect && sedeSelect.value) filters.sede = sedeSelect.value;
    const facultades = getUniqueCatalogValues(entries, 'facultad', filters);
    fillSelect(facultadSelect, facultades, '-- --', formatFacultadLabel);
    setSelectEnabled(facultadSelect, facultades.length > 0);
  }

  async function refreshCarreraSelector(){
    const fuente = universidadSelect ? universidadSelect.value : '';
    if (!fuente) return;
    const rawData = await loadDatosFuente(fuente);
    if (!rawData) return;
    const entries = buildCatalogEntries(fuente, rawData);
    const filters = {};
    if (sedeSelect && sedeSelect.value) filters.sede = sedeSelect.value;
    if (facultadSelect && facultadSelect.value) filters.facultad = facultadSelect.value;
    if ((sedeSelect && !sedeSelect.disabled && !filters.sede) || !filters.facultad){
      fillSelect(carreraImportSelect, [], '-- --', formatCarreraLabel);
      setSelectEnabled(carreraImportSelect, false);
      return;
    }
    const carreras = getUniqueCatalogValues(entries, 'carrera', filters);
    fillSelect(carreraImportSelect, carreras, '-- --', formatCarreraLabel);
    setSelectEnabled(carreraImportSelect, carreras.length > 0);
    try{
      if (carreraImportSelect.options && carreraImportSelect.options.length === 2){
        carreraImportSelect.selectedIndex = 1;
        carreraImportSelect.dispatchEvent(new Event('change'));
      }
    }catch(_){ }
  }

  if (universidadSelect) universidadSelect.onchange = async ()=>{
    const f = universidadSelect.value;
    try{
      console.log('universidadSelect change ->', f);
      if (statusEl) statusEl.textContent = `Cargando datos para ${f}...`;
    }catch(_){ }
    const importRowEl = document.getElementById('importRowSection');
    const cmFormEl = document.getElementById('customMateriaForm');
    const historialLabelEl = historialText ? historialText.closest('label') : null;

    function updateHistorialVisibility(selectedUniversity){
      if (!historialLabelEl) return;
      const hideHistorial = selectedUniversity === 'udea';
      historialLabelEl.classList.toggle('hidden', hideHistorial);
      if (hideHistorial) {
        if (histResult) {
          histResult.classList.add('hidden');
          histResult.textContent = '';
        }
      }
    }

    updateHistorialVisibility(universidadSelect ? universidadSelect.value : '');

    if (!f){
      if (importRowEl) importRowEl.classList.add('hidden');
      if (cmFormEl) cmFormEl.classList.add('hidden');
      if (histResult) {
        histResult.classList.add('hidden');
        histResult.textContent = '';
      }
      return;
    }

    if (f === 'otro'){
      if (importRowEl) importRowEl.classList.add('hidden');
      if (cmFormEl) cmFormEl.classList.remove('hidden');
      if (!window.__cmGrupos || !window.__cmGrupos.length){
        window.__cmGrupos = [{cupos:0, profesor:'', horarios:[{dia:'LUNES', hora_inicio:'08:00', hora_fin:'10:00', lugar:''}]}];
      }
      renderCmGrupos();
      return;
    } else {
      if (importRowEl) importRowEl.classList.remove('hidden');
      if (cmFormEl) cmFormEl.classList.add('hidden');
    }
    updateHistorialVisibility(f);
    if (!f) return;
    await refreshCatalogSelectors();
  };

  if (sedeSelect) sedeSelect.onchange = async ()=>{
    await refreshCatalogSelectors();
  };

  try{ refreshCatalogSelectors(); }catch(_){ }

  function renderCmGrupos(){
    const container = document.getElementById('cmGruposContainer');
    if (!container) return;
    const DIAS = ['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
    const DIAS_ABR = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    const grupos = window.__cmGrupos || [];
    container.innerHTML = '';
    const gruposGrid = document.createElement('div');
    gruposGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:4px';
    grupos.forEach((grupo, gi) => {
      const INPUT_H = 'height:30px;box-sizing:border-box';
      const card = document.createElement('div');
      card.style.cssText = 'position:relative;border:1px solid var(--line,#333);border-radius:8px;padding:7px 10px;padding-top:24px';
      // Botón × esquina superior derecha
      const delGrupoBtn = document.createElement('button'); delGrupoBtn.type='button'; delGrupoBtn.className='secondary';
      delGrupoBtn.style.cssText='position:absolute;top:3px;right:3px;padding:0 7px;font-size:13px;line-height:20px;z-index:2;display:inline-block;width:auto'; delGrupoBtn.textContent='×';
      delGrupoBtn.addEventListener('click', ()=>{ window.__cmGrupos.splice(gi, 1); renderCmGrupos(); });
      card.appendChild(delGrupoBtn);
      // Cabecera del grupo
      const hdr = document.createElement('div');
      hdr.style.cssText = 'display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-bottom:4px';
      const numLabel = document.createElement('span');
      numLabel.style.cssText = 'font-size:11px;font-weight:700;color:var(--accent2,#7fc4ff);min-width:44px';
      numLabel.textContent = `Grupo ${gi+1}`;
      const cuposInput = document.createElement('input');
      cuposInput.type = 'number';
      cuposInput.value = grupo.cupos;
      cuposInput.min = '0';
      cuposInput.style.cssText = `width:46px;font-size:12px;${INPUT_H}`;
      cuposInput.placeholder = '0';
      cuposInput.title = 'Cupos';
      cuposInput.addEventListener('input', ()=>{ window.__cmGrupos[gi].cupos = parseInt(cuposInput.value)||0; });
      const cuposWrap = document.createElement('label');
      cuposWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;font-size:10px';
      cuposWrap.textContent = 'Cupos';
      cuposWrap.appendChild(cuposInput);
      const profInput = document.createElement('input');
      profInput.type = 'text';
      profInput.value = grupo.profesor;
      profInput.style.cssText = `width:100px;font-size:12px;${INPUT_H}`;
      profInput.placeholder = 'Profesor';
      profInput.addEventListener('input', ()=>{ window.__cmGrupos[gi].profesor = profInput.value; });
      const profWrap = document.createElement('label');
      profWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;font-size:10px;flex:1;min-width:70px';
      profWrap.textContent = 'Profesor';
      profWrap.appendChild(profInput);
      hdr.appendChild(numLabel); hdr.appendChild(cuposWrap); hdr.appendChild(profWrap);
      card.appendChild(hdr);
      // Horarios — grid de 2 por fila
      const horariosGrid = document.createElement('div');
      horariosGrid.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-bottom:4px';
      grupo.horarios.forEach((hor, hi) => {
        const horRow = document.createElement('div');
        horRow.style.cssText = 'display:flex;gap:4px;align-items:flex-end;flex-wrap:wrap;background:var(--surface2,rgba(255,255,255,.04));border-radius:5px;padding:4px 5px';
        const diaSelect = document.createElement('select');
        diaSelect.style.cssText = `font-size:12px;width:70px;${INPUT_H}`;
        DIAS.forEach((d,di) => { const o=document.createElement('option'); o.value=d; o.textContent=DIAS_ABR[di]; if(hor.dia===d) o.selected=true; diaSelect.appendChild(o); });
        diaSelect.addEventListener('change', ()=>{ window.__cmGrupos[gi].horarios[hi].dia = diaSelect.value; });
        const diaWrap = document.createElement('label');
        diaWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;font-size:10px';
        diaWrap.textContent = 'Día';
        diaWrap.appendChild(diaSelect);
        const iniInput = document.createElement('input');
        iniInput.type = 'time';
        iniInput.value = hor.hora_inicio;
        iniInput.style.cssText = `font-size:12px;width:126px;${INPUT_H}`;
        iniInput.addEventListener('change', ()=>{ window.__cmGrupos[gi].horarios[hi].hora_inicio = iniInput.value; });
        const iniWrap = document.createElement('label');
        iniWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;font-size:10px';
        iniWrap.textContent = 'Inicio';
        iniWrap.appendChild(iniInput);
        const finInput = document.createElement('input');
        finInput.type = 'time';
        finInput.value = hor.hora_fin;
        finInput.style.cssText = `font-size:12px;width:126px;${INPUT_H}`;
        finInput.addEventListener('change', ()=>{ window.__cmGrupos[gi].horarios[hi].hora_fin = finInput.value; });
        const finWrap = document.createElement('label');
        finWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;font-size:10px';
        finWrap.textContent = 'Fin';
        finWrap.appendChild(finInput);
        const lugInput = document.createElement('input');
        lugInput.type = 'text';
        lugInput.value = hor.lugar||'';
        lugInput.style.cssText = `width:68px;font-size:12px;${INPUT_H}`;
        lugInput.placeholder = 'Aula';
        lugInput.addEventListener('input', ()=>{ window.__cmGrupos[gi].horarios[hi].lugar = lugInput.value; });
        const lugWrap = document.createElement('label');
        lugWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;font-size:10px';
        lugWrap.textContent = 'Lugar';
        lugWrap.appendChild(lugInput);
        const delHorBtn = document.createElement('button');
        delHorBtn.type = 'button';
        delHorBtn.className = 'secondary';
        delHorBtn.style.cssText = 'padding:1px 4px;font-size:10px;align-self:flex-end';
        delHorBtn.textContent = '×';
        delHorBtn.addEventListener('click', ()=>{ window.__cmGrupos[gi].horarios.splice(hi, 1); renderCmGrupos(); });
        horRow.appendChild(diaWrap); horRow.appendChild(iniWrap); horRow.appendChild(finWrap); horRow.appendChild(lugWrap); horRow.appendChild(delHorBtn);
        horariosGrid.appendChild(horRow);
      });
      card.appendChild(horariosGrid);
      const addHorBtn = document.createElement('button');
      addHorBtn.type = 'button';
      addHorBtn.style.cssText = 'padding:3px 10px;font-size:11px;margin-top:2px';
      addHorBtn.textContent = '+ Horario';
      addHorBtn.addEventListener('click', ()=>{
        window.__cmGrupos[gi].horarios.push({dia:'LUNES', hora_inicio:'08:00', hora_fin:'10:00', lugar:''});
        renderCmGrupos();
      });
      card.appendChild(addHorBtn);
      gruposGrid.appendChild(card);
    });
    container.appendChild(gruposGrid);
  }

  document.getElementById('cmAddGrupoBtn')?.addEventListener('click', ()=>{
    window.__cmGrupos = window.__cmGrupos || [];
    window.__cmGrupos.push({cupos:0, profesor:'', horarios:[{dia:'LUNES', hora_inicio:'08:00', hora_fin:'10:00', lugar:''}]});
    renderCmGrupos();
  });

  document.getElementById('cmAddMateriaBtn')?.addEventListener('click', ()=>{
    const cmStatus = document.getElementById('cmStatus');
    const nombre = (document.getElementById('cmNombre')?.value||'').trim();
    const codigo = (document.getElementById('cmCodigo')?.value||'').trim();
    const creditos = parseInt(document.getElementById('cmCreditos')?.value||'3')||3;
    const obligatoria = (document.getElementById('cmTipo')?.value||'optativa') === 'obligatoria';
    if (!nombre){ if(cmStatus){ cmStatus.textContent='El nombre es requerido.'; cmStatus.style.color='#f55'; } return; }
    if (!window.__cmGrupos || !window.__cmGrupos.length){ if(cmStatus){ cmStatus.textContent='Agrega al menos un grupo.'; cmStatus.style.color='#f55'; } return; }
    const grupos = window.__cmGrupos.map((g, gi) => ({
      grupo: `Grupo ${gi+1}`, creditos, cupos: g.cupos||0, profesor: g.profesor||'',
      horarios: g.horarios.map(h => ({ nombre, dia: h.dia, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, lugar: h.lugar||'' }))
    }));
    const mapped = mapRepoMaterias([{ nombre, codigo, creditos, obligatoria, grupos }]);
    const manualTagged = mapped.map(m => ({...m, __manual: true}));
    const existingManual = window.__manualCache || loadManualMateriasCache();
    const mergedManual = mergeMateriasLists(existingManual, manualTagged);
    saveManualMateriasCache(mergedManual);
    window.__manualCache = mergedManual;
    window.__hasManualCache = mergedManual.length > 0;
    window.__lastLoaded = mergeMateriasLists(window.__lastLoaded || [], manualTagged);
    window.__lastLoadedFiltered = (window.__lastLoadedFiltered || []).filter(x => !manualTagged.some(m => m.nombre === x.nombre));
    if (typeof window.renderLoadedMaterias === 'function') window.renderLoadedMaterias();
    else renderLoadedMateriasCommon();
    // Reset form
    const cmNEl = document.getElementById('cmNombre'); if(cmNEl) cmNEl.value = '';
    const cmCEl = document.getElementById('cmCodigo'); if(cmCEl) cmCEl.value = '';
    const cmCrEl = document.getElementById('cmCreditos'); if(cmCrEl) cmCrEl.value = '3';
    const cmTEl = document.getElementById('cmTipo'); if(cmTEl) cmTEl.value = 'optativa';
    window.__cmGrupos = [{cupos:0, profesor:'', horarios:[{dia:'LUNES', hora_inicio:'08:00', hora_fin:'10:00', lugar:''}]}];
    renderCmGrupos();
    if(cmStatus){ cmStatus.textContent=`“${nombre}” agregada.`; cmStatus.style.color='var(--accent,#7fc4ff)'; }
  });

  facultadSelect.onchange = async ()=>{
    await refreshCarreraSelector();
  };

  if (carreraImportSelect) carreraImportSelect.onchange = async (e)=>{
    if (window.__hasManualCache && (!e || !e.isTrusted)) return;
    const f = universidadSelect ? universidadSelect.value : null; if (!f){ statusEl.textContent='Selecciona una universidad.'; return; }
    const carrera = carreraImportSelect.value; if (!carrera){ statusEl.textContent='Selecciona una carrera.'; return; }
    clearSchedulerMessage();
    statusEl.textContent = `Cargando materias para ${carrera}...`;
    const aprobadasRaw = (window.__historialAprobadas||[]);
    const aprobadas = aprobadasRaw.map(s=> s.split(' - ')[0] || s);
    const historialTxt = historialText ? historialText.value : '';
    try{
      const universidad = fuenteToUniversidad(f);
      const sede = sedeSelect ? sedeSelect.value : '';
      const facultad = facultadSelect ? facultadSelect.value : '';
      const { data, fromCache } = await fetchMateriasFromApi({ fuente: f, universidad, sede, facultad, carrera, aprobadas, historial: historialTxt });
      const aprobadasDict = {};
      for (const a of aprobadas){
        if (!a) continue;
        const code = String(a).toLowerCase();
        aprobadasDict[code] = true;
      }
      aprobadasDict.__names = aprobadasRaw.map(s=>{
        if (!s) return '';
        if (String(s).includes(' - ')) return String(s).split(' - ', 2)[1].toLowerCase();
        return String(s).toLowerCase();
      }).filter(Boolean);
      const hasEnglishApproved = (aprobadasDict.__names || []).some(n=> n.includes('ingles') || n.includes('inglés') || n.includes('intensivo') || n.includes('virtual')) || Object.keys(aprobadasDict).some(k=> k.includes('ing'));
      const filtered = (data || []).filter(d=>{
        const nombre = String(d && d.nombre ? d.nombre : '').toLowerCase();
        if (hasEnglishApproved && (nombre.includes('ingles') || nombre.includes('inglés') || nombre.includes('intensivo') || nombre.includes('virtual'))){
          return false;
        }
        return cumplePrereqsJS(d, aprobadasDict);
      });
      const mapped = mapRepoMaterias(filtered || [], { fuente: f });
      applyDefaultExcludedGroupsForFuente(mapped, f);
      window.__lastLoaded = mergeMateriasLists(window.__lastLoaded || [], mapped);
      if (window.__manualCache && window.__manualCache.length){
        window.__lastLoaded = mergeMateriasLists(window.__lastLoaded, window.__manualCache);
      }
      window.__lastLoadedFiltered = (window.__lastLoadedFiltered || []).filter(x => !mapped.some(m => m.nombre === x.nombre));
      saveMateriasCache();
      try{ renderLoadedMaterias(); }catch(e){}
      clearSchedulerMessage();
      statusEl.textContent = `Se cargaron ${mapped.length} materias desde la historia académica ${fromCache ? '(caché)' : '(API)'}.`;
    }catch(err){
      statusEl.textContent = `Error cargando materias desde base de datos: ${err.message}`;
      showError('Error cargando materias desde base de datos', err);
    }
  };

  // Si sólo hay una opción de carrera (placeholder + 1), auto-seleccionarla y ejecutar el handler
  try{
    if (!window.__hasManualCache && carreraImportSelect && carreraImportSelect.options && carreraImportSelect.options.length === 2){
      // selecciona la única carrera y llama al handler async
      carreraImportSelect.selectedIndex = 1;
      if (typeof carreraImportSelect.onchange === 'function') carreraImportSelect.onchange();
    }
  }catch(_){ }

  function persistHistorialAprobadas(aprobadas){
    const nextAprobadas = Array.isArray(aprobadas) ? aprobadas : [];
    window.__historialAprobadas = nextAprobadas;
    if (nextAprobadas.length){
      localStorage.setItem('historial_aprobadas', JSON.stringify(nextAprobadas));
    } else {
      localStorage.removeItem('historial_aprobadas');
    }
  }

  function renderHistorialAprobadas(aprobadas, options = {}){
    if (!histResult) return;
    const items = Array.isArray(aprobadas) ? aprobadas : [];
    const title = options.title || 'Aprobadas extraídas';
    histResult.classList.remove('hidden');
    if (!items.length){
      histResult.textContent = options.emptyText || 'Historial vacío.';
      return;
    }
    histResult.innerHTML = `
      <div class="historial-aprobadas-header">
        <strong>${escapeXml(title)}: ${items.length}</strong>
        <button type="button" class="historial-aprobada-remove" data-clear-historial="1" title="Borrar historial cargado">×</button>
      </div>
    `;
  }

  async function refreshMateriasForCurrentSelection(){
    if (!carreraImportSelect || !carreraImportSelect.value || typeof carreraImportSelect.onchange !== 'function') return;
    await carreraImportSelect.onchange({ isTrusted: true });
  }

  if (histResult){
    histResult.addEventListener('click', async (event)=>{
      const removeBtn = event.target.closest('[data-clear-historial]');
      if (!removeBtn) return;
      persistHistorialAprobadas([]);
      renderHistorialAprobadas([], { emptyText: 'Historial vacío.' });
      statusEl.textContent = 'Historial actualizado. No quedan materias aprobadas.';
      try{
        await refreshMateriasForCurrentSelection();
      }catch(err){
        console.warn('No se pudieron refrescar las materias tras eliminar una aprobada', err);
      }
    });
  }

  // Procesar historial automáticamente al pegar/editar solo para UNAL
  let histDebounce = null;
  historialText.addEventListener('input', ()=>{
    clearTimeout(histDebounce);
    histDebounce = setTimeout(()=>{
      const txt = (historialText.value||'').trim();
      if (!txt){ persistHistorialAprobadas([]); renderHistorialAprobadas([], { emptyText: 'Historial vacío.' }); return; }
      // Only process if Universidad Nacional is selected
      if (universidadSelect && universidadSelect.value !== 'unal'){
        histResult.classList.remove('hidden'); histResult.textContent = 'La extracción automática de historial solo está disponible para la Universidad Nacional.';
        return;
      }
      const aprobadas = extraerMateriasAprobadasJS(txt);
      persistHistorialAprobadas(aprobadas);
      renderHistorialAprobadas(aprobadas, { title: 'Aprobadas extraídas', emptyText: 'Historial vacío.' });
      historialText.value = '';
      statusEl.textContent = `Historial procesado. Materias aprobadas: ${aprobadas.length}`;
    }, 500);
  });

  // cargar historial si existe en cache y procesarlo automáticamente si la fuente es UNAL
  try{
    const h = JSON.parse(localStorage.getItem('historial_aprobadas')||'null');
    if (h){ persistHistorialAprobadas(h); renderHistorialAprobadas(h, { title: 'Historial (cache)', emptyText: 'Historial vacío.' }); }
  }catch(e){}

  // seguridad extra: si el scheduler no se cargó en 3s, desactivar botón y mostrar nota
  setTimeout(()=>{
    if (!generarHorarioOptimoJS){ try{ document.getElementById('sp-debug-badge').textContent = 'app.js: scheduler NO cargado'; }catch(_){}
      if (runBtn) runBtn.disabled = true;
      if (errorsEl) { errorsEl.classList.remove('hidden'); errorsEl.classList.add('error'); errorsEl.textContent = 'scheduler.js no cargó — revisa Network/Console'; }
    }
  }, 3000);

  }catch(initErr){ console.error('DOMContentLoaded init failed', initErr); try{ const dbg2=document.getElementById('sp-debug-badge'); if(dbg2) dbg2.textContent='app.js: init error'; }catch(_){ } showError('Error inicializando la UI', initErr); }
}); // end DOMContentLoaded

function mapRepoMaterias(data, options = {}){
  const diasPorNumero = {
    1: 'LUNES',
    2: 'MARTES',
    3: 'MIÉRCOLES',
    4: 'JUEVES',
    5: 'VIERNES',
    6: 'SÁBADO',
    7: 'DOMINGO'
  };

  function normalizeHorarioDia(value){
    const numeric = Number(value);
    if (Number.isInteger(numeric) && diasPorNumero[numeric]) return diasPorNumero[numeric];
    return String(value || '').toUpperCase();
  }

  function normalizeHorarioTime(value){
    if (typeof value === 'number' && Number.isFinite(value)){
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    const numeric = Number(value);
    if (String(value || '').trim() !== '' && Number.isFinite(numeric) && String(value).trim() === String(numeric)){
      const hours = Math.floor(numeric / 60);
      const minutes = numeric % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return String(value || '00:00');
  }

  return (data||[]).map(m=>({
    nombre: m.nombre,
    creditos: m.creditos || 0,
    tipologia: m.tipologia || m.Tipologia || '',
    obligatoria: !!m.obligatoria,
    grupos: (m.grupos||[])
      .map(g=>({
      grupo: g.grupo,
      creditos: g.creditos || m.creditos || 0,
      cupos: g.cupos || g.cuposDisponibles || 0,
      profesor: g.profesor || g.docente || '',
      horarios: (g.horarios||[]).map(h=>({
        nombre: h.materia || m.nombre || h.nombre || '',
        dia: normalizeHorarioDia(h.dia),
        hora_inicio: normalizeHorarioTime(h.inicio || h.hora_inicio || h.horaInicio),
        hora_fin: normalizeHorarioTime(h.fin || h.hora_fin || h.horaFin),
        lugar: h.lugar || ''
      }))
    }))
  }));
}

// Extraer materias aprobadas desde historial (portado de Revisa_Materias.extraer_materias_aprobadas)
function extraerMateriasAprobadasJS(texto){
  const materias = [];
  const lineas = texto.split(/\r?\n/);
  const regex = /(.+?)\s+\((\d+-?M?)\)\s+\d+\s+.+?\s+\d{4}-\w?/i;
  for (let i=0;i<lineas.length;i++){
    const linea = lineas[i];
    const m = linea.match(regex);
    if (m){
      const next = (lineas[i+1]||'').trim().toUpperCase();
      if (next.startsWith('APROB') || next.startsWith('APROBADA') || next.startsWith('APROBADO')){
        const nombre = m[1].trim(); const codigo = m[2].trim(); materias.push(`${codigo} - ${nombre}`);
      }
    }
  }
  return materias;
}

// (auto-load and run handlers are initialized inside DOMContentLoaded)

function renderScheduleSVG(best, opts){
  const scheduleEl = document.getElementById('schedule');
  if (!scheduleEl) return;
  if (!best || !best.comb) {
    scheduleEl.classList.add('empty');
    scheduleEl.innerHTML = '';
    return;
  }
  // Determine hours range from earliest and latest class times in the week.
  let startHour = 6, endHour = 22;
  try{
    const horas = [];
    for (const g of best.comb){
      for (const c of (g.horarios||[])){
        horas.push(parseInt((c.hora_inicio||c.inicio||'00:00').split(':')[0],10));
        horas.push(parseInt((c.hora_fin||c.fin||'00:00').split(':')[0],10));
      }
    }
    if (horas.length){
      startHour = Math.min(...horas);
      endHour = Math.max(...horas);
    }
  }catch(e){ /* ignore */ }
  const allDays = ['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
  const usedDays = new Set();
  for (const g of best.comb){
    for (const c of (g.horarios||[])){
      const d = String(c.dia||'').toUpperCase();
      if (d) usedDays.add(d);
    }
  }
  const days = allDays.filter(d=> d === 'SÁBADO' || d === 'DOMINGO' ? usedDays.has(d) : true);
  const cols = days.length;
  const leftW = 60; const colW = 120; const rowH = 40;
  const width = leftW + colW*cols; const height = (endHour - startHour)*rowH + 40;
  // build SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<style> .hour{font:12px sans-serif; fill:#ffffff} .day{font:14px sans-serif; fill:#ffffff; font-weight:600; text-anchor:middle} .celltxt{font:12px sans-serif; fill:#fff} .slot{stroke:#fff;stroke-width:1} </style>`;
  svg += `<rect width="100%" height="100%" fill="#000" />`;
  // header days
  for (let i=0;i<cols;i++){ const x = leftW + i*colW; svg += `<text class="day" x="${x + (colW/2)}" y="18">${days[i]}</text>`; }
  // hour rows and labels
  for (let h=startHour; h<endHour; h++){ const y = 30 + (h-startHour)*rowH; svg += `<text class="hour" x="6" y="${y+14}">${String(h).padStart(2,'0')}:00</text>`; svg += `<line x1="${leftW}" y1="${y}" x2="${width}" y2="${y}" stroke="#ddd"/>`; }
  // helper to normalize group label: remove leading 'G' or 'Grupo' prefixes
  function cleanGrupoLabel(raw){
    if (!raw && raw!==0) return '';
    let s = String(raw).trim();
    // remove prefixes like 'G' or 'Grupo', case-insensitive
    s = s.replace(/^\s*(?:Grupo|G)\.?\s*/i, '');
    return s;
  }

  // slots
  for (const g of best.comb){
    const color = stringToColor(g.materiaNombre || '')
    const grupoLabel = cleanGrupoLabel(g.grupo);
    for (const c of (g.horarios||[])){
      const dia = (c.dia||'').toUpperCase(); const di = days.indexOf(dia); if (di<0) continue;
      const h0 = parseInt((c.hora_inicio||c.inicio||'00:00').split(':')[0],10);
      const h1 = parseInt((c.hora_fin||c.fin||'00:00').split(':')[0],10);
      const x = leftW + di*colW + 4; const y = 30 + (h0-startHour)*rowH + 4;
      const w = colW - 8; const h = (h1-h0)*rowH - 8;
      const lugarLabel = (c.lugar||'').trim();
      const text = `${g.materiaNombre||''}${grupoLabel? ' (G' + grupoLabel + ')' : ''}`;
      svg += `<rect class="slot" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" ry="6" fill="${color}" />`;
      // use foreignObject to allow wrapped text inside the colored slot
      const foHtml = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w-8}px;height:${Math.max(16, h-8)}px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-start;padding:4px;font:11px/1.25 sans-serif;color:#fff;">
        <div style="word-break:break-word;overflow-wrap:break-word;white-space:normal">${escapeXml(text)}</div>
        ${lugarLabel ? `<div style="word-break:break-word;overflow-wrap:break-word;white-space:normal;font-size:10px;opacity:.85;margin-top:2px">${escapeXml(lugarLabel)}</div>` : ''}
      </div>`;
      svg += `<foreignObject x="${x+4}" y="${y+4}" width="${w-8}" height="${Math.max(16, h-8)}">${foHtml}</foreignObject>`;
    }
  }
  svg += `</svg>`;
  const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  scheduleEl.classList.remove('hidden');
  scheduleEl.classList.remove('empty');
  scheduleEl.innerHTML = `<img src="${dataUrl}" alt="Horario">`;
  scheduleEl._lastSvg = svg;
  scheduleEl._lastBest = best;
  scheduleEl._lastOpts = opts;
}

function downloadScheduleSVG(best, opts){
  const scheduleEl = document.getElementById('schedule');
  if (!scheduleEl || !scheduleEl._lastSvg) return;
  const blob = new Blob([scheduleEl._lastSvg], {type:'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'horario.svg'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function downloadScheduleExcel(){
  const scheduleEl = document.getElementById('schedule');
  if (!scheduleEl || !scheduleEl._lastBest) return;
  const best = scheduleEl._lastBest;
  if (!best || !best.comb || !best.comb.length) return;

  const DIAS_ORDER = ['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];
  const DIAS_LABEL = {LUNES:'Lunes',MARTES:'Martes','MIÉRCOLES':'Miércoles',JUEVES:'Jueves',VIERNES:'Viernes','SÁBADO':'Sábado',DOMINGO:'Domingo'};

  let startHour = 23, endHour = 0;
  const usedDays = new Set();
  for (const g of best.comb){
    for (const c of (g.horarios||[])){
      const dia = (c.dia||'').toUpperCase(); usedDays.add(dia);
      const h0 = parseInt((c.hora_inicio||c.inicio||'07:00').split(':')[0],10);
      const h1 = parseInt((c.hora_fin||c.fin||'08:00').split(':')[0],10);
      if (h0 < startHour) startHour = h0;
      if (h1 > endHour) endHour = h1;
    }
  }
  if (!usedDays.size) return;
  if (startHour >= endHour){ startHour = 7; endHour = 20; }
  const days = DIAS_ORDER.filter(d => usedDays.has(d));

  function cleanGrupoLabelXls(raw){
    if (!raw && raw !== 0) return '';
    return String(raw).trim().replace(/^\s*(?:Grupo|G)\.?\s*/i,'');
  }

  // Armar grilla: grid[hora][dia] = texto de celda
  const grid = {};
  for (let h = startHour; h < endHour; h++) grid[h] = {};
  for (const g of best.comb){
    const grupoLabel = cleanGrupoLabelXls(g.grupo);
    const nombre = g.materiaNombre || (g.horarios && g.horarios[0] ? g.horarios[0].nombre : '') || '';
    const cellText = nombre + (grupoLabel ? ' (G' + grupoLabel + ')' : '');
    for (const c of (g.horarios||[])){
      const dia = (c.dia||'').toUpperCase();
      const h0 = parseInt((c.hora_inicio||c.inicio||'00:00').split(':')[0],10);
      const h1 = parseInt((c.hora_fin||c.fin||'00:00').split(':')[0],10);
      for (let h = h0; h < h1; h++){ if (grid[h]) grid[h][dia] = cellText; }
    }
  }

  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n`;
  xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel">\n`;
  xml += `<Styles>\n`;
  xml += `  <Style ss:ID="s_hd"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#1A1A2E" ss:Pattern="Solid"/></Style>\n`;
  xml += `  <Style ss:ID="s_time"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Size="10"/></Style>\n`;
  xml += `  <Style ss:ID="s_sub"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:Size="10"/><Interior ss:Color="#DDE8FF" ss:Pattern="Solid"/></Style>\n`;
  xml += `  <Style ss:ID="s_emp"><Interior ss:Color="#F0F0F0" ss:Pattern="Solid"/></Style>\n`;
  xml += `  <Style ss:ID="s_sec"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="12"/><Interior ss:Color="#2B3A55" ss:Pattern="Solid"/><Alignment ss:Horizontal="Left" ss:Vertical="Center"/></Style>\n`;
  xml += `  <Style ss:ID="s_ch"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="10"/><Interior ss:Color="#4A5568" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>\n`;
  xml += `  <Style ss:ID="s_dat"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Font ss:Size="10"/></Style>\n`;
  xml += `  <Style ss:ID="s_num"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Size="10"/></Style>\n`;
  xml += `</Styles>\n`;
  xml += `<Worksheet ss:Name="Horario">\n<Table ss:DefaultRowHeight="30">\n`;
  xml += `<Column ss:Width="95"/>\n`;
  for (const d of days) xml += `<Column ss:Width="125"/>\n`;

  // Fila de cabecera de días
  xml += `<Row ss:Height="28">\n  <Cell ss:StyleID="s_hd"><Data ss:Type="String">Hora</Data></Cell>\n`;
  for (const d of days) xml += `  <Cell ss:StyleID="s_hd"><Data ss:Type="String">${esc(DIAS_LABEL[d]||d)}</Data></Cell>\n`;
  xml += `</Row>\n`;

  // Filas por hora
  for (let h = startHour; h < endHour; h++){
    xml += `<Row ss:Height="36">\n  <Cell ss:StyleID="s_time"><Data ss:Type="String">${String(h).padStart(2,'0')}:00 – ${String(h+1).padStart(2,'0')}:00</Data></Cell>\n`;
    for (const d of days){
      const val = (grid[h] && grid[h][d]) || '';
      xml += val ? `  <Cell ss:StyleID="s_sub"><Data ss:Type="String">${esc(val)}</Data></Cell>\n`
                 : `  <Cell ss:StyleID="s_emp"><Data ss:Type="String"></Data></Cell>\n`;
    }
    xml += `</Row>\n`;
  }

  // Separador
  xml += `<Row ss:Height="14"><Cell><Data ss:Type="String"></Data></Cell></Row>\n`;
  xml += `<Row ss:Height="14"><Cell><Data ss:Type="String"></Data></Cell></Row>\n`;

  // Título sección
  xml += `<Row ss:Height="28">\n  <Cell ss:StyleID="s_sec" ss:MergeAcross="${days.length}"><Data ss:Type="String">Materias seleccionadas</Data></Cell>\n</Row>\n`;

  // Cabecera tabla materias
  xml += `<Row ss:Height="24">\n`;
  for (const h of ['Materia','Grupo','Créditos','Profesor']) xml += `  <Cell ss:StyleID="s_ch"><Data ss:Type="String">${h}</Data></Cell>\n`;
  xml += `</Row>\n`;

  // Filas de materias
  for (const g of best.comb){
    const grupoLabel = cleanGrupoLabelXls(g.grupo);
    const nombre = g.materiaNombre || (g.horarios && g.horarios[0] ? g.horarios[0].nombre : '') || '';
    const profesor = g.profesor || (g.horarios && g.horarios[0] ? g.horarios[0].profesor : '') || 'No disponible';
    const creditos = g.creditos || 0;
    xml += `<Row ss:Height="24">\n`;
    xml += `  <Cell ss:StyleID="s_dat"><Data ss:Type="String">${esc(nombre)}</Data></Cell>\n`;
    xml += `  <Cell ss:StyleID="s_dat"><Data ss:Type="String">${esc(grupoLabel ? 'G' + grupoLabel : String(g.grupo||''))}</Data></Cell>\n`;
    xml += `  <Cell ss:StyleID="s_num"><Data ss:Type="Number">${creditos}</Data></Cell>\n`;
    xml += `  <Cell ss:StyleID="s_dat"><Data ss:Type="String">${esc(profesor)}</Data></Cell>\n`;
    xml += `</Row>\n`;
  }

  xml += `</Table>\n</Worksheet>\n</Workbook>`;

  const blob = new Blob([xml], {type:'application/vnd.ms-excel'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'horario.xls'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function escapeXml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function stringToColor(s){
  let h=0; for (let i=0;i<s.length;i++) h = s.charCodeAt(i) + ((h<<5)-h);
  const c = (h & 0x00FFFFFF).toString(16).toUpperCase(); return '#' + '00000'.slice(0,6-c.length) + c;
}

// Display errors helper
function showError(message, err){
  const errorsEl = document.getElementById('errors');
  if (!errorsEl) return;
  const detail = err && err.message ? err.message : String(err || 'Error desconocido');
  errorsEl.classList.remove('hidden');
  errorsEl.classList.add('error');
  errorsEl.innerHTML = `<strong>${escapeXml(message || 'Error')}</strong><div>${escapeXml(detail)}</div>`;
}

function clearSchedulerMessage(){
  const errorsEl = document.getElementById('errors');
  if (!errorsEl) return;
  errorsEl.classList.add('hidden');
  errorsEl.classList.remove('error');
  errorsEl.innerHTML = '';
}

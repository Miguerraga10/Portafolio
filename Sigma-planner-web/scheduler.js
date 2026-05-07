// scheduler.js — Generador de horario óptimo en JS (sin UI)
// Exporta la función `generarHorarioOptimoJS(materias, opts)` que devuelve el mejor resultado

function* combinations(arr, k, start = 0, current = []){
  if (k === 0){
    yield current.slice();
    return;
  }
  for (let i = start; i <= arr.length - k; i++){
    current.push(arr[i]);
    yield* combinations(arr, k - 1, i + 1, current);
    current.pop();
  }
}

function countCombinations(n, k){
  if (k < 0 || k > n) return 0;
  let kk = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= kk; i++) result = (result * (n - kk + i)) / i;
  return Math.round(result);
}

function* producto(arrays, index = 0, current = []){
  if (!arrays.length){
    yield [];
    return;
  }
  if (index === arrays.length){
    yield current.slice();
    return;
  }
  const items = arrays[index] || [];
  for (const item of items){
    current.push(item);
    yield* producto(arrays, index + 1, current);
    current.pop();
  }
}

function siguienteTick(){
  return new Promise(resolve => setTimeout(resolve, 0));
}

function nowMs(){
  if (typeof performance !== 'undefined' && performance && typeof performance.now === 'function') return performance.now();
  return Date.now();
}

class SchedulerCancelledError extends Error {
  constructor(message = 'Calculo cancelado por el usuario.'){
    super(message);
    this.name = 'SchedulerCancelledError';
  }
}

class SchedulerTimeoutError extends Error {
  constructor(message = 'Tiempo limite alcanzado para el calculo del horario.'){
    super(message);
    this.name = 'SchedulerTimeoutError';
  }
}

function throwIfCancelled(cancelToken){
  if (cancelToken && cancelToken.cancelled) throw new SchedulerCancelledError();
  if (cancelToken && cancelToken.deadlineAt && Date.now() >= cancelToken.deadlineAt) throw new SchedulerTimeoutError();
}

function horaAminutos(h){ const [hh,mm]= (h||'00:00').split(':').map(x=>parseInt(x,10)); return hh*60 + (mm||0); }
function normalizeDia(d){
  return String(d||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

class SchedulerHorario{
  constructor(){
    this.dias = { LUNES:{}, MARTES:{}, MIERCOLES:{}, JUEVES:{}, VIERNES:{}, SABADO:{}, DOMINGO:{} };
    this.grupos = [];
  }
  _hoursFor(clase){
    const h0 = parseInt((clase.hora_inicio||clase.inicio||'00:00').split(':')[0],10);
    const h1 = parseInt((clase.hora_fin||clase.fin||'00:00').split(':')[0],10);
    const res=[];
    for(let h=h0; h<h1; h++) res.push(h);
    return res;
  }
  verificar_grupo(grupo){
    for (const clase of (grupo.horarios||[])){
      const dia=(clase.dia||'').toUpperCase(); const horas=this._hoursFor(clase);
      for (const h of horas) if (this.dias[dia] && this.dias[dia][h]) return false;
    }
    return true;
  }
  agregar_grupo(grupo){
    if (!this.verificar_grupo(grupo)) return false;
    for (const clase of (grupo.horarios||[])){
      const dia=(clase.dia||'').toUpperCase(); const horas=this._hoursFor(clase);
      if (!this.dias[dia]) this.dias[dia]={};
      for (const h of horas) this.dias[dia][h]=true;
    }
    this.grupos.push(grupo);
    return true;
  }
  contar_huecos(){
    let huecos=0;
    for (const dia in this.dias){
      const horasConClase = Object.keys(this.dias[dia]).map(x=>parseInt(x,10));
      if (horasConClase.length){
        const min = Math.min(...horasConClase);
        const max = Math.max(...horasConClase);
        for (let h=min; h<=max; h++) if (!this.dias[dia][h]) huecos++;
      }
    }
    return huecos;
  }
}

function grupoFueraDeIntervalo(grupo, opts){
  if (!grupo || !grupo.horarios) return true;
  if (opts.horas_libres && Array.isArray(opts.horas_libres) && opts.horas_libres.length){
    for (const clase of grupo.horarios){
      const diaClase = normalizeDia((clase.dia||'').trim());
      const inicioClase = horaAminutos(clase.hora_inicio||clase.inicio||'00:00');
      const finClase = horaAminutos(clase.hora_fin||clase.fin||'00:00');
      for (const intervalo of opts.horas_libres){
        const diasLibres = (intervalo.dias||[]).map(d=>normalizeDia(d.trim()));
        if (diasLibres.includes(diaClase)){
          const inicioLib = horaAminutos(intervalo.inicio||intervalo.hora_inicio||'00:00');
          const finLib = horaAminutos(intervalo.fin||intervalo.hora_fin||'00:00');
          if (inicioClase < finLib && finClase > inicioLib) return true;
        }
      }
    }
  }
  for (const clase of grupo.horarios){
    const hi = clase.hora_inicio || clase.inicio || '00:00';
    const hf = clase.hora_fin || clase.fin || '00:00';
    if (!(opts.hora_inicio <= hi && hi < opts.hora_fin && opts.hora_inicio < hf && hf <= opts.hora_fin)) return true;
  }
  return false;
}

function cloneAndFilterMaterias(materias, opts){
  const deepCopy = obj => JSON.parse(JSON.stringify(obj));
  const materiasC = materias.map((m,mi)=> ({
    ...deepCopy(m),
    __id: mi,
    grupos_originales: deepCopy(m.grupos||[]),
    grupos_brutos: Array.isArray(m.grupos) ? m.grupos.length : 0
  }));
  for (const m of materiasC){
    m.grupos = (m.grupos_originales||[])
      .map((g,gi)=> ({ ...g, __id: `${m.__id}-${gi}`, materiaNombre: m.nombre }))
      .filter(g=> (g.horarios && g.horarios.length>0) && (!opts.usarVirtuales || g.horarios.every(h=> (h.lugar||'').toLowerCase()!=='virtual')) && (!opts.usarCupos || (g.cupos && g.cupos>0)) && !grupoFueraDeIntervalo(g, opts));
  }
  return materiasC;
}

function buildEffectiveSchedulerCoreState(materias, opts, cancelToken){
  const materiasC = cloneAndFilterMaterias(materias, opts);
  throwIfCancelled(cancelToken);
  const faltantes = materiasC.filter(m=> m.obligatoria && (!m.grupos || m.grupos.length===0)).map(m=>m.nombre);
  if (faltantes.length) throw new Error('Faltan grupos obligatorios: '+faltantes.join(', '));

  let materias_filtradas = materiasC.filter(m=> m.grupos && m.grupos.length>0);
  let materias_obligatorias = materias_filtradas.filter(m=> m.obligatoria);
  let materias_optativas = materias_filtradas.filter(m=> !m.obligatoria);
  const incompat_cache = new Map();
  const horario_base = new SchedulerHorario();
  const materias_asignadas = new Set();
  const forcedObligatorias = new Set();
  let hubo_cambios = true;

  while(hubo_cambios){
    throwIfCancelled(cancelToken);
    hubo_cambios = false;
    const pendientes = materias_obligatorias.filter(m=> !materias_asignadas.has(m.nombre));
    const solo_un_grupo = pendientes.filter(m=> m.grupos.length===1);
    const varios = pendientes.filter(m=> m.grupos.length>1);
    for (const mat of solo_un_grupo){
      const grupo = mat.grupos[0];
      if (horario_base.verificar_grupo(grupo)){
        horario_base.agregar_grupo(grupo);
        materias_asignadas.add(mat.nombre);
        forcedObligatorias.add(mat.nombre);
        hubo_cambios = true;
      } else {
        throw new Error('No se pudo asignar el grupo único de la materia obligatoria: '+mat.nombre);
      }
    }
    for (const mat of varios){
      const grupos_compatibles = mat.grupos.filter(g=> horario_base.verificar_grupo(g));
      if (grupos_compatibles.length !== mat.grupos.length){
        hubo_cambios = true;
        mat.grupos = grupos_compatibles;
      }
    }
    materias_filtradas = materias_filtradas.filter(m=> m.grupos && m.grupos.length>0);
    materias_obligatorias = materias_filtradas.filter(m=> m.obligatoria);
    materias_optativas = materias_filtradas.filter(m=> !m.obligatoria);
  }

  if (materias_obligatorias.length > opts.maxmaterias) throw new Error('Hay más materias obligatorias que la cantidad máxima permitida.');
  for (const mat of materias_optativas) mat.grupos = mat.grupos.filter(g=> horario_base.verificar_grupo(g));
  materias_filtradas = materias_filtradas.filter(m=> m.grupos && m.grupos.length>0);
  materias_obligatorias = materias_filtradas.filter(m=> m.obligatoria);
  materias_optativas = materias_filtradas.filter(m=> !m.obligatoria);

  function son_incompatibles_cache(g1,g2){
    const key = [g1.__id, g2.__id].sort().join('|');
    if (incompat_cache.has(key)) return incompat_cache.get(key);
    const h = new SchedulerHorario();
    h.agregar_grupo(g1);
    const res = !h.verificar_grupo(g2);
    incompat_cache.set(key,res);
    return res;
  }

  return {
    materiasOriginales: materiasC,
    materias_filtradas,
    materias_obligatorias,
    materias_optativas,
    forcedObligatorias,
    horario_base,
    incompat_cache,
    son_incompatibles_cache
  };
}

async function buildPreparedSchedulerState(materias, opts, runtime = {}){
  const { cancelToken, onAdvance, maybeYield } = runtime;
  const coreStartedAt = nowMs();
  const core = buildEffectiveSchedulerCoreState(materias, opts, cancelToken);
  const coreElapsedMs = nowMs() - coreStartedAt;
  const listasGruposOblig = core.materias_obligatorias.map(m=> m.grupos);
  const combinaciones_obligatorias_viables = [];
  const grupos_incompatibles = new Set();
  let processed = 0;
  const requiredStartedAt = nowMs();
  for (const combinacion_obligatorias of producto(listasGruposOblig)){
    throwIfCancelled(cancelToken);
    processed += 1;
    if (typeof onAdvance === 'function') onAdvance(1, { phase: 'preparing', message: `Preparando combinaciones obligatorias (${processed})...` });
    if (typeof maybeYield === 'function') await maybeYield(processed, { phase: 'preparing', message: `Preparando combinaciones obligatorias (${processed})...` });
    let skip=false;
    for (let i=0;i<combinacion_obligatorias.length && !skip;i++){
      for (let j=i+1;j<combinacion_obligatorias.length;j++){
        const key = [combinacion_obligatorias[i].__id, combinacion_obligatorias[j].__id].sort().join('|');
        if (grupos_incompatibles.has(key)) { skip=true; break; }
      }
    }
    if (skip) continue;

    let horario = new SchedulerHorario(); let es_viable=true;
    for (let i=0;i<combinacion_obligatorias.length;i++){
      const grupo = combinacion_obligatorias[i];
      if (!horario.verificar_grupo(grupo)){
        es_viable=false;
        for (let j=0;j<i;j++){
          const grupo_previo = combinacion_obligatorias[j];
          if (core.son_incompatibles_cache(grupo, grupo_previo)){
            grupos_incompatibles.add([grupo.__id, grupo_previo.__id].sort().join('|'));
          }
        }
        break;
      }
      horario.agregar_grupo(grupo);
    }
    if (es_viable) combinaciones_obligatorias_viables.push(combinacion_obligatorias);
  }

  if (combinaciones_obligatorias_viables.length===0) throw new Error('No hay forma de organizar un horario con todas las materias obligatorias.');

  return {
    ...core,
    combinaciones_obligatorias_viables,
    grupos_incompatibles,
    timingMeta: {
      filteringMs: coreElapsedMs,
      requiredMs: nowMs() - requiredStartedAt
    }
  };
}

function symmetricCombinationSum(values, k){
  if (k < 0 || k > values.length) return 0;
  const dp = new Array(k + 1).fill(0);
  dp[0] = 1;
  for (const value of values){
    for (let j = k; j >= 1; j--) dp[j] += dp[j - 1] * value;
  }
  return dp[k];
}

function productCardinality(values){
  if (!Array.isArray(values) || !values.length) return 1;
  return values.reduce((acc, value) => acc * Math.max(0, value), 1);
}

export function estimarComplejidadSeleccionJS(materias, opts, cancelToken){
  const state = buildEffectiveSchedulerCoreState(materias, opts, cancelToken);
  const { materiasOriginales, materias_obligatorias, materias_optativas, forcedObligatorias } = state;
  const maxOptStart = Math.max(0, Math.min(materias_optativas.length, opts.maxmaterias - materias_obligatorias.length));
  const obligatoriasVariables = materias_obligatorias.filter(m => !forcedObligatorias.has(m.nombre));
  const obligatoriasBrutas = obligatoriasVariables.length ? obligatoriasVariables.reduce((acc, m) => acc * Math.max(1, m.grupos.length), 1) : 1;
  const optValues = materias_optativas.map(m => Math.max(0, m.grupos.length));
  let optWorstCase = 0;
  for (let r = 0; r <= maxOptStart; r++) optWorstCase += symmetricCombinationSum(optValues, r);
  const estimatedUnits = obligatoriasBrutas + optWorstCase + (obligatoriasBrutas * optWorstCase);
  const COMPLEXITY_UNITS_PER_SECOND = 10000;
  const estimatedSeconds = estimatedUnits / COMPLEXITY_UNITS_PER_SECOND;

  return {
    totalMaterias: materiasOriginales.length,
    gruposTotales: materiasOriginales.reduce((acc, materia) => acc + (Array.isArray(materia.grupos) ? materia.grupos.length : 0), 0),
    obligatoriasBrutas,
    optWorstCase,
    estimatedUnits,
    estimatedSeconds,
    obligatoriasVariables: obligatoriasVariables.length,
    obligatoriasForzadas: forcedObligatorias.size,
    optativasActivas: materias_optativas.length,
    maxOptStart,
    formula: 'U = O + P + (O x P), con O = producto de grupos efectivos de obligatorias variables y P = suma de combinaciones de optativas de 0 a k.'
  };
}

export async function generarHorarioOptimoJS(materias, opts, onProgress, cancelToken){
  // Implementación alineada con Main.py
  const BRUTE_FORCE_LIMIT = 2000000;
  const HEURISTIC_BEAM_WIDTH = 160;
  const progressCallback = typeof onProgress === 'function' ? onProgress : null;
  const YIELD_INTERVAL = 200;
  const runStartedAt = nowMs();
  const timings = {
    filteringMs: 0,
    requiredMs: 0,
    optionalPrepMs: 0,
    evaluationMs: 0,
    totalMs: 0
  };
  let preparationUnitsProcessed = 0;
  let evaluationUnitsProcessed = 0;
  let totalWorkUnits = 0;
  const topN = Math.max(1, Math.min(5, parseInt(opts.topN, 10) || 1));
  const topResults = []; // array ordenado de los mejores resultados (hasta topN)


  function serializeTopResults(){
    return topResults.map(r => ({ horarioMap: r.horarioMap, materias: r.materias, comb: r.comb, total_materias: r.total_materias, creditos: r.creditos }));
  }
  function reportProgress(payload){
    if (!progressCallback) return;
    try { progressCallback(payload); } catch (_) { }
  }

  function reportPreparation(payload = {}){
    reportProgress({
      phase: payload.phase || 'preparing',
      analyzed: preparationUnitsProcessed,
      total: 0,
      percent: 0,
      exact: false,
      message: payload.message || 'Preparando horario...',
      timings: { ...timings, totalMs: nowMs() - runStartedAt }
    });
  }

  function reportHeuristicProgress(message){
    reportProgress({
      phase: 'running',
      analyzed: 0,
      total: 0,
      percent: 0,
      exact: false,
      message,
      timings: { ...timings, totalMs: nowMs() - runStartedAt, algorithmMode: 'heuristic' }
    });
  }

  function reportExactProgress(payload = {}){
    if (!totalWorkUnits) return;
    const analyzed = Math.min(totalWorkUnits, preparationUnitsProcessed + evaluationUnitsProcessed);
    const percent = Math.max(0, Math.min(99, Math.round((analyzed / totalWorkUnits) * 100)));
    reportProgress({
      phase: payload.phase || 'running',
      analyzed,
      total: totalWorkUnits,
      percent,
      exact: true,
      message: payload.message || `Procesando ${analyzed} de ${totalWorkUnits}...`,
      timings: { ...timings, totalMs: nowMs() - runStartedAt }
    });
  }

  function advancePreparation(units, payload = {}){
    preparationUnitsProcessed += units;
    const shouldReport = units === 0 || preparationUnitsProcessed <= 1 || preparationUnitsProcessed % YIELD_INTERVAL === 0;
    if (!shouldReport) return;
    reportPreparation(payload);
  }

  function advanceEvaluation(units, payload = {}){
    evaluationUnitsProcessed += units;
    const analyzed = preparationUnitsProcessed + evaluationUnitsProcessed;
    const shouldReport = units === 0 || analyzed <= 1 || analyzed % YIELD_INTERVAL === 0 || analyzed >= totalWorkUnits;
    if (!shouldReport) return;
    reportExactProgress(payload);
  }

  async function maybeYield(counter, payload){
    throwIfCancelled(cancelToken);
    if (counter > 0 && counter % YIELD_INTERVAL === 0){
      if (payload){
        if (totalWorkUnits) reportExactProgress(payload);
        else reportPreparation(payload);
      }
      await siguienteTick();
    }
  }

  function resultSortComparator(a, b){
    if (b.total_materias !== a.total_materias) return b.total_materias - a.total_materias;
    if (b.creditos !== a.creditos) return b.creditos - a.creditos;
    if (a.dias_ocupados !== b.dias_ocupados) return a.dias_ocupados - b.dias_ocupados;
    return a.huecos - b.huecos;
  }

  function combKey(comb){
    return comb.map(g=>`${g.materiaNombre||''}::${g.grupo||''}`).sort().join('|');
  }

  function insertTopResult(result){
    const key = combKey(result.comb);
    if (topResults.some(r => combKey(r.comb) === key)) return;
    topResults.push(result);
    topResults.sort(resultSortComparator);
    if (topResults.length > topN) topResults.pop();
  }

  function summarizeCombination(combinacion_final){
    const horario = new SchedulerHorario();
    for (const grupo of combinacion_final){
      if (!horario.verificar_grupo(grupo)) return null;
      horario.agregar_grupo(grupo);
    }
    const creditos_asignados = combinacion_final.reduce((s,g)=> s + (g.creditos||0), 0);
    if (creditos_asignados > opts.maxcreditos) return null;
    const dias_ocupados = Object.keys(horario.dias).filter(d=> Object.keys(horario.dias[d]).length>0).length;
    if (dias_ocupados > opts.maxdias) return null;
    const huecos = horario.contar_huecos();
    return {
      horarioMap: horario,
      materias: combinacion_final.map(g=> ({ nombre: (g.horarios && g.horarios[0]) ? g.horarios[0].nombre : '(sin horario)', grupo: g.grupo })),
      comb: combinacion_final,
      total_materias: combinacion_final.length,
      creditos: creditos_asignados,
      dias_ocupados,
      huecos
    };
  }

  function beamScore(state){
    return (state.total_materias * 100000) + (state.creditos * 1000) - (state.dias_ocupados * 100) - (state.huecos * 10);
  }

  async function runHeuristicSearch(requiredCombinations, optionalSubjects){
    const initialBeam = [];
    let processedRequired = 0;
    for (const combOb of requiredCombinations){
      throwIfCancelled(cancelToken);
      processedRequired += 1;
      const summary = summarizeCombination(combOb);
      if (!summary) continue;
      initialBeam.push(summary);
      insertTopResult(summary);
      if (processedRequired === 1 || processedRequired % YIELD_INTERVAL === 0 || processedRequired === requiredCombinations.length){
        reportHeuristicProgress(`Heurística: base obligatoria ${processedRequired}/${requiredCombinations.length}...`);
        await maybeYield(processedRequired, { phase: 'running', message: `Heurística: base obligatoria ${processedRequired}/${requiredCombinations.length}...` });
      }
    }
    if (!initialBeam.length) return;

    let beam = initialBeam
      .sort((left, right) => beamScore(right) - beamScore(left))
      .slice(0, HEURISTIC_BEAM_WIDTH);

    const sortedOptionals = optionalSubjects.slice().sort((left, right) => {
      const leftBest = Math.max(...left.grupos.map(g => g.creditos || left.creditos || 0), 0);
      const rightBest = Math.max(...right.grupos.map(g => g.creditos || right.creditos || 0), 0);
      if (rightBest !== leftBest) return rightBest - leftBest;
      return left.nombre.localeCompare(right.nombre, 'es');
    });

    let heuristicSteps = 0;
    for (const materia of sortedOptionals){
      throwIfCancelled(cancelToken);
      const nextBeam = [];
      for (const state of beam){
        nextBeam.push(state);
        if (state.total_materias >= opts.maxmaterias) continue;
        for (const grupo of (materia.grupos || [])){
          heuristicSteps += 1;
          const candidate = summarizeCombination(state.comb.concat([grupo]));
          if (!candidate) continue;
          nextBeam.push(candidate);
          insertTopResult(candidate);
          if (heuristicSteps % YIELD_INTERVAL === 0){
            reportHeuristicProgress(`Heurística: explorando ${materia.nombre}...`);
            await maybeYield(heuristicSteps, { phase: 'running', message: `Heurística: explorando ${materia.nombre}...` });
          }
        }
      }
      beam = nextBeam
        .sort((left, right) => {
          const diff = beamScore(right) - beamScore(left);
          if (diff !== 0) return diff;
          return resultSortComparator(left, right);
        })
        .slice(0, HEURISTIC_BEAM_WIDTH);
    }
  }

  try{
    reportPreparation({ phase: 'preparing', message: 'Preparando materias...' });
    const state = await buildPreparedSchedulerState(materias, opts, {
      cancelToken,
      onAdvance(units, payload){
        advancePreparation(units, payload);
      },
      maybeYield
    });
    timings.filteringMs = state.timingMeta ? state.timingMeta.filteringMs : 0;
    timings.requiredMs = state.timingMeta ? state.timingMeta.requiredMs : 0;
    const { materias_obligatorias, materias_optativas, combinaciones_obligatorias_viables, grupos_incompatibles, son_incompatibles_cache } = state;

    let mejor_horario = null;
    let mejor_comb = null;
    let max_materias = 0, max_creditos = 0, menor_dias_ocupados = Infinity, menor_huecos = Infinity;
    let materias_seleccionadas_final = null;

    const optionalPrepStartedAt = nowMs();
    let optionalPrepAccumulatedMs = 0;
    let evaluationAccumulatedMs = 0;

    const maxOptStart = Math.min(materias_optativas.length, opts.maxmaterias - materias_obligatorias.length);
    const estimatedFinalCombinationSpace = (()=>{
      const optionalValues = materias_optativas.map(m => Math.max(0, m.grupos.length));
      let total = 0;
      for (let r = 0; r <= maxOptStart; r++) total += symmetricCombinationSum(optionalValues, r);
      return combinaciones_obligatorias_viables.length * total;
    })();
    const useHeuristic = !opts.forceBrute && estimatedFinalCombinationSpace > BRUTE_FORCE_LIMIT;
    timings.algorithmMode = useHeuristic ? 'heuristic' : 'exact';

    if (useHeuristic){
      reportHeuristicProgress(`Heurística activada: espacio estimado ${estimatedFinalCombinationSpace}.`);
      await runHeuristicSearch(combinaciones_obligatorias_viables, materias_optativas);
      timings.optionalPrepMs = nowMs() - optionalPrepStartedAt;
      timings.evaluationMs = 0;
      timings.totalMs = nowMs() - runStartedAt;
      reportProgress({
        phase: 'done',
        analyzed: 0,
        total: 0,
        percent: 100,
        exact: false,
        message: topResults.length ? 'Analisis heurístico completado.' : 'Analisis heurístico completado sin horario viable.',
        timings: { ...timings }
      });
      return topResults.length ? serializeTopResults() : null;
    }

    const optionalPlans = [];
    const optValues = materias_optativas.map(m => Math.max(0, m.grupos.length));
    const requiredCombinationUnits = productCardinality(materias_obligatorias.map(m => Math.max(0, m.grupos.length)));
    const optionalPreparationUnits = (()=>{
      let total = 0;
      for (let r = 1; r <= maxOptStart; r++) total += symmetricCombinationSum(optValues, r);
      return total;
    })();

    for (let numOpt = maxOptStart; numOpt>=0; numOpt--){
    throwIfCancelled(cancelToken);
    let combinaciones_optativas_viables = [[]];
    const optionalPrepLoopStartedAt = nowMs();
    if (numOpt>0){
      const totalElegidoSets = countCombinations(materias_optativas.length, numOpt);
      combinaciones_optativas_viables = [];
      let setsProcesados = 0;
      let productosProcesados = 0;
      for (const set of combinations(materias_optativas, numOpt)){
        throwIfCancelled(cancelToken);
        setsProcesados += 1;
        if (setsProcesados === 1 || setsProcesados % YIELD_INTERVAL === 0 || setsProcesados === totalElegidoSets) {
          reportPreparation({ phase: 'preparing', message: `Preparando optativas (${setsProcesados}/${totalElegidoSets})...` });
          await maybeYield(setsProcesados, { phase: 'preparing', message: `Preparando optativas (${setsProcesados}/${totalElegidoSets})...` });
        }
        for (const prod of producto(set.map(m=> m.grupos))){
          throwIfCancelled(cancelToken);
          productosProcesados += 1;
          advancePreparation(1, { phase: 'preparing', message: `Preparando optativas (${productosProcesados})...` });
          await maybeYield(productosProcesados, { phase: 'preparing', message: `Preparando optativas (${productosProcesados})...` });
          // comprobar incompatibilidades parciales
          let skip=false;
          for (let i=0;i<prod.length && !skip;i++){
            for (let j=i+1;j<prod.length;j++){
              const key = [prod[i].__id, prod[j].__id].sort().join('|');
              if (grupos_incompatibles.has(key)) { skip=true; break; }
            }
          }
          if (skip) continue;
          // verificar con Horario local
          const horario = new SchedulerHorario(); let es_viable=true;
          for (let i=0;i<prod.length;i++){
            const grupo = prod[i];
            if (!horario.verificar_grupo(grupo)){
              es_viable=false;
              for (let j=0;j<i;j++){
                const grupo_prev = prod[j];
                const k = [grupo.__id, grupo_prev.__id].sort().join('|');
                if (son_incompatibles_cache(grupo, grupo_prev)) grupos_incompatibles.add(k);
              }
              break;
            }
            horario.agregar_grupo(grupo);
          }
          if (es_viable) combinaciones_optativas_viables.push(prod);
        }
      }
    }
    optionalPlans.push({ numOpt, combinaciones_optativas_viables });
    optionalPrepAccumulatedMs += nowMs() - optionalPrepLoopStartedAt;
    timings.optionalPrepMs = optionalPrepAccumulatedMs;
  }

    const totalOptionalViableCombinations = optionalPlans.reduce((acc, plan) => acc + plan.combinaciones_optativas_viables.length, 0);
    totalWorkUnits = Math.max(1, requiredCombinationUnits + optionalPreparationUnits + (combinaciones_obligatorias_viables.length * totalOptionalViableCombinations));

    for (const plan of optionalPlans){
    const { combinaciones_optativas_viables } = plan;
    const totalCombinaciones = combinaciones_obligatorias_viables.length * combinaciones_optativas_viables.length;
    let combinacionesAnalizadas = 0;
    let ultimoPorcentaje = -1;
    const evaluationStartedAt = nowMs();
    reportExactProgress({ phase: 'evaluating', message: `Analizando 0 de ${totalCombinaciones} combinaciones...` });

    for (const combOb of combinaciones_obligatorias_viables){
      for (const combOpt of combinaciones_optativas_viables){
        throwIfCancelled(cancelToken);
        combinacionesAnalizadas += 1;
        advanceEvaluation(1, { phase: 'evaluating', message: `Analizando ${combinacionesAnalizadas} de ${totalCombinaciones} combinaciones...` });
        const porcentaje = totalWorkUnits ? Math.max(0, Math.min(99, Math.round(((preparationUnitsProcessed + evaluationUnitsProcessed) / totalWorkUnits) * 100))) : 0;
        if (porcentaje !== ultimoPorcentaje && (combinacionesAnalizadas === 1 || combinacionesAnalizadas % YIELD_INTERVAL === 0 || combinacionesAnalizadas === totalCombinaciones)) {
          ultimoPorcentaje = porcentaje;
          reportExactProgress({ phase: 'evaluating', message: `Analizando ${combinacionesAnalizadas} de ${totalCombinaciones} combinaciones...` });
          await maybeYield(combinacionesAnalizadas, { phase: 'evaluating', message: `Analizando ${combinacionesAnalizadas} de ${totalCombinaciones} combinaciones...` });
        }

        const combinacion_final = combOb.concat(combOpt);
        // verificar viabilidad completa
        const horario = new SchedulerHorario(); let es_viable=true;
        for (const grupo of combinacion_final){ if (!horario.verificar_grupo(grupo)){ es_viable=false; break; } horario.agregar_grupo(grupo); }
        if (!es_viable) continue;
        const creditos_asignados = combinacion_final.reduce((s,g)=> s + (g.creditos||0), 0);
        if (creditos_asignados > opts.maxcreditos) continue;
        const dias_ocupados = Object.keys(horario.dias).filter(d=> Object.keys(horario.dias[d]).length>0).length;
        if (dias_ocupados > opts.maxdias) continue;
        const huecos = horario.contar_huecos();
        const total_materias = combinacion_final.length;
        let es_mejor = false;
        if (total_materias > max_materias) es_mejor = true;
        else if (total_materias == max_materias){
          if (creditos_asignados > max_creditos) es_mejor = true;
          else if (creditos_asignados == max_creditos){
            if (dias_ocupados < menor_dias_ocupados) es_mejor = true;
            else if (dias_ocupados == menor_dias_ocupados && huecos < menor_huecos) es_mejor = true;
          }
        }
        if (es_mejor){
          max_materias = total_materias; max_creditos = creditos_asignados; menor_dias_ocupados = dias_ocupados; menor_huecos = huecos;
          materias_seleccionadas_final = combinacion_final.map(g=> ({ nombre: (g.horarios && g.horarios[0])?g.horarios[0].nombre:'(sin horario)', grupo: g.grupo }));
          mejor_horario = horario; mejor_comb = combinacion_final;
        }
        // Insertar en top N
        insertTopResult({
          horarioMap: horario,
          materias: combinacion_final.map(g=>({ nombre:(g.horarios&&g.horarios[0])?g.horarios[0].nombre:'(sin horario)', grupo:g.grupo })),
          comb: combinacion_final,
          total_materias,
          creditos: creditos_asignados,
          dias_ocupados,
          huecos
        });
      }
    }
    evaluationAccumulatedMs += nowMs() - evaluationStartedAt;
    timings.evaluationMs = evaluationAccumulatedMs;
    if (max_materias > 0) {
      timings.totalMs = nowMs() - runStartedAt;
      reportProgress({
        phase: 'done',
        analyzed: totalWorkUnits,
        total: totalWorkUnits,
        percent: 100,
        exact: true,
        message: 'Analisis completado.',
        timings: { ...timings }
      });
      break;
    }
  }

    if (!topResults.length){
      timings.totalMs = nowMs() - runStartedAt;
      reportProgress({ phase: 'done', analyzed: totalWorkUnits, total: totalWorkUnits, percent: 100, exact: true, message: 'Analisis completado. No se encontro un horario viable.', timings: { ...timings } });
      return null;
    }
    timings.totalMs = nowMs() - runStartedAt;
    return serializeTopResults();
  }catch(err){
    if (!(err && err.name === 'SchedulerTimeoutError')) throw err;
    timings.totalMs = nowMs() - runStartedAt;
    const analyzed = totalWorkUnits ? Math.min(totalWorkUnits, preparationUnitsProcessed + evaluationUnitsProcessed) : 0;
    const percent = totalWorkUnits ? Math.max(0, Math.min(99, Math.round((analyzed / totalWorkUnits) * 100))) : 0;
    const partialResults = serializeTopResults();
    if (partialResults.length){
      Object.defineProperty(partialResults, '__timedOut', { value: true, enumerable: false, configurable: true });
    }
    reportProgress({
      phase: 'done',
      analyzed,
      total: totalWorkUnits,
      percent,
      exact: totalWorkUnits > 0,
      timedOut: true,
      message: partialResults.length ? 'Tiempo limite alcanzado. Mostrando el mejor resultado encontrado hasta ahora.' : 'Tiempo limite alcanzado antes de encontrar un horario viable.',
      timings: { ...timings }
    });
    return partialResults.length ? partialResults : null;
  }
}

export default generarHorarioOptimoJS;

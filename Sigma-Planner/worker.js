// Worker que recibe un array de combinaciones (cada combinación es array de grupos planos)
self.onmessage = function(e) {
  const {chunk, opts} = e.data;
  function normalizeDia(d){
    return String(d||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function toMinutes(h){
    const parts = String(h||'00:00').split(':');
    const hh = parseInt(parts[0],10) || 0;
    const mm = parseInt(parts[1],10) || 0;
    return hh*60 + mm;
  }
  let best = null;
  const stats = { evaluated: 0, skipped_conflict: 0, skipped_creditos: 0, skipped_dias: 0 };
  for (const comb of chunk) {
    stats.evaluated += 1;
    // comb es array de grupos (objetos sencillos)
    const horario = new Map(); // key dia -> set de horas ocupadas
    let viable = true;
    for (const g of comb) {
      if (!g.horarios || g.horarios.length === 0) { viable = false; break; }
      for (const c of g.horarios) {
        const dia = normalizeDia(c.dia||'');
        const h0 = toMinutes(c.hora_inicio||c.inicio);
        const h1 = toMinutes(c.hora_fin||c.fin);

        // Respect hora_inicio/hora_fin global
        if (opts.hora_inicio && opts.hora_fin) {
          const globalStart = toMinutes(opts.hora_inicio);
          const globalEnd = toMinutes(opts.hora_fin);
          if (!(globalStart <= h0 && h1 <= globalEnd)) { viable = false; break; }
        }

        // horas_libres: si se solapa con intervalo obligatorio, descartar
        if (opts.horas_libres && Array.isArray(opts.horas_libres)){
          for (const intervalo of opts.horas_libres){
            const dias = (intervalo.dias||[]).map(d=>normalizeDia(d));
            if (dias.includes(dia)){
              const inicioLib = toMinutes(intervalo.inicio||intervalo.hora_inicio);
              const finLib = toMinutes(intervalo.fin||intervalo.hora_fin);
              if (h0 < finLib && h1 > inicioLib){ viable = false; break; }
            }
          }
          if (!viable) break;
        }

            if (!horario.has(dia)) horario.set(dia, new Set());
            for (let h=h0; h<h1; h+=60){
              if (horario.get(dia).has(h)) { viable = false; break; }
              horario.get(dia).add(h);
            }
        if (!viable) break;
      }
      if (!viable) break;
    }
    if (!viable) { stats.skipped_conflict += 1; continue; }
    const creditos = comb.reduce((s,g)=>s+(g.creditos||0),0);
    if (creditos > opts.maxcreditos) { stats.skipped_creditos += 1; continue; }
    const dias_ocup = Array.from(horario.keys()).length;
    if (dias_ocup > opts.maxdias) { stats.skipped_dias += 1; continue; }
    let huecos = 0; // simplificado: 0
    const total_materias = comb.length;
    const sel = comb.map(g=> ({nombre: (g.horarios && g.horarios[0])?g.horarios[0].nombre:'(sin horario)', grupo: g.grupo}));
    if (!best) best = {horarioMap: Array.from(horario.entries()).map(([d,s])=>[d, Array.from(s)]), total_materias, creditos, dias_ocup, huecos, sel, comb};
    else {
      const b = best;
      let es = false;
      if (total_materias > b.total_materias) es = true;
      else if (total_materias==b.total_materias){
        if (creditos > b.creditos) es = true;
        else if (creditos==b.creditos){
          if (dias_ocup < b.dias_ocup) es = true;
          else if (dias_ocup==b.dias_ocup && huecos < b.huecos) es = true;
        }
      }
      if (es) best = {horarioMap:Array.from(horario.entries()).map(([d,s])=>[d, Array.from(s)]), total_materias, creditos, dias_ocup, huecos, sel, comb};
    }
  }
  try{
    if (best) postMessage({ result: best, stats });
    else postMessage({ error: 'no_viable', stats });
  }catch(e){
    postMessage({ error: 'exception', message: (e && e.message) || String(e), stats });
  }
};

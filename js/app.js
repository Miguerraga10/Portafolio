/* app.js - logica para catalogos, proyectos, navegacion y contacto */
const FALLBACK_DATA = {
  coursesCatalogs: [
    {
      id: "idiomas",
      title: "Idiomas",
      image: "assets/course-idiomas.svg",
      courses: []
    },
    {
      id: "matematicas",
      title: "Matematicas",
      image: "assets/course-matematicas.svg",
      courses: []
    },
    {
      id: "programacion",
      title: "Programacion",
      image: "assets/course-programacion.svg",
      courses: []
    }
  ],
  projects: [
    {
      id: 1,
      title: "Proyecto: Dashboard Analytics",
      desc: "Dashboard responsivo con visualizaciones de datos.",
      tech: ["HTML", "CSS", "JavaScript"],
      link: "#"
    },
    {
      id: 2,
      title: "Proyecto: Tienda UI",
      desc: "Interfaz e-commerce enfocada en experiencia de usuario.",
      tech: ["React", "Sass"],
      link: "#"
    }
  ]
};

const hasValidPortfolioData =
  window.PORTFOLIO_DATA &&
  Array.isArray(window.PORTFOLIO_DATA.coursesCatalogs) &&
  Array.isArray(window.PORTFOLIO_DATA.projects);

const DATA = hasValidPortfolioData ? window.PORTFOLIO_DATA : FALLBACK_DATA;
const COURSE_RELEASE_CONFIG = window.PORTFOLIO_COURSE_RELEASE || {
  enabledCourses: []
};

const ENABLED_COURSES = new Set(
  (Array.isArray(COURSE_RELEASE_CONFIG.enabledCourses)
    ? COURSE_RELEASE_CONFIG.enabledCourses
    : [])
    .map(function (value) {
      return String(value || "").trim().toLowerCase();
    })
    .filter(Boolean)
);

function getCourseId(courseItem) {
  if (!courseItem || typeof courseItem !== "object") return "";
  return String(courseItem.id || "").trim();
}

function getCourseTitle(courseItem) {
  if (!courseItem) return "";
  if (typeof courseItem === "string") return courseItem;
  return String(courseItem.title || "").trim();
}

function getCourseLanguageKey(courseItem) {
  const title = getCourseTitle(courseItem);
  const match = title.match(/^(.+?)\s+N\d+$/i);
  return (match ? match[1] : title).trim();
}

function getCourseLevelValue(courseItem) {
  const title = getCourseTitle(courseItem);
  const jlptMatch = title.match(/\bN\s*(\d+)\b/i);
  if (jlptMatch) return Number(jlptMatch[1]) || Number.POSITIVE_INFINITY;

  const genericMatch = title.match(/\b(\d+)\b/);
  if (genericMatch) return Number(genericMatch[1]) || Number.POSITIVE_INFINITY;

  return Number.POSITIVE_INFINITY;
}

function compareCourseCatalogItems(courseA, courseB, criterion, direction) {
  const factor = direction === "desc" ? -1 : 1;
  const titleA = getCourseTitle(courseA);
  const titleB = getCourseTitle(courseB);

  if (criterion === "nivel") {
    const levelA = getCourseLevelValue(courseA);
    const levelB = getCourseLevelValue(courseB);
    if (levelA !== levelB) return (levelA - levelB) * factor;
  }

  const valueA = criterion === "idioma" ? getCourseLanguageKey(courseA) : titleA;
  const valueB = criterion === "idioma" ? getCourseLanguageKey(courseB) : titleB;
  return valueA.localeCompare(valueB, "es", { sensitivity: "base" }) * factor;
}

function isCourseEnabled(catalogId, courseItem) {
  const normalizedCatalogId = String(catalogId || "").trim().toLowerCase();
  const courseId = getCourseId(courseItem);
  if (!courseId) return false;

  const normalizedCourseId = courseId.toLowerCase();
  const scopedId = normalizedCatalogId + "/" + normalizedCourseId;
  return ENABLED_COURSES.has(normalizedCourseId) || ENABLED_COURSES.has(scopedId);
}

function appendLoadWarning(container) {
  if (!container || hasValidPortfolioData) return;
  const warning = el(
    "p",
    "muted",
    "Se cargaron datos de respaldo. Revisa la consola del navegador para ver el error original de js/data.js."
  );
  warning.setAttribute("data-load-warning", "1");
  container.appendChild(warning);
}

function el(tag, cls, txt) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (txt) node.textContent = txt;
  return node;
}

function imagePath(src) {
  if (!src) return "";
  if (src.indexOf("data:image/") === 0) return src;
  if (src.indexOf("generated:class-") === 0) {
    return createGeneratedClassImage(src);
  }
  return src && src.indexOf("assets/") === 0 ? src : "assets/" + src;
}

function createGeneratedClassImage(token) {
  const raw = token.replace("generated:class-", "");
  const parts = raw.split("|");
  const classNo = (parts[0] || "00").trim();
  const fullName = parts[1] ? decodeURIComponent(parts[1]) : ("Clase " + classNo);
  const sourceName = parts[2] ? decodeURIComponent(parts[2]) : "";
  const practiceMatch = sourceName.match(/practica\s*0*\d+/i) || fullName.match(/practica\s*0*\d+/i);
  const classMatch = sourceName.match(/clase\s*0*\d+/i) || fullName.match(/clase\s*0*\d+/i);
  const miniExamMatch = sourceName.match(/mini\s*examen\s*\d*/i) || fullName.match(/mini\s*examen\s*\d*/i);
  const examFinalMatch = /examen\s+final/i.test(sourceName) || /examen\s+final/i.test(fullName);
  const badgeLabel = miniExamMatch
    ? miniExamMatch[0].replace(/\s+/g, " ").trim()
    : (examFinalMatch
        ? "Examen final"
        : (practiceMatch
            ? practiceMatch[0]
            : (classMatch ? classMatch[0].replace(/\s+/g, " ").trim() : ("Clase " + classNo))));
  const num = Number(classNo) || 0;
  const palette = getClassPalette(num, sourceName);
  const hueA = palette.hueA;
  const hueB = palette.hueB;
  const sourceDisplayName = normalizeClassDisplayName(sourceName);
  const isGenericSourceName = /^(Estadistica\s*2|Metodos\s*numericos|Calculo\s*multivariable|Japones\s*N5)$/i.test(sourceDisplayName);
  const displayName = sourceDisplayName && !isGenericSourceName ? sourceDisplayName : fullName;
  const escapedName = escapeXml(displayName);
  const lines = splitTitleLines(escapedName, 20, 4);
  const line1 = lines[0] || "Clase " + classNo;
  const line2 = lines[1] || "";
  const line3 = lines[2] || "";
  const line4 = lines[3] || "";
  const longestLine = Math.max(line1.length, line2.length, line3.length, line4.length);
  const titleSize = longestLine > 19 ? 44 : (longestLine > 15 ? 48 : 52);
  const lineGap = titleSize + 10;
  const y1 = 300;
  const y2 = y1 + lineGap;
  const y3 = y2 + lineGap;
  const y4 = y3 + lineGap;
  const motif = getClassMotifSvg(num, sourceName);
  const extraIcons = getClassExtraIconsSvg(num, sourceName, !!practiceMatch);
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700' role='img' aria-label='" + escapeXml(badgeLabel) + "'>" +
    "<defs>" +
    "<linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='hsl(" + hueA + ",85%,45%)'/><stop offset='100%' stop-color='hsl(" + hueB + ",90%,52%)'/></linearGradient>" +
    "<radialGradient id='halo' cx='0.15' cy='0.05' r='1'><stop offset='0%' stop-color='rgba(255,255,255,0.36)'/><stop offset='100%' stop-color='rgba(255,255,255,0)'/></radialGradient>" +
    "<linearGradient id='ink' x1='0' y1='0' x2='1' y2='0'><stop offset='0%' stop-color='rgba(190,228,255,0.98)'/><stop offset='100%' stop-color='rgba(255,255,255,0.95)'/></linearGradient>" +
    "<pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'><path d='M40 0H0V40' fill='none' stroke='rgba(255,255,255,0.09)' stroke-width='1'/></pattern>" +
    "<pattern id='dots' width='20' height='20' patternUnits='userSpaceOnUse'><circle cx='2' cy='2' r='1.4' fill='rgba(255,255,255,0.16)'/></pattern>" +
    "<filter id='soft'><feGaussianBlur stdDeviation='24'/></filter>" +
    "<filter id='cardShadow'><feDropShadow dx='0' dy='10' stdDeviation='8' flood-color='rgba(0,0,0,0.35)'/></filter>" +
    "</defs>" +
    "<rect width='1200' height='700' fill='#0a0f18'/>" +
    "<rect width='1200' height='700' fill='url(#bg)' opacity='0.22'/>" +
    "<rect width='1200' height='700' fill='url(#halo)' opacity='0.55'/>" +
    "<rect width='1200' height='700' fill='url(#grid)' opacity='0.22'/>" +
    "<rect width='1200' height='700' fill='url(#dots)' opacity='0.16'/>" +
    "<ellipse cx='170' cy='110' rx='220' ry='120' fill='url(#bg)' opacity='0.42' filter='url(#soft)'/>" +
    "<ellipse cx='1020' cy='570' rx='280' ry='140' fill='url(#bg)' opacity='0.34' filter='url(#soft)'/>" +
    "<path d='M70,545 C250,430 360,635 550,525 C735,420 875,620 1125,468' stroke='url(#ink)' stroke-width='9' fill='none' opacity='0.72'/>" +
    "<path d='M92,575 C260,495 386,640 566,558 C760,472 892,630 1118,520' stroke='rgba(255,255,255,0.38)' stroke-width='3' fill='none' opacity='0.5'/>" +
    motif +
    extraIcons +
    "<rect x='84' y='100' width='670' height='410' rx='24' fill='rgba(7,12,21,0.56)' stroke='rgba(255,255,255,0.28)' stroke-width='2' filter='url(#cardShadow)'/>" +
    "<path d='M84,124 a24,24 0 0 1 24,-24 h70' stroke='rgba(255,255,255,0.35)' stroke-width='3' fill='none'/>" +
    "<path d='M730,510 h-78 a24,24 0 0 1 -24,24' stroke='rgba(255,255,255,0.24)' stroke-width='3' fill='none'/>" +
    "<rect x='104' y='130' width='330' height='96' rx='16' fill='url(#bg)' opacity='0.98'/>" +
    "<text x='130' y='194' fill='#eff6ff' font-family='Sora, Segoe UI, Arial, sans-serif' font-size='52' font-weight='820'>" + escapeXml(badgeLabel) + "</text>" +
    "<text x='122' y='" + y1 + "' fill='#eff6ff' font-family='Sora, Segoe UI, Arial, sans-serif' font-size='" + titleSize + "' font-weight='760'>" + line1 + "</text>" +
    (line2 ? "<text x='122' y='" + y2 + "' fill='#d8e6f8' font-family='Sora, Segoe UI, Arial, sans-serif' font-size='" + titleSize + "' font-weight='660'>" + line2 + "</text>" : "") +
    (line3 ? "<text x='122' y='" + y3 + "' fill='#c3d8f1' font-family='Sora, Segoe UI, Arial, sans-serif' font-size='" + titleSize + "' font-weight='620'>" + line3 + "</text>" : "") +
    (line4 ? "<text x='122' y='" + y4 + "' fill='#b8d0ee' font-family='Sora, Segoe UI, Arial, sans-serif' font-size='" + titleSize + "' font-weight='600'>" + line4 + "</text>" : "") +
    "</svg>";
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function isJaponesN5Source(sourceName) {
  var s = String(sourceName || "");
  return /^Japones\s*N5$/i.test(s) || /^Mini\s*examen/i.test(s) || /^Examen\s*final$/i.test(s);
}

function getJaponesN5Palette(num) {
  var palettes = [
    { hueA: 355, hueB: 330 },
    { hueA: 8,   hueB: 340 },
    { hueA: 345, hueB: 5   },
    { hueA: 0,   hueB: 320 },
    { hueA: 15,  hueB: 350 },
    { hueA: 350, hueB: 290 },
    { hueA: 5,   hueB: 335 }
  ];
  var idx = num === 0 ? 0 : (num - 1) % palettes.length;
  return palettes[idx];
}

function getJaponesN5MotifSvg(num) {
  var s = "rgba(255,215,220,0.82)";
  var t = "rgba(255,170,185,0.50)";
  var b = "rgba(255,245,248,0.92)";
  var motifType = num === 0 ? 7 : (num - 1) % 7;
  switch (motifType) {
    case 0: // Torii gate
      return "<line x1='800' y1='462' x2='800' y2='296' stroke='" + s + "' stroke-width='14' stroke-linecap='round'/>" +
        "<line x1='940' y1='462' x2='940' y2='296' stroke='" + s + "' stroke-width='14' stroke-linecap='round'/>" +
        "<path d='M756,282 Q870,242 984,282' fill='none' stroke='" + s + "' stroke-width='11' stroke-linecap='round'/>" +
        "<line x1='756' y1='282' x2='984' y2='282' stroke='" + s + "' stroke-width='6' stroke-linecap='round'/>" +
        "<line x1='756' y1='274' x2='756' y2='294' stroke='" + b + "' stroke-width='7' stroke-linecap='round'/>" +
        "<line x1='984' y1='274' x2='984' y2='294' stroke='" + b + "' stroke-width='7' stroke-linecap='round'/>" +
        "<line x1='780' y1='335' x2='960' y2='335' stroke='" + s + "' stroke-width='8' stroke-linecap='round'/>";
    case 1: // Mont Fuji
      return "<path d='M710,462 L860,232 L1010,462' fill='none' stroke='" + s + "' stroke-width='3.5'/>" +
        "<path d='M825,272 L860,232 L895,272 L875,281 L860,283 L845,281 Z' fill='" + b + "' opacity='0.28' stroke='" + b + "' stroke-width='1.5'/>" +
        "<path d='M718,448 Q860,418 1002,448' fill='none' stroke='" + t + "' stroke-width='2'/>" +
        "<path d='M726,432 Q860,404 994,432' fill='none' stroke='" + t + "' stroke-width='1.5'/>" +
        "<path d='M736,416 Q860,390 984,416' fill='none' stroke='" + t + "' stroke-width='1'/>";
    case 2: // Cherry blossom
      return "<path d='M730,462 C780,410 840,360 900,308' fill='none' stroke='" + s + "' stroke-width='5' stroke-linecap='round'/>" +
        "<path d='M900,308 C930,282 960,264 996,250' fill='none' stroke='" + s + "' stroke-width='4' stroke-linecap='round'/>" +
        "<path d='M900,308 C920,330 950,323 978,314' fill='none' stroke='" + t + "' stroke-width='3' stroke-linecap='round'/>" +
        "<circle cx='900' cy='294' r='8' fill='none' stroke='" + b + "' stroke-width='1.5'/>" +
        "<circle cx='913' cy='303' r='8' fill='none' stroke='" + b + "' stroke-width='1.5'/>" +
        "<circle cx='908' cy='318' r='8' fill='none' stroke='" + b + "' stroke-width='1.5'/>" +
        "<circle cx='892' cy='318' r='8' fill='none' stroke='" + b + "' stroke-width='1.5'/>" +
        "<circle cx='887' cy='303' r='8' fill='none' stroke='" + b + "' stroke-width='1.5'/>" +
        "<circle cx='900' cy='308' r='4' fill='" + b + "' opacity='0.5'/>" +
        "<circle cx='996' cy='237' r='6' fill='none' stroke='" + s + "' stroke-width='1.5'/>" +
        "<circle cx='1006' cy='245' r='6' fill='none' stroke='" + s + "' stroke-width='1.5'/>" +
        "<circle cx='1002' cy='258' r='6' fill='none' stroke='" + s + "' stroke-width='1.5'/>" +
        "<circle cx='990' cy='258' r='6' fill='none' stroke='" + s + "' stroke-width='1.5'/>" +
        "<circle cx='986' cy='245' r='6' fill='none' stroke='" + s + "' stroke-width='1.5'/>" +
        "<circle cx='840' cy='348' r='4' fill='" + t + "' opacity='0.7'/>" +
        "<circle cx='958' cy='274' r='4' fill='" + t + "' opacity='0.6'/>" +
        "<circle cx='1022' cy='292' r='3' fill='" + t + "' opacity='0.5'/>";
    case 3: // Wave
      return "<path d='M716,392 C740,370 762,382 786,362 C810,342 832,354 856,332 C878,312 902,324 926,302 C948,282 972,294 996,272 C1018,252 1042,266 1060,246' fill='none' stroke='" + s + "' stroke-width='3'/>" +
        "<path d='M716,422 C740,400 762,412 786,392 C810,372 832,384 856,362 C878,342 902,354 926,332 C948,312 972,324 996,302 C1018,282 1042,296 1060,276' fill='none' stroke='" + t + "' stroke-width='2'/>" +
        "<path d='M716,452 C740,430 762,442 786,422 C810,402 832,414 856,392 C878,372 902,384 926,362 C948,342 972,356 996,334' fill='none' stroke='" + t + "' stroke-width='1.5'/>" +
        "<path d='M786,362 C778,352 771,348 765,352' fill='none' stroke='" + b + "' stroke-width='2.5'/>" +
        "<path d='M856,332 C848,322 841,318 835,322' fill='none' stroke='" + b + "' stroke-width='2.5'/>" +
        "<path d='M926,302 C918,292 911,288 905,292' fill='none' stroke='" + b + "' stroke-width='2.5'/>";
    case 4: // Enso
      return "<path d='M752,362 C756,274 820,236 870,238 C932,240 988,284 998,352 C1008,420 974,476 922,490 C870,504 812,476 780,434 C752,398 750,378 752,362 Z' fill='none' stroke='" + s + "' stroke-width='6' stroke-linecap='round' opacity='0.84'/>" +
        "<path d='M752,362 C754,344 758,329 766,317' fill='none' stroke='" + s + "' stroke-width='14' stroke-linecap='round' opacity='0.48'/>" +
        "<circle cx='874' cy='364' r='8' fill='" + b + "' opacity='0.42'/>";
    case 5: // Rising sun
      return "<circle cx='870' cy='372' r='72' fill='none' stroke='" + s + "' stroke-width='3'/>" +
        "<line x1='870' y1='288' x2='870' y2='250' stroke='" + t + "' stroke-width='2.5'/>" +
        "<line x1='921' y1='301' x2='943' y2='279' stroke='" + t + "' stroke-width='2.5'/>" +
        "<line x1='942' y1='352' x2='980' y2='352' stroke='" + t + "' stroke-width='2.5'/>" +
        "<line x1='921' y1='423' x2='943' y2='445' stroke='" + t + "' stroke-width='2.5'/>" +
        "<line x1='870' y1='444' x2='870' y2='482' stroke='" + t + "' stroke-width='2.5'/>" +
        "<line x1='819' y1='423' x2='797' y2='445' stroke='" + t + "' stroke-width='2.5'/>" +
        "<line x1='798' y1='372' x2='760' y2='372' stroke='" + t + "' stroke-width='2.5'/>" +
        "<line x1='819' y1='301' x2='797' y2='279' stroke='" + t + "' stroke-width='2.5'/>" +
        "<circle cx='870' cy='372' r='30' fill='" + s + "' opacity='0.20'/>";
    case 6: // Bamboo
      return "<line x1='800' y1='462' x2='800' y2='236' stroke='" + s + "' stroke-width='12' stroke-linecap='round'/>" +
        "<line x1='880' y1='462' x2='880' y2='252' stroke='" + s + "' stroke-width='12' stroke-linecap='round'/>" +
        "<line x1='960' y1='462' x2='960' y2='264' stroke='" + t + "' stroke-width='8' stroke-linecap='round'/>" +
        "<line x1='787' y1='322' x2='813' y2='322' stroke='" + b + "' stroke-width='4'/>" +
        "<line x1='787' y1='388' x2='813' y2='388' stroke='" + b + "' stroke-width='4'/>" +
        "<line x1='867' y1='340' x2='893' y2='340' stroke='" + b + "' stroke-width='4'/>" +
        "<line x1='867' y1='404' x2='893' y2='404' stroke='" + b + "' stroke-width='4'/>" +
        "<line x1='949' y1='350' x2='971' y2='350' stroke='" + b + "' stroke-width='3'/>" +
        "<path d='M800,322 C770,298 750,278 762,258 C778,258 796,278 800,322' fill='" + s + "' opacity='0.36'/>" +
        "<path d='M880,340 C910,316 940,298 934,278 C918,276 898,294 880,340' fill='" + s + "' opacity='0.36'/>" +
        "<path d='M960,350 C932,327 924,304 936,286 C950,284 964,306 960,350' fill='" + t + "' opacity='0.34'/>";
    default: // Scroll / exam
      return "<rect x='748' y='270' width='304' height='188' rx='12' fill='none' stroke='" + s + "' stroke-width='2.5'/>" +
        "<ellipse cx='900' cy='270' rx='152' ry='14' fill='rgba(0,0,0,0.22)' stroke='" + s + "' stroke-width='2'/>" +
        "<ellipse cx='900' cy='458' rx='152' ry='14' fill='rgba(0,0,0,0.22)' stroke='" + s + "' stroke-width='2'/>" +
        "<line x1='784' y1='310' x2='1016' y2='310' stroke='" + t + "' stroke-width='1.5'/>" +
        "<line x1='784' y1='340' x2='1016' y2='340' stroke='" + t + "' stroke-width='1.5'/>" +
        "<line x1='784' y1='370' x2='1016' y2='370' stroke='" + t + "' stroke-width='1.5'/>" +
        "<line x1='784' y1='400' x2='1016' y2='400' stroke='" + t + "' stroke-width='1.5'/>" +
        "<line x1='784' y1='430' x2='1016' y2='430' stroke='" + t + "' stroke-width='1.5'/>" +
        "<path d='M800,312 C840,312 920,342 980,352' fill='none' stroke='" + b + "' stroke-width='5' stroke-linecap='round' opacity='0.58'/>";
  }
}

function getClassPalette(num, sourceName) {
  if (isJaponesN5Source(sourceName)) {
    return getJaponesN5Palette(num);
  }
  const estNo = getEstadistica2ClassNo(sourceName);
  if (estNo >= 1) {
    const estPalette = {
      1: { hueA: 188, hueB: 152 },
      2: { hueA: 196, hueB: 164 },
      3: { hueA: 178, hueB: 150 },
      4: { hueA: 206, hueB: 172 }
    };
    return estPalette[estNo] || { hueA: 192, hueB: 160 };
  }

  const mnNo = getMetodosNumericosClassNo(sourceName);
  if (mnNo >= 1 && mnNo <= 9) {
    const mnPalette = {
      1: { hueA: 28, hueB: 202 },
      2: { hueA: 16, hueB: 196 },
      3: { hueA: 40, hueB: 176 },
      4: { hueA: 8, hueB: 186 },
      5: { hueA: 34, hueB: 214 },
      6: { hueA: 52, hueB: 188 },
      7: { hueA: 22, hueB: 170 },
      8: { hueA: 46, hueB: 206 },
      9: { hueA: 12, hueB: 178 }
    };
    return mnPalette[mnNo];
  }

  return {
    hueA: 185 + (num * 9) % 120,
    hueB: 345 - (num * 7) % 120
  };
}

function getEstadistica2ClassNo(sourceName) {
  const raw = String(sourceName || "");
  const match = raw.match(/Clase\s*0?(\d{1,2})\s*-\s*Estadistica\s*2/i);
  if (!match) return 0;
  return Number(match[1]) || 0;
}

function getEstadistica2MotifSvg(estNo, stroke, thin, bold) {
  switch (estNo) {
    case 1:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='460' x2='710' y2='270' stroke='" + thin + "' stroke-width='2'/>" +
        "<rect x='740' y='418' width='28' height='42' fill='" + stroke + "'/>" +
        "<rect x='780' y='376' width='28' height='84' fill='" + stroke + "'/>" +
        "<rect x='820' y='336' width='28' height='124' fill='" + stroke + "'/>" +
        "<rect x='860' y='356' width='28' height='104' fill='" + stroke + "'/>" +
        "<rect x='900' y='394' width='28' height='66' fill='" + stroke + "'/>" +
        "<path d='M738,428 C785,320 845,298 920,404' fill='none' stroke='" + bold + "' stroke-width='3'/>";
    case 2:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='460' x2='710' y2='250' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M720,440 C760,300 820,270 860,320 C900,370 950,360 1000,250' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M730,390 C770,430 800,430 845,385 C890,340 935,332 985,350' fill='none' stroke='" + bold + "' stroke-width='3'/>" +
        "<circle cx='845' cy='385' r='7' fill='" + bold + "'/>";
    case 3:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='460' x2='710' y2='250' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M730,430 L980,270' fill='none' stroke='" + stroke + "' stroke-width='3.2'/>" +
        "<path d='M730,390 L980,390' fill='none' stroke='" + thin + "' stroke-width='2.2'/>" +
        "<path d='M730,360 C810,300 900,300 980,360' fill='none' stroke='" + bold + "' stroke-width='2.6'/>" +
        "<circle cx='825' cy='370' r='7' fill='" + bold + "'/>" +
        "<circle cx='905' cy='318' r='7' fill='" + bold + "'/>";
    case 4:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='460' x2='710' y2='250' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M730,420 C780,300 940,300 990,420' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M730,365 C800,435 920,435 990,365' fill='none' stroke='" + bold + "' stroke-width='2.5'/>" +
        "<line x1='860' y1='290' x2='860' y2='450' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='790' y1='420' x2='930' y2='420' stroke='" + thin + "' stroke-width='2'/>";
    case 5:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='460' x2='710' y2='250' stroke='" + thin + "' stroke-width='2'/>" +
        "<rect x='748' y='392' width='38' height='68' rx='5' fill='" + stroke + "' opacity='0.72'/>" +
        "<rect x='802' y='360' width='38' height='100' rx='5' fill='" + stroke + "' opacity='0.72'/>" +
        "<rect x='856' y='330' width='38' height='130' rx='5' fill='" + stroke + "' opacity='0.72'/>" +
        "<rect x='910' y='370' width='38' height='90' rx='5' fill='" + stroke + "' opacity='0.72'/>" +
        "<path d='M748,432 C810,310 885,300 948,388' fill='none' stroke='" + bold + "' stroke-width='3'/>" +
        "<path d='M760,300 L790,300 M775,285 L775,315' stroke='" + thin + "' stroke-width='2'/>";
    default:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M725,430 C790,280 930,280 995,430' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M725,360 C790,430 930,430 995,360' fill='none' stroke='" + bold + "' stroke-width='2.5'/>";
  }
}

function getEstadistica2PracticeMotifSvg(stroke, thin, bold) {
  return "<rect x='724' y='250' width='280' height='220' rx='14' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
    "<line x1='756' y1='306' x2='966' y2='306' stroke='" + thin + "' stroke-width='2'/>" +
    "<line x1='756' y1='352' x2='966' y2='352' stroke='" + thin + "' stroke-width='2'/>" +
    "<line x1='756' y1='398' x2='966' y2='398' stroke='" + thin + "' stroke-width='2'/>" +
    "<path d='M736,302 L746,312 L764,292' fill='none' stroke='" + bold + "' stroke-width='3'/>" +
    "<path d='M736,348 L746,358 L764,338' fill='none' stroke='" + bold + "' stroke-width='3'/>" +
    "<path d='M736,394 L746,404 L764,384' fill='none' stroke='" + bold + "' stroke-width='3'/>" +
    "<path d='M940,232 L980,272 L952,300 L912,260 Z' fill='rgba(255,255,255,0.12)' stroke='" + bold + "' stroke-width='2'/>" +
    "<line x1='922' y1='270' x2='946' y2='246' stroke='" + bold + "' stroke-width='3'/>";
}

function getClassExtraIconsSvg(num, sourceName, isPractice) {
  if (isJaponesN5Source(sourceName)) return "";
  const iconStroke = "rgba(226,239,255,0.8)";
  const iconFill = "rgba(182,214,246,0.26)";
  const iconAccent = "rgba(255,255,255,0.88)";

  let leftSet =
    "<g transform='translate(86 520)' opacity='0.92'>" +
    "<circle cx='0' cy='0' r='18' fill='" + iconFill + "' stroke='" + iconStroke + "' stroke-width='2'/>" +
    "<path d='M-8 0h16M0-8v16' stroke='" + iconAccent + "' stroke-width='2' stroke-linecap='round'/>" +
    "</g>" +
    "<g transform='translate(150 520)' opacity='0.9'>" +
    "<rect x='-16' y='-14' width='32' height='28' rx='6' fill='" + iconFill + "' stroke='" + iconStroke + "' stroke-width='2'/>" +
    "<path d='M-8 -4h16M-8 4h12' stroke='" + iconAccent + "' stroke-width='2' stroke-linecap='round'/>" +
    "</g>";

  let rightSet =
    "<g transform='translate(1100 84)' opacity='0.9'>" +
    "<path d='M0-12L4-4L12 0L4 4L0 12L-4 4L-12 0L-4 -4Z' fill='" + iconFill + "' stroke='" + iconStroke + "' stroke-width='2'/>" +
    "</g>" +
    "<g transform='translate(1052 98)' opacity='0.85'>" +
    "<circle cx='0' cy='0' r='10' fill='none' stroke='" + iconStroke + "' stroke-width='2'/>" +
    "<circle cx='0' cy='0' r='3' fill='" + iconAccent + "'/>" +
    "</g>";

  if (isPractice) {
    rightSet +=
      "<g transform='translate(1038 152)' opacity='0.92'>" +
      "<rect x='-18' y='-14' width='36' height='28' rx='7' fill='" + iconFill + "' stroke='" + iconStroke + "' stroke-width='2'/>" +
      "<path d='M-10 -2h20M-10 6h14' stroke='" + iconAccent + "' stroke-width='2' stroke-linecap='round'/>" +
      "</g>";
  } else if (num >= 17) {
    rightSet +=
      "<g transform='translate(1038 152)' opacity='0.88'>" +
      "<path d='M-14 10C-5 -12 7 -12 14 10' fill='none' stroke='" + iconStroke + "' stroke-width='2'/>" +
      "<line x1='-10' y1='14' x2='10' y2='14' stroke='" + iconAccent + "' stroke-width='2'/>" +
      "</g>";
  }

  if (num <= 10) {
    leftSet +=
      "<g transform='translate(214 520)' opacity='0.92'>" +
      "<polygon points='0,-15 14,12 -14,12' fill='" + iconFill + "' stroke='" + iconStroke + "' stroke-width='2'/>" +
      "</g>";
  } else if (num <= 16) {
    leftSet +=
      "<g transform='translate(214 520)' opacity='0.92'>" +
      "<rect x='-14' y='-14' width='28' height='28' fill='none' stroke='" + iconStroke + "' stroke-width='2'/>" +
      "<line x1='-14' y1='0' x2='14' y2='0' stroke='" + iconAccent + "' stroke-width='2'/>" +
      "<line x1='0' y1='-14' x2='0' y2='14' stroke='" + iconAccent + "' stroke-width='2'/>" +
      "</g>";
  } else {
    leftSet +=
      "<g transform='translate(214 520)' opacity='0.92'>" +
      "<path d='M-12 10C-12 -6 12 -6 12 10' fill='none' stroke='" + iconStroke + "' stroke-width='2'/>" +
      "<path d='M-8 4L0 -8L8 4' fill='none' stroke='" + iconAccent + "' stroke-width='2'/>" +
      "</g>";
  }

  return leftSet + rightSet;
}

function normalizeClassDisplayName(sourceName) {
  const raw = String(sourceName || "").trim();
  if (!raw) return "";

  const firstRef = raw.split("+")[0].trim();

  return firstRef
    .replace(/\.pdf$/i, "")
    .replace(/^clase\s*\d+\s*(,\s*pt\s*\d+)?\s*([\.:\-])?\s*/i, "")
    .replace(/^mn\s*\d+\s*([_\-:\.]\s*)?/i, "")
    .replace(/\bmn\s*\d+\b/ig, "")
    .replace(/\s*[-:]\s*Estadistica\s*2\s*$/i, "")
    .replace(/\s*[-:]\s*Metodos\s*numericos\s*$/i, "")
    .replace(/\s*[-:]\s*Calculo\s*multivariable\s*$/i, "")
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\bMN\s*(\d+)\b/i, "MN$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*\(.*?\)\s*$/i, "")
    .trim();
}

function splitTitleLines(title, maxChars, maxLines) {
  const rawWords = String(title || "").replace(/\s+/g, " ").trim().split(" ");
  const words = [];

  // Si hay "palabras" muy largas (ej. nombres de archivo), se parten para evitar desborde.
  rawWords.forEach(function (word) {
    if (!word) return;
    if (word.length <= maxChars) {
      words.push(word);
      return;
    }
    let remaining = word;
    while (remaining.length > maxChars) {
      words.push(remaining.slice(0, maxChars - 1) + "-");
      remaining = remaining.slice(maxChars - 1);
    }
    if (remaining.length) words.push(remaining);
  });

  const lines = [];
  let current = "";

  words.forEach(function (word) {
    const candidate = current ? current + " " + word : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);

  return lines.slice(0, maxLines);
}

function getMetodosNumericosClassNo(sourceName) {
  const raw = String(sourceName || "");
  const match = raw.match(/MN\s*(\d{1,2})/i);
  if (!match) return 0;
  return Number(match[1]) || 0;
}

function getMetodosNumericosMotifSvg(mnNo, stroke, thin, bold) {
  switch (mnNo) {
    case 1:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M720,430 C780,300 930,300 990,430' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='760' y1='460' x2='760' y2='370' stroke='" + bold + "' stroke-width='3'/>" +
        "<line x1='910' y1='460' x2='910' y2='370' stroke='" + bold + "' stroke-width='3'/>";
    case 2:
      return "<path d='M720,450 C760,320 860,280 1000,230' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='860' y1='430' x2='960' y2='320' stroke='" + bold + "' stroke-width='3'/>" +
        "<circle cx='860' cy='430' r='8' fill='" + bold + "'/>" +
        "<circle cx='960' cy='320' r='8' fill='" + bold + "'/>";
    case 3:
      return "<rect x='710' y='260' width='300' height='200' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='810' y1='260' x2='810' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='910' y1='260' x2='910' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='327' x2='1010' y2='327' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='394' x2='1010' y2='394' stroke='" + thin + "' stroke-width='2'/>";
    case 4:
      return "<line x1='740' y1='460' x2='740' y2='290' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='820' y1='460' x2='820' y2='290' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='900' y1='460' x2='900' y2='290' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='980' y1='460' x2='980' y2='290' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M740,460 L980,290' stroke='" + stroke + "' stroke-width='4'/>";
    case 5:
      return "<circle cx='760' cy='420' r='10' fill='" + bold + "'/>" +
        "<circle cx='860' cy='340' r='10' fill='" + bold + "'/>" +
        "<circle cx='960' cy='400' r='10' fill='" + bold + "'/>" +
        "<path d='M760,420 Q850,260 960,400' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M760,420 L860,340 L960,400' fill='none' stroke='" + thin + "' stroke-width='2'/>";
    case 6:
      return "<path d='M720,430 C790,300 930,300 1000,430' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M720,360 C790,430 930,430 1000,360' fill='none' stroke='" + thin + "' stroke-width='3'/>" +
        "<line x1='860' y1='290' x2='860' y2='460' stroke='" + bold + "' stroke-width='3'/>";
    case 7:
      return "<path d='M720,410 C760,300 840,300 880,410 C920,520 1000,520 1040,410' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M720,370 C760,290 840,290 880,370 C920,450 1000,450 1040,370' fill='none' stroke='" + thin + "' stroke-width='2'/>";
    case 8:
      return "<path d='M720,460 L990,460' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M740,430 C790,320 920,320 970,430' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='740' y1='460' x2='740' y2='430' stroke='" + bold + "' stroke-width='3'/>" +
        "<line x1='970' y1='460' x2='970' y2='430' stroke='" + bold + "' stroke-width='3'/>";
    case 9:
      return "<line x1='710' y1='460' x2='1010' y2='460' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='760' y1='460' x2='760' y2='300' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='460' x2='860' y2='280' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='960' y1='460' x2='960' y2='300' stroke='" + thin + "' stroke-width='2'/>" +
        "<circle cx='760' cy='430' r='8' fill='" + bold + "'/>" +
        "<circle cx='860' cy='360' r='8' fill='" + bold + "'/>" +
        "<circle cx='960' cy='400' r='8' fill='" + bold + "'/>";
    default:
      return "";
  }
}

function getClassMotifSvg(num, sourceName) {
  const stroke = "rgba(210,230,255,0.82)";
  const thin = "rgba(180,210,245,0.62)";
  const bold = "rgba(255,255,255,0.9)";

  if (isJaponesN5Source(sourceName)) {
    return getJaponesN5MotifSvg(num);
  }

  if (/Practica\s*0*1\s*-\s*Estadistica\s*2/i.test(String(sourceName || ""))) {
    return getEstadistica2PracticeMotifSvg(stroke, thin, bold);
  }

  const estNo = getEstadistica2ClassNo(sourceName);
  if (estNo >= 1) {
    return getEstadistica2MotifSvg(estNo, stroke, thin, bold);
  }

  const metodosNo = getMetodosNumericosClassNo(sourceName);
  if (metodosNo >= 1 && metodosNo <= 9) {
    return getMetodosNumericosMotifSvg(metodosNo, stroke, thin, bold);
  }

  switch (num) {
    case 1:
      return "<ellipse cx='860' cy='250' rx='160' ry='80' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<ellipse cx='860' cy='250' rx='110' ry='50' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M760,320 L960,180' stroke='" + bold + "' stroke-width='3'/>";
    case 2:
      return "<path d='M720,420 C760,260 940,260 980,420' fill='none' stroke='" + stroke + "' stroke-width='4'/>" +
        "<ellipse cx='850' cy='420' rx='170' ry='28' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<ellipse cx='850' cy='372' rx='130' ry='22' fill='none' stroke='" + thin + "' stroke-width='2'/>";
    case 3:
      return "<path d='M690,430 C760,350 820,260 1000,230' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M690,430 C760,390 860,330 1000,320' fill='none' stroke='" + thin + "' stroke-width='3'/>" +
        "<circle cx='760' cy='390' r='6' fill='" + bold + "'/>";
    case 4:
      return "<path d='M700,430 L980,430' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M700,380 L980,380' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M730,460 L790,340' stroke='" + stroke + "' stroke-width='4'/>" +
        "<path d='M860,460 L920,340' stroke='" + stroke + "' stroke-width='4'/>";
    case 5:
      return "<polygon points='740,420 980,380 980,250 740,290' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='740' y1='420' x2='980' y2='250' stroke='" + thin + "' stroke-width='2'/>";
    case 6:
      return "<path d='M710,390 C760,310 820,310 860,390' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M860,390 C900,470 960,470 1010,390' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='860' y1='390' x2='860' y2='300' stroke='" + bold + "' stroke-width='3'/>";
    case 7:
      return "<circle cx='860' cy='355' r='92' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<circle cx='860' cy='355' r='56' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M860,355 L960,310' stroke='" + stroke + "' stroke-width='4'/>" +
        "<polygon points='960,310 946,312 952,325' fill='" + stroke + "'/>";
    case 8:
    case 9:
    case 10:
      return "<path d='M720,450 C790,290 930,290 1000,450' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M720,250 C790,410 930,410 1000,250' fill='none' stroke='" + thin + "' stroke-width='3'/>" +
        "<circle cx='860' cy='350' r='7' fill='" + bold + "'/>";
    case 11:
    case 12:
      return "<rect x='700' y='250' width='300' height='220' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='800' y1='250' x2='800' y2='470' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='900' y1='250' x2='900' y2='470' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='700' y1='323' x2='1000' y2='323' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='700' y1='396' x2='1000' y2='396' stroke='" + thin + "' stroke-width='2'/>";
    case 13:
      return "<circle cx='860' cy='360' r='150' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<circle cx='860' cy='360' r='100' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='210' x2='860' y2='510' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='710' y1='360' x2='1010' y2='360' stroke='" + thin + "' stroke-width='2'/>";
    case 14:
    case 15:
    case 16:
      return "<path d='M730,430 L730,270 L890,230 L1050,270 L1050,430 L890,470 Z' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='730' y1='270' x2='890' y2='310' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='890' y1='310' x2='1050' y2='270' stroke='" + thin + "' stroke-width='2'/>";
    case 17:
      return "<path d='M770,470 C740,410 740,290 850,260 C960,290 960,410 930,470' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M810,460 C780,410 780,315 850,295 C920,315 920,410 890,460' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='850' y1='235' x2='850' y2='500' stroke='" + thin + "' stroke-width='2'/>" +
        "<polygon points='930,470 915,468 922,455' fill='" + bold + "'/>";
    case 18:
      return "<path d='M720,430 C780,330 900,330 980,430' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='740' y1='455' x2='980' y2='455' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='810' y1='455' x2='810' y2='360' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='900' y1='455' x2='900' y2='360' stroke='" + thin + "' stroke-width='2'/>";
    case 19:
      return "<path d='M730,410 L980,290' stroke='" + stroke + "' stroke-width='4'/>" +
        "<polygon points='980,290 964,292 970,305' fill='" + bold + "'/>" +
        "<path d='M760,470 L1020,350' stroke='" + thin + "' stroke-width='3'/>" +
        "<polygon points='1020,350 1004,352 1010,365' fill='" + thin + "'/>";
    case 20:
      return "<path d='M730,430 C810,300 930,300 1010,430' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<circle cx='730' cy='430' r='8' fill='" + bold + "'/>" +
        "<circle cx='1010' cy='430' r='8' fill='" + bold + "'/>" +
        "<text x='838' y='382' fill='" + bold + "' font-size='28' font-family='Space Grotesk, Arial, sans-serif'>f(B)-f(A)</text>";
    case 21:
      return "<circle cx='870' cy='360' r='135' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<circle cx='870' cy='360' r='70' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M1005,360 A135,135 0 0 1 1004,377' stroke='" + bold + "' stroke-width='4' fill='none'/>" +
        "<polygon points='1004,377 992,365 1009,363' fill='" + bold + "'/>";
    case 22:
      return "<path d='M710,430 C760,250 950,250 1020,430' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M730,390 C785,300 940,300 995,390' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='760' y1='430' x2='760' y2='275' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='865' y1='430' x2='865' y2='250' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='970' y1='430' x2='970' y2='275' stroke='" + thin + "' stroke-width='2'/>";
    case 23:
      return "<ellipse cx='860' cy='360' rx='170' ry='85' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<line x1='860' y1='275' x2='860' y2='470' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='740' y1='360' x2='980' y2='360' stroke='" + thin + "' stroke-width='2'/>" +
        "<path d='M910,315 L970,285' stroke='" + bold + "' stroke-width='3'/>" +
        "<polygon points='970,285 956,286 962,298' fill='" + bold + "'/>";
    case 24:
      return "<circle cx='860' cy='360' r='120' fill='none' stroke='" + stroke + "' stroke-width='3'/>" +
        "<path d='M780,360 C780,315 820,290 860,290 C900,290 940,315 940,360 C940,405 900,430 860,430 C820,430 780,405 780,360' fill='none' stroke='" + thin + "' stroke-width='3'/>" +
        "<path d='M940,360 A120,120 0 0 1 930,405' stroke='" + bold + "' stroke-width='4' fill='none'/>" +
        "<polygon points='930,405 918,393 935,391' fill='" + bold + "'/>";
    case 25:
      return "<circle cx='860' cy='360' r='55' fill='none' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='860' y2='230' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='980' y2='280' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='1015' y2='360' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='980' y2='440' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='860' y2='495' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='740' y2='440' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='705' y2='360' stroke='" + thin + "' stroke-width='2'/>" +
        "<line x1='860' y1='360' x2='740' y2='280' stroke='" + thin + "' stroke-width='2'/>" +
        "<polygon points='860,230 852,246 868,246' fill='" + stroke + "'/>" +
        "<polygon points='980,280 965,282 972,295' fill='" + stroke + "'/>" +
        "<polygon points='1015,360 1000,352 1000,368' fill='" + stroke + "'/>" +
        "<polygon points='980,440 972,425 965,438' fill='" + stroke + "'/>" +
        "<polygon points='860,495 852,479 868,479' fill='" + stroke + "'/>" +
        "<polygon points='740,440 755,438 748,425' fill='" + stroke + "'/>" +
        "<polygon points='705,360 720,368 720,352' fill='" + stroke + "'/>" +
        "<polygon points='740,280 748,295 755,282' fill='" + stroke + "'/>";
    default:
      return "<circle cx='860' cy='360' r='120' fill='none' stroke='" + stroke + "' stroke-width='3'/>";
  }
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderCourseCatalogs() {
  const container = document.getElementById("courses-list");
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(DATA.coursesCatalogs) || !DATA.coursesCatalogs.length) {
    container.appendChild(el("p", "muted", "No hay catalogos de cursos disponibles."));
    appendLoadWarning(container);
    return;
  }

  DATA.coursesCatalogs.forEach((catalog, index) => {
    const card = el("article", "card reveal-card");
    card.style.animationDelay = index * 120 + "ms";

    const title = el("h3", "card-title", catalog.title);

    const img = document.createElement("img");
    img.src = imagePath(catalog.image);
    img.alt = catalog.title;
    img.className = "card-img";

    const btn = el("button", "btn ghost", "Ver catalogo");
    btn.addEventListener("click", function () {
      window.location.href = "catalog.html?area=" + encodeURIComponent(catalog.id);
    });

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(btn);
    container.appendChild(card);
  });

  appendLoadWarning(container);
}

function getCatalogByArea() {
  const params = new URLSearchParams(window.location.search);
  const area = params.get("area");
  if (!area) return null;
  return DATA.coursesCatalogs.find(function (catalog) {
    return catalog.id === area;
  }) || null;
}

function getCourseByParams() {
  const params = new URLSearchParams(window.location.search);
  const area = params.get("area");
  const course = params.get("course");
  if (!area || !course) return null;

  const catalog = DATA.coursesCatalogs.find(function (item) {
    return item.id === area;
  });
  if (!catalog) return null;

  const courseItem = (catalog.courses || []).find(function (item) {
    return item.id === course;
  });

  if (!courseItem) return null;
  return {
    catalog: catalog,
    course: courseItem,
    locked: !isCourseEnabled(catalog.id, courseItem)
  };
}

function getLessonByParams() {
  const result = getCourseByParams();
  if (!result) return null;
  if (result.locked) {
    return { catalog: result.catalog, course: result.course, locked: true };
  }

  const params = new URLSearchParams(window.location.search);
  const moduleId = params.get("module");
  if (!moduleId) return null;

  const moduleItem = (result.course.modules || []).find(function (item) {
    return item.id === moduleId;
  });

  if (!moduleItem) return null;
  return { catalog: result.catalog, course: result.course, module: moduleItem };
}

function renderCatalogCoursesPage() {
  const container = document.getElementById("catalog-courses-list");
  if (!container) return;

  const catalog = getCatalogByArea();
  const titleNode = document.getElementById("catalog-title");
  const sortCriterionNode = document.getElementById("catalog-sort-criterion");
  const sortToggleNode = document.getElementById("catalog-sort-toggle");
  const sortCriterion = sortCriterionNode && sortCriterionNode.dataset.criterion === "nivel" ? "nivel" : "idioma";
  const sortDirection = sortToggleNode && sortToggleNode.dataset.direction === "desc" ? "desc" : "asc";

  container.innerHTML = "";
  if (!catalog) {
    if (titleNode) titleNode.textContent = "Catalogo no encontrado";
    container.appendChild(el("p", "muted", "No se encontro el area solicitada."));
    return;
  }

  if (titleNode) titleNode.textContent = catalog.title;

  if (sortCriterionNode) {
    sortCriterionNode.textContent = sortCriterion === "nivel" ? "Nivel" : "Curso";
    sortCriterionNode.setAttribute("title", sortCriterion === "nivel" ? "Ordenar por nivel" : "Ordenar por curso");
    sortCriterionNode.setAttribute("aria-label", sortCriterion === "nivel" ? "Ordenar por nivel" : "Ordenar por curso");
  }

  if (sortToggleNode) {
    sortToggleNode.textContent = sortDirection === "desc" ? "↓" : "↑";
    sortToggleNode.setAttribute("title", sortDirection === "desc" ? "Orden descendente" : "Orden ascendente");
    sortToggleNode.setAttribute("aria-label", sortDirection === "desc" ? "Orden descendente" : "Orden ascendente");
  }

  if (sortCriterionNode && !sortCriterionNode.dataset.bound) {
    sortCriterionNode.dataset.bound = "1";
    sortCriterionNode.addEventListener("click", function () {
      sortCriterionNode.dataset.criterion = sortCriterionNode.dataset.criterion === "nivel" ? "idioma" : "nivel";
      renderCatalogCoursesPage();
    });
  }

  if (sortToggleNode && !sortToggleNode.dataset.bound) {
    sortToggleNode.dataset.bound = "1";
    sortToggleNode.addEventListener("click", function () {
      sortToggleNode.dataset.direction = sortToggleNode.dataset.direction === "desc" ? "asc" : "desc";
      renderCatalogCoursesPage();
    });
  }

  const sortedCourses = (catalog.courses || []).slice().sort(function (courseA, courseB) {
    return compareCourseCatalogItems(courseA, courseB, sortCriterion, sortDirection);
  });

  sortedCourses.forEach(function (courseItem, index) {
    const courseTitle = getCourseTitle(courseItem);
    const courseImage = typeof courseItem === "string" ? catalog.image : (courseItem.image || catalog.image);
    const enabled = isCourseEnabled(catalog.id, courseItem);
    const courseId = getCourseId(courseItem);
    const card = el("article", "card reveal-card" + (enabled ? "" : " card-disabled"));
    card.style.animationDelay = index * 110 + "ms";

    const title = el("h3", "card-title", courseTitle);
    const img = document.createElement("img");
    img.src = imagePath(courseImage);
    img.alt = courseTitle;
    img.className = "card-img";

    if (enabled && courseId) {
      const link = document.createElement("a");
      link.className = "btn ghost";
      link.href =
        "course.html?area=" +
        encodeURIComponent(catalog.id) +
        "&course=" +
        encodeURIComponent(courseId);
      link.textContent = "Abrir curso";
      card.appendChild(title);
      card.appendChild(img);
      card.appendChild(link);
      container.appendChild(card);
      return;
    }

    const status = el("p", "course-status", "Proximamente");
    const disabledBtn = document.createElement("button");
    disabledBtn.className = "btn ghost";
    disabledBtn.type = "button";
    disabledBtn.disabled = true;
    disabledBtn.textContent = "No disponible";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(status);
    card.appendChild(disabledBtn);
    container.appendChild(card);
  });

}

function renderCoursePage() {
  const root = document.getElementById("course-detail");
  if (!root) return;

  const result = getCourseByParams();
  if (!result) {
    root.innerHTML = "";
    root.appendChild(el("h2", null, "Curso no encontrado"));
    root.appendChild(el("p", "muted", "Verifica el enlace e intenta de nuevo."));
    return;
  }

  if (result.locked) {
    root.innerHTML = "";
    root.appendChild(el("h2", null, "Curso no habilitado aun"));
    root.appendChild(el("p", "muted", "Este curso estara disponible cuando lo publique."));
    const back = document.createElement("a");
    back.className = "btn ghost";
    back.href = "catalog.html?area=" + encodeURIComponent(result.catalog.id);
    back.textContent = "Volver al catalogo";
    root.appendChild(back);
    return;
  }

  const titleNode = document.getElementById("course-title");
  const subtitleNode = document.getElementById("course-subtitle");
  const heroNode = document.getElementById("course-hero");
  const backLink = document.getElementById("back-to-catalog");
  const modulesNode = document.getElementById("course-modules");

  if (titleNode) titleNode.textContent = result.course.title;
  if (subtitleNode) subtitleNode.textContent = "Area: " + result.catalog.title;
  if (backLink) backLink.href = "catalog.html?area=" + encodeURIComponent(result.catalog.id);

  if (heroNode) {
    heroNode.dataset.courseId = result.course.id || "";
    heroNode.style.backgroundImage =
      "linear-gradient(180deg, rgba(6,8,12,0.15), rgba(6,8,12,0.8)), url('" +
      imagePath(result.course.image || result.catalog.image) +
      "')";
  }

  if (modulesNode) {
    modulesNode.innerHTML = "";
    (result.course.modules || []).forEach(function (moduleData, index) {
      const card = el("a", "card reveal-card card-link");
      card.style.animationDelay = index * 90 + "ms";
      card.href =
        "lesson.html?area=" +
        encodeURIComponent(result.catalog.id) +
        "&course=" +
        encodeURIComponent(result.course.id) +
        "&module=" +
        encodeURIComponent(moduleData.id);

      if (moduleData.image) {
        const img = document.createElement("img");
        img.src = imagePath(moduleData.image);
        img.alt = moduleData.title;
        img.className = "card-img";
        card.appendChild(img);
        card.setAttribute("aria-label", (moduleData.title || "") + (moduleData.subtitle ? ": " + moduleData.subtitle : ""));

        const topicBox = el("div", "module-topic-box");
        const topicTitle = el("p", "module-topic-title", "Temas de la clase");
        const topicList = el("ul", "module-topic-list");
        (moduleData.topics || []).forEach(function (topic) {
          const li = el("li");
          li.innerHTML = topic;
          topicList.appendChild(li);
        });
        topicBox.appendChild(topicTitle);
        topicBox.appendChild(topicList);
        card.appendChild(topicBox);
      } else {
        const title = el("h3", "card-title", moduleData.title);
        const copy = el("p", "card-copy module-subtitle", moduleData.subtitle);
        card.appendChild(title);
        card.appendChild(copy);
      }
      modulesNode.appendChild(card);
    });

    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      window.MathJax.typesetPromise([modulesNode]).catch(function () {
        // Ignore rendering failures on course cards.
      });
    }
  }
}

function shuffleExerciseArray(items) {
  return (items || []).slice().sort(function () {
    return Math.random() - 0.5;
  });
}

function pickRandomItems(items, count) {
  var shuffled = shuffleExerciseArray(items || []);
  var safeCount = Math.max(0, Math.min(count || shuffled.length, shuffled.length));
  return shuffled.slice(0, safeCount);
}

function resolveExerciseConfig(config) {
  var baseConfig = Object.assign({}, config || {});
  var resolved = baseConfig;

  if (Array.isArray(baseConfig.bank) && baseConfig.bank.length) {
    var picked = baseConfig.bank[Math.floor(Math.random() * baseConfig.bank.length)] || {};
    resolved = Object.assign({}, baseConfig, picked);
  }

  delete resolved.bank;

  if (Array.isArray(resolved.items)) {
    resolved.items = shuffleExerciseArray(resolved.items);
  }
  if (Array.isArray(resolved.groups)) {
    resolved.groups = shuffleExerciseArray(resolved.groups);
  }
  if (Array.isArray(resolved.targets)) {
    resolved.targets = shuffleExerciseArray(resolved.targets);
  }
  if (Array.isArray(resolved.questions)) {
    resolved.questions = shuffleExerciseArray(resolved.questions).map(function (question) {
      var nextQuestion = Object.assign({}, question);
      if (Array.isArray(nextQuestion.options)) {
        nextQuestion.options = shuffleExerciseArray(nextQuestion.options);
      }
      return nextQuestion;
    });
  }

  return resolved;
}

function createDragExercise(config) {
  config = resolveExerciseConfig(config);
  var wrap = document.createElement("div");
  wrap.className = "drag-exercise";
  wrap.appendChild(el("h5", "drag-exercise__title", config.title || ""));
  if (config.instruction) wrap.appendChild(el("p", "drag-exercise__instruction", config.instruction));

  var feedback = el("p", "drag-feedback", "");
  var validateBtn = document.createElement("button");
  validateBtn.className = "drag-validate-btn";
  validateBtn.textContent = "Validar";

  if (config.type === "categorize") {
    var pool = document.createElement("div");
    pool.className = "drag-pool";
    var chipsArr = config.items.map(function (item) {
      var chip = document.createElement("span");
      chip.className = "drag-chip";
      chip.textContent = item;
      chip.dataset.value = item;
      chip.draggable = true;
      chip.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", item);
        chip.classList.add("dragging");
      });
      chip.addEventListener("dragend", function () { chip.classList.remove("dragging"); });
      return chip;
    });
    chipsArr.forEach(function (c) { pool.appendChild(c); });
    wrap.appendChild(pool);
    pool.addEventListener("dragover", function (e) { e.preventDefault(); });
    pool.addEventListener("drop", function (e) {
      e.preventDefault();
      var val = e.dataTransfer.getData("text/plain");
      var chip = wrap.querySelector("[data-value=\"" + val + "\"]");
      if (chip) { pool.appendChild(chip); chip.style.borderColor = ""; chip.style.background = ""; }
    });
    var groupsContainer = document.createElement("div");
    groupsContainer.className = "drag-groups";
    config.groups.forEach(function (groupName) {
      var group = document.createElement("div");
      group.className = "drag-group";
      var chipsArea = document.createElement("div");
      chipsArea.className = "drag-group__chips";
      chipsArea.dataset.group = groupName;
      group.appendChild(el("div", "drag-group__label", groupName));
      group.appendChild(chipsArea);
      groupsContainer.appendChild(group);
      group.addEventListener("dragover", function (e) { e.preventDefault(); group.classList.add("drag-over"); });
      group.addEventListener("dragleave", function () { group.classList.remove("drag-over"); });
      group.addEventListener("drop", function (e) {
        e.preventDefault();
        group.classList.remove("drag-over");
        var val = e.dataTransfer.getData("text/plain");
        var chip = wrap.querySelector("[data-value=\"" + val + "\"]");
        if (chip) { chipsArea.appendChild(chip); chip.style.borderColor = ""; chip.style.background = ""; }
      });
    });
    wrap.appendChild(groupsContainer);
    validateBtn.addEventListener("click", function () {
      var allOk = true; var missing = false;
      chipsArr.forEach(function (chip) {
        var parent = chip.parentElement;
        var inGroup = parent && parent.dataset && parent.dataset.group;
        if (!inGroup) { missing = true; return; }
        var ok = config.answers[chip.dataset.value] === parent.dataset.group;
        chip.style.borderColor = ok ? "#2bff7e" : "#ff4a6a";
        chip.style.background = ok ? "rgba(43,255,126,0.1)" : "rgba(255,74,106,0.1)";
        if (!ok) allOk = false;
      });
      if (missing) { feedback.textContent = "Coloca todos los simbolos antes de validar."; feedback.className = "drag-feedback fail"; }
      else if (allOk) { feedback.textContent = "\u00a1Correcto! Todos los simbolos estan en su sistema correcto."; feedback.className = "drag-feedback ok"; }
      else { feedback.textContent = "Hay errores. Revisa los simbolos marcados en rojo."; feedback.className = "drag-feedback fail"; }
    });

  } else if (config.type === "match") {
    var pool2 = document.createElement("div");
    pool2.className = "drag-pool";
    var itemChips = config.items.map(function (item) {
      var chip = document.createElement("span");
      chip.className = "drag-chip";
      chip.textContent = item;
      chip.dataset.value = item;
      chip.draggable = true;
      chip.style.fontSize = "0.85rem";
      chip.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", item);
        chip.classList.add("dragging");
      });
      chip.addEventListener("dragend", function () { chip.classList.remove("dragging"); });
      return chip;
    });
    itemChips.forEach(function (c) { pool2.appendChild(c); });
    wrap.appendChild(pool2);
    pool2.addEventListener("dragover", function (e) { e.preventDefault(); });
    pool2.addEventListener("drop", function (e) {
      e.preventDefault();
      var val = e.dataTransfer.getData("text/plain");
      var chip = wrap.querySelector("[data-value=\"" + val + "\"]");
      if (chip) { pool2.appendChild(chip); chip.style.borderColor = ""; chip.style.background = ""; }
    });
    var matchTable = document.createElement("div");
    matchTable.className = "drag-match-table";
    var zones = {};
    config.targets.forEach(function (target) {
      var zone = document.createElement("div");
      zone.className = "drag-match-zone";
      zone.dataset.target = target;
      zones[target] = zone;
      zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("drag-over"); });
      zone.addEventListener("dragleave", function () { zone.classList.remove("drag-over"); });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("drag-over");
        var val = e.dataTransfer.getData("text/plain");
        var existing = zone.querySelector(".drag-chip");
        if (existing) pool2.appendChild(existing);
        var chip = wrap.querySelector("[data-value=\"" + val + "\"]");
        if (chip) { zone.appendChild(chip); chip.style.borderColor = ""; chip.style.background = ""; }
      });
      matchTable.appendChild(el("div", "drag-match-left", target));
      matchTable.appendChild(el("div", "drag-match-arrow", "\u2192"));
      matchTable.appendChild(zone);
    });
    wrap.appendChild(matchTable);
    validateBtn.addEventListener("click", function () {
      var allOk = true; var missing = false;
      Object.keys(zones).forEach(function (target) {
        var chip = zones[target].querySelector(".drag-chip");
        if (!chip) { missing = true; return; }
        var ok = config.answers[target] === chip.dataset.value;
        chip.style.borderColor = ok ? "#2bff7e" : "#ff4a6a";
        chip.style.background = ok ? "rgba(43,255,126,0.1)" : "rgba(255,74,106,0.1)";
        if (!ok) allOk = false;
      });
      if (missing) { feedback.textContent = "Completa todas las relaciones antes de validar."; feedback.className = "drag-feedback fail"; }
      else if (allOk) { feedback.textContent = "\u00a1Excelente! Todas las relaciones son correctas."; feedback.className = "drag-feedback ok"; }
      else { feedback.textContent = "Hay errores. Revisa las relaciones marcadas en rojo."; feedback.className = "drag-feedback fail"; }
    });

  } else if (config.type === "choice") {
    if (config.word) wrap.appendChild(el("div", "drag-choice-word", config.word));
    var selections = {};
    config.questions.forEach(function (q, qi) {
      var qWrap = document.createElement("div");
      qWrap.className = "drag-question";
      qWrap.appendChild(el("p", "drag-question__text", (qi + 1) + ". " + q.q));
      var opts = document.createElement("div");
      opts.className = "drag-options";
      q.options.forEach(function (opt) {
        var optEl = el("div", "drag-option", opt);
        optEl.dataset.value = opt;
        optEl.addEventListener("click", function () {
          opts.querySelectorAll(".drag-option").forEach(function (o) { o.classList.remove("selected", "correct", "wrong"); });
          optEl.classList.add("selected");
          selections[qi] = opt;
        });
        opts.appendChild(optEl);
      });
      qWrap.appendChild(opts);
      wrap.appendChild(qWrap);
    });
    validateBtn.addEventListener("click", function () {
      var allOk = true; var missing = false;
      var qWraps = wrap.querySelectorAll(".drag-question");
      config.questions.forEach(function (q, qi) {
        if (!selections[qi]) { missing = true; return; }
        qWraps[qi].querySelectorAll(".drag-option").forEach(function (o) {
          o.classList.remove("selected", "correct", "wrong");
          if (o.dataset.value === q.answer) o.classList.add("correct");
          else if (o.dataset.value === selections[qi]) { o.classList.add("wrong"); allOk = false; }
        });
      });
      if (missing) { feedback.textContent = "Responde todas las preguntas antes de validar."; feedback.className = "drag-feedback fail"; }
      else if (allOk) { feedback.textContent = "\u00a1Correcto! Todas las respuestas son acertadas."; feedback.className = "drag-feedback ok"; }
      else { feedback.textContent = "Hay respuestas incorrectas. La correcta esta marcada en verde."; feedback.className = "drag-feedback fail"; }
    });
  }

  wrap.appendChild(validateBtn);
  wrap.appendChild(feedback);
  return wrap;
}

function createExamExercise(config) {
  var wrap = document.createElement("div");
  wrap.className = "exam-exercise";

  wrap.appendChild(el("h5", "exam-exercise__title", config.title || "Mini examen"));
  if (config.instruction) wrap.appendChild(el("p", "exam-exercise__instruction", config.instruction));
  if (config.note) wrap.appendChild(el("p", "exam-exercise__note", config.note));

  var feedback = el("p", "drag-feedback", "");
  var validateBtn = document.createElement("button");
  validateBtn.className = "drag-validate-btn";
  validateBtn.textContent = "Calificar intento";

  var closedQuestionCount = 0;
  var autoScoreTotal = 0;
  var autoQuestionNodes = [];

  (config.banks || []).forEach(function (bank) {
    var section = document.createElement("section");
    section.className = "exam-section";
    if (bank.showTitle && bank.title) section.appendChild(el("h6", "exam-section__title", bank.title));
    if (bank.showTitle && bank.typeLabel) section.appendChild(el("p", "exam-section__meta", "Tipo: " + bank.typeLabel));

    var questions = pickRandomItems(bank.questions || [], bank.pick || ((bank.questions || []).length));
    questions.forEach(function (question) {
      closedQuestionCount++;
      autoScoreTotal++;

      var questionNode = document.createElement("div");
      questionNode.className = "exam-question";
      questionNode.appendChild(el("p", "exam-question__text", closedQuestionCount + ". " + (question.prompt || "")));

      var optionsNode = document.createElement("div");
      optionsNode.className = "drag-options";
      var questionState = {
        answer: question.answer,
        selected: "",
        optionsNode: optionsNode
      };

      shuffleExerciseArray(question.options || []).forEach(function (optionValue) {
        var optionNode = el("div", "drag-option", optionValue);
        optionNode.dataset.value = optionValue;
        optionNode.addEventListener("click", function () {
          optionsNode.querySelectorAll(".drag-option").forEach(function (item) {
            item.classList.remove("selected", "correct", "wrong");
          });
          questionState.selected = optionValue;
          optionNode.classList.add("selected");
        });
        optionsNode.appendChild(optionNode);
      });

      questionNode.appendChild(optionsNode);
      section.appendChild(questionNode);
      autoQuestionNodes.push(questionState);
    });

    wrap.appendChild(section);
  });

  var openInputs = [];
  if (Array.isArray(config.openQuestions) && config.openQuestions.length) {
    var openSection = document.createElement("section");
    openSection.className = "exam-section exam-section--open";
    if (config.showOpenTitle !== false) {
      openSection.appendChild(el("h6", "exam-section__title", config.openTitle || "Produccion"));
      openSection.appendChild(el("p", "exam-section__meta", "Tipo: respuesta abierta"));
    }

    pickRandomItems(config.openQuestions, config.openPick || config.openQuestions.length).forEach(function (question, index) {
      var openNode = document.createElement("div");
      openNode.className = "exam-open-question";
      openNode.appendChild(el("p", "exam-question__text", (closedQuestionCount + index + 1) + ". " + question.prompt));
      var textarea = document.createElement("textarea");
      textarea.className = "exam-open-textarea";
      textarea.rows = 4;
      textarea.placeholder = question.placeholder || "Escribe tu respuesta aqui...";
      openNode.appendChild(textarea);
      openInputs.push(textarea);
      openSection.appendChild(openNode);
    });

    wrap.appendChild(openSection);
  }

  validateBtn.addEventListener("click", function () {
    var score = 0;
    var missingClosed = 0;
    var completedOpen = 0;

    autoQuestionNodes.forEach(function (questionState) {
      if (!questionState.selected) {
        missingClosed++;
        return;
      }

      questionState.optionsNode.querySelectorAll(".drag-option").forEach(function (optionNode) {
        optionNode.classList.remove("selected", "correct", "wrong");
        if (optionNode.dataset.value === questionState.answer) optionNode.classList.add("correct");
        else if (optionNode.dataset.value === questionState.selected) optionNode.classList.add("wrong");
      });

      if (questionState.selected === questionState.answer) score++;
    });

    openInputs.forEach(function (input) {
      var answered = !!String(input.value || "").trim();
      input.classList.toggle("exam-open-textarea--missing", !answered);
      input.classList.toggle("exam-open-textarea--ok", answered);
      if (answered) completedOpen++;
    });

    if (missingClosed) {
      feedback.textContent = "Responde todas las preguntas cerradas antes de calificar. Puntaje actual: " + score + "/" + autoScoreTotal + ".";
      feedback.className = "drag-feedback fail";
      return;
    }

    var message = "Puntaje automatico: " + score + "/" + autoScoreTotal + ".";
    if (openInputs.length) {
      message += " Abiertas completadas: " + completedOpen + "/" + openInputs.length + ".";
      message += completedOpen === openInputs.length
        ? " Requieren revision manual."
        : " Completa todas las abiertas obligatorias.";
    }
    feedback.textContent = message;
    feedback.className = completedOpen === openInputs.length ? "drag-feedback ok" : "drag-feedback fail";
  });

  wrap.appendChild(validateBtn);
  wrap.appendChild(feedback);
  return wrap;
}

function renderLessonPage() {
  const root = document.getElementById("lesson-detail");
  if (!root) return;

  const result = getLessonByParams();
  if (!result) {
    root.innerHTML = "";
    root.appendChild(el("h2", null, "Leccion no encontrada"));
    root.appendChild(el("p", "muted", "Verifica el enlace del modulo e intenta de nuevo."));
    return;
  }

  if (result.locked) {
    root.innerHTML = "";
    root.appendChild(el("h2", null, "Curso no habilitado aun"));
    root.appendChild(el("p", "muted", "Las lecciones de este curso todavia no estan publicadas."));
    const back = document.createElement("a");
    back.className = "btn ghost";
    back.href = "catalog.html?area=" + encodeURIComponent(result.catalog.id);
    back.textContent = "Volver al catalogo";
    root.appendChild(back);
    return;
  }

  const titleNode = document.getElementById("lesson-title");
  const subtitleNode = document.getElementById("lesson-subtitle");
  const heroNode = document.getElementById("lesson-hero");
  const heroImageNode = document.getElementById("lesson-hero-image");
  const headingNode = document.getElementById("lesson-heading");
  const sourceNode = document.getElementById("lesson-source");
  const descriptionNode = document.getElementById("lesson-description");
  const contentNode = document.getElementById("lesson-content");
  const topicsNode = document.getElementById("lesson-topics");
  const backNode = document.getElementById("back-to-course");

  if (titleNode) titleNode.textContent = result.module.title;
  if (subtitleNode) subtitleNode.textContent = result.module.subtitle || (result.course.title + " • " + result.catalog.title);
  if (headingNode) headingNode.textContent = result.module.subtitle || result.module.title;
  if (sourceNode) {
    sourceNode.textContent = "";
    sourceNode.style.display = "none";
  }
  if (descriptionNode) descriptionNode.textContent = result.module.description || "";

  if (contentNode) {
    contentNode.innerHTML = "";
    const blocks = (result.module.content || "")
      .split(/\n\s*\n/)
      .map(function (block) {
        return block.trim();
      })
      .filter(Boolean);

    blocks.forEach(function (block) {
      if (block.indexOf("## ") === 0) {
        const h4 = el("h4", "lesson-subheading", block.replace(/^##\s*/, ""));
        contentNode.appendChild(h4);
        return;
      }

      const isStandaloneMath =
        /^\$\$[\s\S]*\$\$$/.test(block) ||
        /^\\\[[\s\S]*\\\]$/.test(block);

      if (isStandaloneMath) {
        const formulaWrap = el("div", "lesson-formula-block");
        formulaWrap.textContent = block;
        contentNode.appendChild(formulaWrap);
        return;
      }

      if (block.indexOf("DEF::") === 0) {
        const box = el("div", "lesson-def-box");
        const body = block.replace(/^DEF::\s*/, "");
        const p = el("p", null, body);
        box.appendChild(p);
        contentNode.appendChild(box);
        return;
      }

      if (block.indexOf("EJ::") === 0) {
        const details = document.createElement("details");
        details.className = "lesson-exercise-box";

        const summary = document.createElement("summary");
        summary.textContent = "Ejercicio propuesto";

        const body = block.replace(/^EJ::\s*/, "");
        const p = el("p", null, body);

        details.appendChild(summary);
        details.appendChild(p);
        contentNode.appendChild(details);
        return;
      }

      if (block.indexOf("EXAM::") === 0) {
        try {
          var examConfig = JSON.parse(block.replace(/^EXAM::\s*/, ""));
          contentNode.appendChild(createExamExercise(examConfig));
        } catch (examErr) {
          // Ignore malformed EXAM blocks
        }
        return;
      }

      if (block.indexOf("DRAG::") === 0) {
        try {
          var dragConfig = JSON.parse(block.replace(/^DRAG::\s*/, ""));
          contentNode.appendChild(createDragExercise(dragConfig));
        } catch (dragErr) {
          // Ignore malformed DRAG blocks
        }
        return;
      }

      if (/^(?:-\s+.+\n?)+$/.test(block)) {
        const list = el("ul", "lesson-bullets");
        block.split("\n").forEach(function (line) {
          const itemText = line.replace(/^-\s+/, "").trim();
          if (!itemText) return;
          list.appendChild(el("li", null, itemText));
        });
        contentNode.appendChild(list);
        return;
      }

      const p = el("p", null, block);
      contentNode.appendChild(p);
    });

    if (result.module.id === "sobre-el-curso") {
      const outlineTitle = el("h4", "lesson-subheading", "Contenido del curso");
      const outline = el("ul", "lesson-outline");

      (result.course.modules || [])
        .filter(function (moduleItem) {
          return moduleItem.id && moduleItem.id.indexOf("clase-") === 0;
        })
        .forEach(function (moduleItem) {
          const label = moduleItem.subtitle
            ? moduleItem.title + ": " + moduleItem.subtitle
            : moduleItem.title;
          outline.appendChild(el("li", null, label));
        });

      contentNode.appendChild(outlineTitle);
      contentNode.appendChild(outline);
    }
  }

  if (backNode) {
    backNode.href =
      "course.html?area=" +
      encodeURIComponent(result.catalog.id) +
      "&course=" +
      encodeURIComponent(result.course.id);
  }

  if (heroNode) {
    const lessonImage = result.module.image || result.course.image || result.catalog.image;
    const lessonImagePath = imagePath(lessonImage);
    heroNode.style.backgroundImage =
      "linear-gradient(180deg, rgba(6,8,12,0.15), rgba(6,8,12,0.8)), url('" +
      lessonImagePath +
      "')";

    if (heroImageNode) {
      heroImageNode.src = lessonImagePath;
      heroImageNode.alt = result.module.title || "Imagen de la clase";
    }
  }

  if (topicsNode) {
    topicsNode.innerHTML = "";
    if (result.module.content) {
      topicsNode.style.display = "none";
    } else {
      topicsNode.style.display = "";
      (result.module.topics || []).forEach(function (topic) {
        const li = el("li");
        li.innerHTML = topic;
        topicsNode.appendChild(li);
      });
    }
  }

  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    window.MathJax.typesetPromise([root]).catch(function () {
      // Ignore rendering failures to avoid breaking lesson navigation.
    });
  }
}

function initBgDots() {
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
  document.body.insertBefore(canvas, document.body.firstChild);

  var W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var ctx = canvas.getContext('2d');

  // Puntos estáticos de fondo (no se mueven)
  var staticDots = [];
  for (var i = 0; i < 80; i++) {
    staticDots.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.45 + 0.15,
      blue: Math.random() > 0.5
    });
  }

  // Estrellas fugaces
  function makeStar() {
    var angle = (Math.random() * 30 + 15) * Math.PI / 180; // 15-45°
    var speed = Math.random() * 0.8 + 0.4;
    return {
      x: Math.random() * 1.3 - 0.15,
      y: Math.random() * 0.6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: Math.random() * 120 + 60,
      a: Math.random() * 0.55 + 0.3,
      r: Math.random() * 1.0 + 0.4,
      blue: Math.random() > 0.5,
      life: 1.0
    };
  }

  var stars = [];
  for (var j = 0; j < 5; j++) {
    var s = makeStar();
    s.x = Math.random(); s.y = Math.random(); // esparcidas inicialmente
    stars.push(s);
  }

  var lastTime = 0;
  function frame(ts) {
    var dt = Math.min((ts - lastTime) / 16.67, 3);
    lastTime = ts;

    ctx.clearRect(0, 0, W, H);

    // Dibujar puntos estáticos
    for (var i = 0; i < staticDots.length; i++) {
      var d = staticDots[i];
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.blue
        ? 'rgba(43,139,255,' + d.a + ')'
        : 'rgba(255,35,77,' + d.a + ')';
      ctx.fill();
    }

    // Dibujar y mover estrellas fugaces
    for (var k = stars.length - 1; k >= 0; k--) {
      var st = stars[k];
      st.x += st.vx * dt / W * 100;
      st.y += st.vy * dt / H * 100;
      st.life -= 0.0015 * dt;

      var px = st.x * W, py = st.y * H;
      var tailX = px - st.vx * st.len / W * 100 * W / 100;
      var tailY = py - st.vy * st.len / H * 100 * H / 100;
      var alpha = st.a * Math.max(0, st.life);
      var color = st.blue ? '43,139,255' : '255,35,77';

      var grad = ctx.createLinearGradient(tailX, tailY, px, py);
      grad.addColorStop(0, 'rgba(' + color + ',0)');
      grad.addColorStop(1, 'rgba(' + color + ',' + alpha + ')');
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(px, py);
      ctx.strokeStyle = grad;
      ctx.lineWidth = st.r * 2;
      ctx.stroke();

      // Punto brillante en la cabeza
      ctx.beginPath();
      ctx.arc(px, py, st.r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + alpha + ')';
      ctx.fill();

      if (st.life <= 0 || st.x > 1.2 || st.y > 1.2) {
        stars[k] = makeStar();
      }
    }

    // Mantener entre 4 y 6 estrellas vivas
    while (stars.length < 4) stars.push(makeStar());
    if (stars.length > 6) stars.splice(0, 1);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderCarousel() {
  var container = document.getElementById("featured-carousel");
  if (!container) return;

  var projects = (DATA.projects || []).filter(function(p) {
    return p.category !== "Social" && p.category !== "Investigacion";
  });
  if (!projects.length) { container.style.display = "none"; return; }

  var trackWrap = el("div", "carousel-track-wrap");
  var track = el("div", "carousel-track");

  projects.forEach(function(project) {
    var slide = el("div", "carousel-slide");

    var bg = el("div", "carousel-slide-bg");
    if (project.image) {
      bg.style.backgroundImage = "url(" + project.image + ")";
    } else {
      bg.style.background = "radial-gradient(circle at 18% 55%, rgba(43,139,255,0.18), transparent 52%), radial-gradient(circle at 82% 28%, rgba(255,35,77,0.14), transparent 48%)";
    }

    var overlay = el("div", "carousel-slide-overlay");
    var content = el("div", "carousel-slide-content");

    var tag = el("span", "carousel-tag", project.category || "Proyecto");
    var title = el("h2", "carousel-title", project.title);
    var desc = el("p", "carousel-desc", project.desc);
    var actions = el("div", "carousel-actions");

    if (project.demo && project.demo !== "#") {
      var demoBtn = el("a", "btn");
      demoBtn.href = project.demo;
      demoBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:5px"><path d="M8 5v14l11-7z"/></svg>Demo';
      actions.appendChild(demoBtn);
    }
    if (project.repo) {
      var repoBtn = el("a", "btn ghost");
      repoBtn.href = project.repo;
      repoBtn.target = "_blank";
      repoBtn.rel = "noopener";
      repoBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:5px"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 5.1 18 5.4 18 5.4c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>GitHub';
      actions.appendChild(repoBtn);
    }

    content.appendChild(tag);
    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(actions);
    overlay.appendChild(content);
    slide.appendChild(bg);
    slide.appendChild(overlay);
    track.appendChild(slide);
  });

  var prevBtn = el("button", "carousel-btn carousel-prev");
  prevBtn.setAttribute("aria-label", "Anterior");
  prevBtn.innerHTML = "&#8249;";

  var nextBtn = el("button", "carousel-btn carousel-next");
  nextBtn.setAttribute("aria-label", "Siguiente");
  nextBtn.innerHTML = "&#8250;";

  trackWrap.appendChild(track);
  trackWrap.appendChild(prevBtn);
  trackWrap.appendChild(nextBtn);
  container.appendChild(trackWrap);

  var dotsWrap = el("div", "carousel-dots");
  container.appendChild(dotsWrap);

  var current = 0;
  var timer;

  function goTo(index) {
    current = ((index % projects.length) + projects.length) % projects.length;
    track.style.transform = "translateX(-" + (current * 100) + "%)";
    Array.from(dotsWrap.children).forEach(function(dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(function() { goTo(current + 1); }, 5000);
  }

  projects.forEach(function(_, i) {
    var dot = el("button", "carousel-dot");
    if (i === 0) dot.classList.add("active");
    dot.setAttribute("aria-label", "Slide " + (i + 1));
    dot.addEventListener("click", function() { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });

  if (projects.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    dotsWrap.style.display = "none";
  }

  prevBtn.addEventListener("click", function() { goTo(current - 1); resetTimer(); });
  nextBtn.addEventListener("click", function() { goTo(current + 1); resetTimer(); });

  goTo(0);
  resetTimer();
}

function renderProjects() {
  const container = document.getElementById("projects-list");
  if (!container) return;
  container.innerHTML = "";
  container.className = "projects-grid";

  if (!Array.isArray(DATA.projects) || !DATA.projects.length) {
    container.appendChild(el("p", "muted", "No hay proyectos disponibles."));
    appendLoadWarning(container);
    return;
  }

  const techIcons = {
    "Python":     { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",     label: "Python" },
    "JavaScript": { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", label: "JavaScript" },
    "HTML":       { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",       label: "HTML5" },
    "CSS":        { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",         label: "CSS3" },
    "MongoDB":    { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",   label: "MongoDB" },
    "React":      { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",       label: "React" },
    "Node.js":    { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",     label: "Node.js" },
    "Flask":      { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",       label: "Flask" },
    "TypeScript": { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", label: "TypeScript" }
  };

  DATA.projects.forEach(function (project, i) {
    const card = el("article", "project-card reveal-card");
    card.style.animationDelay = i * 100 + "ms";

    // Image area
    const imgWrap = el("div", "project-img-wrap");
    if (project.image) {
      const img = document.createElement("img");
      img.src = project.image;
      img.alt = project.title;
      img.className = "project-img";
      imgWrap.appendChild(img);
    } else {
      imgWrap.classList.add("project-img-placeholder");
      imgWrap.textContent = project.title.slice(0, 1);
    }
    card.appendChild(imgWrap);

    // Body
    const body = el("div", "project-body");

    const title = el("h3", "project-title", project.title);
    body.appendChild(title);

    const desc = el("p", "project-desc card-copy", project.desc);
    body.appendChild(desc);

    // Tech logos
    if (Array.isArray(project.tech) && project.tech.length) {
      const techRow = el("div", "project-tech");
      project.tech.forEach(function (t) {
        const info = techIcons[t];
        const chip = el("span", "tech-chip");
        if (info) {
          const img = document.createElement("img");
          img.src = info.icon;
          img.alt = info.label;
          img.className = "tech-icon";
          chip.appendChild(img);
        }
        chip.appendChild(document.createTextNode(t));
        techRow.appendChild(chip);
      });
      body.appendChild(techRow);
    }

    // Action buttons
    const actions = el("div", "project-actions");

    if (project.repo) {
      const repoBtn = el("a", "btn ghost project-btn");
      repoBtn.href = project.repo;
      repoBtn.target = "_blank";
      repoBtn.rel = "noopener";
      repoBtn.setAttribute("aria-label", "Repositorio");
      repoBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> Repositorio';
      actions.appendChild(repoBtn);
    }

    if (project.demo && project.demo !== "#") {
      const demoBtn = el("a", "btn project-btn");
      demoBtn.href = project.demo;
      demoBtn.setAttribute("aria-label", "Demo");
      demoBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Demo';
      actions.appendChild(demoBtn);
    }

    body.appendChild(actions);
    card.appendChild(body);
    container.appendChild(card);
  });

  appendLoadWarning(container);
}

function openModal(type, item) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");
  if (!modal || !body) return;

  body.innerHTML = "";
  body.appendChild(el("h3", null, item.title));

  if (type === "course") {
    const list = el("ul", "modal-list");
    (item.courses || []).forEach(function (courseName) {
      list.appendChild(el("li", null, courseName));
    });
    body.appendChild(list);
  } else {
    body.appendChild(el("p", null, item.desc || ""));
    body.appendChild(el("p", null, "Clasificacion: " + (item.category || "General")));
    body.appendChild(el("p", null, "Tecnologias: " + (item.tech || []).join(", ")));
    const link = document.createElement("a");
    link.href = item.link || "#";
    link.className = "btn";
    link.textContent = "Abrir proyecto";
    body.appendChild(link);
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function initMenu() {
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

function markActiveNav() {
  const links = document.querySelectorAll(".nav-links a");
  if (!links.length) return;

  const current = location.pathname.split("/").pop() || "index.html";
  links.forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const feedback = document.getElementById("contact-feedback");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      if (feedback) {
        feedback.textContent = "Por favor completa todos los campos.";
        feedback.classList.remove("hidden");
      }
      return;
    }

    const subject = encodeURIComponent("Contacto desde portafolio - " + name);
    const body = encodeURIComponent(message + "\n\nCorreo: " + email);
    window.location.href = "mailto:miguerraga10@gmail.com?subject=" + subject + "&body=" + body;

    if (feedback) {
      feedback.textContent = "Se abrio tu cliente de correo.";
      feedback.classList.remove("hidden");
    }
  });

  const resetBtn = document.getElementById("contact-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      if (feedback) feedback.classList.add("hidden");
    });
  }
}

function initModalClose() {
  const closeBtn = document.getElementById("modal-close");
  const modal = document.getElementById("modal");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target.id === "modal") closeModal();
    });
  }
}

function initLanguageInteractions() {
  const langItems = document.querySelectorAll(".lang-item[data-lang]");
  if (!langItems.length) return;

  const sectionTitleEl = document.getElementById("lang-section-title");
  const sharedWordOutput = document.getElementById("lang-word-display");

  const languageData = {
    es: {
      label: "Español",
      nativeName: "Castellano",
      sectionTitle: "Idiomas y niveles",
      words: ["Hola", "Gracias", "Constancia", "Aprender", "Disciplina"],
      skills: [
        { name: "Lectura", score: 96, level: "C2" },
        { name: "Escucha", score: 95, level: "C2" },
        { name: "Escritura", score: 94, level: "C2" },
        { name: "Habla", score: 97, level: "C2" }
      ]
    },
    en: {
      label: "Inglés",
      nativeName: "English",
      sectionTitle: "Languages & Levels",
      words: ["Hello", "Learning", "Focus", "Consistency", "Growth"],
      skills: [
        { name: "Lectura", score: 72, level: "C2" },
        { name: "Escucha", score: 43, level: "B1" },
        { name: "Escritura", score: 43, level: "B1" },
        { name: "Habla", score: 36, level: "A2" }
      ]
    },
    jp: {
      label: "Japonés",
      nativeName: "日本語",
      sectionTitle: "言語とレベル",
      words: ["こんにちは", "ありがとう", "まなぶ", "かいぜん", "がんばる"],
      skills: [
        { name: "Lectura", score: 54, level: "B1" },
        { name: "Escucha", score: 52, level: "B1" },
        { name: "Escritura", score: 44, level: "A2" },
        { name: "Habla", score: 42, level: "A2" }
      ]
    },
    pt: {
      label: "Portugués",
      nativeName: "Português",
      sectionTitle: "Idiomas e níveis",
      words: ["Ola", "Aprender", "Foco", "Disciplina", "Crescimento"],
      skills: [
        { name: "Lectura", score: 47, level: "A2" },
        { name: "Escucha", score: 46, level: "A2" },
        { name: "Escritura", score: 39, level: "A2" },
        { name: "Habla", score: 42, level: "A2" }
      ]
    },
    it: {
      label: "Italiano",
      nativeName: "Italiano",
      sectionTitle: "Lingue e livelli",
      words: ["Ciao", "Studio", "Costanza", "Disciplina", "Crescita"],
      skills: [
        { name: "Lectura", score: 34, level: "A1" },
        { name: "Escucha", score: 10, level: "A1" },
        { name: "Escritura", score: 28, level: "A1" },
        { name: "Habla", score: 30, level: "A1" }
      ]
    }
  };

  function getScoreColor(score) {
    const normalized = Math.max(0, Math.min(100, Number(score) || 0));

    const red = { r: 255, g: 35, b: 77 };   // #ff234d (logo red)
    const yellow = { r: 245, g: 195, b: 46 }; // yellow at 35
    const green = { r: 34, g: 170, b: 88 }; // green at 65
    const blue = { r: 18, g: 88, b: 184 };  // darker blue

    let r;
    let g;
    let b;

    if (normalized <= 35) {
      const t = normalized / 35;
      r = Math.round(red.r + (yellow.r - red.r) * t);
      g = Math.round(red.g + (yellow.g - red.g) * t);
      b = Math.round(red.b + (yellow.b - red.b) * t);
    } else if (normalized <= 65) {
      const t = (normalized - 35) / 30;
      r = Math.round(yellow.r + (green.r - yellow.r) * t);
      g = Math.round(yellow.g + (green.g - yellow.g) * t);
      b = Math.round(yellow.b + (green.b - yellow.b) * t);
    } else {
      const t = (normalized - 65) / 35;
      r = Math.round(green.r + (blue.r - green.r) * t);
      g = Math.round(green.g + (blue.g - green.g) * t);
      b = Math.round(green.b + (blue.b - green.b) * t);
    }

    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  function buildStatsCards(skills) {
    return skills.map(function (skill) {
      const ringColor = getScoreColor(skill.score);
      return "<div class='lang-skill-card'>" +
        "<div class='lang-skill-cefr'>" + skill.level + "</div>" +
        "<div class='score-ring' style='--score:" + skill.score + ";--ring-color:" + ringColor + "'><span>" + skill.score + "</span></div>" +
        "<div class='lang-skill-name'>" + skill.name + "</div>" +
        "</div>";
    }).join("");
  }

  let typewriterTimer = null;

  function typewriterEffect(el, text) {
    if (typewriterTimer) clearTimeout(typewriterTimer);
    el.textContent = "";
    el.classList.add("visible");
    let i = 0;
    const delay = Math.max(40, Math.min(90, Math.round(500 / text.length)));
    function typeNext() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        typewriterTimer = setTimeout(typeNext, delay);
      }
    }
    typeNext();
  }

  langItems.forEach(function (item) {
    const langCode = item.getAttribute("data-lang");
    const langInfo = languageData[langCode];
    if (!langInfo) return;

    const flag = item.querySelector(".lang-flag");
    if (!flag) return;

    flag.setAttribute("role", "button");
    flag.setAttribute("tabindex", "0");
    flag.setAttribute("aria-label", "Generar palabra en " + langInfo.label);

    const nameEl = item.querySelector(".lang-name");
    let clickCount = 0;
    let titleFlipped = false;

    const statsPanel = document.createElement("div");
    statsPanel.className = "lang-stats-panel";
    statsPanel.innerHTML =
      "<div class='lang-stats-title'>Habilidades de idioma</div>" +
      "<div class='lang-stats-grid' aria-label='Estadisticas de " + langInfo.label + "'>" +
      buildStatsCards(langInfo.skills) +
      "</div>";

    item.appendChild(statsPanel);

    function animateScoreRings() {
      const rings = statsPanel.querySelectorAll(".score-ring");
      if (!rings.length) return;

      rings.forEach(function (ring) {
        const target = Math.max(0, Math.min(100, Number(ring.style.getPropertyValue("--score")) || 0));
        const duration = 720;
        const startTime = performance.now();

        ring.style.setProperty("--progress", "0");

        function frame(now) {
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = target * eased;
          ring.style.setProperty("--progress", current.toFixed(2));
          if (t < 1) requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
      });
    }

    function resetScoreRings() {
      const rings = statsPanel.querySelectorAll(".score-ring");
      rings.forEach(function (ring) {
        ring.style.setProperty("--progress", "0");
      });
    }

    item.addEventListener("mouseenter", animateScoreRings);
    item.addEventListener("focusin", animateScoreRings);
    item.addEventListener("mouseleave", resetScoreRings);
    item.addEventListener("focusout", function (event) {
      if (!item.contains(event.relatedTarget)) resetScoreRings();
    });

    function flipLangTitle() {
      if (!nameEl || titleFlipped) return;
      titleFlipped = true;
      nameEl.classList.add("lang-name-flip");
      setTimeout(function () {
        nameEl.textContent = langInfo.nativeName;
        nameEl.classList.remove("lang-name-flip");
      }, 160);
    }

    function showRandomWord() {
      const words = langInfo.words;
      if (!Array.isArray(words) || !words.length) return;
      const index = Math.floor(Math.random() * words.length);
      if (sharedWordOutput) {
        typewriterEffect(sharedWordOutput, words[index]);
      }
      clickCount++;
      if (clickCount % 5 === 0) flipLangTitle();
      if (clickCount === 20 && sectionTitleEl) {
        sectionTitleEl.classList.add("lang-name-flip");
        setTimeout(function () {
          sectionTitleEl.textContent = langInfo.sectionTitle;
          sectionTitleEl.classList.remove("lang-name-flip");
        }, 160);
      }
    }

    flag.addEventListener("click", showRandomWord);
    flag.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showRandomWord();
      }
    });
  });
}

document.querySelectorAll(".brand-logo").forEach(function (img) {
  img.addEventListener("error", function () {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = "assets/M10.png";
    }
  });
});

initBgDots();
renderCourseCatalogs();
renderCarousel();
renderProjects();
renderCatalogCoursesPage();
renderCoursePage();
renderLessonPage();
initMenu();
markActiveNav();
initContactForm();
initModalClose();
initLanguageInteractions();

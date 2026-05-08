/* data.js - fuente general de informacion del portafolio */
function createDefaultModules() {
  return [
    {
      id: "contenido",
      title: "Sobre el Curso",
      subtitle: "Resumen general, objetivos y ruta del curso.",
      description: "Vista general del curso y lo que aprenderas en cada bloque.",
      topics: ["Objetivos", "Metodologia", "Recursos base"]
    },
    {
      id: "clase-1",
      title: "Clase #1",
      subtitle: "Introduccion y fundamentos clave del tema.",
      description: "Primer acercamiento practico a los conceptos esenciales.",
      topics: ["Conceptos base", "Ejemplo guiado", "Actividad inicial"]
    },
    {
      id: "clase-2",
      title: "Clase #2",
      subtitle: "Desarrollo guiado con ejercicios practicos.",
      description: "Profundizacion con ejercicios de complejidad intermedia.",
      topics: ["Practica aplicada", "Correccion", "Refuerzo"]
    },
    {
      id: "clase-3",
      title: "Clase #3",
      subtitle: "Aplicacion, cierre y actividad integradora.",
      description: "Sesion de consolidacion para unir todo lo visto.",
      topics: ["Caso integrador", "Retroalimentacion", "Preparacion final"]
    },
    {
      id: "examen-final",
      title: "Examen final",
      subtitle: "Evaluacion final de conocimientos del curso.",
      description: "Evaluacion completa para medir competencias alcanzadas.",
      topics: ["Criterios", "Tiempo", "Entrega y resultados"]
    }
  ];
}

function withModules(course) {
  return Object.assign({}, course, { modules: createDefaultModules() });
}

function createClassModules(classItems) {
  var classCounter = 0;
  return classItems.map(function (item, index) {
    var isExam = /examen/i.test(String(item.moduleTitle || "")) || /examen/i.test(String(item.title || "")) || /examen/i.test(String(item.id || ""));
    if (!isExam) classCounter += 1;
    const moduleNumber = classCounter;
    return {
      id: item.id || ("clase-" + moduleNumber),
      title: item.moduleTitle || ("Clase #" + moduleNumber),
      subtitle: item.title,
      description: item.description,
      content: item.content,
      topics: item.topics,
      sourceFile: item.sourceFile
    };
  });
}

function safeCreateModules(factoryFn) {
  try {
    return factoryFn();
  } catch (error) {
    // Fallback defensivo para no bloquear todo el sitio por un curso puntual.
    if (typeof console !== "undefined" && console.error) {
      console.error("Fallo al construir modulos del curso:", error);
    }
    return createDefaultModules();
  }
}

function createCalculoMultivariableModules() {
  const classModules = createClassModules([
    {
      title: "Funciones de varias variables",
      description: "Estudio formal de funciones escalares de dos y tres variables, con enfasis en dominio, rango y representacion geometrica. Se trabaja como modelar fenomenos reales (temperatura, volumen) y como determinar el dominio cuando hay raices, logaritmos o denominadores.",
      content:
        "## Funciones de varias variables\n\nEn la vida diaria aparecen fenomenos que dependen de varias cantidades al mismo tiempo. Por ejemplo, la temperatura de un punto en la Tierra puede depender de la latitud y la longitud, y entonces se modela como \\(T=f(x,y)\\). Si ademas depende de la hora del dia, se modela como \\(T=f(x,y,t)\\), que ya es una funcion de tres variables.\n\n## Definicion formal\n\nDEF:: Una funcion escalar de dos variables es una regla que asigna a cada punto \\((x,y)\\) de un conjunto \\(D\\subseteq\\mathbb{R}^2\\) un unico numero real \\(f(x,y)\\). El dominio es \\(D=\\mathrm{Dom}(f)\\) y el rango es \\(R=\\{f(x,y):(x,y)\\in D\\}\\subseteq\\mathbb{R}\\). Se escribe \\(f:D\\subseteq\\mathbb{R}^2\\to\\mathbb{R},\\ (x,y)\\mapsto z=f(x,y)\\). De forma analoga, para tres variables: \\(f:D\\subseteq\\mathbb{R}^3\\to\\mathbb{R},\\ (x,y,z)\\mapsto w=f(x,y,z)\\).\n\n## Ejemplo de modelacion\n\nEl volumen de un cono depende del radio \\(r\\) y la altura \\(h\\), por lo que es una funcion de dos variables: \\(V(r,h)=\\frac{\\pi r^2h}{3}\\). Su dominio natural es \\((0,\\infty)\\times(0,\\infty)\\), porque tanto el radio como la altura deben ser positivos.\n\n## Dominio con restricciones algebraicas\n\nPara \\(f(x,y)=\\frac{x-1}{\\sqrt{x^2+y^2-1}}\\), la raiz en el denominador obliga a exigir \\(x^2+y^2-1>0\\), equivalente a \\(x^2+y^2>1\\). Geometricamente, el dominio es el exterior del disco de centro \\((0,0)\\) y radio \\(1\\), sin incluir el borde.\n\nPara \\(g(x,y)=\\sqrt{xy}\\,\\log(y-x^2)\\), se deben cumplir ambas condiciones: \\(xy\\ge 0\\) (para la raiz) y \\(y-x^2>0\\), es decir \\(y>x^2\\) (para el logaritmo). La interseccion da \\(\\mathrm{Dom}(g)=\\{(x,y)\\in\\mathbb{R}^2: y>x^2\\ \\land\\ x\\ge 0\\}\\).\n\nEJ:: Halle el dominio y el rango de la funcion \\(f(x,y)=\\frac{x^2+5y^2}{x^2+y^2}\\).\n\n## Graficas de funciones de dos variables\n\nDEF:: La grafica de una funcion \\(f\\) de dos variables con dominio \\(D\\) es el conjunto \\(S=\\{(x,y,z):(x,y)\\in D,\\ z=f(x,y)\\}\\subseteq\\mathbb{R}^3\\). Es una superficie con ecuacion \\(z=f(x,y)\\).\n\nSe estudian casos base como \\(z=c\\), \\(x=h\\), \\(y=k\\), y planos de la forma \\(ax+by+cz=d\\). Por ejemplo, \\(f(x,y)=4-x-2y\\) corresponde al plano \\(x+2y+z=4\\). Cuando una variable no aparece, queda libre, y la curva en un plano se extiende para formar un cilindro; por ejemplo, \\(z=2x^2\\) produce un cilindro parabolico.\n\nEJ:: Ubique en \\(\\mathbb{R}^3\\) el punto \\((1,2,3)\\), y dibuje los casos particulares \\(x=2\\), \\(y=4\\), \\(z=-2\\).",
      topics: [
        "Funciones de varias variables",
        "Dominio",
        "Rango",
        "Graficas de superficies",
        "Modelacion",
        "Trazas"
      ],
      sourceFile: "Clase 01. Funciones de varias variables.pdf"
    },
    {
      title: "Superficies cuadraticas. Curvas y superficies de nivel",
      description: "Clasificacion de superficies cuadraticas usando trazas en planos coordenados y niveles horizontales. Se conecta la geometria de paraboloides, conos, hiperboloides y cilindros con curvas de nivel para interpretar mapas de contorno.",
      content:
        "## Superficies cuadraticas\n\nUna superficie cuadratica (o cuadrica) es la grafica de una ecuacion de segundo grado en \\(x,y,z\\). En esta clase se distinguen dos formas base: las de tipo \\(Ax^2+By^2+Cz^2=D\\), que en general no se escriben como funcion \\(z=f(x,y)\\), y las de tipo \\(Ax^2+By^2+Ez=F\\), que si pueden verse como funcion de dos variables.\n\n$$Ax^2+By^2+Cz^2=D$$\n\n$$Ax^2+By^2+Ez=F$$\n\nSe retoman ejemplos ya vistos como \\(z=2x^2\\) y \\(x^2+y^2=1\\), y se enfatiza que la herramienta principal para bosquejar superficies es estudiar sus trazas: intersecciones con planos \\(x=c\\), \\(y=c\\), \\(z=c\\).\n\n## Metodo de trazas: ejemplo \\(z=x^2+y^2\\)\n\nPara visualizar \\(z=f(x,y)=x^2+y^2\\), se analizan tres familias de cortes. Con \\(z=c\\), se obtiene \\(x^2+y^2=c\\): si \\(c<0\\), no hay puntos; si \\(c=0\\), solo aparece el origen; y si \\(c>0\\), aparecen circulos de radio \\(\\sqrt{c}\\) en altura \\(z=c\\).\n\nCon \\(x=c\\), resulta \\(z=c^2+y^2\\), una parabola abierta hacia arriba en el plano \\(x=c\\). Con \\(y=c\\), resulta \\(z=x^2+c^2\\), tambien parabola abierta hacia arriba en el plano \\(y=c\\). La combinacion de estas trazas describe un paraboloide circular.\n\nEJ:: Bosqueje las trazas de \\(z=x^2+y^2\\) para \\(z=0\\), \\(z=1\\), \\(z=2\\), y use esas curvas para dibujar la superficie completa.\n\n## Cuadricas mas usadas\n\nDEF:: Entre las superficies cuadraticas mas frecuentes aparecen: cilindro circular \\((y-h)^2+(z-k)^2=r^2\\), esfera \\((x-h)^2+(y-k)^2+(z-l)^2=r^2\\), elipsoide \\(\\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}+\\frac{(z-l)^2}{c^2}=1\\), paraboloide eliptico \\(\\frac{z-l}{c}=\\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}\\), cono \\(\\frac{(z-l)^2}{c^2}=\\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}\\), paraboloide hiperbolico \\(\\frac{z-l}{c}=\\frac{(x-h)^2}{a^2}-\\frac{(y-k)^2}{b^2}\\), hiperboloide de una hoja \\(\\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}-\\frac{(z-l)^2}{c^2}=1\\) e hiperboloide de dos hojas \\(-\\frac{(x-h)^2}{a^2}-\\frac{(y-k)^2}{b^2}+\\frac{(z-l)^2}{c^2}=1\\).\n\n## Curvas de nivel\n\nLas curvas de nivel permiten representar una superficie por contornos en el plano, igual que en cartografia. Para una funcion \\(f:D\\subseteq\\mathbb{R}^2\\to\\mathbb{R}\\) y un valor \\(k\\), la curva de nivel se define como:\n\nDEF:: \\(L_k=\\{(x,y)\\in D: f(x,y)=k\\}\\). Son subconjuntos de \\(\\mathbb{R}^2\\) y pueden verse como la proyeccion en el plano \\(xy\\) de las trazas horizontales de la superficie.\n\nEn el cono \\(z=\\sqrt{x^2+y^2}\\), las curvas de nivel cumplen \\(\\sqrt{x^2+y^2}=k\\), es decir \\(x^2+y^2=k^2\\) para \\(k\\ge 0\\). Por tanto, para \\(k>0\\) se obtienen circulos de radio \\(k\\), y para \\(k=0\\) solo el origen.\n\nEJ:: A partir de un mapa de curvas de nivel, identifique si la superficie corresponde a un cono, paraboloide o punto de silla, justificando por la forma de las curvas.\n\n## Funciones escalares de tres variables y superficies de nivel\n\nPara funciones de tres variables se usa \\(f:D\\subseteq\\mathbb{R}^3\\to\\mathbb{R}\\), \\((x,y,z)\\mapsto w=f(x,y,z)\\). Por ejemplo, \\(f(x,y,z)=\\log(x^2+y^2-z)\\) exige \\(x^2+y^2-z>0\\), equivalente a \\(z<x^2+y^2\\), por lo que su dominio es la region por debajo de un paraboloide circular.\n\nComo la grafica completa de \\(f(x,y,z)\\) viviria en \\(\\mathbb{R}^4\\), se estudia mediante superficies de nivel \\(f(x,y,z)=k\\).\n\nDEF:: La superficie de nivel de valor \\(k\\) de \\(f\\) es \\(S_k=\\{(x,y,z)\\in D: f(x,y,z)=k\\}\\).\n\nPara \\(f(x,y,z)=x^2+y^2-z^2\\), si \\(k=0\\) aparece un cono circular; si \\(k<0\\), un hiperboloide de dos hojas; y si \\(k>0\\), un hiperboloide de una hoja. Esta familia muestra como el parametro \\(k\\) transforma gradualmente la geometria de la superficie.",
      topics: [
        "Superficies cuadraticas",
        "Clasificacion de cuadricas",
        "Metodo de trazas",
        "Curvas de nivel",
        "Superficies de nivel",
        "Visualizacion geometrica"
      ],
      sourceFile: "Clase 02. Superficies cuadráticas. Curvas y superficies de nivel.pdf"
    },
    {
      title: "Limites y continuidad",
      description: "Analisis de existencia de limites en dos variables usando trayectorias y teorema de estriccion. Se estudia por que en varias variables no basta evaluar por una sola direccion y como decidir continuidad en puntos criticos.",
      content:
        "## Limites de funciones de varias variables\n\nConsidere las funciones \\(f(x,y)=\\frac{\\sin(x^2+y^2)}{x^2+y^2}\\) y \\(g(x,y)=\\frac{xy}{x^2+y^2}\\), ambas con dominio \\(\\mathbb{R}^2\\setminus\\{(0,0)\\}\\). Al estudiar \\((x,y)\\to(0,0)\\), en la primera se puede usar \\(r=x^2+y^2\\), de modo que \\(r\\to0\\) y \\(\\frac{\\sin r}{r}\\to1\\). En cambio, la segunda depende de la trayectoria: por \\(y=0\\) da \\(0\\), y por \\(y=x\\) da \\(\\tfrac12\\). Por eso su limite no existe.\n\n## Definicion de limite\n\nDEF:: Decimos que \\(\\lim_{(x,y)\\to(a,b)}f(x,y)=L\\) si \\(|f(x,y)-L|\\to0\\) cuando \\(\\|(x,y)-(a,b)\\|\\to0\\). Informalmente, \\(f(x,y)\\) esta cerca de \\(L\\) cuando \\((x,y)\\) esta cerca de \\((a,b)\\), sin exigir que \\(f(a,b)\\) exista o coincida con \\(L\\).\n\nPara calcular limites, importan los valores cerca del punto, no necesariamente en el punto. En varias variables hay infinitas trayectorias de aproximacion; por eso coincidir en dos trayectorias no garantiza existencia, pero diferir en dos trayectorias si garantiza que no existe.\n\n## Teorema de estriccion\n\nDEF:: Si \\(g(x,y)\\le f(x,y)\\le h(x,y)\\) y \\(\\lim g=\\lim h=L\\), entonces \\(\\lim f=L\\). En forma equivalente: si \\(0\\le |f(x,y)-L|\\le h(x,y)\\) y \\(\\lim h=0\\), entonces \\(\\lim f=L\\).\n\nEste teorema es clave cuando el metodo de trayectorias sugiere un valor, pero aun no alcanza para demostrar existencia.\n\n## Ejemplos de calculo\n\nEn \\(\\lim_{(x,y)\\to(0,0)}\\frac{xy}{x^2+y^2+2}\\), el denominador no se anula y se evalua por sustitucion: el limite es \\(0\\).\n\nEn \\(\\lim_{(x,y)\\to(0,0)}\\frac{x^2y}{x^2+y^2}\\), varias trayectorias dan \\(0\\), pero eso no basta. Se aplica estriccion:\n\n$$0\\le\\left|\\frac{x^2y}{x^2+y^2}\\right|=\\frac{x^2}{x^2+y^2}|y|\\le |y|,\\quad \\lim_{(x,y)\\to(0,0)}|y|=0,$$\n\npor lo tanto el limite existe y vale \\(0\\).\n\nEn \\(\\lim_{(x,y)\\to(0,0)}\\frac{x^2y^{1/3}}{\\sqrt{x^6+y^2}}\\), elegir \\(y=x^3\\) produce una expresion que no converge, de modo que el limite no existe. Este ejemplo muestra que elegir bien la trayectoria es decisivo.\n\nEn \\(\\lim_{(x,y)\\to(0,0)}\\frac{xy}{\\sqrt{x^2+y^2}}\\), se usa \\(|x|\\le\\sqrt{x^2+y^2}\\) y queda\n\n$$0\\le\\left|\\frac{xy}{\\sqrt{x^2+y^2}}\\right|\\le |y|\\to0,$$\n\nasi que el limite es \\(0\\). De forma similar se demuestra\n\n$$\\lim_{(x,y)\\to(0,0)}\\frac{x^2y^3}{x^4+y^4}=0.$$\n\nEJ:: Verifique con estriccion que \\(\\lim_{(x,y)\\to(0,0)}\\frac{x^2y^3}{x^4+y^4}=0\\), y compare con lo que sugieren las trayectorias \\(y=mx\\) y \\(y=x^2\\).\n\n## Continuidad\n\nDEF:: Una funcion \\(f\\) de dos variables es continua en \\((a,b)\\in D\\) si y solo si \\(\\lim_{(x,y)\\to(a,b)}f(x,y)=f(a,b)\\). Es continua en \\(D\\) si lo es en todos sus puntos.\n\nLas funciones polinomicas son continuas en todo \\(\\mathbb{R}^2\\), y las racionales son continuas donde el denominador no sea cero. Tambien se mantiene la continuidad de funciones compuestas: si \\(f\\) es continua en \\((a,b)\\) y \\(g\\) es continua en \\(f(a,b)\\), entonces \\(g\\circ f\\) es continua en \\((a,b)\\).\n\nEn la funcion por tramos\n\n$$f(x,y)=\\begin{cases}2-(x^2+y^2),&x^2+y^2<1,\\\\0,&x^2+y^2\\ge1,\\end{cases}$$\n\nno hay continuidad sobre la circunferencia \\(x^2+y^2=1\\), porque los limites laterales por trayectorias dentro y fuera del disco no coinciden.\n\nFinalmente, para\n\n$$h(x,y)=\\begin{cases}\\frac{x^2+2xy}{\\sqrt{x^2+y^2}},&(x,y)\\ne(0,0),\\\\c,&(x,y)=(0,0),\\end{cases}$$\n\nla continuidad en el origen exige elegir \\(c\\) igual al limite. Usando estriccion se obtiene\\(\\lim h(x,y)=0\\), por tanto \\(c=0\\).",
      topics: [
        "Limites en varias variables",
        "Trayectorias",
        "Teorema de estriccion",
        "No existencia de limite",
        "Continuidad",
        "Funciones por tramos"
      ],
      sourceFile: "Clase 03. Límites y Continuidad.pdf"
    },
    {
      title: "Derivadas parciales",
      description: "Definicion de derivadas parciales como tasas de cambio al fijar variables, junto con su significado geometrico sobre curvas de interseccion. Incluye derivacion implicita y derivadas de orden superior.",
      content:
        "## Derivadas parciales\n\nSea \\(f(x,y)\\) una funcion de dos variables. Para derivar respecto a \\(x\\), se fija \\(y=b\\) y se estudia la funcion de una variable \\(\\phi(x)=f(x,b)\\). Si \\(\\phi\\) es derivable en \\(a\\), se define\n\n$$\\frac{\\partial f}{\\partial x}(a,b)=\\lim_{h\\to0}\\frac{f(a+h,b)-f(a,b)}{h}. $$\n\nDe forma analoga, fijando \\(x=a\\) y tomando \\(\\varphi(y)=f(a,y)\\), se define\n\n$$\\frac{\\partial f}{\\partial y}(a,b)=\\lim_{h\\to0}\\frac{f(a,b+h)-f(a,b)}{h}. $$\n\nAl dejar variar \\((a,b)\\), se obtienen las funciones \\(f_x(x,y)\\) y \\(f_y(x,y)\\).\n\n## Regla practica de calculo\n\nDEF:: Si \\(f(x,y)\\) no es por tramos, para hallar \\(f_x\\) se trata \\(y\\) como constante (y para \\(f_y\\), se trata \\(x\\) como constante). Si \\(f\\) es por tramos y se deriva en un punto problema, debe usarse la definicion por limite.\n\nTambien se usa la notacion\n\n$$\\frac{\\partial f}{\\partial x}=f_x=D_1f,\\qquad \\frac{\\partial f}{\\partial y}=f_y=D_2f.$$\n\nEn tres variables, el esquema es completamente analogo.\n\n## Interpretacion geometrica\n\nSea \\(P=(a,b,f(a,b))\\). La derivada \\(f_x(a,b)\\) es la pendiente de la recta tangente a la curva interseccion de la superficie \\(z=f(x,y)\\) con el plano \\(y=b\\). De modo similar, \\(f_y(a,b)\\) es la pendiente de la tangente en la interseccion con el plano \\(x=a\\).\n\nEsto permite leer sobre cada traza cuanto crece o decrece la superficie. Si mas adelante \\(f_x\\) y \\(f_y\\) son continuas, esas dos rectas determinan el plano tangente.\n\n## Ejemplos de primer orden\n\nPara \\(f(x,y)=x^3y^2-e^{xy}\\), se obtiene\n\n$$f_x=3x^2y^2-ye^{xy},\\qquad f_y=2x^3y-xe^{xy}. $$\n\nPara la funcion por tramos\n\n$$f(x,y)=\\begin{cases}\\dfrac{x^3(1+y)}{x^2+y^2},&(x,y)\\ne(0,0),\\\\0,&(x,y)=(0,0),\\end{cases}$$\n\nse puede calcular \\(f_y(1,1)\\) derivando la rama racional y evaluando en \\((1,1)\\), mientras que para \\(f_x(0,0)\\) hay que usar la definicion. El resultado en la clase es \\(f_y(1,1)=-\\tfrac12\\) y \\(f_x(0,0)=1\\).\n\nEJ:: Verifique directamente con la definicion que \\(f_x(0,0)=1\\) en el ejemplo anterior.\n\n## Derivacion implicita\n\nSi \\(z=z(x,y)\\) esta definida por\n\n$$x^4+y^3-z^3+2xyz=1,$$\n\nse deriva implicitamente respecto a \\(x\\) (tomando \\(y\\) constante) y se despeja \\(\\partial z/\\partial x\\):\n\n$$\\frac{\\partial z}{\\partial x}=\\frac{4x^3+2yz}{3z^2-2xy}. $$\n\nEJ:: Halle \\(\\partial z/\\partial y\\) para la misma ecuacion implicita.\n\n## Derivadas parciales de orden superior\n\nAl derivar de nuevo \\(f_x\\) y \\(f_y\\), aparecen\n\n$$f_{xx},\\ f_{yy},\\ f_{xy},\\ f_{yx}. $$\n\nEl orden importa en la notacion: \\(f_{xy}=(f_x)_y\\), mientras que \\(\\partial^2f/(\\partial x\\partial y)=(f_y)_x\\).\n\nPara \\(f(x,y)=x^3-4xy^5-2y^3\\):\n\n$$f_x=3x^2-4y^5,\\quad f_y=-20xy^4-6y^2,$$\n$$f_{xx}=6x,\\quad f_{yy}=-80xy^3-12y,\\quad f_{xy}=f_{yx}=-20y^4.$$\n\n## Clase \\(C^2\\) y teorema de Clairaut\n\nDEF:: Una funcion es de clase \\(C^2\\) en un disco \\(D\\subset\\mathbb{R}^2\\) si tiene derivadas parciales de primer y segundo orden en \\(D\\), y todas ellas son continuas en \\(D\\).\n\nSi \\(f_{xy}\\) y \\(f_{yx}\\) son continuas en un disco que contiene \\((a,b)\\), entonces\n\n$$f_{xy}(a,b)=f_{yx}(a,b).$$\n\nEn particular, si \\(f\\in C^2(D)\\), la igualdad vale en todo punto de \\(D\\).\n\n## Ejemplo armonico\n\nPara \\(u(x,y)=e^x\\sin y\\), se verifica \\(u_{xy}=u_{yx}=e^x\\cos y\\). Ademas,\n\n$$u_{xx}=e^x\\sin y,\\qquad u_{yy}=-e^x\\sin y,\\qquad u_{xx}+u_{yy}=0.$$\n\nEsta es la ecuacion de Laplace, fundamental en conduccion de calor, fluidos y electrostatica.\n\nEJ:: Demuestre que \\(u(x,y)=e^{kx}\\sin(ky)\\) y \\(u(x,y)=e^{kx}\\cos(ky)\\) satisfacen \\(u_{xx}+u_{yy}=0\\) para todo \\(k\\in\\mathbb{R}\\).",
      topics: [
        "Derivadas parciales",
        "Interpretacion geometrica",
        "Derivacion implicita",
        "Derivadas de orden superior",
        "Teorema de Clairaut",
        "Funciones armonicas"
      ],
      sourceFile: "Clase 04. Derivadas parciales.pdf"
    },
    {
      title: "Diferenciabilidad y planos tangentes",
      description: "Construccion del plano tangente y de la linealizacion como mejor aproximacion local de una superficie. Se diferencia entre tener derivadas parciales y ser realmente diferenciable en un punto.",
      content:
        "## El plano tangente\n\nEn una variable, la recta tangente a \\(y=f(x)\\) en \\((a,f(a))\\) es \\(y=f(a)+f'(a)(x-a)\\). En dos variables, para \\(z=f(x,y)\\), la idea se generaliza a un plano tangente en \\(P=(a,b,f(a,b))\\).\n\nSi \\(f_x\\) y \\(f_y\\) existen en \\((a,b)\\), las intersecciones de la superficie con los planos \\(y=b\\) y \\(x=a\\) dan curvas cuyas tangentes en \\(P\\) tienen pendientes \\(f_x(a,b)\\) y \\(f_y(a,b)\\). Eso conduce a la ecuacion del plano tangente:\n\n$$z=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b).$$\n\n## Ejemplos de plano tangente y linealizacion\n\nPara \\(f(x,y)=x^2y\\) en \\((1,1)\\): \\(f_x=2xy\\), \\(f_y=x^2\\), luego \\(f_x(1,1)=2\\), \\(f_y(1,1)=1\\), \\(f(1,1)=1\\). El plano tangente queda\n\n$$z=1+2(x-1)+(y-1)=2x+y-2.$$\n\nDEF:: La funcion lineal \\(L(x,y)=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)\\) se llama linealizacion de \\(f\\) en \\((a,b)\\), y aproxima bien a \\(f(x,y)\\) cuando \\((x,y)\\) esta cerca de \\((a,b)\\).\n\nPara \\(f(x,y)=x^2e^{xy}\\) en \\((2,0)\\): \\(f(2,0)=4\\), \\(f_x(2,0)=4\\), \\(f_y(2,0)=8\\), entonces\n\n$$L(x,y)=4+4(x-2)+8y=4x+8y-4.$$\n\nAsi, \\(f(2.1,-0.2)\\approx L(2.1,-0.2)=2.8\\).\n\nEJ:: Use la linealizacion para aproximar \\(f(1.95,0.1)\\) cuando \\(f(x,y)=x^2e^{xy}\\) cerca de \\((2,0)\\).\n\n## Diferenciabilidad\n\nTener derivadas parciales en un punto no basta para ser diferenciable. Un ejemplo clasico es\n\n$$f(x,y)=\\begin{cases}\\dfrac{xy}{x^2+y^2},&(x,y)\\ne(0,0),\\\\0,&(x,y)=(0,0).\\end{cases}$$\n\nAunque \\(f_x(0,0)=f_y(0,0)=0\\), la funcion no es continua en \\((0,0)\\), asi que no puede ser diferenciable.\n\nDEF:: \\(f\\) es diferenciable en \\((a,b)\\) si (i) existen \\(f_x(a,b),f_y(a,b)\\), y (ii)\n\n$$\\lim_{(x,y)\\to(a,b)}\\frac{f(x,y)-\\big[f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)\\big]}{\\sqrt{(x-a)^2+(y-b)^2}}=0.$$\n\nGeometricamente, esto significa que cerca de \\((a,b,f(a,b))\\) la superficie y su plano tangente son casi indistinguibles.\n\n## Teorema clave\n\nDEF:: Si \\(f\\) es diferenciable en \\((a,b)\\), entonces \\(f\\) es continua en \\((a,b)\\).\n\nEn la practica, tambien se usa una condicion suficiente muy util:\n\nDEF:: Si \\(f_x\\) y \\(f_y\\) existen cerca de \\((a,b)\\) y son continuas en \\((a,b)\\), entonces \\(f\\) es diferenciable en \\((a,b)\\). En particular, toda funcion de clase \\(C^1\\) es diferenciable.\n\n## Ejemplos de verificacion\n\nPara\n\n$$f(x,y)=\\begin{cases}\\dfrac{xy}{x^2+y^2},&(x,y)\\ne(0,0),\\\\0,&(x,y)=(0,0),\\end{cases}$$\n\nno hay diferenciabilidad en \\((0,0)\\), porque en el cociente de la definicion aparecen trayectorias con comportamientos incompatibles (por ejemplo \\(x=0\\) frente a \\(y=x,\\ x>0\\)).\n\nEn cambio, para\n\n$$f(x,y)=\\begin{cases}(x^2+y^2)\\sin\\!\\big(2\\sqrt{x^2+y^2}\\big)+x,&(x,y)\\ne(0,0),\\\\0,&(x,y)=(0,0),\\end{cases}$$\n\nse verifica \\(f_x(0,0)=1\\), \\(f_y(0,0)=0\\) y el cociente de diferenciabilidad tiende a \\(0\\), por lo que \\(f\\) si es diferenciable en el origen.\n\nEJ:: Determine si\n\n$$f(x,y)=\\begin{cases}\\dfrac{-x^3-y^3}{x^2+y^2},&(x,y)\\ne(0,0),\\\\0,&(x,y)=(0,0),\\end{cases}$$\n\nes diferenciable en \\((0,0)\\).",
      topics: [
        "Plano tangente",
        "Linealizacion",
        "Diferenciabilidad",
        "Continuidad",
        "Criterio de diferenciabilidad",
        "Aproximacion local"
      ],
      sourceFile: "Clase 05. Diferenciabilidad y planos tangentes.pdf"
    },
    {
      title: "Regla de la cadena",
      description: "Aplicacion sistematica de la regla de la cadena en composiciones con una y varias variables intermedias. Se resuelve con diagramas de dependencia para evitar omisiones en derivadas parciales y derivadas totales.",
      content:
        "## La regla de la cadena en varias variables\n\nEn una variable, si \\(y=f(x)\\) y \\(x=g(t)\\), entonces \\(y=f(g(t))\\) y\n\n$$\\frac{dy}{dt}=f'(g(t))g'(t)=\\frac{dy}{dx}\\frac{dx}{dt}. $$\n\nEn varias variables la idea es la misma, pero depende de cuantas variables intermedias y parametros esten involucrados.\n\n## Caso cero\n\nSi \\(z=g(f(x,y))=g(u)\\), con \\(g:\\mathbb{R}\\to\\mathbb{R}\\) y \\(f:\\mathbb{R}^2\\to\\mathbb{R}\\), entonces\n\n$$\\frac{\\partial z}{\\partial x}=\\frac{dg}{du}\\frac{\\partial u}{\\partial x},\\qquad \\frac{\\partial z}{\\partial y}=\\frac{dg}{du}\\frac{\\partial u}{\\partial y}. $$\n\nEJ:: Demuestre que \\(z=f\\!\\left(\\frac12bx^2-\\frac13ay^3\\right)\\) satisface \\(ay^2\\,\\frac{\\partial z}{\\partial x}+bx\\,\\frac{\\partial z}{\\partial y}=0\\).\n\n## Primer caso\n\nSi \\(z=f(x,y)\\), con \\(x=g(t)\\), \\(y=h(t)\\), entonces \\(z\\) depende de \\(t\\) y\n\n$$\\frac{dz}{dt}=\\frac{\\partial z}{\\partial x}\\frac{dx}{dt}+\\frac{\\partial z}{\\partial y}\\frac{dy}{dt}. $$\n\nEste caso se interpreta bien con diagrama de arbol: cada camino desde \\(z\\) hasta \\(t\\) aporta un producto, y se suman los caminos.\n\nPara \\(z=x^2\\cos y\\), \\(x=t^2\\), \\(y=\\sin t\\):\n\n$$\\frac{dz}{dt}=2x\\cos y\\cdot2t+x^2(-\\sin y)\\cdot\\cos t=4t^3\\cos(\\sin t)-t^4\\sin(\\sin t)\\cos t.$$\n\n## Segundo caso\n\nSi \\(z=f(x,y)\\), con \\(x=g(s,t)\\), \\(y=h(s,t)\\), entonces\n\n$$\\frac{\\partial z}{\\partial s}=\\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial s}+\\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial s},$$\n$$\\frac{\\partial z}{\\partial t}=\\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial t}+\\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial t}. $$\n\nCon arboles de dependencia, cada derivada parcial se construye sumando los caminos que llegan al parametro derivado.\n\nEjemplo: \\(z=x^2-3x^2y^3\\), \\(x=e^{st}\\), \\(y=e^{-st}\\). Se obtiene\n\n$$z_s=2te^{2st}+3te^{-st},\\qquad z_t=2se^{2st}+3se^{-st}. $$\n\n## Aplicacion fisica\n\nEn la ley del gas ideal \\(PV=\\alpha T\\), si \\(\\alpha=0.8\\), entonces \\(T(P,V)=1.25PV\\). Por regla de la cadena:\n\n$$\\frac{dT}{dt}=\\frac{\\partial T}{\\partial P}\\frac{dP}{dt}+\\frac{\\partial T}{\\partial V}\\frac{dV}{dt}=1.25V\\frac{dP}{dt}+1.25P\\frac{dV}{dt}. $$\n\nCon \\(V=15\\), \\(P=12\\), \\(dV/dt=0.1\\), \\(dP/dt=-0.2\\):\n\n$$\\frac{dT}{dt}=1.25[15(-0.2)+12(0.1)]=-2.25, $$\n\npor lo que la temperatura disminuye a \\(2.25\\,K/min\\).\n\n## Caso de tres variables intermedias\n\nSi \\(u=xy+xz+yz\\), con \\(x=st\\), \\(y=e^{st}\\), \\(z=t^2\\), para \\(u_s\\) se consideran los caminos que pasan por \\(x\\) y \\(y\\) (porque \\(z\\) no depende de \\(s\\)):\n\n$$u_s=u_xx_s+u_yy_s. $$\n\nTras reemplazar y simplificar,\n\n$$u_s(s,t)=t^3+(t+st^2+t^3)e^{st},\\qquad u_s(0,1)=3. $$\n\nEJ:: Reproduzca el calculo de \\(u_s(0,1)\\) usando solo el diagrama de arbol y comparando termino a termino.\n\n## Derivadas de orden superior en composiciones\n\nAplicando regla de la cadena y regla del producto de forma sucesiva, para \\(z=f(x,y)\\), \\(x=x(s,t)\\), \\(y=y(s,t)\\), se obtiene una expresion para \\(z_{st}\\) en terminos de \\(f_x,f_y,f_{xx},f_{xy},f_{yy}\\) y derivadas de \\(x,y\\).\n\nUna forma compacta es\n\n$$z_{st}=f_{xx}x_sx_t+f_{yy}y_sy_t+f_{xy}(x_sy_t+y_sx_t)+f_xx_{st}+f_yy_{st}. $$\n\nComo \\(f_{xy}=f_{yx}\\) cuando \\(f\\in C^2\\), la formula se simplifica y facilita calculos en coordenadas transformadas.\n\n## Ejemplo final\n\nSi \\(g(r,\\theta)=f(r\\cos\\theta,r\\sin\\theta)\\), la regla de la cadena permite calcular \\(g_{rr}\\) en un punto combinando derivadas de \\(f\\) con derivadas de \\(x=r\\cos\\theta\\), \\(y=r\\sin\\theta\\). En el ejemplo de clase, usando los datos suministrados de \\(f_x,f_y,f_{xx},f_{xy},f_{yy}\\), se obtiene\n\n$$g_{rr}\\left(1,\\frac{\\pi}{4}\\right)=32.$$",
      topics: [
        "Regla de la cadena",
        "Composicion de funciones",
        "Derivadas totales",
        "Derivadas parciales compuestas",
        "Diagramas de dependencia",
        "Derivadas de orden superior"
      ],
      sourceFile: "Clase 06. Regla de la cadena.pdf"
    },
    {
      title: "Derivada direccional y gradiente",
      description: "Definicion de derivada direccional en cualquier direccion unitaria y uso del gradiente como operador de maxima variacion. Se estudia su relacion con curvas y superficies de nivel, y con la direccion de crecimiento mas rapido.",
      content:
        "## La derivada direccional\n\nLas derivadas parciales \\(f_x(x_0,y_0)\\) y \\(f_y(x_0,y_0)\\) miden cambio en direcciones coordenadas, es decir, en \\(\\mathbf{i}=\\langle1,0\\rangle\\) y \\(\\mathbf{j}=\\langle0,1\\rangle\\). La derivada direccional generaliza esto a cualquier direccion unitaria \\(\\mathbf{u}=\\langle a,b\\rangle\\).\n\nDEF:: La derivada direccional de \\(f\\) en \\((x_0,y_0)\\) en direccion \\(\\mathbf{u}=\\langle a,b\\rangle\\) es\n\n$$D_{\\mathbf{u}}f(x_0,y_0)=\\lim_{h\\to0}\\frac{f(x_0+ha,y_0+hb)-f(x_0,y_0)}{h},$$\n\nsi el limite existe.\n\nAl tomar \\(\\mathbf{u}=\\mathbf{i}\\) se recupera \\(f_x\\), y al tomar \\(\\mathbf{u}=\\mathbf{j}\\) se recupera \\(f_y\\).\n\n## Teorema operativo\n\nSi \\(f\\) es derivable, entonces para todo vector unitario \\(\\mathbf{u}=\\langle a,b\\rangle\\):\n\n$$D_{\\mathbf{u}}f(x_0,y_0)=f_x(x_0,y_0)a+f_y(x_0,y_0)b.$$\n\nDEF:: El vector gradiente es\n\n$$\\nabla f(x,y)=\\langle f_x(x,y),f_y(x,y)\\rangle=\\frac{\\partial f}{\\partial x}\\mathbf{i}+\\frac{\\partial f}{\\partial y}\\mathbf{j},$$\n\npor lo que la formula anterior se escribe\n\n$$D_{\\mathbf{u}}f(x_0,y_0)=\\nabla f(x_0,y_0)\\cdot\\mathbf{u}. $$\n\nEn tres variables: \\(\\nabla f(x,y,z)=\\langle f_x,f_y,f_z\\rangle\\).\n\n## Ejemplos de calculo\n\nPara \\(f(x,y)=\\sin(x+2y)\\), en \\((4,-2)\\), con direccion nor-oeste, se usa\n\n$$\\mathbf{u}=\\left\\langle\\cos\\frac{3\\pi}{4},\\sin\\frac{3\\pi}{4}\\right\\rangle=\\frac{\\sqrt2}{2}\\langle-1,1\\rangle.$$\n\nComo \\(\\nabla f(x,y)=\\langle\\cos(x+2y),2\\cos(x+2y)\\rangle\\), resulta \\(\\nabla f(4,-2)=\\langle1,2\\rangle\\), y\n\n$$D_{\\mathbf{u}}f(4,-2)=\\langle1,2\\rangle\\cdot\\frac{\\sqrt2}{2}\\langle-1,1\\rangle=\\frac{\\sqrt2}{2}. $$\n\nPara \\(f(x,y)=xe^y+\\cos(xy)\\) en \\((2,0)\\), direccion \\(\\mathbf{v}=3\\mathbf{i}-4\\mathbf{j}\\), primero se normaliza:\n\n$$\\mathbf{u}=\\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|}=\\left\\langle\\frac35,-\\frac45\\right\\rangle.$$\n\nCon \\(\\nabla f(2,0)=\\langle1,2\\rangle\\), se obtiene\n\n$$D_{\\mathbf{u}}f(2,0)=\\left\\langle1,2\\right\\rangle\\cdot\\left\\langle\\frac35,-\\frac45\\right\\rangle=-1.$$\n\nEJ:: Repita el segundo ejemplo usando directamente la definicion por limite para comparar con el resultado del producto punto.\n\n## Maximización de la derivada direccional\n\nComo\n\n$$D_{\\mathbf{u}}f=\\nabla f\\cdot\\mathbf{u}=\\|\\nabla f\\|\\,\\|\\mathbf{u}\\|\\cos\\theta=\\|\\nabla f\\|\\cos\\theta,$$\n\nsi \\(\\|\\mathbf{u}\\|=1\\), se concluye:\n\nDEF:: \\(f\\) crece mas rapido en la direccion de \\(\\nabla f\\), con valor maximo \\(D_{\\mathbf{u}}f=\\|\\nabla f\\|\\). Decrece mas rapido en direccion \\(-\\nabla f\\), con valor \\(-\\|\\nabla f\\|\\).\n\n## Aplicacion fisica (temperatura)\n\nSi la temperatura en una esfera es inversamente proporcional a la distancia al origen,\n\n$$T(x,y,z)=\\frac{360}{\\sqrt{x^2+y^2+z^2}},$$\n\ny en \\(P=(1,2,2)\\) se busca la razon de cambio hacia \\(Q=(2,1,3)\\), se toma\n\n$$\\mathbf{u}=\\frac{\\overrightarrow{PQ}}{\\|\\overrightarrow{PQ}\\|}=\\frac1{\\sqrt3}\\langle1,-1,1\\rangle,$$\n\ncon\n\n$$\\nabla T=-\\frac{360}{(x^2+y^2+z^2)^{3/2}}\\langle x,y,z\\rangle.$$\n\nEntonces\n\n$$D_{\\mathbf{u}}T(1,2,2)=\\nabla T(1,2,2)\\cdot\\mathbf{u}=-\\frac{40\\sqrt3}{9}. $$\n\nAdemas, \\(\\nabla T\\) apunta hacia el origen, que es la direccion de mayor aumento de temperatura.\n\n## Gradiente y superficies de nivel\n\nSea \\(F:U\\subset\\mathbb{R}^3\\to\\mathbb{R}\\), y \\(S_k=\\{(x,y,z):F(x,y,z)=k\\}\\). Si \\(P=(x_0,y_0,z_0)\\in S_k\\) y \\(\\nabla F(P)\\ne\\mathbf{0}\\), el plano tangente en \\(P\\) tiene normal \\(\\nabla F(P)\\):\n\n$$\\nabla F(x_0,y_0,z_0)\\cdot\\overrightarrow{PQ}=0,$$\n\nesto es\n\n$$F_x(P)(x-x_0)+F_y(P)(y-y_0)+F_z(P)(z-z_0)=0.$$\n\nSi la superficie es \\(z=f(x,y)\\), tomando \\(F(x,y,z)=f(x,y)-z\\), se recupera la formula conocida del plano tangente\n\n$$z=f(x_0,y_0)+f_x(x_0,y_0)(x-x_0)+f_y(x_0,y_0)(y-y_0).$$\n\nTambien, la recta normal se escribe\n\n$$x=x_0+tF_x(P),\\quad y=y_0+tF_y(P),\\quad z=z_0+tF_z(P).$$\n\nEJ:: Halle la ecuacion del plano tangente a \\(x^2z+z^2xy+z^3=1\\) en \\((0,0,1)\\), y la recta normal en ese punto.",
      topics: [
        "Derivada direccional",
        "Vector unitario",
        "Gradiente",
        "Maximo crecimiento",
        "Superficies de nivel",
        "Plano tangente y recta normal"
      ],
      sourceFile: "Clase 07. Derivada direccional y Gradiente.pdf"
    },
    {
      title: "Maximos y minimos relativos",
      description: "Busqueda y clasificacion de extremos locales a partir de puntos criticos y del criterio de la segunda derivada. Se distinguen minimos, maximos y puntos de silla mediante la Hessiana.",
      content:
        "## Extremos relativos: maximos y minimos locales\n\nUna aplicacion central de las derivadas parciales es localizar maximos y minimos de funciones de varias variables. El lenguaje es paralelo al de una variable, pero ahora el comportamiento se analiza en vecindades del plano.\n\nDEF:: Sea \\(f\\) definida en una region \\(R\\subseteq\\mathbb{R}^2\\) que contiene \\((a,b)\\).\n\n- \\(f(a,b)\\) es un maximo local si \\(f(a,b)\\ge f(x,y)\\) para todo \\((x,y)\\) cercano a \\((a,b)\\).\n- \\(f(a,b)\\) es un minimo local si \\(f(a,b)\\le f(x,y)\\) para todo \\((x,y)\\) cercano a \\((a,b)\\).\n\nSi la desigualdad vale para todo el dominio, se tiene maximo absoluto o minimo absoluto.\n\n## Teorema de Fermat en dos variables\n\nSi \\(f\\) tiene un maximo o minimo local en \\((a,b)\\) y existen \\(f_x(a,b)\\), \\(f_y(a,b)\\), entonces\n\n$$f_x(a,b)=0,\\qquad f_y(a,b)=0,$$\n\nes decir,\n\n$$\\nabla f(a,b)=\\langle0,0\\rangle.$$\n\nGeometricamente: en un extremo local, el plano tangente (si existe) es horizontal, pues\n\n$$z=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)$$\n\nse reduce a \\(z=f(a,b)\\).\n\nDEF:: Un punto \\((a,b)\\) del dominio se llama punto critico si \\(f_x(a,b)=0=f_y(a,b)\\), o si alguna de esas derivadas no existe.\n\nNo todo punto critico es extremo: tambien pueden aparecer puntos de silla.\n\n## Ejemplos iniciales\n\n1) \\(f(x,y)=y^2-x^2\\).\n\n$$f_x=-2x,\\qquad f_y=2y.$$\n\nEl unico punto critico es \\((0,0)\\). Sobre \\(y=0\\): \\(f(x,0)=-x^2<0=f(0,0)\\). Sobre \\(x=0\\): \\(f(0,y)=y^2>0=f(0,0)\\). Luego \\((0,0)\\) es punto de silla.\n\n2) \\(g(x,y)=x^2+y^2-2x-6y+14\\).\n\n$$g_x=2x-2,\\qquad g_y=2y-6,$$\n\nde donde el punto critico es \\((1,3)\\). Completando cuadrados:\n\n$$g(x,y)=(x-1)^2+(y-3)^2+4\\ge4=g(1,3),$$\n\npor tanto \\((1,3)\\) es minimo absoluto.\n\n## Criterio de la segunda derivada\n\nPara clasificar puntos criticos se usa la matriz Hessiana en \\((a,b)\\):\n\n$$H(a,b)=\\begin{bmatrix}f_{xx}(a,b) & f_{xy}(a,b)\\\\ f_{yx}(a,b) & f_{yy}(a,b)\\end{bmatrix}.$$\n\nSi \\(f\\in C^2\\), se define\n\n$$D=\\det H(a,b)=f_{xx}(a,b)f_{yy}(a,b)-\\big(f_{xy}(a,b)\\big)^2.$$\n\nDEF:: En un punto critico \\((a,b)\\):\n\n- Si \\(D>0\\) y \\(f_{xx}(a,b)>0\\), hay minimo local.\n- Si \\(D>0\\) y \\(f_{xx}(a,b)<0\\), hay maximo local.\n- Si \\(D<0\\), hay punto de silla.\n- Si \\(D=0\\), el criterio no concluye.\n\n## Ejemplo de clasificacion completa\n\nSea\n\n$$f(x,y)=x^2+y^2+x^2y+4.$$\n\nLos puntos criticos satisfacen\n\n$$f_x=2x+2xy=0,\\qquad f_y=2y+x^2=0.$$\n\nDel sistema se obtiene:\n\n$$(0,0),\\qquad (-\\sqrt2,-1),\\qquad (\\sqrt2,-1).$$\n\nDerivadas segundas:\n\n$$f_{xx}=2+2y,\\qquad f_{yy}=2,\\qquad f_{xy}=2x.$$\n\n- En \\((0,0)\\): \\(D=(2)(2)-0^2=4>0\\) y \\(f_{xx}(0,0)=2>0\\) \\(\\Rightarrow\\) minimo local.\n- En \\((\\pm\\sqrt2,-1)\\): \\(D=(0)(2)-(\\pm2\\sqrt2)^2=-8<0\\) \\(\\Rightarrow\\) puntos de silla.\n\nEJ:: Halle y clasifique los puntos criticos de \\(f(x,y)=x\\sin(y)\\).\n\n## Aplicacion de optimizacion: punto mas cercano a un plano\n\nBusquemos el punto del plano\n\n$$T: 2x-y+z=1$$\n\nmas cercano a \\((-4,1,3)\\). Como en \\(T\\), \\(z=1-2x+y\\), se minimiza la distancia al cuadrado\n\n$$F(x,y)=(x+4)^2+(y-1)^2+(y-2x-2)^2.$$\n\nCondicion critica:\n\n$$F_x=0,\\quad F_y=0\\iff\\begin{cases}5x-2y=-8,\\\\ -2x+2y=3.\\end{cases}$$\n\nLa solucion es\n\n$$x=-\\frac53,\\qquad y=-\\frac16.$$\n\nComo\n\n$$F_{xx}=10,\\quad F_{yy}=4,\\quad F_{xy}=-4,\\quad D=10\\cdot4-(-4)^2=24>0,$$\n\ny \\(F_{xx}>0\\), se obtiene un minimo local (y de hecho absoluto). El punto pedido es\n\n$$P=\\left(-\\frac53,-\\frac16,\\frac{25}{6}\\right).$$\n\n## Aplicacion de maximo: caja inscrita en elipsoide\n\nPara el elipsoide\n\n$$9x^2+36y^2+4z^2=36,$$\n\nla caja de mayor volumen con aristas paralelas a ejes tiene, por simetria, volumen\n\n$$V=8xyz$$\n\nsi \\((x,y,z)\\) esta en el primer octante. Con \\(z=\\frac{\\sqrt{36-9x^2-36y^2}}{2}\\), se maximiza\n\n$$V(x,y)=4xy\\sqrt{36-9x^2-36y^2},$$\n\no equivalentemente\n\n$$G(x,y)=V(x,y)^2=16x^2y^2(36-9x^2-36y^2).$$\n\nAl resolver el sistema critico en \\(x>0, y>0\\), se obtiene\n\n$$x=\\frac{2\\sqrt3}{3},\\qquad y=\\frac{\\sqrt3}{3},\\qquad z=\\sqrt3.$$\n\nPor tanto, el volumen maximo es\n\n$$V_{\\max}=8xyz=\\frac{16\\sqrt3}{3}. $$\n\nEJ:: Rehaga el ejemplo imponiendo primero una restriccion equivalente en forma normalizada \\(\\frac{x^2}{4}+y^2+\\frac{z^2}{9}=1\\), y compare resultados.",
      topics: [
        "Maximos y minimos relativos",
        "Puntos criticos",
        "Puntos de silla",
        "Hessiana",
        "Criterio de segunda derivada",
        "Optimizacion local"
      ],
      sourceFile: "Clase 08. Máximos y mínimos relativos.pdf"
    },
    {
      title: "Maximos y minimos absolutos",
      description: "Metodo de optimizacion global en regiones cerradas y acotadas: analisis de puntos criticos interiores y frontera. Se aplica el teorema del valor extremo y se comparan valores candidatos para concluir extremos absolutos.",
      content:
        "## Valores maximos y minimos globales\n\nEn una variable, si \\(f\\) es continua en un intervalo cerrado \\([a,b]\\), entonces alcanza maximo y minimo absolutos. En varias variables ocurre algo análogo, pero ahora el dominio es una region del plano.\n\nPara aplicar el resultado correctamente, se necesitan dos ideas geometricas:\n\nDEF:: Un conjunto \\(E\\subseteq\\mathbb{R}^2\\) es cerrado si contiene su frontera.\n\nDEF:: Un conjunto \\(E\\subseteq\\mathbb{R}^2\\) es acotado si esta contenido en algun disco \\(D_R\\).\n\nEjemplos: \\(x^2+y^2\\le1\\) es cerrado y acotado; \\(x^2+y^2<1\\) es acotado pero no cerrado; \\(x\\ge0\\) es cerrado pero no acotado.\n\n## Teorema del valor extremo en \\(\\mathbb{R}^2\\)\n\nSi \\(D\\subseteq\\mathbb{R}^2\\) es no vacio, cerrado y acotado, y \\(f:D\\to\\mathbb{R}\\) es continua, entonces existen puntos \\((a,b),(c,d)\\in D\\) tales que\n\n$$f(a,b)\\le f(x,y)\\le f(c,d),\\quad\\forall(x,y)\\in D.$$\n\nEs decir, \\(f\\) alcanza minimo absoluto y maximo absoluto en \\(D\\).\n\n## Metodo practico para hallar extremos absolutos\n\nDEF:: Para encontrar extremos globales de \\(f\\) en una region cerrada y acotada \\(D\\):\n\n1. Hallar puntos criticos de \\(f\\) en el interior \\(\\operatorname{int}(D)\\) y evaluar \\(f\\) alli.\n2. Estudiar la frontera \\(\\partial D\\): parametrizar cada tramo y reducir a funciones de una variable.\n3. Comparar todos los valores candidatos (interior + frontera). El mayor es maximo absoluto y el menor es minimo absoluto.\n\n## Ejemplo principal: region triangular\n\nDetermine maximo y minimo absolutos de\n\n$$f(x,y)=x^2+2xy+3y^2$$\n\nen el triangulo cerrado con vertices \\((-1,1)\\), \\((2,1)\\), \\((-1,-2)\\).\n\n### Paso 1: interior de \\(D\\)\n\n$$f_x=2x+2y,\\qquad f_y=2x+6y.$$\n\nSistema critico:\n\n$$2x+2y=0,\\quad 2x+6y=0\\Rightarrow (x,y)=(0,0).$$\n\nComo \\((0,0)\\in\\operatorname{int}(D)\\), se evalua:\n\n$$f(0,0)=0.$$\n\n### Paso 2: frontera \\(\\partial D=L_1\\cup L_2\\cup L_3\\)\n\n- \\(L_1: y=1,\\ -1\\le x\\le2\\).\n  Sea \\(h(x)=f(x,1)=x^2+2x+3\\).\n  \\(h'(x)=2x+2=0\\Rightarrow x=-1\\).\n  Evaluando en extremos y critico: \\(h(-1)=2\\), \\(h(2)=11\\).\n  Entonces en \\(L_1\\): minimo \\(2\\) en \\((-1,1)\\), maximo \\(11\\) en \\((2,1)\\).\n\n- \\(L_2: x=-1,\\ -2\\le y\\le1\\).\n  Sea \\(g(y)=f(-1,y)=3y^2-2y+1\\).\n  \\(g'(y)=6y-2=0\\Rightarrow y=\\tfrac13\\).\n  Evaluando: \\(g(\\tfrac13)=\\tfrac23\\), \\(g(-2)=17\\), \\(g(1)=2\\).\n  Entonces en \\(L_2\\): minimo \\(\\tfrac23\\), maximo \\(17\\).\n\n- \\(L_3: y=x-1,\\ -1\\le x\\le2\\).\n  Sea \\(\\varphi(x)=f(x,x-1)=6x^2-8x+3\\).\n  \\(\\varphi'(x)=12x-8=0\\Rightarrow x=\\tfrac23\\).\n  Evaluando: \\(\\varphi(-1)=17\\), \\(\\varphi(2)=11\\), \\(\\varphi(\\tfrac23)=\\tfrac13\\).\n  Entonces en \\(L_3\\): minimo \\(\\tfrac13\\), maximo \\(17\\).\n\n### Paso 3: comparacion global\n\nCandidatos obtenidos: \\(0,\\tfrac13,\\tfrac23,2,11,17\\).\n\n- Minimo absoluto: \\(0\\), alcanzado en \\((0,0)\\).\n- Maximo absoluto: \\(17\\), alcanzado en \\((-1,-2)\\).\n\n## Observacion clave\n\nEn optimizacion global en varias variables, no basta con puntos criticos interiores. La frontera puede contener los verdaderos extremos absolutos, incluso cuando en el interior hay minimos o maximos locales.\n\nEJ:: Halle los extremos absolutos de\n\n$$f(x,y)=x^2+y^2-x-y+1$$\n\nen el disco\n\n$$D=\\{(x,y):x^2+y^2\\le1\\}. $$\n\nSugerencia: parametrice la frontera con \\(x=\\cos t,\\ y=\\sin t\\), \\(0\\le t\\le2\\pi\\), y compare con los puntos criticos del interior.",
      topics: [
        "Maximos y minimos absolutos",
        "Conjuntos cerrados y acotados",
        "Teorema del valor extremo",
        "Analisis del interior",
        "Analisis de frontera",
        "Comparacion de candidatos"
      ],
      sourceFile: "Clase 09. Máximos y mínimos absolutos.pdf"
    },
    {
      title: "Multiplicadores de Lagrange",
      description: "Optimizacion con restricciones de igualdad usando paralelismo entre gradientes. Se modelan problemas fisicos y geometricos donde no se puede variar libremente en todo el espacio.",
      content:
        "## Maximos y minimos con una restriccion\n\nEn optimizacion restringida se busca extremar una funcion sobre una curva o superficie dada por una ecuacion. Si se quiere optimizar \\(f(x,y,z)\\) sujeto a \\(g(x,y,z)=k\\), los puntos extremos se obtienen del paralelismo entre gradientes.\n\nDEF:: Si \\(P\\) es punto extremo restringido y \\(\\nabla g(P)\\neq\\mathbf{0}\\), existe \\(\\lambda\\in\\mathbb{R}\\) tal que \\(\\nabla f(P)=\\lambda\\nabla g(P)\\).\n\nResolver \\(\\nabla f=\\lambda\\nabla g\\) junto con \\(g=k\\), evaluar \\(f\\) en candidatos y comparar.\n\nEJ:: Aplique el metodo para maximizar \\(V=xyz\\) con restriccion \\(xy+2xz+2yz=16\\).",
      topics: [
        "Multiplicadores de Lagrange",
        "Restricciones de igualdad",
        "Interpretacion geometrica",
        "Sistema con lambda",
        "Dos restricciones",
        "Optimizacion restringida"
      ],
      sourceFile: "Clase 10. Multiplicadores de Lagrange.pdf"
    },
    {
      title: "Integrales dobles sobre rectangulos. Integrales iteradas",
      description: "Definicion de integral doble por sumas de Riemann en rectangulos y calculo practico con integrales iteradas. Se interpreta como volumen bajo superficies y se usa Fubini para integrar por etapas.",
      content:
        "## Integrales dobles sobre rectangulos\n\nSi \\(f:[a,b]\\times[c,d]\\to\\mathbb{R}\\) y \\(R=[a,b]\\times[c,d]\\), la integral doble nace como limite de sumas dobles de Riemann. Cuando \\(f\\ge0\\), representa el volumen bajo \\(z=f(x,y)\\) y sobre el rectangulo \\(R\\).\n\nAl subdividir \\(R\\) en subrectangulos \\(R_{ij}\\), con \\(\\Delta A=\\Delta x\\Delta y\\), una aproximacion del volumen es\n\n$$\\sum_{i=1}^m\\sum_{j=1}^n f(x_{ij},y_{ij})\\,\\Delta x\\,\\Delta y.$$\n\nDEF::\n\n$$\\iint_R f(x,y)\\,dA=\\lim_{m,n\\to\\infty}\\sum_{i=1}^m\\sum_{j=1}^n f(x_{ij},y_{ij})\\,\\Delta x\\,\\Delta y,$$\n\nsi el limite existe e independe de los puntos de muestra.\n\n## Propiedades basicas\n\nSi \\(f\\) y \\(g\\) son integrables en \\(R\\):\n\n- Linealidad: \\(\\iint_R(f+g)=\\iint_R f+\\iint_R g\\).\n- Homogeneidad: \\(\\iint_R\\lambda f=\\lambda\\iint_R f\\).\n- Monotonia: si \\(f\\le g\\), entonces \\(\\iint_R f\\le\\iint_R g\\).\n- Aditividad por particion en subrectangulos no traslapados.\n\n## Integrales iteradas y Fubini\n\nPara \\(f\\) continua en \\(R=[a,b]\\times[c,d]\\):\n\n$$\\iint_R f(x,y)\\,dA=\\int_a^b\\!\\left(\\int_c^d f(x,y)\\,dy\\right)dx=\\int_c^d\\!\\left(\\int_a^b f(x,y)\\,dx\\right)dy.$$\n\nEste resultado permite calcular integrales dobles mediante dos integrales de una variable.\n\n## Ejemplos\n\n1) Volumen bajo \\(z=\\sin y\\) sobre \\(R=[0,1]\\times[0,\\pi/2]\\):\n\n$$V=\\int_0^1\\int_0^{\\pi/2}\\sin(y)\\,dy\\,dx=1.$$\n\n2)\n\n$$\\iint_{[1,2]\\times[0,\\pi]} y\\sin(xy)\\,dA=0,$$\n\nconveniente integrando primero respecto a \\(x\\).\n\n3) Si \\(f(x,y)=g(x)h(y)\\) en \\(R=[a,b]\\times[c,d]\\), entonces\n\n$$\\iint_R g(x)h(y)\\,dA=\\left(\\int_a^b g(x)\\,dx\\right)\\left(\\int_c^d h(y)\\,dy\\right).$$\n\nEJ:: Recalcule el ejemplo 2 integrando primero respecto a \\(y\\) y compare la dificultad algebraica.",
      topics: [
        "Integral doble en rectangulos",
        "Sumas de Riemann dobles",
        "Interpretacion geometrica",
        "Propiedades de la integral doble",
        "Integrales iteradas",
        "Teorema de Fubini"
      ],
      sourceFile: "Clase 11. Integrales dobles sobre rectángulos. Integrales iteradas.pdf"
    },
    {
      title: "Integrales dobles sobre regiones generales",
      description: "Extension de la integral doble a regiones no rectangulares mediante dominios tipo I, II y III. Incluye cambio de orden de integracion y calculo de volumenes sobre fronteras curvas.",
      content:
        "## Integrales dobles sobre regiones generales\n\nSi \\(D\\subset\\mathbb{R}^2\\) es acotada y \\(D\\subset R\\) para algun rectangulo, se define\n\n$$F(x,y)=\\begin{cases}f(x,y),&(x,y)\\in D,\\\\0,&(x,y)\\notin D,\\end{cases}$$\n\ny\n\n$$\\iint_D f(x,y)\\,dA:=\\iint_R F(x,y)\\,dA.$$\n\n## Regiones tipo I y tipo II\n\nDEF:: Tipo I:\n\n$$D=\\{(x,y):a\\le x\\le b,\\ g_1(x)\\le y\\le g_2(x)\\}.$$\n\nEntonces\n\n$$\\iint_D f(x,y)\\,dA=\\int_a^b\\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx.$$\n\nDEF:: Tipo II:\n\n$$D=\\{(x,y):c\\le y\\le d,\\ h_1(y)\\le x\\le h_2(y)\\}.$$\n\nEntonces\n\n$$\\iint_D f(x,y)\\,dA=\\int_c^d\\int_{h_1(y)}^{h_2(y)} f(x,y)\\,dx\\,dy.$$\n\nUna region tipo III admite ambas descripciones y permite cambiar orden de integracion.\n\n## Ejemplos\n\n1) Bajo \\(z=x^2+y^2\\) sobre la region entre \\(y=x^2\\) y \\(y=2x\\):\n\n$$D=\\{0\\le x\\le2,\\ x^2\\le y\\le2x\\}=\\{0\\le y\\le4,\\ y/2\\le x\\le\\sqrt y\\}.$$\n\nEn ambos ordenes se obtiene\n\n$$V=\\iint_D(x^2+y^2)\\,dA=\\frac{216}{35}.$$\n\n2)\n\n$$\\iint_D xy\\,dA,\\quad D=\\{0\\le x\\le1,\\ x\\le y\\le2x\\},$$\n\nresulta\n\n$$\\frac{3}{8}.$$\n\n3) Volumen del tetraedro limitado por \\(x=0\\), \\(y=0\\), \\(z=0\\), \\(y-x+z=1\\):\n\n$$V=\\iint_D(1+x-y)\\,dA=\\frac16.$$\n\n## Cambio de orden\n\nPuede volver calculable una integral dificil. Ejemplo:\n\n$$\\int_0^1\\int_x^1\\sin(y^2)\\,dy\\,dx$$\n\nno es conveniente en ese orden. Como\n\n$$D=\\{(x,y):0\\le x\\le1,\\ x\\le y\\le1\\}=\\{(x,y):0\\le y\\le1,\\ 0\\le x\\le y\\},$$\n\nqueda\n\n$$\\int_0^1\\int_0^y\\sin(y^2)\\,dx\\,dy=\\frac12(1-\\cos1).$$\n\n## Observaciones utiles\n\n- \\(A(D)=\\iint_D1\\,dA\\).\n- Si \\(m\\le f\\le M\\) en \\(D\\), entonces\n\n$$mA(D)\\le\\iint_D f\\,dA\\le MA(D).$$\n\nEjemplo de estimacion en disco de radio 2:\n\n$$4\\pi e^{-1}\\le\\iint_D e^{\\sin x\\cos y}\\,dA\\le4\\pi e.$$\n\nEJ:: Rehaga el volumen del tetraedro usando descripcion tipo II de la proyeccion \\(D\\).",
      topics: [
        "Integrales dobles en regiones generales",
        "Regiones tipo I",
        "Regiones tipo II",
        "Regiones tipo III",
        "Cambio de orden",
        "Aplicaciones geometricas"
      ],
      sourceFile: "Clase 12. Integrales dobles sobre regiones generales.pdf"
    },
    {
      title: "Integrales dobles en coordenadas polares y aplicaciones",
      description: "Cambio a coordenadas polares y aplicaciones fisicas de integrales dobles: masa, carga, momentos, centro de masa y momentos de inercia.",
      content:
        "## Coordenadas polares e integracion\n\nRecordemos:\n\n$$x=r\\cos\\theta,\\quad y=r\\sin\\theta,\\quad r^2=x^2+y^2.$$\n\nPara una region polar\n\n$$D=\\{(r,\\theta):\\alpha\\le\\theta\\le\\beta,\\ h_1(\\theta)\\le r\\le h_2(\\theta)\\},$$\n\nla integral doble se transforma como\n\n$$\\iint_D f(x,y)\\,dA=\\int_\\alpha^\\beta\\int_{h_1(\\theta)}^{h_2(\\theta)} f(r\\cos\\theta,r\\sin\\theta)\\,r\\,dr\\,d\\theta.$$\n\nDEF:: El factor \\(r\\) es obligatorio (jacobiano polar).\n\n## Aplicaciones de integrales dobles\n\n### Densidad y masa\n\nSi una lamina ocupa \\(D\\) y su densidad superficial es \\(\\rho(x,y)\\), entonces\n\n$$m=\\iint_D \\rho(x,y)\\,dA.$$\n\nSi \\(\\sigma(x,y)\\) es densidad de carga, la carga total es\n\n$$Q=\\iint_D \\sigma(x,y)\\,dA.$$\n\nEjemplo (carga en disco desplazado):\n\n$$D=\\{(x,y):(x-1)^2+y^2\\le1\\},\\quad \\sigma(x,y)=1+x^2+y^2.$$\n\nEn polar: \\(r=2\\cos\\theta\\), \\(-\\pi/2\\le\\theta\\le\\pi/2\\), \\(0\\le r\\le2\\cos\\theta\\). Entonces\n\n$$Q=\\int_{-\\pi/2}^{\\pi/2}\\int_0^{2\\cos\\theta}(1+r^2)r\\,dr\\,d\\theta=\\frac{5\\pi}{2}. $$\n\n### Momentos y centro de masa\n\nPara una lamina con densidad \\(\\rho\\):\n\n$$M_x=\\iint_D y\\rho(x,y)\\,dA,\\qquad M_y=\\iint_D x\\rho(x,y)\\,dA.$$\n\nCon masa \\(m\\), el centro de masa es\n\n$$\\bar x=\\frac{M_y}{m},\\qquad \\bar y=\\frac{M_x}{m}. $$\n\nEjemplo: \\(D\\) entre \\(y=9-x^2\\) y eje \\(x\\), con \\(\\rho(x,y)=y\\).\n\n$$D=\\{(x,y):-3\\le x\\le3,\\ 0\\le y\\le9-x^2\\}.$$\n\nResultados:\n\n$$m=\\iint_D y\\,dA=\\frac{648}{5},\\qquad \\bar x=0,\\qquad \\bar y=\\frac{36}{7}. $$\n\n### Momento de inercia\n\nLos momentos de inercia de una lamina son\n\n$$I_x=\\iint_D y^2\\rho(x,y)\\,dA,\\qquad I_y=\\iint_D x^2\\rho(x,y)\\,dA,\\qquad I_0=I_x+I_y. $$\n\nEjemplo: region del primer cuadrante limitada por \\(y=x^2\\) y \\(y=1\\), con \\(\\rho(x,y)=xy\\):\n\n$$I_x=\\frac{1}{10},\\qquad I_y=\\frac{1}{16},\\qquad I_0=\\frac{13}{80}. $$\n\n## Cierre\n\nLas integrales dobles no solo miden volumen: permiten modelar acumulacion de masa y carga, y cuantificar equilibrio y resistencia al giro mediante centros de masa y momentos de inercia.\n\nEJ:: Plantee y calcule \\(m, M_x, M_y\\) para una lamina semicircular de radio \\(R\\) con densidad radial \\(\\rho(x,y)=k\\sqrt{x^2+y^2}\\).",
      topics: [
        "Coordenadas polares",
        "Jacobiano polar",
        "Masa y carga de laminas",
        "Momentos",
        "Centro de masa",
        "Momento de inercia"
      ],
      sourceFile: "Clase 13, pt 1. Integración doble en coordenadas polares.pdf + Clase 13, pt 2. Aplicaciones de las integrales dobles.pdf"
    },
    {
      title: "Integrales triples",
      description: "Definicion de integral triple en cajas rectangulares y extension a regiones generales tipo I, II y III. Se interpreta como volumen, masa o acumulacion total en solidos del espacio.",
      content:
        "## Integrales triples sobre cajas rectangulares\n\nPara una caja\n\n$$B=[a,b]\\times[c,d]\\times[r,s],$$\n\nse divide cada intervalo en subintervalos, obteniendo subcajas \\(B_{ijk}\\) con volumen \\(\\Delta V=\\Delta x\\Delta y\\Delta z\\). La suma triple de Riemann es\n\n$$S_{lmn}=\\sum_{i=1}^{l}\\sum_{j=1}^{m}\\sum_{k=1}^{n}f(x_{ijk},y_{ijk},z_{ijk})\\,\\Delta x\\Delta y\\Delta z.$$\n\nDEF:: La integral triple de \\(f\\) sobre \\(B\\) es\n\n$$\\iiint_B f(x,y,z)\\,dV=\\lim_{l,m,n\\to\\infty}S_{lmn},$$\n\nsi el limite existe.\n\nObservaciones:\n\n- \\(\\iiint_B 1\\,dV=V(B)\\).\n- Si \\(f\\) es continua, se calcula por integrales iteradas (teorema de Fubini), en cualquiera de los seis ordenes posibles.\n\nEjemplo:\n\n$$\\iiint_{[0,2]\\times[-3,0]\\times[-1,1]}(x^2+yz)\\,dV=16.$$\n\n## Integrales triples sobre regiones generales\n\nSea \\(E\\subset\\mathbb{R}^3\\) un solido acotado. La estrategia es describir \\(E\\) usando proyecciones a planos coordenados y limites variables.\n\n### Region tipo I\n\nDEF::\n\n$$E=\\{(x,y,z):(x,y)\\in D,\\ u_1(x,y)\\le z\\le u_2(x,y)\\}.$$\n\nEntonces\n\n$$\\iiint_E f\\,dV=\\iint_D\\left(\\int_{u_1(x,y)}^{u_2(x,y)}f(x,y,z)\\,dz\\right)dA.$$\n\nSi \\(D\\) es tipo I en el plano:\n\n$$\\iiint_E f\\,dV=\\int_a^b\\int_{g_1(x)}^{g_2(x)}\\int_{u_1(x,y)}^{u_2(x,y)}f\\,dz\\,dy\\,dx.$$\n\nSi \\(D\\) es tipo II:\n\n$$\\iiint_E f\\,dV=\\int_c^d\\int_{h_1(y)}^{h_2(y)}\\int_{u_1(x,y)}^{u_2(x,y)}f\\,dz\\,dx\\,dy.$$\n\nEjemplo: para el solido bajo \\(z=x+2y\\) sobre la region \\(0\\le x\\le1,\\ 0\\le y\\le x^2\\):\n\n$$\\iiint_E y\\,dV=\\int_0^1\\int_0^{x^2}\\int_0^{x+2y}y\\,dz\\,dy\\,dx=\\frac{5}{28}. $$\n\n### Region tipo II\n\nDEF::\n\n$$E=\\{(x,y,z):(y,z)\\in D,\\ u_1(y,z)\\le x\\le u_2(y,z)\\},$$\n\ny\n\n$$\\iiint_E f\\,dV=\\iint_D\\left(\\int_{u_1(y,z)}^{u_2(y,z)}f(x,y,z)\\,dx\\right)dA.$$\n\n### Region tipo III\n\nDEF::\n\n$$E=\\{(x,y,z):(x,z)\\in D,\\ u_1(x,z)\\le y\\le u_2(x,z)\\},$$\n\ny\n\n$$\\iiint_E f\\,dV=\\iint_D\\left(\\int_{u_1(x,z)}^{u_2(x,z)}f(x,y,z)\\,dy\\right)dA.$$\n\n## Cambio de orden en integrales triples\n\nAl igual que en integrales dobles, cambiar el orden puede simplificar calculos. Para\n\n$$\\int_0^1\\int_{\\sqrt{x}}^1\\int_0^{1-y}f(x,y,z)\\,dz\\,dy\\,dx,$$\n\nla region puede reescribirse con diferentes proyecciones en planos \\(xy\\), \\(yz\\) y \\(xz\\), obteniendo las otras cinco formas equivalentes de integral iterada.\n\n## Ejemplo geometrico con paraboloides\n\nPara el solido limitado por\n\n$$z=x^2+3y^2,\\qquad z=9-2x^2,$$\n\nla curva de interseccion proyectada cumple\n\n$$x^2+y^2=3,$$\n\ny el volumen puede escribirse como\n\n$$V=\\iiint_E1\\,dV=\\int_{-\\sqrt3}^{\\sqrt3}\\int_{-\\sqrt{3-x^2}}^{\\sqrt{3-x^2}}\\int_{x^2+3y^2}^{9-2x^2}1\\,dz\\,dy\\,dx=\\frac{27\\pi}{2}. $$\n\n## Aplicaciones de integrales triples\n\nSi \\(\\rho(x,y,z)\\) es densidad de masa:\n\n$$m=\\iiint_E\\rho\\,dV.$$\n\nMomentos respecto a planos coordenados:\n\n$$M_{yz}=\\iiint_Ex\\rho\\,dV,\\quad M_{xz}=\\iiint_Ey\\rho\\,dV,\\quad M_{xy}=\\iiint_Ez\\rho\\,dV.$$\n\nCentro de masa:\n\n$$\\bar x=\\frac{M_{yz}}{m},\\quad \\bar y=\\frac{M_{xz}}{m},\\quad \\bar z=\\frac{M_{xy}}{m}. $$\n\nSi \\(\\sigma(x,y,z)\\) es densidad de carga:\n\n$$Q=\\iiint_E\\sigma\\,dV.$$\n\nMomentos de inercia respecto a ejes coordenados:\n\n$$I_x=\\iiint_E(y^2+z^2)\\rho\\,dV,\\quad I_y=\\iiint_E(x^2+z^2)\\rho\\,dV,\\quad I_z=\\iiint_E(x^2+y^2)\\rho\\,dV.$$\n\nEJ:: Halle la masa y \\(I_z\\) del tetraedro \\(x,y,z\\ge0\\), \\(x+y+z\\le1\\), con densidad \\(\\rho(x,y,z)=y\\).",
      topics: [
        "Integrales triples",
        "Sumas de Riemann triples",
        "Integrales iteradas triples",
        "Regiones tipo I, II y III",
        "Cambio de orden",
        "Aplicaciones fisicas"
      ],
      sourceFile: "Clase 14. Integrales triples.pdf"
    },
    {
      title: "Integrales triples en coordenadas curvilineas",
      description: "Uso de coordenadas cilindricas y esfericas para explotar simetria y simplificar regiones y funciones. Se enfatiza el uso correcto de los factores jacobianos r y rho^2 sen(phi).",
      content:
        "## Coordenadas cilindricas\n\nUn punto \\(P=(x,y,z)\\) puede representarse como \\(P=(r,\\theta,z)\\), donde\n\n$$x=r\\cos\\theta,\\qquad y=r\\sin\\theta,\\qquad z=z,$$\n\ncon \\(r>0\\), \\(0\\le\\theta<2\\pi\\). Es la extension natural de coordenadas polares al espacio.\n\n## Integrales triples en coordenadas cilindricas\n\nSi una region tipo I se describe por\n\n$$E=\\{(x,y,z):(x,y)\\in D,\\ u_1(x,y)\\le z\\le u_2(x,y)\\},$$\n\ny su proyeccion en \\(xy\\) es polar\n\n$$D=\\{(r,\\theta):\\alpha\\le\\theta\\le\\beta,\\ h_1(\\theta)\\le r\\le h_2(\\theta)\\},$$\n\nentonces\n\n$$\\iiint_E f(x,y,z)\\,dV=\\int_\\alpha^\\beta\\int_{h_1(\\theta)}^{h_2(\\theta)}\\int_{u_1(r\\cos\\theta,r\\sin\\theta)}^{u_2(r\\cos\\theta,r\\sin\\theta)} f(r\\cos\\theta,r\\sin\\theta,z)\\,r\\,dz\\,dr\\,d\\theta.$$\n\nDEF:: En cilindricas aparece el factor jacobiano \\(r\\).\n\n### Ejemplo 1\n\n$$I=\\iiint_E(x^2+y^2+z^2)\\,dV,$$\n\ncon \\(E: x^2+y^2\\le2,\\ -2\\le z\\le3\\).\n\nEn cilindricas: \\(0\\le\\theta\\le2\\pi\\), \\(0\\le r\\le\\sqrt2\\), \\(-2\\le z\\le3\\), y \\(x^2+y^2+z^2=r^2+z^2\\).\n\n$$I=\\int_0^{2\\pi}\\int_0^{\\sqrt2}\\int_{-2}^{3}(r^2+z^2)r\\,dz\\,dr\\,d\\theta=\\frac{100\\pi}{3}. $$\n\n### Ejemplo 2 (masa con densidad radial)\n\nEl solido \\(E\\) esta dentro de \\(x^2+y^2\\le1\\), por debajo de \\(z=4\\), y por encima de \\(z=1-x^2-y^2\\).\n\nEn cilindricas:\n\n$$E=\\{(r,\\theta,z):0\\le\\theta\\le2\\pi,\\ 0\\le r\\le1,\\ 1-r^2\\le z\\le4\\}.$$\n\nSi la densidad es proporcional a la distancia al eje \\(z\\): \\(\\rho=k\\sqrt{x^2+y^2}=kr\\), entonces\n\n$$m=\\iiint_E\\rho\\,dV=k\\int_0^{2\\pi}\\int_0^1\\int_{1-r^2}^{4}r\\cdot r\\,dz\\,dr\\,d\\theta=\\frac{12\\pi k}{5}. $$\n\nEJ:: Para \\(E=\\{x^2+y^2\\le4,\\ \\sqrt{x^2+y^2}\\le z\\le\\sqrt{3(x^2+y^2)}\\}\\), evalúe \\(\\iiint_E z\\sqrt{x^2+y^2}\\,dV\\).\n\n## Coordenadas esfericas\n\nLas coordenadas esfericas \\( (\\rho,\\theta,\\phi) \\) satisfacen\n\n$$x=\\rho\\sin\\phi\\cos\\theta,\\quad y=\\rho\\sin\\phi\\sin\\theta,\\quad z=\\rho\\cos\\phi,$$\n\ncon\n\n$$\\rho\\ge0,\\quad 0\\le\\theta\\le2\\pi,\\quad 0\\le\\phi\\le\\pi,$$\n\ny\n\n$$\\rho^2=x^2+y^2+z^2.$$\n\nSon especialmente utiles para esferas y conos con vertice en el origen.\n\n## Integrales triples en coordenadas esfericas\n\nSi\n\n$$E=\\{(\\rho,\\theta,\\phi):\\alpha\\le\\theta\\le\\beta,\\ c\\le\\phi\\le d,\\ g_1(\\theta,\\phi)\\le\\rho\\le g_2(\\theta,\\phi)\\},$$\n\nentonces\n\n$$\\iiint_E f(x,y,z)\\,dV=\\int_\\alpha^\\beta\\int_c^d\\int_{g_1}^{g_2} f(\\rho\\sin\\phi\\cos\\theta,\\rho\\sin\\phi\\sin\\theta,\\rho\\cos\\phi)\\,\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta.$$\n\nDEF:: El factor jacobiano es \\(\\rho^2\\sin\\phi\\).\n\n### Ejemplo 1 (capa esferica)\n\n$$I=\\iiint_E\\frac{dV}{(x^2+y^2+z^2)^{3/2}},$$\n\ndonde \\(E\\) esta entre \\(\\rho=a\\) y \\(\\rho=b\\), \\(0<a<b\\).\n\nComo \\((x^2+y^2+z^2)^{3/2}=\\rho^3\\), queda\n\n$$I=\\int_0^{2\\pi}\\int_0^{\\pi}\\int_a^b\\frac{1}{\\rho^3}\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=4\\pi\\ln\\left(\\frac{b}{a}\\right).$$\n\n### Ejemplo 2 (cono y esfera desplazada)\n\nSolido encima del cono \\(z=\\sqrt{x^2+y^2}\\) y debajo de la esfera \\(x^2+y^2+z^2=z\\).\n\nLa esfera se escribe \\(\\rho=\\cos\\phi\\), y el cono da \\(\\phi=\\pi/4\\). Por tanto\n\n$$E=\\{(\\rho,\\theta,\\phi):0\\le\\theta\\le2\\pi,\\ 0\\le\\phi\\le\\pi/4,\\ 0\\le\\rho\\le\\cos\\phi\\}.$$\n\nEl volumen:\n\n$$V=\\iiint_E dV=\\int_0^{2\\pi}\\int_0^{\\pi/4}\\int_0^{\\cos\\phi}\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=\\frac{\\pi}{8}. $$\n\n## Cierre\n\nEn problemas con simetria circular se prefieren cilindricas; en problemas con simetria respecto al origen o con esferas/conos, las esfericas suelen simplificar radicalmente limites y calculos.",
      topics: [
        "Coordenadas cilindricas",
        "Coordenadas esfericas",
        "Jacobiano cilindrico",
        "Jacobiano esferico",
        "Simetria de regiones",
        "Integracion en coordenadas curvilineas"
      ],
      sourceFile: "Clase 15. Integrales triples en coordenadas curvilíneas.pdf"
    },
    {
      title: "Cambio de variables en integracion multiple",
      description: "Teoria general del cambio de variable mediante transformaciones T(u,v) y el jacobiano absoluto. Se practica como convertir regiones complicadas en regiones simples para integrar de forma eficiente.",
      content:
        "## Cambio de variable en integrales multiples\n\nUn cambio de coordenadas sirve para simplificar regiones y funciones al integrar.\n\nDEF:: En dos variables, si (x, y) = T(u, v), el jacobiano J(u, v) mide el factor local de cambio de area.\n\nTeorema en dobles: integral en R = integral en S de f(T(u,v)) por valor absoluto de J.\n\nIdea clave: dA = |J| du dv.\n\nEjemplos tipicos:\n- Cambios lineales que llevan paralelogramos a rectangulos.\n- Coordenadas polares, donde el factor jacobiano es r.\n\n## Cambio de variable en triples\n\nSi x = g(u,v,w), y = h(u,v,w), z = k(u,v,w), se usa el jacobiano 3D para convertir dV.\n\nTeorema en triples: integral en R = integral en S de f(g,h,k) por |J(u,v,w)|.\n\nAplicacion clasica: elipsoide transformado a esfera unitaria con un cambio lineal.\n\nEJ:: Elija un cambio que transforme una region complicada en una region rectangular y compare la dificultad antes y despues.",
      topics: [
        "Cambio de variables en dobles",
        "Jacobiano bidimensional",
        "Transformaciones del plano",
        "Cambio de variables en triples",
        "Jacobiano tridimensional",
        "Transformaciones del espacio"
      ],
      sourceFile: "Clase 16. Cambio de variables en integración múltiple.pdf"
    },
    {
      title: "Funciones vectoriales y curvas parametricas en el espacio",
      description: "Introduccion a funciones vectoriales r(t) como descripcion de curvas en R2 y R3. Incluye derivada vectorial, recta tangente, movimiento de particulas y longitud de arco.",
      content:
        "## Curvas parametricas\n\nUna funcion vectorial usa un parametro t para describir una curva en R2 o R3.\n\nForma general en R3: r(t) = (f(t), g(t), h(t)).\n\nEjemplos clasicos:\n- Circulo unitario: r(t) = (cos t, sen t).\n- Cicloide: r(t) = (t - sen t, 1 - cos t).\n- Helice: r(t) = (cos t, sen t, t).\n- Segmento entre Pi y Pf: r(t) = Pi + t(Pf - Pi), 0 <= t <= 1.\n\n## Operaciones\n\n- Limite y continuidad: se revisan componente a componente.\n- Derivada: r'(t) = (f'(t), g'(t), h'(t)).\n- Recta tangente en t0: L(s) = r(t0) + s r'(t0).\n- Integral definida: se integra componente a componente.\n\n## Interpretacion fisica\n\nSi r(t) es posicion:\n- v(t) = r'(t): velocidad.\n- rapidez = norma de v(t).\n- a(t) = r''(t): aceleracion.\n\n## Longitud de arco\n\nPara una curva suave en [a,b]:\n\nL = integral de a a b de norma(r'(t)) dt.\n\nEn R3: norma(r'(t)) = raiz de (f'(t)^2 + g'(t)^2 + h'(t)^2).\n\nEjemplo de helice r(t) = (cos t, sen t, t), 0 <= t <= 4pi:\nla rapidez es constante sqrt(2), y la longitud resulta 4 sqrt(2) pi.",
      topics: [
        "Funciones vectoriales",
        "Curvas parametricas",
        "Derivada vectorial",
        "Recta tangente",
        "Movimiento de particulas",
        "Longitud de arco"
      ],
      sourceFile: "Clase 17. Funciones vectoriales y curvas paramétricas en el espacio.pdf"
    },
    {
      title: "Integrales de linea de campos escalares",
      description: "Definicion de integral de linea para campos escalares sobre curvas suaves y suaves por tramos. Se interpreta en problemas de masa de alambres, areas de paredes y acumulacion sobre trayectorias.",
      content:
        "## Campos escalares e integral de linea\n\nUn campo escalar asigna un numero real a cada punto del espacio.\n\nSi C es una curva parametrizada por r(t), a <= t <= b, la integral de linea escalar se calcula con:\n\nintegral_C f ds = integral_a^b f(r(t)) * norma(r'(t)) dt.\n\n## Interpretaciones\n\n- Si f = 1, la integral da la longitud de la curva.\n- Si f >= 0 en una curva del plano, puede interpretarse como area de una pared vertical.\n- Si f es densidad lineal de un alambre, la integral da su masa.\n\nCentro de masa de alambre:\n- x_bar = (1/m) integral_C x rho ds\n- y_bar = (1/m) integral_C y rho ds\n\n## Ejemplos\n\n1) Cuarto de circunferencia de radio 2 con rho(x,y)=x+y:\n- masa m = 8\n- centro de masa: x_bar = y_bar = (2 + pi)/4\n\n2) Segmento de (1,0,1) a (0,3,6), integrando f(x,y,z)=x y^2 z:\n- resultado: 3 sqrt(35).\n\nEJ:: Parametrice un arco semicircular y calcule una integral escalar con ds.",
      topics: [
        "Campos escalares",
        "Integral de linea escalar",
        "Diferencial de arco",
        "Masa de alambre",
        "Centro de masa lineal",
        "Curvas suaves por tramos"
      ],
      sourceFile: "Clase 18. Integrales de línea de campos escalares.pdf"
    },
    {
      title: "Integrales de linea de campos vectoriales",
      description: "Integral de linea de campos vectoriales y su interpretacion como trabajo mecanico. Se trabaja orientacion de curvas, dependencia del sentido de recorrido y descomposicion por tramos.",
      content:
        "## Campos vectoriales e integral de linea\n\nUn campo vectorial asigna un vector a cada punto del plano o del espacio.\n\nPara una curva C parametrizada por r(t), a <= t <= b:\n\nintegral_C F . dr = integral_a^b F(r(t)) . r'(t) dt\n\nTambien se escribe como integral_C P dx + Q dy + R dz.\n\nInterpretacion principal: trabajo realizado por un campo de fuerzas sobre una trayectoria.\n\n## Propiedades\n\n- Si la curva es por tramos, la integral total es suma de tramos.\n- La orientacion importa: al invertir el sentido, cambia el signo del resultado.\n\n## Resultados de referencia (de la clase)\n\n- Ejemplo espacial con F=(x^2,xy,z^2) y r(t)=(sen t, cos t, t^2): resultado pi^6/192.\n- Ejemplo en parabola y=x^2 con F=(x sen y, y): resultado (15 + cos 1 - cos 4)/2.\n- Ejemplo en segmento de (1,0,1) a (0,3,6) con F=(y,z,1): resultado 14; en sentido contrario, -14.",
      topics: [
        "Campos vectoriales",
        "Integral de linea vectorial",
        "Trabajo mecanico",
        "Orientacion de curvas",
        "Curvas por tramos",
        "Notacion diferencial"
      ],
      sourceFile: "Clase 19. Integrales de línea de campos vectoriales.pdf"
    },
    {
      title: "Teorema fundamental de las integrales de linea",
      description: "Caracterizacion de campos conservativos mediante potencial escalar f y evaluacion de integrales por diferencia de potencial. Se conecta independencia de trayectoria con trabajo nulo en curvas cerradas.",
      content:
        "## Teorema fundamental de integrales de linea\n\nDEF:: Un campo F es conservativo si existe una funcion potencial f tal que grad f = F.\n\nSi C es una curva que va de A a B y F = grad f, entonces:\n\nintegral_C F . dr = f(B) - f(A).\n\nConsecuencias:\n- La integral no depende de la trayectoria, solo de extremos.\n- En una curva cerrada, la integral vale 0.\n\n## Criterio en R2\n\nEn una region simplemente conexa, si F=(P,Q) con derivadas continuas y Py = Qx, entonces F es conservativo.\n\n## Ejemplos de la clase\n\n- F=(3+2xy, x^2-3y^2) es conservativo; potencial: f=3x + x^2 y - y^3.\n- Integral sobre la curva dada: e^(3pi) + 1.\n\n- F=(2xyz+sen x, x^2 z, x^2 y) es conservativo; potencial: f=x^2 y z - cos x.\n- Entre (1,3,-1) y (0,1,2): resultado 2 + cos(1).\n\nEJ:: Verifique un campo propuesto construyendo su potencial y evaluando por extremos.",
      topics: [
        "Campos conservativos",
        "Funcion potencial",
        "Teorema fundamental",
        "Independencia de trayectoria",
        "Curvas cerradas",
        "Criterio en R2"
      ],
      sourceFile: "Clase 20. Teorema fundamental de las integrales de línea.pdf"
    },
    {
      title: "Teorema de Green",
      description: "Relacion central entre integrales de linea sobre frontera cerrada e integrales dobles sobre la region interior. Se usa para calcular circulacion, flujo plano y areas por integracion en borde.",
      topics: ["Teorema de Green", "Circulacion", "Flujo plano", "Orientacion positiva", "Area por contorno", "Regiones simplemente conexas"],
      sourceFile: "Clase 21. Teorema de Green.pdf"
    },
    {
      title: "Superficies parametricas y area de una superficie",
      description: "Parametrizacion de superficies en R3 mediante r(u,v), estudio de vectores tangentes y normales, y calculo de area superficial. Se aplica a esferas, cilindros, conos y graficas z=f(x,y).",
      content:
        "## Superficies parametricas\n\nUna superficie en R3 se describe con dos parametros:\n\nr(u,v) = (x(u,v), y(u,v), z(u,v)).\n\nEjemplos:\n- Esfera\n- Cilindro\n- Cono\n\n## Curvas reticulares y normal\n\nAl fijar un parametro se obtienen curvas sobre la superficie.\n\nVectores tangentes: ru y rv.\n\nVector normal: ru x rv.\n\nLa superficie es suave si ru x rv no es cero.\n\n## Area superficial\n\nFormula general:\n\nA(S) = integral doble en D de norma(ru x rv) du dv.\n\nResultados clasicos de la clase:\n- Area de esfera radio a: 4 pi a^2.\n- Area lateral del cono z=sqrt(x^2+y^2), 0<=z<=2: 4 pi sqrt(2).\n\nCaso grafica z=f(x,y):\n\nA(S) = integral doble en D de sqrt(1 + fx^2 + fy^2) dx dy.\n\nEjemplo: paraboloide z=x^2+y^2 bajo z=4, usando polares.",
      topics: [
        "Superficies parametricas",
        "Curvas reticulares",
        "Vectores tangentes",
        "Vector normal",
        "Area de superficie",
        "Superficies graficas"
      ],
      sourceFile: "Clase 22. Superficies paramétricas y Área de una superficie.pdf"
    },
    {
      title: "Integrales de superficie",
      description: "Integrales de superficie para campos escalares (masa, area ponderada) y para campos vectoriales (flujo). Se enfatiza orientacion, eleccion de normal y descomposicion de superficies compuestas.",
      content:
        "## Integrales de superficie: dos casos\n\nCaso 1 (campo escalar):\n\nintegral doble sobre S de f dS = integral doble sobre D de f(r(u,v)) * norma(ru x rv) du dv.\n\nAplicaciones:\n- Area (si f=1).\n- Masa de lamina (si f es densidad).\n- Centro de masa de superficie.\n\nCaso 2 (campo vectorial, flujo):\n\nintegral doble sobre S de F . dS = integral doble sobre D de F(r(u,v)) . (ru x rv) du dv.\n\nLa orientacion es clave: cambiar la normal cambia el signo del flujo.\n\n## Ideas practicas\n\n- Leer muy bien si S es solo una cara o toda la frontera de un solido.\n- Si la superficie tiene varias partes, sumar integrales por piezas.\n- Elegir parametrizacion que simplifique limites y normal.",
      topics: [
        "Integral de superficie escalar",
        "Masa superficial",
        "Integral de superficie vectorial",
        "Flujo",
        "Orientacion de superficies",
        "Normales unitarias"
      ],
      sourceFile: "Clase 23. Integrales de superficie.pdf"
    },
    {
      title: "Teorema de Stokes",
      description: "Conexion entre circulacion en la frontera de una superficie y flujo del rotacional a traves de esa superficie. Permite reemplazar una integral complicada por otra equivalente mas simple.",
      content:
        "## Rotacional y teorema de Stokes\n\nEl rotacional de F en R3 mide tendencia local al giro del campo.\n\nSi F = grad f (campo conservativo), entonces rot F = 0.\n\nEn dominio simplemente conexo, bajo continuidad suficiente, tambien vale el recíproco: rot F = 0 implica que F es conservativo.\n\n## Teorema de Stokes\n\nCirculacion en la frontera C de una superficie S = flujo del rotacional a traves de S:\n\nintegral_C F . dr = integral doble_S (rot F) . dS.\n\nPuntos clave:\n- S debe estar orientada.\n- C hereda orientacion por regla de mano derecha.\n- Se puede elegir cualquier superficie con la misma frontera y orientacion compatible.\n\n## Aplicaciones tipicas\n\n- Cambiar una integral de linea dificil por una integral de superficie mas simple.\n- Cambiar una superficie complicada por otra equivalente con la misma frontera.",
      topics: [
        "Rotacional",
        "Campos irrotacionales",
        "Teorema de Stokes",
        "Orientacion borde-superficie",
        "Circulacion",
        "Flujo del rotacional"
      ],
      sourceFile: "Clase 24. Teorema de Stokes.pdf"
    },
    {
      title: "Teorema de la divergencia",
      description: "Teorema de Gauss que relaciona flujo total saliente por una superficie cerrada con la integral triple de la divergencia en el volumen interior. Se aplica para evitar integrar cara por cara en solidos complejos.",
      content:
        "## Divergencia y teorema de Gauss\n\nDEF:: Para F=(P,Q,R),\n\ndiv F = dP/dx + dQ/dy + dR/dz.\n\nLa divergencia es escalar y mide fuente/sumidero local del flujo.\n\n## Teorema de la divergencia\n\nSi S es la frontera cerrada de un solido E, con normal exterior, entonces:\n\nintegral doble sobre S de F . dS = integral triple sobre E de div F dV.\n\nInterpretacion: flujo total saliente por la frontera = acumulacion interna de divergencia.\n\n## Uso practico\n\n- Evita integrar cara por cara en superficies cerradas complicadas.\n- Si la superficie es abierta, primero se cierra agregando una tapa y luego se corrige restando el flujo de esa tapa.\n\n## Ejemplos de la clase\n\n- Solido con cilindro parabólico y planos: flujo = 184/35.\n- Semiesfera superior cerrada con disco: flujo final = 13pi/20.\n- Region en cilindricas: flujo = 17pi/180.",
      topics: [
        "Divergencia",
        "Fuente y sumidero",
        "Teorema de Gauss",
        "Flujo en superficies cerradas",
        "Cierre de superficies abiertas",
        "Integracion en coordenadas curvilineas"
      ],
      sourceFile: "Clase 25. Teorema de la Divergencia.pdf"
    }
  ]);

  const classModulesWithImage = classModules.map(function (moduleItem, index) {
    const num = String(index + 1).padStart(2, "0");
    const encodedTitle = encodeURIComponent(moduleItem.subtitle || moduleItem.title || ("Clase " + num));
    const encodedSource = encodeURIComponent(moduleItem.sourceFile || "");
    return Object.assign({}, moduleItem, {
      image: "generated:class-" + num + "|" + encodedTitle + "|" + encodedSource
    });
  });

  return [
    {
      id: "sobre-el-curso",
      title: "Sobre el Curso",
      subtitle: "Panorama completo de Calculo multivariable",
      description: "Este curso desarrolla de forma progresiva el calculo en varias variables, empezando por funciones de varias variables, dominio y graficas, y avanzando hacia derivadas parciales, optimizacion, integrales multiples y teoremas fundamentales del calculo vectorial.",
      content:
        "La ruta del curso esta organizada en tres bloques principales. En el primero se construyen las bases del calculo diferencial multivariable: funciones de varias variables, limites, continuidad, derivadas parciales, diferenciabilidad, regla de la cadena, gradiente y optimizacion. En el segundo bloque se trabaja calculo integral en dos y tres variables: integrales dobles y triples, cambio de variable y coordenadas especiales para resolver regiones complejas. En el tercer bloque se introducen ideas de calculo vectorial: funciones vectoriales, integrales de linea y de superficie, junto con los teoremas de Green, Stokes y Gauss.\n\nCada clase fue estructurada para conservar fidelidad con el contenido fuente de los PDF, priorizando definiciones claras y desarrollo en parrafos con contexto y ejemplos. La recomendacion es recorrer las clases en orden, porque cada tema reutiliza resultados anteriores y la comprension mejora cuando se sigue la secuencia completa.",
      topics: ["Bloque diferencial", "Bloque integral", "Bloque vectorial"],
      sourceFile: "Compilado general de Clase 01 a Clase 25"
    }
  ].concat(classModulesWithImage);
}

function createMetodosNumericosModules() {
  const classModules = createClassModules([
    {
      title: "Metodo de biseccion y metodo de punto fijo",
      description: "Fundamentos de convergencia, error absoluto y relativo, metodo de biseccion, metodo de punto fijo y su relacion con el problema de raices f(x)=0.",
      content:
        "## Contexto del curso\n\nEn metodos numericos buscamos aproximar soluciones cuando no es practico obtenerlas de forma exacta. En esta primera clase se estudia el problema de encontrar raices de una ecuacion \\(f(x)=0\\), es decir, valores \\(p\\) tales que \\(f(p)=0\\).\n\n## Sucesiones de aproximacion y convergencia\n\nLa idea central es construir una sucesion \\(\{x_n\}\\) que converja a la raiz \\(p\\). Formalmente, \\(x_n\to x\\) si para todo \\(\varepsilon>0\\) existe \\(N(\varepsilon)\\) tal que \\(|x_n-x|<\varepsilon\\) para todo \\(n>N(\varepsilon)\\). Equivalentemente, \\(x_n\to x\\) si y solo si \\(|x_n-x|\to0\\).\n\nDEF:: Si \\(p^*\\) aproxima a \\(p\\), el error absoluto es \\(|p^*-p|\\) y el error relativo es \\(|p^*-p|/|p|\\) (cuando \\(p\ne0\\)).\n\nDEF:: \\(p^*\\) aproxima a \\(p\\) con \\(t\\) cifras significativas si \\(|p^*-p|/|p|<5\times10^{-t}\\).\n\n## Metodo de biseccion\n\nSi \\(f\\) es continua en \\([a,b]\\) y \\(f(a)f(b)<0\\), por el Teorema del Valor Intermedio existe al menos una raiz en \\((a,b)\\). El metodo de biseccion construye intervalos cada vez mas pequenos usando el punto medio:\n\n$$p_n=\frac{a_n+b_n}{2}. $$\n\nEn cada iteracion:\n\n- Si \\(f(p_n)=0\\), se encontro la raiz.\n- Si \\(f(a_n)f(p_n)<0\\), se toma el nuevo intervalo \\([a_n,p_n]\\).\n- Si \\(f(a_n)f(p_n)>0\\), se toma el nuevo intervalo \\([p_n,b_n]\\).\n\nDEF:: Para biseccion, el error queda acotado por\n\n$$|p_n-p|\\le\frac{b-a}{2^n},\\quad n\\ge1.$$\n\nEsto garantiza convergencia, aunque puede ser lenta.\n\n## Ejemplo guia de biseccion\n\nSe estudio \\(f(x)=(x-2)^2-\\ln(x)\\) en \\([1,2]\\). Como \\(f(1)>0\\) y \\(f(2)<0\\), existe al menos una raiz en ese intervalo. Las primeras aproximaciones por biseccion muestran convergencia hacia \\(p\\approx1.41\\).\n\nEJ:: Complete la tabla de iteraciones hasta \\(n=6\\) y compare \\(|f(p_5)|\\) con \\(|f(p_6)|\\).\n\n## Criterios de parada en biseccion\n\nCon tolerancia \\(tol\\), se suele detener cuando:\n\n- \\(|f(p_n)|<tol\\), o\n- \\((b-a)/2^n<tol\\).\n\n## Metodo de punto fijo\n\nTambien se puede reformular el problema como \\(x=g(x)\\). Se genera la iteracion\n\n$$p_{n+1}=g(p_n),\\quad n\\ge0.$$\n\nSi \\(g\\in C[a,b]\\), \\(g([a,b])\\subseteq[a,b]\\), y existe \\(0<k<1\\) con \\(|g'(x)|\\le k\\) en \\((a,b)\\), entonces hay un unico punto fijo y la iteracion converge para cualquier \\(p_0\\in[a,b]\\).\n\nDEF:: Una cota util de error en punto fijo es\n\n$$|p_n-p|\\le k^n\\max\{b-p_0,\ p_0-a\}. $$\n\n## Ejemplo guia de punto fijo\n\nPara \\(g(x)=\\ln\!\\left(\frac{5e^x}{x^2-1}\right)\\) en \\([2,3]\\), se verifica \\(|g'(x)|\\le1/3\\), por lo que existe un unico punto fijo. Con \\(p_0=2.3\\), una estimacion da alrededor de 11 iteraciones para asegurar error menor que \\(10^{-5}\\).\n\n## Criterios de parada en punto fijo\n\nCon tolerancia \\(tol\\) y maximo \\(n_{max}\\), se detiene cuando:\n\n- \\(|p_{n+1}-p_n|<tol\\), o\n- \\(n>n_{max}\\).\n\n## Conexion entre raices y puntos fijos\n\nLos problemas \\(f(x)=0\\) y \\(x=g(x)\\) son equivalentes si se define \\(f(x)=g(x)-x\\). Tambien, desde \\(f(x)=0\\) se pueden construir funciones de iteracion \\(g\\), pero no todas garantizan convergencia: hay que verificar las hipotesis del teorema de existencia y unicidad del punto fijo.\n\n## Cierre de la clase\n\nBiseccion ofrece robustez y convergencia garantizada bajo cambio de signo. Punto fijo puede ser mas rapido y simple de iterar, pero exige revisar condiciones sobre \\(g\\) y \\(g'\\). En las siguientes clases se compararan estos metodos con otras tecnicas de aproximacion de raices.",
      topics: [
        "Convergencia de sucesiones",
        "Error absoluto y relativo",
        "Cifras significativas",
        "Teorema del valor intermedio",
        "Metodo de biseccion",
        "Metodo de punto fijo",
        "Criterios de parada",
        "Relacion f(x)=0 y x=g(x)"
      ],
      sourceFile: "MN1_BiseccionPuntoFijo.pdf"
    },
    {
      title: "Metodo de Newton y orden de convergencia",
      description: "Orden de convergencia, teorema de Taylor, metodo de Newton y variantes para ceros multiples: Newton acelerado y Newton modificado.",
      content:
        "## Orden de convergencia\n\nEn esta clase se formaliza que significa converger lento o rapido para una sucesion \\(\{p_n\}\\) que converge a \\(p\\).\n\nDEF:: Si existen \\(\\lambda>0\\) y \\(\\alpha>0\\) tales que\n\n$$\\lim_{n\\to\\infty}\\frac{|p_{n+1}-p|}{|p_n-p|^\\alpha}=\\lambda,$$\n\nentonces la sucesion tiene orden de convergencia \\(\\alpha\\) y constante asintotica \\(\\lambda\\).\n\nUna forma equivalente es que existe \\(C>0\\) con\n\n$$|p-p_{n+1}|\\le C|p-p_n|^\\alpha. $$\n\nSi \\(\\alpha=1\\), la convergencia es lineal; si \\(\\alpha=2\\), es cuadratica.\n\n## Recordatorio de Taylor\n\nEl teorema de Taylor permite aproximar funciones suaves por polinomios alrededor de un punto \\(x_0\\):\n\n$$f(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+\\frac{f^{(n+1)}(\\beta(x))}{(n+1)!}(x-x_0)^{n+1}. $$\n\nEn la practica, cuando \\(x\\) esta cerca de \\(x_0\\), el residuo es pequeno y el polinomio de Taylor da una aproximacion util.\n\nEJ:: Halle la expansion de Taylor de \\(f(x)=e^{2x}-x\\) alrededor de \\(x_0=0\\) y compare \\(p_1, p_2, p_3\\).\n\n## Metodo de Newton\n\nA partir de la recta tangente en \\((p_n, f(p_n))\\), la iteracion de Newton es\n\n$$p_{n+1}=p_n-\\frac{f(p_n)}{f'(p_n)},\\quad n=0,1,2,\\dots$$\n\nEs un caso particular de punto fijo con\n\n$$g(x)=x-\\frac{f(x)}{f'(x)}. $$\n\nSi \\(f\\in C^2[a,b]\\), \\(f(p)=0\\) y \\(f'(p)\\ne0\\), existe un entorno de \\(p\\) donde la iteracion converge para aproximaciones iniciales suficientemente cercanas.\n\n## Ejemplos de Newton\n\n- Para \\(f(x)=e^{-x}-7x+8\\), con \\(p_0=1.1\\), la convergencia es rapida y en pocas iteraciones se obtiene \\(p\\approx1.1864709668\\).\n- Para \\(f(x)=e^x-3x^2\\) en \\([3,5]\\), se verifica unicidad de raiz y Newton converge a \\(p\\approx3.7330790286\\).\n\nDEF:: Criterios de parada usuales para Newton: detener cuando \\(|f(p_n)|<\\epsilon\\), o \\(|p_{n+1}-p_n|<tol\\), o \\(n>n_{max}\\).\n\n## Ceros simples y ceros multiples\n\nDEF:: \\(p\\) es cero de multiplicidad \\(m\\) si\n\n$$f(x)=(x-p)^m q(x),\\quad x\\ne p,\\quad \\lim_{x\\to p} q(x)\\ne0. $$\n\nCaracterizacion equivalente:\n\n$$f(p)=f'(p)=\\cdots=f^{(m-1)}(p)=0,\\quad f^{(m)}(p)\\ne0. $$\n\nPara ceros simples, Newton converge cuadraticamente. Para ceros multiples, Newton converge linealmente.\n\n## Newton acelerado y Newton modificado\n\nSi el cero tiene multiplicidad \\(m\\ge2\\), se usan variantes que recuperan convergencia cuadratica:\n\n- Newton acelerado:\n$$p_{n+1}=p_n-m\\frac{f(p_n)}{f'(p_n)}. $$\n\n- Newton modificado:\n$$p_{n+1}=p_n-\\frac{f(p_n)f'(p_n)}{[f'(p_n)]^2-f(p_n)f''(p_n)}. $$\n\nEl modificado no requiere conocer \\(m\\), pero involucra segunda derivada y expresiones mas largas.\n\n## Casos comparativos de la clase\n\nEn los ejemplos numericos de la semana, para funciones con ceros multiples se observa que:\n\n- Newton clasico requiere muchas iteraciones (convergencia lineal).\n- Newton acelerado y modificado llegan en pocas iteraciones (convergencia cuadratica).\n\nEJ:: Compare para una misma funcion y mismo \\(p_0\\) el numero de iteraciones de Newton, Newton acelerado y Newton modificado.\n\n## Practica en MATLAB\n\nLa guia incluye ejercicios para identificar ceros simples/multiples desde graficas, y luego aproximarlos con las rutinas `newton`, `newtonMod` y `newtonAcelerado`, contrastando error absoluto, error relativo aproximado y numero de iteraciones.\n\n## Cierre de Semana 02\n\nLa idea central es que no basta con converger: interesa con que orden converge el metodo. Newton es muy veloz en ceros simples, pero para ceros multiples conviene usar variantes aceleradas para recuperar eficiencia.",
      topics: [
        "Orden de convergencia",
        "Convergencia lineal y cuadratica",
        "Teorema de Taylor",
        "Metodo de Newton",
        "Criterios de parada",
        "Multiplicidad de ceros",
        "Newton acelerado",
        "Newton modificado"
      ],
      sourceFile: "MN2_NewtonExtensionesConvergencia.pdf"
    },
    {
      title: "Metodos iterativos para sistemas de ecuaciones lineales",
      description: "Formulacion x = T x + c, normas vectoriales y matriciales, criterio de radio espectral, metodo de Jacobi y metodo de Gauss-Seidel.",
      content:
        "## Contexto de la semana\n\nEn problemas de ingenieria y ciencias, al discretizar ecuaciones diferenciales se llega con frecuencia a sistemas lineales grandes de la forma A x = b. Cuando la dimension n es alta, los metodos directos pueden ser costosos en tiempo y memoria, por eso se estudian metodos iterativos.\n\n## De A x = b a un problema de punto fijo\n\nLa idea es reescribir el sistema como\n\n$$x = T x + c,$$\n\npara generar una sucesion\n\n$$x^{(k+1)} = T x^{(k)} + c, \\quad k = 0,1,2,\\dots$$\n\ncon una aproximacion inicial x^(0). Aqui T es la matriz de iteracion y c es el vector asociado.\n\n## Normas vectoriales y matriciales\n\nDEF:: Una norma vectorial cumple positividad, separacion, homogeneidad y desigualdad triangular. En R^n se usan comunmente:\n\n- norma 1: suma de valores absolutos,\n- norma 2: euclideana,\n- norma infinito: maximo valor absoluto por componente.\n\nDEF:: Una norma matricial agrega, ademas, la propiedad submultiplicativa:\n\n$$\\|A B\\| \\le \\|A\\| \\|B\\|.$$\n\nEn particular se usan norma 1 matricial (maximo suma de columnas), norma infinito matricial (maximo suma de filas) y norma 2 matricial (espectral).\n\n## Espectro y radio espectral\n\nDEF:: El espectro de A es el conjunto de sus autovalores sigma(A), y su radio espectral es\n\n$$\\rho(A) = \\max_{\\lambda \\in \\sigma(A)} |\\lambda|.$$\n\nEste numero es clave para convergencia de iteraciones lineales.\n\n## Condicion de convergencia\n\nA partir de\n\n$$x^{(k)} - x = T^k (x^{(0)} - x),$$\n\nse obtiene una cota del error\n\n$$\\|x^{(k)}-x\\| \\le \\|T\\|^k \\|x^{(0)}-x\\|.$$\n\nTeorema central: la iteracion converge para toda x^(0) si y solo si rho(T) < 1.\n\nCorolario practico: si existe una norma inducida con ||T|| < 1, entonces tambien hay convergencia y se tiene cota de error.\n\n## Metodo de Jacobi\n\nPartiendo de A = D - L - U, la iteracion de Jacobi es\n\n$$x^{(k+1)} = T_J x^{(k)} + c_J,$$\n\ncon\n\n$$T_J = D^{-1}(L+U), \\quad c_J = D^{-1} b.$$\n\nEn forma escalar, cada componente nueva usa solo valores de la iteracion anterior.\n\n## Metodo de Gauss-Seidel\n\nCon la misma descomposicion A = D - L - U, la iteracion de Gauss-Seidel es\n\n$$x^{(k+1)} = T_{GS} x^{(k)} + c_{GS},$$\n\ncon\n\n$$T_{GS} = (D-L)^{-1}U, \\quad c_{GS} = (D-L)^{-1} b.$$\n\nEn forma escalar, cada componente nueva reutiliza inmediatamente valores ya actualizados dentro de la misma iteracion, por eso suele acelerar frente a Jacobi.\n\n## Residual y criterios de parada\n\nDEF:: Para una aproximacion x*, el residual es\n\n$$r = A x^* - b.$$\n\nUna aproximacion es mejor cuando ||r|| es pequeno.\n\nCriterios de parada usuales con tolerancias tol, delta y tope nmax:\n\n- ||r^(k)|| < tol,\n- ||x^(k) - x^(k-1)|| < delta,\n- k > nmax.\n\n## Dominancia diagonal estricta\n\nDEF:: A es estrictamente diagonal dominante por filas si\n\n$$|a_{ii}| > \\sum_{j\\ne i}|a_{ij}|, \\quad i=1,\\dots,n.$$\n\nTeorema: si A es estrictamente diagonal dominante por filas, entonces Jacobi y Gauss-Seidel convergen para toda aproximacion inicial.\n\n## Lectura de resultados numericos\n\nEn los ejemplos de la guia, ambos metodos pueden converger cuando rho(T) < 1, pero Gauss-Seidel suele requerir menos iteraciones por usar informacion mas reciente en cada paso. En sistemas grandes (por ejemplo matrices de Poisson), esta diferencia en iteraciones se vuelve relevante.\n\nEJ:: Para un sistema dado, construya T_J y T_GS, estime rho(T_J) y rho(T_GS), y compare experimentalmente cual metodo llega primero al criterio delta.\n\n## Cierre de la clase\n\nLa idea principal de la semana es separar dos preguntas: (1) si el metodo converge, y (2) que tan rapido converge. La primera se decide teoricamente con rho(T) o con cotas de norma; la segunda se evalua comparando iteraciones y residual en la practica computacional.",
      topics: [
        "Sistemas lineales A x = b",
        "Iteracion x = T x + c",
        "Normas vectoriales y matriciales",
        "Autovalores y radio espectral",
        "Metodo de Jacobi",
        "Metodo de Gauss-Seidel",
        "Residual y criterios de parada",
        "Dominancia diagonal estricta"
      ],
      sourceFile: "MN3_SistemasEcuaciones_JacobiGaussSeidelv2.pdf"
    },
    {
      title: "S.O.R. y sistemas no lineales F(x) = 0",
      description: "Metodo de relajacion S.O.R. para sistemas lineales y extension de Newton a sistemas no lineales mediante Jacobiana.",
      content:
        "## Metodo de relajacion (S.O.R.)\n\nHasta ahora la rapidez de convergencia de una iteracion lineal\n\n$$x^{(k+1)} = T x^{(k)} + c$$\n\nestaba asociada a \\rho(T). El metodo S.O.R. introduce un parametro \\omega>0 para acelerar la reduccion del residual\n\n$$r^{(k)} = A x^{(k)} - b.$$\n\nParte de Gauss-Seidel y ajusta cada componente con relajacion:\n\n$$x_i^{(k+1)}=(1-\\omega)x_i^{(k)}+\\omega\\left(\\frac{b_i}{a_{ii}}-\\frac{1}{a_{ii}}\\sum_{j<i}a_{ij}x_j^{(k+1)}-\\frac{1}{a_{ii}}\\sum_{j>i}a_{ij}x_j^{(k)}\\right).$$\n\n## Interpretacion de \\omega\n\n- Si \\0<\\omega<1: subrelajacion.\n- Si \\omega=1: Gauss-Seidel.\n- Si \\omega>1: sobrerrelajacion.\n\nEn forma matricial, con A = D - L - U:\n\n$$T_\\omega=(D-\\omega L)^{-1}[(1-\\omega)D+\\omega U],\\quad c_\\omega=\\omega(D-\\omega L)^{-1}b,$$\n\n$$x^{(k+1)} = T_\\omega x^{(k)} + c_\\omega.$$\n\n## Condiciones de convergencia para S.O.R.\n\nUn resultado base establece:\n\n$$\\rho(T_\\omega) \\ge |\\omega-1|.$$\n\nPara poder tener convergencia se requiere \\rho(T_\\omega)<1, de modo que necesariamente\\n\n$$0<\\omega<2.$$\n\nEsta condicion es necesaria, pero no suficiente por si sola: la convergencia final depende de la matriz de iteracion T_\\omega.\n\n## Caso especial con matriz definida positiva\n\nDEF:: A es definida positiva si es simetrica y\\n\n$$y^T A y > 0,\\quad \\forall y\\ne0.$$\n\nTeorema: si A es definida positiva y \\0<\\omega<2, entonces S.O.R. converge para toda aproximacion inicial.\n\n## Caso optimo: A tridiagonal y definida positiva\n\nCuando A es tridiagonal y definida positiva, se tiene\\n\n$$\\rho(T_{GS})=[\\rho(T_J)]^2<1,$$\n\ny el parametro optimo de S.O.R. es\\n\n$$\\omega_{opt}=\\frac{2}{1+\\sqrt{1-[\\rho(T_J)]^2}},$$\n\ncon\\n\n$$\\rho(T_{\\omega_{opt}})=\\omega_{opt}-1.$$\n\nEsto permite elegir \\omega de forma teorica para acelerar iteraciones.\n\n## Criterios de parada en practica\n\nCon tolerancias adecuadas, se suele detener por:\n\n- residual pequeno: ||r^(k)|| < tol,\n- cambio pequeno entre iteraciones: ||x^(k)-x^(k-1)|| < delta,\n- maximo de iteraciones alcanzado.\n\n## Newton para sistemas no lineales\n\nPara un sistema no lineal\\n\n$$F(x)=0,\\quad F: \\mathbb{R}^n \\to \\mathbb{R}^n,$$\n\nla extension de Newton usa la Jacobiana J_F(x):\n\n$$x^{(k+1)} = x^{(k)} - [J_F(x^{(k)})]^{-1}F(x^{(k)}).$$\n\nEn implementacion numerica se evita invertir explicitamente y se resuelve en dos pasos:\n\n$$J_F(x^{(k)})y^{(k)}=-F(x^{(k)}),\\quad x^{(k+1)}=x^{(k)}+y^{(k)}.$$\n\n## Ejemplo guia (2 ecuaciones no lineales)\n\nPara sistemas en dos variables, se construye F(x,y) y su Jacobiana 2x2 con derivadas parciales. Iniciando desde x^(0) cercano a una solucion, Newton suele converger rapido si la Jacobiana es invertible en las iteraciones y la aproximacion inicial es razonable.\n\n## MATLAB en la semana\n\nLa practica computacional compara Jacobi, Gauss-Seidel y S.O.R. (incluyendo \\omega optimo), y luego aplica Newton para sistemas no lineales usando funciones F y JF.\n\nSe observa tipicamente que:\n\n- S.O.R. con buen \\omega reduce iteraciones frente a Jacobi y Gauss-Seidel.\n- Newton para sistemas puede converger en pocas iteraciones cuando el punto inicial es adecuado.\n\nEJ:: Para una matriz A dada, calcule T_J, estime \\rho(T_J), obtenga \\omega_{opt} y compare el numero de iteraciones de S.O.R. frente a Gauss-Seidel. Luego aplique Newton a un sistema no lineal de dos ecuaciones y verifique la norma ||F(x^(k))||.",
      topics: [
        "Metodo S.O.R.",
        "Parametro de relajacion omega",
        "Subrelajacion y sobrerrelajacion",
        "Matriz definida positiva",
        "Parametro optimo omega opt",
        "Residual y criterios de parada",
        "Newton para sistemas no lineales",
        "Jacobiana y solucion incremental"
      ],
      sourceFile: "MN4_SistemasEcuaciones_SORNewtonSistemas.pdf"
    },
    {
      title: "Interpolacion y aproximacion polinomial",
      description: "Polinomios interpolantes de Lagrange y Newton, diferencias divididas y estimacion del error de interpolacion.",
      content:
        "## Planteamiento\n\nDado un conjunto de n+1 puntos \\((x_i,y_i)\\) con nodos distintos, se busca un polinomio de menor grado que cumpla la condicion de interpolacion\n\n$$p(x_i)=y_i,\\quad i=0,\\dots,n.$$\n\nTambien, si se conoce una funcion \\(f\\), se toma un conjunto de nodos y se interpola la nube \\((x_i,f(x_i))\\) para aproximar \\(f\\) por un polinomio.\n\n## Interpolacion de Lagrange\n\nPara nodos distintos \\(x_0,\\dots,x_n\\), el polinomio interpolante unico de grado a lo mas \\(n\\) es\n\n$$p_n(x)=\\sum_{i=0}^{n} f(x_i)L_i(x),$$\n\ncon bases de Lagrange\n\n$$L_i(x)=\\prod_{j=0,\,j\\ne i}^{n}\\frac{x-x_j}{x_i-x_j}.$$\n\nEstas bases cumplen la propiedad clave\n\n$$L_i(x_j)=\\delta_{ij},$$\n\nlo que garantiza que \\(p_n(x_i)=f(x_i)\\).\n\n## Unicidad del interpolante\n\nTeorema: dados \\(n+1\\) nodos distintos, existe un unico polinomio de grado menor o igual a \\(n\\) que interpola los datos.\n\nEsto significa que, aunque Lagrange y Newton se escriben diferente, representan el mismo polinomio.\n\n## Interpolacion de Newton (forma recursiva)\n\nLa forma de Newton se construye agregando nodos de manera incremental:\n\n$$p_n(x)=a_0+a_1(x-x_0)+a_2(x-x_0)(x-x_1)+\\cdots+a_n\\prod_{j=0}^{n-1}(x-x_j).$$\n\nLos coeficientes \\(a_i\\) son diferencias divididas:\n\n$$a_i=f[x_0,\\dots,x_i].$$\n\nCon esta forma, pasar de \\(p_n\\) a \\(p_{n+1}\\) es directo, ventaja importante frente a la forma de Lagrange cuando se agregan datos nuevos.\n\n## Diferencias divididas\n\nDefiniciones recursivas:\n\n$$f[x_i]=f(x_i),$$\n$$f[x_i,x_{i+1}]=\\frac{f[x_{i+1}]-f[x_i]}{x_{i+1}-x_i},$$\n$$f[x_i,\\dots,x_{i+k}]=\\frac{f[x_{i+1},\\dots,x_{i+k}]-f[x_i,\\dots,x_{i+k-1}]}{x_{i+k}-x_i}.$$\n\nSe organizan en una tabla triangular; la diagonal principal de la tabla entrega los coeficientes de Newton.\n\n## Error de interpolacion\n\nSi \\(f\\in C^{n+1}[a,b]\\), entonces para cada \\(x\\in[a,b]\\):\n\n$$f(x)=p_n(x)+E(x),$$\n\ncon\n\n$$E(x)=\\frac{f^{(n+1)}(\\xi(x))}{(n+1)!}\\prod_{i=0}^{n}(x-x_i),\\quad \\xi(x)\\in(a,b).$$\n\nLa expresion muestra dos factores de error:\n\n- suavidad de \\(f\\) (derivada de orden \\(n+1\\)),\n- eleccion de nodos (producto \\(\\prod(x-x_i)\\)).\n\n## Lectura practica de la semana\n\n- Lagrange es directo para construir una sola vez el polinomio.\n- Newton es mas comodo si se agregan nodos nuevos.\n- Para evaluar calidad de aproximacion se usan error relativo en puntos puntuales y estimaciones discretas del error maximo en una malla.\n\n## MATLAB en esta clase\n\nSe trabaja con rutinas de interpolacion para obtener:\n\n- coeficientes del polinomio en forma expandida,\n- bases de Lagrange o tabla de diferencias divididas,\n- evaluacion numerica con `polyval`,\n- estimacion de error puntual y error maximo discreto en intervalos.\n\nEJ:: Tome una funcion en un intervalo, construya \\(p_4\\) con nodos equiespaciados, evalue el error relativo en un punto interior y compare con una estimacion de error maximo discreto usando 1000 puntos.",
      topics: [
        "Interpolacion polinomial",
        "Condicion p(xi)=yi",
        "Polinomio de Lagrange",
        "Polinomio de Newton",
        "Diferencias divididas",
        "Unicidad del interpolante",
        "Error de interpolacion",
        "Implementacion en MATLAB"
      ],
      sourceFile: "MN5_Interpolacion_LagrangeNewton.pdf"
    },
    {
      title: "Minimizacion de error y aproximacion discreta por minimos cuadrados",
      description: "Nodos de Chebyshev para reducir cota de error en interpolacion y ajuste discreto por minimos cuadrados (recta y polinomios).",
      content:
        "## Pregunta central de la semana\n\nSe busca mejorar la aproximacion polinomial desde dos frentes:\n\n- minimizar la cota del error de interpolacion eligiendo nodos adecuados,\n- ajustar datos discretos cuando no conviene interpolar exactamente todos los puntos.\n\n## Interpolacion con error minimo en [−1,1]\n\nSi \\(f\\in C^{n+1}[-1,1]\\) y \\(p_n\\) interpola en nodos \\(t_0,\\dots,t_n\\), el error cumple\n\n$$|E(t)|\\le \\frac{1}{(n+1)!}\\max_{[-1,1]}|f^{(n+1)}|\\max_{[-1,1]}|Q(t)|,$$\n\ncon\n\n$$Q(t)=\\prod_{i=0}^n(t-t_i).$$\n\nPara reducir la cota, se debe minimizar \\(\\max|Q(t)|\\).\n\n## Polinomios de Chebyshev\n\nLos polinomios de Chebyshev se definen por recurrencia:\n\n$$T_0(t)=1,\\quad T_1(t)=t,\\quad T_k(t)=2tT_{k-1}(t)-T_{k-2}(t).$$\n\nEn \\([-1,1]\\):\n\n$$T_n(t)=\\cos(n\\arccos t),\\quad |T_n(t)|\\le1.$$\n\nSus ceros (nodos de Chebyshev) son:\n\n$$t_k=\\cos\\left(\\frac{2k+1}{2(n+1)}\\pi\\right),\\quad k=0,\\dots,n.$$\n\nTeorema: elegir estos nodos minimiza la cota asociada a \\(\\max|Q(t)|\\).\n\n## Nodos de Chebyshev trasladados a [a,b]\n\nPara un intervalo general \\([a,b]\\), los nodos optimos se trasladan por\n\n$$x_k=\\frac{b-a}{2}\\cos\\left(\\frac{2k+1}{2(n+1)}\\pi\\right)+\\frac{a+b}{2},\\quad k=0,\\dots,n.$$\n\nCon esta eleccion se obtiene una cota teorica menor del error maximo en el intervalo.\n\n## Cuando NO conviene interpolar\n\nSi los datos experimentales presentan ruido o tendencia global (lineal, parabolica, exponencial), forzar interpolacion exacta suele ser mala idea. En ese caso se usa ajuste por minimos cuadrados.\n\n## Minimos cuadrados discretos\n\nDados puntos \\((x_k,y_k)\\), se minimiza el error cuadratico\n\n$$E=\\sum_{k=1}^m(f(x_k)-y_k)^2.$$\n\nEsta medida es diferenciable y conduce a sistemas normales para encontrar parametros optimos.\n\n## Recta de regresion\n\nPara \\(f(x)=Ax+B\\), se minimiza\n\n$$E(A,B)=\\sum_{k=1}^m(Ax_k+B-y_k)^2,$$\n\ny al anular derivadas parciales se obtiene el sistema normal 2x2 para \\(A,B\\).\n\n## Ajuste polinomial\n\nPara un polinomio de grado \\(n\\),\n\n$$p_n(x)=a_nx^n+\\cdots+a_1x+a_0,$$\n\nlos coeficientes se obtienen resolviendo el sistema de ecuaciones normales construido con sumas de potencias de \\(x_k\\) y productos \\(x_k^j y_k\\).\n\n## Modelos no lineales y linealizacion\n\nModelos como \\(y=be^{Ax}\\), \\(y=Cx^A\\) o logisticos pueden linealizarse con cambios de variable (por ejemplo logaritmos) para ajustar una recta.\n\nImportante: el ajuste linealizado aproxima el modelo transformado; no siempre coincide con el minimo cuadratico del problema original sin transformar.\n\n## MATLAB en esta clase\n\nLa practica computacional compara:\n\n- interpolacion con nodos equiespaciados vs nodos de Chebyshev,\n- error maximo discreto entre ambas elecciones,\n- recta de regresion y ajuste polinomial de grado fijo,\n- modelos exponenciales mediante linealizacion y calculo de error relativo en prediccion.\n\nEJ:: Para una funcion en [a,b], construya \\(p_5\\) con nodos equiespaciados y con nodos de Chebyshev trasladados; estime el error maximo discreto en 1000 puntos y compare. Luego ajuste por minimos cuadrados una recta y un polinomio de grado 2 sobre la misma nube de datos.",
      topics: [
        "Minimizacion de cota de error",
        "Polinomios de Chebyshev",
        "Nodos de Chebyshev en [-1,1]",
        "Nodos trasladados en [a,b]",
        "Error maximo de interpolacion",
        "Aproximacion por minimos cuadrados",
        "Recta de regresion",
        "Ajuste polinomial y linealizacion"
      ],
      sourceFile: "MN6_Interpolacion_Chebyshev_MinimosCuadrados_v3.pdf"
    },
    {
      title: "Interpolacion de trazadores cubicos",
      description: "Interpolacion fragmentaria con splines cubicos: continuidad C2, condiciones de frontera y construccion de sistemas tridiagonales.",
      content:
        "## Idea central\n\nPara evitar oscilaciones de polinomios globales al usar muchos nodos, se emplea interpolacion fragmentaria: en lugar de un unico polinomio en todo el intervalo, se usa una funcion por tramos.\n\n## Interpolacion lineal a trozos\n\nCon nodos \\(x_0<\\cdots<x_n\\), el interpolante lineal a trozos une cada par consecutivo con una recta.\n\nVentaja: simplicidad y continuidad.\n\nDesventaja: no es derivable en nodos interiores.\n\n## Spline cubico\n\nUn spline cubico \\(S\\) en \\([x_0,x_n]\\) se define por tramos\n\n$$S_j(x)=a_j+b_j(x-x_j)+c_j(x-x_j)^2+d_j(x-x_j)^3,\\quad x\\in[x_j,x_{j+1}],$$\n\ncon condiciones:\n\n- interpolacion: \\(S(x_j)=f(x_j)\\),\n- continuidad de \\(S\\),\n- continuidad de \\(S'\\),\n- continuidad de \\(S''\\).\n\nAsi se logra suavidad \\(C^2\\).\n\n## Grados de libertad y fronteras\n\nLas condiciones internas no bastan para determinar todos los coeficientes; faltan dos ecuaciones que se fijan con condiciones de frontera.\n\nTipos comunes:\n\n- naturales: \\(S''(x_0)=S''(x_n)=0\\),\n- sujetas (clamped): \\(S'(x_0), S'(x_n)\\) conocidas,\n- curvatura conocida: \\(S''(x_0), S''(x_n)\\) conocidas,\n- terminacion parabolica,\n- extrapolada.\n\n## Construccion eficiente\n\nDefiniendo \\(h_j=x_{j+1}-x_j\\), se reduce el problema a un sistema lineal tridiagonal para los coeficientes \\(c_j\\).\n\nLuego se recuperan\n\n$$d_j=\frac{c_{j+1}-c_j}{3h_j},\\qquad b_j=\frac{a_{j+1}-a_j}{h_j}-\frac{h_j}{3}(2c_j+c_{j+1}).$$\n\nEste esquema da una construccion numericamente estable y computacionalmente eficiente.\n\n## Propiedad importante\n\nEn los casos natural, curvatura conocida y terminacion parabolica, la matriz del sistema para \\(c_j\\) es tridiagonal y diagonal dominante en condiciones habituales, garantizando existencia y unicidad del spline.\n\n## MATLAB en esta clase\n\nSe implementan rutinas para distintos tipos de spline, por ejemplo:\n\n- spline natural,\n- spline con curvatura conocida,\n- spline extrapolado.\n\nLa evaluacion de \\(S(x)\\) exige elegir primero el tramo correcto \\([x_j,x_{j+1}]\\), luego evaluar el polinomio local en \\(x-x_j\\).\n\nEJ:: Construya para una nube de 5 puntos el spline natural y el spline con curvatura conocida en extremos; compare valores aproximados en un punto interior y contraste errores frente a la funcion original.",
      topics: [
        "Interpolacion fragmentaria",
        "Interpolacion lineal a trozos",
        "Spline cubico C2",
        "Condiciones de frontera",
        "Sistema tridiagonal para c_j",
        "Existencia y unicidad",
        "Evaluacion por tramos",
        "Implementacion MATLAB"
      ],
      sourceFile: "MN7_Interpolacion_SplineCubico.pdf"
    },
    {
      title: "Integracion numerica I",
      description: "Reglas de Newton-Cotes: trapecio y Simpson 1/3 (simple y compuesta), exactitud y analisis de error.",
      content:
        "## Cuadratura numerica\n\nSe busca aproximar\n\n$$\\int_a^b f(x)\,dx \\approx \\sum_{i=0}^n w_i f(x_i),$$\n\ncuando no se conoce antiderivada cerrada o no es practica su evaluacion.\n\nLas reglas estudiadas se obtienen integrando el polinomio interpolante en nodos dados.\n\n## Regla del trapecio\n\nUsando dos nodos extremos:\n\n$$\\int_a^b f(x)\,dx \\approx \frac{b-a}{2}\,[f(a)+f(b)].$$\n\nError (si \\(f\\in C^2[a,b]\\)):\n\n$$E_T=-\frac{h^3}{12}f''(\\\\xi),\\quad h=b-a.$$\n\nGrado de exactitud: 1.\n\n## Trapecio compuesto\n\nCon particion uniforme \\(h=(b-a)/n\\):\n\n$$\\int_a^b f(x)\,dx \\approx \frac{h}{2}\\left[f(x_0)+2\\sum_{i=1}^{n-1}f(x_i)+f(x_n)\right].$$\n\nError global:\n\n$$E_{TC}= -\frac{h^2}{12}(b-a)f''(\\\\xi).$$\n\n## Regla de Simpson 1/3\n\nCon tres nodos equiespaciados:\n\n$$\\int_a^b f(x)\,dx \\approx \frac{b-a}{6}\\left[f(a)+4f\\left(\frac{a+b}{2}\right)+f(b)\right].$$\n\nError (si \\(f\\in C^4[a,b]\\)):\n\n$$E_S=-\frac{h^5}{90}f^{(4)}(\\\\xi),\\quad h=\frac{b-a}{2}.$$\n\nGrado de exactitud: 3.\n\n## Simpson 1/3 compuesto\n\nPara \\(n\\) par, \\(h=(b-a)/n\\):\n\n$$\\int_a^b f(x)\,dx \\approx \frac{h}{3}\\left[f(x_0)+4\\sum_{i=1}^{n/2}f(x_{2i-1})+2\\sum_{i=1}^{n/2-1}f(x_{2i})+f(x_n)\right].$$\n\nError global:\n\n$$E_{SC}= -\frac{h^4}{180}(b-a)f^{(4)}(\\\\xi).$$\n\n## Newton-Cotes cerradas y abiertas\n\n- Cerradas: incluyen extremos \\(a,b\\).\n- Abiertas: usan nodos interiores (utiles cuando hay singularidades en extremos).\n\nSe revisan formulas como Simpson 3/8, Boole y regla del punto medio (abierta), junto con versiones compuestas.\n\n## Exactitud\n\nDEF:: El grado de precision es el mayor \\(m\\) para el cual la formula es exacta en la base \\(1,x,\\dots,x^m\\).\n\nEste criterio permite comparar calidad teorica entre cuadraturas sin depender de un caso particular.\n\n## MATLAB en esta clase\n\nSe implementan y usan rutinas de trapecio y Simpson compuestas para aproximar trabajo, energia e integrales de funciones sin primitiva simple.\n\nEJ:: Aproxime una integral en [a,b] con trapecio compuesto y Simpson compuesto para varios \\(n\\), compare convergencia y verifique el orden de error esperado en funcion de \\(h\\).",
      topics: [
        "Cuadratura numerica",
        "Regla del trapecio",
        "Trapecio compuesto",
        "Regla de Simpson 1/3",
        "Simpson compuesto",
        "Newton-Cotes cerradas",
        "Newton-Cotes abiertas",
        "Grado de exactitud y error"
      ],
      sourceFile: "MN8_IntegracionNumericaI.pdf"
    },
    {
      title: "Integracion numerica II: cuadratura gaussiana e integrales impropias",
      description: "Cuadratura de Gauss-Legendre con nodos optimos y tratamiento numerico de integrales impropias mediante cambios de variable.",
      content:
        "## Cuadratura gaussiana\n\nSe consideran formulas\n\n$$\\int_a^b f(x)\,dx \\approx \\sum_{i=1}^n c_i f(x_i),$$\n\neligiendo nodos \\(x_i\\) no equiespaciados para maximizar exactitud.\n\nCon \\(n\\) nodos hay \\(2n\\) parametros (nodos y pesos), permitiendo grado de precision hasta \\(2n-1\\).\n\n## Gauss-Legendre en [-1,1]\n\nEn \\([-1,1]\\), los nodos son los ceros del polinomio de Legendre \\(P_n\\). Con esos nodos y pesos adecuados, la formula es exacta para todo polinomio de grado \\(\\le 2n-1\\).\n\nEjemplos clasicos:\n\n- n=2: exactitud 3,\n- n=3: exactitud 5.\n\n## Error de Gauss\n\nPara nodos de Legendre de orden \\(n\\), el error involucra la derivada de orden \\(2n\\), lo que explica la alta precision con pocos nodos frente a Newton-Cotes.\n\n## Traslado a [a,b]\n\nSe usa el cambio\n\n$$x=\frac{b-a}{2}y+\frac{a+b}{2},$$\n\npara convertir\n\n$$\\int_a^b f(x)\,dx=\frac{b-a}{2}\\int_{-1}^1 f\\left(\frac{b-a}{2}y+\frac{a+b}{2}\right)dy,$$\n\ny aplicar Gauss-Legendre estandar en \\([-1,1]\\).\n\n## Integrales impropias\n\nCasos tipicos:\n\n- singularidad en extremos o interior,\n- intervalo no acotado: \\([a,\\infty), (-\\infty,b], (-\\infty,\\infty)\\).\n\nEstrategia:\n\n1. convertir a intervalo acotado por cambio de variable (por ejemplo \\(y=1/x\\) para colas infinitas),\n2. evitar nodos en singularidades usando formulas abiertas o gaussianas,\n3. dividir integral cuando hay singularidad interior.\n\n## Comparacion practica\n\nCon pocas evaluaciones, Gauss suele superar en precision a reglas cerradas equiespaciadas de orden similar, especialmente en integrandos suaves despues del cambio de variable adecuado.\n\n## MATLAB en la semana\n\nSe usa una rutina de Gauss-Legendre que retorna:\n\n- aproximacion de la integral,\n- raices de Legendre,\n- nodos trasladados a [a,b],\n- pesos de cuadratura.\n\nTambien se aplican cambios de variable para integrales impropias y se compara el efecto de usar 2, 3, 4, 5 o 6 nodos.\n\nEJ:: Reescriba una integral impropia de cola infinita en [0,1], aplique Gauss-Legendre con n=3 y n=4, y compare estabilidad numerica y sensibilidad a singularidades cercanas al extremo.",
      topics: [
        "Cuadratura gaussiana",
        "Polinomios de Legendre",
        "Nodos y pesos optimos",
        "Exactitud 2n-1",
        "Cambio de variable a [a,b]",
        "Integrales impropias",
        "Singularidades y formulas abiertas",
        "Implementacion MATLAB"
      ],
      sourceFile: "MN9_IntegracionNumericaII_CG_Impropias.pdf"
    }
  ]);

  const classModulesWithImage = classModules.map(function (moduleItem, index) {
    const num = String(index + 1).padStart(2, "0");
    const encodedTitle = encodeURIComponent(moduleItem.subtitle || moduleItem.title || ("Clase " + num));
    const encodedSource = encodeURIComponent(moduleItem.sourceFile || "");
    return Object.assign({}, moduleItem, {
      image: "generated:class-" + num + "|" + encodedTitle + "|" + encodedSource
    });
  });

  return [
    {
      id: "sobre-el-curso",
      title: "Sobre el Curso",
      subtitle: "Métodos Numéricos 3006907",
      description: "Curso enfocado en algoritmos para aproximar soluciones numericas de ecuaciones y problemas de analisis aplicado.",
      content:
        "Este curso desarrolla estrategias numericas para resolver problemas donde no siempre existe una solucion cerrada o facil de calcular de forma exacta. Se trabaja con metodos iterativos, analisis del error, criterios de convergencia y condiciones de estabilidad para elegir el procedimiento adecuado en cada contexto.\n\nLa Clase 1 introduce el marco teorico base: convergencia de sucesiones, medicion del error, metodo de biseccion y metodo de punto fijo. Estos conceptos serviran como fundamento para metodos posteriores como regla falsa, Newton, secante e interpolacion numerica.",
      topics: ["Raices de ecuaciones", "Metodos iterativos", "Convergencia", "Error numerico"],
      sourceFile: "Programa base Metodos Numericos 3006907"
    }
  ].concat(classModulesWithImage);
}

function createEstadistica2Modules() {
  const classModules = createClassModules([
    {
      title: "Fundamentos de inferencia estadistica",
      description: "Introduccion a la inferencia estadistica, definicion de estadisticos muestrales y fundamentos de distribuciones muestrales para la media.",
      content:
        "## Introduccion\n\nLa estadistica es una herramienta fundamental para recolectar, analizar y presentar informacion en distintas disciplinas cientificas. Su fortaleza es que permite trabajar con variables numericas y categoricas para sustentar conclusiones en investigacion teorica y aplicada.\n\nEn general, el analisis estadistico se divide en dos partes:\n\n- Estadistica descriptiva: resume informacion con tablas, graficas y medidas numericas para facilitar interpretacion.\n- Inferencia estadistica: modela, predice y permite tomar decisiones sobre una poblacion a partir de una muestra.\n\n## Inferencia estadistica\n\nLa inferencia estadistica consiste en obtener conclusiones basadas en datos experimentales. Para ello se distingue:\n\nDEF:: Poblacion: total de observaciones del proceso de interes.\n\nDEF:: Muestra: subconjunto de la poblacion usado para inferir sobre ella.\n\nDEF:: Muestra aleatoria: subconjunto seleccionado de forma independiente e identicamente distribuida (iid).\n\n## Estadisticos\n\nLos estadisticos son funciones de variables aleatorias muestrales usadas para estimar parametros desconocidos de una poblacion.\n\nSi \\(X_1, X_2, \\dots, X_n\\) es una muestra aleatoria iid de tamano \\(n\\), se definen estadisticos de centro y dispersion como media, varianza y desviacion estandar muestral.\n\n## Media muestral\n\nDEF:: La media muestral es\n\n$$\\bar{X}=\\frac{1}{n}\\sum_{i=1}^{n}x_i=\\frac{x_1+x_2+\\cdots+x_n}{n}. $$\n\nEn R: `mean(datos)`.\n\nEJ:: Para salarios (millones) de 15 egresados\n\n1.78, 2.93, 1.22, 1.27, 1.17, 1.03, 1.24, 2.07, 2.04, 1.28, 1.53, 0.98, 1.73, 1.38, 3.24\n\ncalcule la media muestral.\n\nSolucion resumida: \\(\\bar{X}=1.659333\\).\n\n## Varianza muestral\n\nDEF:: La varianza muestral es\n\n$$S^2=\\frac{1}{n-1}\\sum_{i=1}^{n}(x_i-\\bar{X})^2,$$\n\ncon \\(n-1\\) (correccion de Bessel) para corregir sesgo del estimador.\n\nEn R: `var(datos)`.\n\nEJ:: Con los mismos 15 salarios, calcule \\(S^2\\).\n\nSolucion resumida: \\(S^2=0.4501638\\).\n\n## Desviacion estandar muestral\n\nDEF::\n\n$$S=\\sqrt{S^2}. $$\n\nEn R: `sd(datos)`.\n\nEJ:: Con \\(S^2=0.4501638\\),\n\n$$S=\\sqrt{0.4501638}=0.6709425.$$\n\nInterpretacion: promedio muestral de salario \\(1.659\\) millones, con dispersion aproximada de \\(0.671\\) millones.\n\n## Distribuciones muestrales\n\nComo los estadisticos son funciones de variables aleatorias muestrales, tambien son variables aleatorias y tienen distribuciones de probabilidad asociadas llamadas distribuciones muestrales.\n\n## Distribucion muestral de la media\n\nSi \\(X_1,\\dots,X_n\\) proviene de una normal con media \\(\\mu\\) y varianza \\(\\sigma^2\\), entonces\n\n$$\\bar{X}=\\frac{1}{n}\\sum_{i=1}^{n}X_i\\sim N\\left(\\mu,\\frac{\\sigma^2}{n}\right).$$\n\nTeorema de estandarizacion:\n\n$$Z_c=\\frac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}\\sim N(0,1).$$\n\n## Ejercicios con normal estandar\n\nPara \\(Z\\sim N(0,1)\\):\n\n- \\(P(Z\\le1.96)=0.9750\\).\n- \\(P(Z>2.13)=1-P(Z\\le2.13)=1-0.9834=0.0166\\).\n- \\(P(-2.42<Z\\le0.24)=P(Z\\le0.24)-P(Z\\le-2.42)=0.5948-0.0078=0.587\\).\n- Si \\(P(Z>z)=0.0129\\), entonces \\(P(Z\\le z)=0.9871\\) y \\(z\\approx2.24\\).\n\n## Aplicacion inferencial con salarios\n\nCon los 15 salarios anteriores, \\(\\bar{X}=1.659333\\), \\(n=15\\), y desviacion estandar poblacional conocida \\(\\sigma=0.5\\), se plantea:\n\n$$P(\\mu\\le2).$$\n\nLlevando a normal estandar:\n\n$$Z=\\frac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}},\\qquad P(\\mu\\le2)=P\\left(Z\\ge\\frac{1.659333-2}{0.5/\\sqrt{15}}\right)=P(Z\\ge-2.638793).$$\n\nPor tabla o software:\n\n$$P(Z\\ge-2.638793)=0.9958399.$$\n\nPor tanto, la probabilidad de que el salario promedio poblacional sea a lo mas 2 millones es aproximadamente \\(99.58\\%\\).",
      topics: [
        "Inferencia estadistica",
        "Poblacion y muestra",
        "Estadisticos muestrales",
        "Media, varianza y desviacion",
        "Distribucion muestral de la media",
        "Estandarizacion normal"
      ],
      sourceFile: "Clase 01 - Estadistica 2"
    },
    {
      title: "Distribuciones muestrales y teorema del limite central",
      description: "Teorema del limite central, combinaciones lineales y distribuciones muestrales chi-cuadrado, t de Student, F de Fisher y proporcion muestral.",
      content:
        "## Teorema del limite central\n\nSean \\(X_1, X_2, \\dots, X_n\\) variables aleatorias iid con media \\(E(X_i)=\\mu\\) y varianza \\(Var(X_i)=\\sigma^2<\\infty\\). Si \\(\\bar{X}\\) es la media muestral, entonces\n\n$$Z_c=\\frac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}\\xrightarrow{d}N(0,1),\\quad n\to\\infty,$$\n\nusualmente con referencia practica \\(n\\ge30\\).\n\nEJ:: En una maquina de bebidas con distribucion Weibull (forma \\(\\alpha=1/5\\), escala \\(\\beta=3\\)), para una muestra de 40 vasos calcule \\(P(\\bar{X}\\le340)\\).\n\nSolucion resumida: por TLC, estandarizando con \\(\\mu=360\\) y \\(\\sigma\\approx5703.473\\),\n\n$$P(\\bar{X}\\le340)=P(Z\\le-0.02217791)=0.491153,$$\n\nes decir, aproximadamente \\(49.11\\%\\).\n\n## Distribuciones muestrales para combinaciones lineales\n\nDEF:: Si \\(X_1,\\dots,X_n\\) son normales independientes y\n\n$$Y=a_1X_1+\\cdots+a_nX_n,$$\n\nentonces \\(Y\\) es normal con\n\n$$\\mu_Y=a_1\\mu_1+\\cdots+a_n\\mu_n,\\qquad \\sigma_Y^2=a_1^2\\sigma_1^2+\\cdots+a_n^2\\sigma_n^2.$$\n\nPara dos variables:\n\n$$Y=X_1+X_2,\\quad E(Y)=\\mu_1+\\mu_2,$$\n\n$$Var(Y)=\\sigma_1^2+\\sigma_2^2+2Cov(X_1,X_2),$$\n\ny si son independientes, \\(Var(Y)=\\sigma_1^2+\\sigma_2^2\\).\n\n## Distribucion muestral de chi-cuadrado\n\nSi \\(X_1,\\dots,X_n\\sim N(\\mu,\\sigma^2)\\) iid, entonces\n\n$$\\chi_c^2=\\frac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2_{n-1}. $$\n\nPropiedades importantes:\n\n- \\(\\bar{X}\\) y \\(S^2\\) son independientes (muestra normal).\n- \\(E(S^2)=\\sigma^2\\).\n- \\(Var(S^2)=\\frac{2\\sigma^4}{n-1}.\\)\n\nEJ:: Para tabla chi-cuadrado:\n\n- \\(P(\\chi^2_5>3)=0.70\\).\n- \\(P(\\chi^2_{20}\\le37.566)=0.99\\).\n- \\(P(9.034<\\chi^2_{12}\\le15.812)=0.50\\).\n- Si \\(P(\\chi^2_8<x)=0.10\\), entonces \\(x\\approx3.490\\).\n\nEJ:: Con \\(n=26\\), varianza poblacional 5 y preguntar \\(P(S>2.828427)\\):\n\n$$P(S>2.828427)=P(\\chi^2_{25}>40)=0.0291644,$$\n\naproximadamente \\(2.92\\%\\).\n\n## Distribucion muestral t de Student\n\nSi \\(Z\\sim N(0,1)\\), \\(W\\sim\\chi^2_\nu\\), independientes, entonces\n\n$$t=\\frac{Z}{\\sqrt{W/\nu}}\\sim t_\nu. $$\n\nPara muestra normal:\n\n$$t_c=\\frac{\\bar{X}-\\mu}{S/\\sqrt{n}}\\sim t_{n-1}. $$\n\nEJ:: Probabilidades con tabla t:\n\n- \\(P(t_{14}>1.076)=0.15\\).\n- \\(P(t_7\\le3.53)\\approx0.995\\).\n- \\(P(0.862<t_{18}\\le2.214)=0.18\\).\n- Si \\(P(t_{10}\\ge t)=0.01\\), entonces \\(t\\approx2.764\\).\n\nEJ:: Caso nicotina (muestra de 25): con \\(\\mu=1.1\\), \\(\\bar{X}=1.02\\), \\(S=0.23\\),\n\n$$P(\\bar{X}\\le1.02)=P(t_{24}\\le-1.73913)=0.04741239,$$\n\naprox. \\(4.74\\%\\).\n\n## Distribucion muestral F de Fisher-Snedecor\n\nSi \\(W_1\\sim\\chi^2_{\nu_1}\\), \\(W_2\\sim\\chi^2_{\nu_2}\\), independientes, entonces\n\n$$F=\\frac{W_1/\nu_1}{W_2/\nu_2}\\sim F_{\nu_1,\nu_2}. $$\n\nPara dos muestras normales independientes:\n\n$$F_c=\\frac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2}\\sim F_{n_1-1,n_2-1}. $$\n\nTeorema de cola izquierda:\n\n$$F_{1-\\alpha,\nu_1,\nu_2}=\\frac{1}{F_{\\alpha,\nu_2,\nu_1}}. $$\n\nEJ:: Resultados aproximados de tabla:\n\n- \\(0.01<P(F_{8,12}\\ge3)<0.05\\).\n- \\(P(F_{10,6}\\le0.18)\\approx0.01\\).\n- \\(P(0.31<F_{15,5}\\le9.6)\\approx0.94\\).\n- Si \\(P(F_{12,12}\\ge f)=0.05\\), entonces \\(f\\approx2.69\\).\n\nEJ:: Cables con y sin encapsulado (varianzas muestrales \\(S_C^2=1.899286\\), \\(S_S^2=10.441\\)):\n\n$$P(\\sigma_S^2>\\sigma_C^2)=P(F_{7,9}>0.1819065)=0.9824406,$$\n\naprox. \\(98.24\\%\\).\n\n## Distribucion muestral para una proporcion\n\nSi \\(\\hat{p}=x/n\\), con \\(n\\) grande y condiciones \\(np>5\\), \\(n(1-p)>5\\), entonces\n\n$$\\hat{p}\\approx N\\left(p,\\frac{p(1-p)}{n}\right),\\qquad Z_c=\\frac{\\hat{p}-p}{\\sqrt{p(1-p)/n}}\\approx N(0,1).$$\n\nEJ:: Con los 15 salarios, hay 4 mayores a 2 millones, por tanto\n\n$$\\hat{p}=\\frac{4}{15}=0.2666667.$$\n\nPara calcular \\(P(p>0.4)\\), al estandarizar:\n\n$$P(p>0.4)=P\\left(Z<-1.054092\right)=0.1459204,$$\n\nes decir, aproximadamente \\(14.59\\%\\).",
      topics: [
        "Teorema del limite central",
        "Combinaciones lineales",
        "Distribucion chi-cuadrado",
        "Distribucion t de Student",
        "Distribucion F de Fisher",
        "Proporcion muestral"
      ],
      sourceFile: "Clase 02 - Estadistica 2"
    },
    {
      title: "Transformaciones para inferencia de parametros",
      description: "Transformaciones para calcular probabilidades sobre media, varianza, proporcion, diferencia de medias, diferencia de proporciones y razon de varianzas.",
      content:
        "## Transformaciones para calculo de probabilidades con muestras\n\nLas distribuciones muestrales permiten calcular probabilidades para inferencia sobre parametros poblacionales desconocidos, como \\(\\mu\\), \\(\\sigma^2\\) y \\(p\\).\n\nDependiendo de las condiciones (normalidad, tamano muestral, varianzas conocidas o no), se elige la transformacion adecuada.\n\n## Transformaciones para una media \\(\\mu\\)\n\nSea \\(X_1,\\dots,X_n\\) iid. Las transformaciones mas usadas son:\n\n- Si poblacion normal y \\(\\sigma\\) conocida:\n$$Z_c=\\frac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}\\sim N(0,1).$$\n\n- Si poblacion normal y \\(\\sigma\\) desconocida:\n$$t_c=\\frac{\\bar{X}-\\mu}{S/\\sqrt{n}}\\sim t_{n-1}.$$\n\n- Si no hay normalidad pero \\(n\\ge30\\) (TLC):\n$$Z_c\\approx N(0,1).$$\n\nEJ:: Salarios (n=15, \\(\\bar{X}=1.659333\\), \\(\\sigma=0.5\\)):\n$$P(\\mu\\le2)=P\\left(Z\\ge\\frac{1.659333-2}{0.5/\\sqrt{15}}\right)=P(Z\\ge-2.638793)=0.9958399.$$\n\nEJ:: Maquina de gaseosa Weibull (n=40):\n$$P(\\bar{X}\\le340)=P(Z\\le-0.02217791)=0.491153.$$\n\nEJ:: Nicotina Marlboro (n=25, \\(\\bar{X}=1.02\\), \\(S=0.23\\), \\(\\mu=1.1\\)):\n$$P(\\bar{X}\\le1.02)=P(t_{24}\\le-1.73913)=0.04741239.$$\n\n## Transformaciones para una varianza \\(\\sigma^2\\)\n\nSi \\(X_1,\\dots,X_n\\) iid de una normal:\n\n$$\\chi_c^2=\\frac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2_{n-1}. $$\n\nEJ:: Con \\(n=26\\), \\(\\sigma^2=5\\), calcular \\(P(S>2.828427)\\):\n\n$$P(S>2.828427)=P(\\chi^2_{25}>40)=0.0291644.$$\n\n## Transformaciones para una proporcion \\(p\\)\n\nPara muestras grandes en binomial (condiciones de aproximacion):\n\n$$Z_c=\\frac{\\hat{p}-p}{\\sqrt{p(1-p)/n}}\\approx N(0,1),\\qquad \\hat{p}=\\frac{x}{n}. $$\n\nEJ:: En salarios, \\(x=4\\) exitos sobre \\(n=15\\), \\(\\hat{p}=0.2666667\\). Para \\(P(p>0.4)\\):\n\n$$P(p>0.4)=P(Z<-1.054092)=0.1459204.$$\n\n## Transformaciones para diferencia de medias \\(\\mu_1-\\mu_2\\)\n\nPara dos muestras independientes:\n\n- Varianzas poblacionales conocidas:\n$$Z_c=\\frac{(\\bar{X}_1-\\bar{X}_2)-(\\mu_1-\\mu_2)}{\\sqrt{\\sigma_1^2/n_1+\\sigma_2^2/n_2}}\\sim N(0,1).$$\n\n- Varianzas desconocidas y muestras grandes:\n$$Z_c\\approx N(0,1),\\quad \\sigma_i^2\text{ reemplazada por }S_i^2.$$\n\n- Varianzas desconocidas pero iguales (muestras pequenas, normalidad):\n$$t_c=\\frac{(\\bar{X}_1-\\bar{X}_2)-(\\mu_1-\\mu_2)}{S_p\\sqrt{1/n_1+1/n_2}}\\sim t_{n_1+n_2-2},$$\n$$S_p^2=\\frac{(n_1-1)S_1^2+(n_2-1)S_2^2}{n_1+n_2-2}. $$\n\n- Varianzas desconocidas y diferentes (Welch):\n$$t_c=\\frac{(\\bar{X}_1-\\bar{X}_2)-(\\mu_1-\\mu_2)}{\\sqrt{S_1^2/n_1+S_2^2/n_2}}\\sim t_{\nu}\text{ (aprox.)}. $$\n\nEJ:: Ventas con capacitacion vs sin capacitacion (varianzas conocidas):\n$$P(\\mu_C-\\mu_S>3)=P(Z<-0.1595986)=0.4365986.$$\n\nEJ:: Salarios hombres vs mujeres (muestras grandes):\n$$P(\\mu_H>\\mu_M)=P(Z<3.512839)=0.9997783.$$\n\nEJ:: Pesos ninos vs ninas (varianzas iguales):\n$$P(\\mu_H-\\mu_M\\le3)=P(t_{48}\\ge1.494814)=0.07075437.$$\n\nEJ:: Madera A vs B (varianzas diferentes):\n$$P(\\mu_B<\\mu_A)=P(t_{26}>-0.8121217)=0.7879523.$$\n\nEJ:: Motores A vs B sin normalidad (muestras grandes):\n$$P(\\mu_B<\\mu_A)=P(Z>2.941414)=0.001633588.$$\n\n## Distribucion muestral para diferencia de proporciones \\(p_1-p_2\\)\n\nCon dos muestras grandes independientes:\n\n$$Z_c=\\frac{(\\hat{p}_1-\\hat{p}_2)-(p_1-p_2)}{\\sqrt{\\hat{p}^*(1-\\hat{p}^*)\\left(\\frac{1}{n_1}+\\frac{1}{n_2}\right)}}\\approx N(0,1),$$\n\ncon proporcion conjunta\n$$\\hat{p}^*=\\frac{x_1+x_2}{n_1+n_2}. $$\n\nEJ:: Proceso nuevo vs actual (220/700 y 120/500):\n\n$$\\hat{p}_N=0.3142857,\\quad \\hat{p}_A=0.24,\\quad \\hat{p}^*=0.2833333,$$\n$$P(p_N>p_A)=P(Z<2.815407)=0.9975642.$$\n\n## Distribucion muestral para razon de varianzas \\(\\sigma_1^2/\\sigma_2^2\\)\n\nPara dos muestras normales independientes con varianzas desconocidas:\n\n$$F_c=\\frac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2}\\sim F_{n_1-1,n_2-1}. $$\n\nEJ:: Cables sin encapsulado vs con encapsulado:\n\n$$P(\\sigma_S^2>\\sigma_C^2)=P(F_{7,9}>0.1819065)=0.9824406,$$\n\nes decir, aproximadamente \\(98.24\\%\\).",
      topics: [
        "Transformaciones para media",
        "Transformaciones para varianza",
        "Transformaciones para proporcion",
        "Diferencia de medias",
        "Diferencia de proporciones",
        "Razon de varianzas"
      ],
      sourceFile: "Clase 03 - Estadistica 2"
    },
    {
      title: "Estadisticos de orden y convergencia",
      description: "Definicion y propiedades de estadisticos de orden, rangos muestrales y tipos de convergencia usados en inferencia asintotica.",
      content:
        "## Estadisticos de orden\n\nSea \\(X_1, X_2, \\dots, X_n\\) una muestra aleatoria iid. Al ordenar sus valores de menor a mayor se obtiene:\n\n$$X_{(1)} \\le X_{(2)} \\le \\cdots \\le X_{(n)}.$$\n\nLos valores \\(X_{(1)}, X_{(2)}, \\dots, X_{(n)}\\) se llaman estadisticos de orden.\n\n- \\(X_{(1)}\\): minimo muestral.\n- \\(X_{(n)}\\): maximo muestral.\n- \\(R = X_{(n)} - X_{(1)}\\): rango muestral.\n\nDEF:: El k-esimo estadistico de orden \\(X_{(k)}\\) es la k-esima observacion mas pequena de la muestra ordenada.\n\n## Distribucion del minimo y del maximo\n\nSi \\(F(x)\\) es la funcion de distribucion acumulada de \\(X_i\\), entonces:\n\n$$P(X_{(1)} > x) = [1 - F(x)]^n,\\qquad F_{X_{(1)}}(x) = 1 - [1 - F(x)]^n.$$\n\n$$P(X_{(n)} \\le x) = [F(x)]^n,\\qquad F_{X_{(n)}}(x) = [F(x)]^n.$$\n\nAl derivar, se obtiene la densidad del k-esimo orden:\n\n$$f_{X_{(k)}}(x) = \\frac{n!}{(k-1)!(n-k)!} [F(x)]^{k-1} [1-F(x)]^{n-k} f(x).$$\n\n## Mediana muestral como estadistico de orden\n\n- Si \\(n\\) es impar, la mediana es \\(X_{((n+1)/2)}\\).\n- Si \\(n\\) es par, se suele usar\\n$$\\tilde{X}=\\frac{X_{(n/2)}+X_{(n/2+1)}}{2}. $$\n\nLos estadisticos de orden son claves para construir estimadores robustos y pruebas no parametricas.\n\n## Convergencia de variables aleatorias\n\nEn inferencia moderna interesa el comportamiento de sucesiones \\((X_n)\\) cuando \\(n\\to\\infty\\).\n\n### Convergencia casi segura\n\nDEF:: \\(X_n\\to X\\) casi seguramente si\n\n$$P\\left(\\lim_{n\\to\\infty} X_n = X\\right)=1.$$\n\nEs una forma fuerte de convergencia y garantiza que, salvo en un conjunto de probabilidad cero, las trayectorias convergen punto a punto.\n\n### Convergencia en probabilidad\n\nDEF:: \\(X_n\\to X\\) en probabilidad si para todo \\(\\varepsilon>0\\),\n\n$$\\lim_{n\\to\\infty} P(|X_n-X|>\\varepsilon)=0.$$\n\nEsta convergencia aparece de forma natural en la Ley Debil de los Grandes Numeros.\n\n### Convergencia en distribucion\n\nDEF:: \\(X_n\\to X\\) en distribucion si\n\n$$F_{X_n}(x) \\to F_X(x)$$\n\npara todo punto de continuidad de \\(F_X\\).\n\nEs la nocion usada en resultados asintoticos como el Teorema del Limite Central.\n\n### Convergencia en media cuadratica\n\nDEF:: \\(X_n\\to X\\) en media cuadratica si\n\n$$E[(X_n-X)^2] \\to 0.$$\n\nEste tipo de convergencia implica convergencia en probabilidad.\n\n## Relaciones entre convergencias\n\nSe cumplen las implicaciones clasicas:\n\n- Convergencia casi segura \\(\\Rightarrow\\) convergencia en probabilidad.\n- Convergencia en media cuadratica \\(\\Rightarrow\\) convergencia en probabilidad.\n- Convergencia en probabilidad \\(\\Rightarrow\\) convergencia en distribucion.\n\nLas implicaciones inversas no siempre son ciertas.\n\n## Ejemplos cortos\n\nEJ:: Si \\((X_i)\\) son iid con media \\(\\mu\\), entonces la media muestral \\(\\bar{X}_n\\) satisface:\n\n$$\\bar{X}_n \\xrightarrow{P} \\mu,$$\n\npor la Ley Debil de los Grandes Numeros.\n\nEJ:: Bajo condiciones del TLC:\n\n$$\\frac{\\bar{X}_n-\\mu}{\\sigma/\\sqrt{n}} \\xrightarrow{d} N(0,1).$$\n\nEJ:: Si \\(E[(X_n-X)^2]\\to0\\), entonces para cualquier \\(\\varepsilon>0\\):\n\n$$P(|X_n-X|>\\varepsilon) \\le \\frac{E[(X_n-X)^2]}{\\varepsilon^2} \\to 0,$$\n\nmostrando convergencia en probabilidad por desigualdad de Markov (o Chebyshev en forma equivalente).\n\n## Cierre\n\nLos estadisticos de orden describen la estructura interna de la muestra y son utiles en metodos robustos. Por su parte, las nociones de convergencia permiten justificar rigurosamente los procedimientos inferenciales cuando el tamano muestral crece.",
      topics: [
        "Estadisticos de orden",
        "Minimo, maximo y rango",
        "Distribucion del orden k",
        "Convergencia casi segura",
        "Convergencia en probabilidad y distribucion",
        "Convergencia en media cuadratica"
      ],
      sourceFile: "Clase 04 - Estadistica 2"
    },
    {
      id: "practica-01",
      moduleTitle: "Practica 01",
      title: "Practica integrada de inferencia y muestreo",
      description: "Lista de ejercicios para consolidar inferencia estadistica, distribuciones muestrales y estimacion.",
      content:
        "## Practica 01\n\nEsta practica se desarrolla antes de la Clase 05 y recopila ejercicios aplicados de inferencia estadistica.\n\n## Ejercicio 1\n\nSean \\(X_1, X_2, \\dots, X_5\\) iid con \\(f(x)=\\frac{2(x+2)}{5}\\), \\(0\\le x\\le1\\).\nSe pide:\n\n1) hallar la densidad del minimo muestral \\(X_{(1)}\\).\n\n## Ejercicio 2\n\nMovilidad en Medellin: \\(n=60\\), \\(\\bar{X}=280\\), bajo \\(X\\sim\\mathrm{Poisson}(260)\\).\nSe pide:\n\n1) calcular \\(P(\\bar{X}\\ge280)\\).\n\n2) calcular \\(P(\\mu\\le270)\\).\n\n## Ejercicio 3\n\nResistencia de hilos A y B (50 piezas por marca):\nA: \\(\\bar{X}_A=78.3\\), \\(S_A=5.6\\).\nB: \\(\\bar{X}_B=87.2\\), \\(S_B=6.3\\).\nSe pide:\n\n1) calcular \\(P(|\\mu_A-\\mu_B|\\le5)\\).\n\n## Ejercicio 4\n\nAcido sulfurico en 7 contenedores: 9.8, 10.2, 10.4, 9.8, 10.0, 10.2, 9.6.\nSe pide:\n\n1) hallar la probabilidad de que \\(9.7\\le\\mu\\le9.8\\).\n\n## Ejercicio 5\n\nSi \\(X_1,\\dots,X_n\\sim U(0,\\theta)\\), para \\(X_{(n)}=\\max(X_1,\\dots,X_n)\\).\nSe pide:\n\n1) densidad.\n\n2) distribucion acumulada.\n\n3) media y varianza.\n\n## Ejercicio 6\n\nRatones con dieta restringida: \\(\\sigma=5.8\\), \\(n=15\\).\nSe pide:\n\n1) calcular \\(P(|\\bar{X}-\\mu|\\le2)\\).\n\n## Ejercicio 7\n\nEstaturas universitarias: \\(n=50\\), \\(\\bar{X}=174.5\\), \\(S=6.9\\).\nSe pide:\n\n1) hallar \\(P(\\mu\\le172)\\).\n\n2) repetir con \\(\\sigma=7.3\\).\n\n## Ejercicio 8\n\nRefrigeradores: A con \\(n_A=50, x_A=12\\), B con \\(n_B=60, x_B=12\\).\nSe pide:\n\n1) calcular \\(P(p_A>p_B)\\).\n\n## Ejercicio 9\n\nTiempo de viaje exponencial con media 28 minutos y \\(n=50\\).\nSe pide:\n\n1) calcular \\(P(\\bar{X}\\ge30)\\).\n\n## Ejercicio 10\n\nTratamiento hospitalario (normal): \\(n=500\\), \\(\\bar{X}=5.4\\), \\(S=3.1\\).\nSe pide:\n\n1) calcular \\(P(\\sigma^2>8)\\).\n\n## Ejercicio 11\n\nGeometrica con \\(p=0.12\\), \\(n=60\\).\nSe pide:\n\n1) calcular \\(P(6\\le\\bar{X}\\le8)\\).\n\n## Ejercicio 12\n\nDos lineas de montaje: A (18 defectuosas/100), B (12 defectuosas/100).\nSe pide:\n\n1) calcular \\(P(p_B>p_A)\\).\n\n## Ejercicio 13\n\nTelevisores con vida exponencial media 10 anos; muestra \\(X_1,\\dots,X_{2m+1}\\).\nSe pide:\n\n1) hallar densidad de la mediana muestral \\(\\tilde{X}\\).\n\n## Ejercicio 14\n\nSAT (n=20): verbal \\(\\bar{X}=505, S=57\\), matematicas \\(\\bar{X}=495, S=69\\).\nSe pide:\n\n1) \\(P(\\mu_V\\ge508)\\).\n\n2) \\(P(\\mu_M\\le520)\\).\n\n## Ejercicio 15\n\nSistema de cohetes: 40 lanzamientos, 34 exitos, referencia \\(p=0.8\\).\nSe pide:\n\n1) calcular \\(P(p\\ge0.8)\\).\n\n## Ejercicio 16\n\nAcetanilida (10 datos): 3.85, 3.88, 3.90, 3.62, 3.72, 3.80, 3.85, 3.36, 4.01, 3.82.\nSe pide:\n\n1) calcular \\(P(3.69\\le\\mu\\le3.82)\\).\n\n## Ejercicio 17\n\nMedicamentos para hipertension: A \\(n=16,\\bar{X}=11,S=6\\), B \\(n=20,\\bar{X}=12,S=8\\).\nSe pide:\n\n1) \\(P(\\mu_A<\\mu_B)\\) con varianzas iguales.\n\n2) con varianzas diferentes.\n\n## Ejercicio 18\n\nPrecios de atun (normalidad).\nSe pide:\n\n1) \\(P(\\mu_{blanco,aceite}\\le1.4)\\).\n\n2) \\(P(\\sigma^2_{blanco,agua}>\\sigma^2_{claro,agua})\\).\n\n3) \\(P(\\mu_{blanco,aceite}<\\mu_{claro,aceite})\\).\n\n## Ejercicio 19\n\nRuido de camiones (muestra: 85.4, 86.8, 85.3, 84.8, 86.0).\nSe pide:\n\n1) \\(P(\\sigma^2>2)\\).\n\n2) \\(P(|\\mu-\\bar{X}|\\le0.4)\\).\n\n## Ejercicio 20\n\nBloque integrador del listado original.\nSe pide:\n\n1) resolver diferencias de medias.\n\n2) diferencias de proporciones.\n\n3) razon de varianzas.\n\n4) estadisticos de orden en contextos aplicados.",
      topics: [
        "Practica guiada",
        "Inferencia estadistica",
        "Distribuciones muestrales",
        "Comparacion de parametros",
        "Proporciones y varianzas",
        "Aplicaciones"
      ],
      sourceFile: "Practica 01 - Estadistica 2"
    },
    {
      id: "clase-5",
      moduleTitle: "Clase #5",
      title: "Estimacion puntual, insesgadez y eficiencia",
      description: "Criterios de calidad de estimadores: insesgadez, sesgo asintotico y eficiencia relativa.",
      content:
        "## Estimacion puntual\n\nUna estimacion puntual es un unico valor calculado con la muestra para aproximar un parametro poblacional desconocido.\n\nEn la practica pueden existir varios estimadores para el mismo parametro, por lo que se comparan mediante criterios de calidad estadistica.\n\n## Insesgadez\n\nDEF:: Un estimador \\(^\\hat{\\theta}\\) es insesgado para \\(\\theta\\) si\\n\\n$$E(\\hat{\\theta})=\\theta.$$\n\nSi no se cumple, el estimador es sesgado y su sesgo es:\n\n$$B(\\hat{\\theta})=E(\\hat{\\theta})-\\theta.$$\n\n## Ejercicio 1: sesgo de \\($\\tilde{S}^2\\)\n\nSea \\(X_1, X_2, \\dots, X_n\\) una muestra aleatoria con \\(E(X)=\\mu\\) y \\(Var(X)=\\sigma^2\\). Defina\n\n$$\\tilde{S}^2=\\frac{1}{n}\\sum_{i=1}^{n}(X_i-\\bar{X})^2.$$\n\nSe pide: 1) verificar si \\(\\tilde{S}^2\\) es insesgado para \\(\\sigma^2\\); 2) si no lo es, hallar su sesgo.\n\nSolucion:\n\nUsamos la identidad\\n\n$$\\sum_{i=1}^{n}(X_i-\\bar{X})^2=\\sum_{i=1}^{n}(X_i-\\mu)^2-n(\\bar{X}-\\mu)^2.$$\n\nTomando esperanza:\n\n$$E(\\tilde{S}^2)=\\frac{1}{n}\\left[\\sum_{i=1}^{n}E((X_i-\\mu)^2)-nE((\\bar{X}-\\mu)^2)\\right].$$\n\nComo \\(E((X_i-\\mu)^2)=\\sigma^2\\) y \\(E((\\bar{X}-\\mu)^2)=Var(\\bar{X})=\\sigma^2/n\\), resulta:\n\n$$E(\\tilde{S}^2)=\\frac{1}{n}\\left[n\\sigma^2-n\\left(\\frac{\\sigma^2}{n}\\right)\\right]=\\frac{n-1}{n}\\sigma^2.$$\n\nPor tanto, \\(\\tilde{S}^2\\) es sesgado y\\n\n$$B(\\tilde{S}^2)=E(\\tilde{S}^2)-\\sigma^2=\\frac{n-1}{n}\\sigma^2-\\sigma^2=-\\frac{\\sigma^2}{n}.$$\n\n## Estimador asintoticamente insesgado\n\nDEF:: Un estimador sesgado \\(^\\hat{\\theta}\\) es asintoticamente insesgado si\\n\n$$\\lim_{n\\to\\infty}B(\\hat{\\theta})=0.$$\n\n## Ejercicio 2: asintotica de \\($\\tilde{S}^2\\)\n\nCon el sesgo hallado en el ejercicio anterior:\n\n$$B(\\tilde{S}^2)=-\\frac{\\sigma^2}{n}.$$\n\nEntonces\n\n$$\\lim_{n\\to\\infty}B(\\tilde{S}^2)=\\lim_{n\\to\\infty}-\\frac{\\sigma^2}{n}=0.$$\n\nConclusion: \\(\\tilde{S}^2\\) no es insesgado en muestras finitas, pero si es asintoticamente insesgado.\n\n## Eficiencia y eficiencia relativa\n\nSean \\(\\hat{\\theta}_1\\) y \\(\\hat{\\theta}_2\\) estimadores insesgados del mismo parametro \\(\\theta\\), calculados con el mismo tamano muestral.\n\n- \\(\\hat{\\theta}_1\\) es mas eficiente que \\(\\hat{\\theta}_2\\) si\\n$$Var(\\hat{\\theta}_1)<Var(\\hat{\\theta}_2).$$\n\n- Eficiencia relativa:\n$$EFR=\\frac{Var(\\hat{\\theta}_1)}{Var(\\hat{\\theta}_2)}.$$\n\nInterpretacion:\n- Si \\(EFR<1\\), \\(\\hat{\\theta}_1\\) es mas eficiente.\n- Si \\(EFR=1\\), son igual de eficientes.\n- Si \\(EFR>1\\), \\(\\hat{\\theta}_1\\) es menos eficiente.\n\n## Ejercicio 3: comparacion de dos estimadores de \\($\\mu\\)\n\nSea una muestra \\(X_1, X_2, \\dots, X_{50}\\) con \\(E(X)=\\mu\\), \\(Var(X)=\\sigma^2\\). Defina\n\n$$\\bar{X}_1=\\frac{1}{50}\\sum_{i=1}^{50}X_i,\\qquad \\bar{X}_2=\\frac{1}{4}(X_1+X_7+X_{10}+X_{50}).$$\n\nSe pide: 1) calcular la eficiencia relativa; 2) concluir cual es mas eficiente.\n\nSolucion:\n\nPara \\(\\bar{X}_1\\):\n\n$$Var(\\bar{X}_1)=\\frac{\\sigma^2}{50}.$$\n\nPara \\(\\bar{X}_2\\), usando independencia:\n\n$$Var(\\bar{X}_2)=Var\\left(\\frac{1}{4}(X_1+X_7+X_{10}+X_{50})\\right)=\\frac{1}{16}(4\\sigma^2)=\\frac{\\sigma^2}{4}.$$\n\nEficiencia relativa de \\(\\bar{X}_1\\) respecto a \\(\\bar{X}_2\\):\n\n$$EFR=\\frac{Var(\\bar{X}_1)}{Var(\\bar{X}_2)}=\\frac{\\sigma^2/50}{\\sigma^2/4}=\\frac{4}{50}=0.08.$$\n\nComo \\(0.08<1\\), se concluye que \\(\\bar{X}_1\\) es mas eficiente que \\(\\bar{X}_2\\).\n\n## Cierre\n\n- \\(\\tilde{S}^2\\) es sesgado para \\(\\sigma^2\\), pero su sesgo se anula cuando \\(n\\) crece.\n- Entre dos estimadores insesgados, la menor varianza define mayor eficiencia.",
      topics: [
        "Estimacion puntual",
        "Insesgadez y sesgo",
        "Asintotica del sesgo",
        "Eficiencia",
        "Eficiencia relativa",
        "Comparacion de estimadores"
      ],
      sourceFile: "Clase 05 - Estadistica 2"
    }
  ]);

  const classModulesWithImage = classModules.map(function (moduleItem, index) {
    const num = String(index + 1).padStart(2, "0");
    const encodedTitle = encodeURIComponent(moduleItem.subtitle || moduleItem.title || ("Clase " + num));
    const encodedSource = encodeURIComponent(moduleItem.sourceFile || "");
    return Object.assign({}, moduleItem, {
      image: "generated:class-" + num + "|" + encodedTitle + "|" + encodedSource
    });
  });

  return [
    {
      id: "sobre-el-curso",
      title: "Sobre el Curso",
      subtitle: "Estadistica 2",
      description: "Curso enfocado en inferencia estadistica y analisis probabilistico para toma de decisiones.",
      content:
        "Estadistica 2 desarrolla herramientas para realizar inferencia a partir de muestras, construir estimadores y cuantificar incertidumbre mediante modelos probabilisticos.\n\nLa Clase 01 introduce los fundamentos: inferencia estadistica, estadisticos muestrales y distribucion muestral de la media, junto con ejercicios de probabilidad normal estandar.",
      topics: ["Inferencia", "Muestreo", "Normal estandar", "Estadisticos"],
      sourceFile: "Programa base Estadistica 2"
    }
  ].concat(classModulesWithImage);
}

function createJaponesN5Modules() {
  function normalizeJaponesN5Text(value) {
    const replacements = [
      [/\bAdemas\b/g, "Además"],
      [/\bademas\b/g, "además"],
      [/\bAnalisis\b/g, "Análisis"],
      [/\banalisis\b/g, "análisis"],
      [/\bautonoma\b/g, "autónoma"],
      [/\bautonomos\b/g, "autónomos"],
      [/\bAutonomos\b/g, "Autónomos"],
      [/\bbano\b/g, "baño"],
      [/\bBasica\b/g, "Básica"],
      [/\bbasica\b/g, "básica"],
      [/\bBasicas\b/g, "Básicas"],
      [/\bbasicas\b/g, "básicas"],
      [/\bBasico\b/g, "Básico"],
      [/\bbasico\b/g, "básico"],
      [/\bBasicos\b/g, "Básicos"],
      [/\bbasicos\b/g, "básicos"],
      [/\bcaracteristicas\b/g, "características"],
      [/\bCaracteristicas\b/g, "Características"],
      [/\bclasificacion\b/g, "clasificación"],
      [/\bCombinacion\b/g, "Combinación"],
      [/\bcombinacion\b/g, "combinación"],
      [/\bcomparacion\b/g, "comparación"],
      [/\bComparacion\b/g, "Comparación"],
      [/\bcomprendera\b/g, "comprenderá"],
      [/\bComprendera\b/g, "Comprenderá"],
      [/\bcomprension\b/g, "comprensión"],
      [/\bComprension\b/g, "Comprensión"],
      [/\bcomunicacion\b/g, "comunicación"],
      [/\bComunicacion\b/g, "Comunicación"],
      [/\bconjugacion\b/g, "conjugación"],
      [/\bConjugacion\b/g, "Conjugación"],
      [/\bconstruccion\b/g, "construcción"],
      [/\bConstruccion\b/g, "Construcción"],
      [/\bcortesia\b/g, "cortesía"],
      [/\bdescripcion\b/g, "descripción"],
      [/\bDescripcion\b/g, "Descripción"],
      [/\bDespues\b/g, "Después"],
      [/\bdespues\b/g, "después"],
      [/\bdia\b/g, "día"],
      [/\bdias\b/g, "días"],
      [/\bdisenado\b/g, "diseñado"],
      [/\bdistribucion\b/g, "distribución"],
      [/\bduracion\b/g, "duración"],
      [/\bentonacion\b/g, "entonación"],
      [/\bEntonacion\b/g, "Entonación"],
      [/\bespecificos\b/g, "específicos"],
      [/\besta\b bien/g, "está bien"],
      [/\bestara\b/g, "estará"],
      [/\bEvaluacion\b/g, "Evaluación"],
      [/\bevaluacion\b/g, "evaluación"],
      [/\bexpresion\b/g, "expresión"],
      [/\bExpresion\b/g, "Expresión"],
      [/\bExpresiones de hora: gozen, gogo, -ji, -fun\b/g, "Expresiones de hora: gozen, gogo, -ji, -fun"],
      [/\bfrances\b/g, "francés"],
      [/\bfuncion\b/g, "función"],
      [/\bFuncion\b/g, "Función"],
      [/\bgramatica\b/g, "gramática"],
      [/\bGramatica\b/g, "Gramática"],
      [/\bidentificara\b/g, "identificará"],
      [/\bIdentificacion\b/g, "Identificación"],
      [/\bidentificacion\b/g, "identificación"],
      [/\bingles\b/g, "inglés"],
      [/\bInformacion\b/g, "Información"],
      [/\binformacion\b/g, "información"],
      [/\bIntegracion\b/g, "Integración"],
      [/\bintegracion\b/g, "integración"],
      [/\binterrogacion\b/g, "interrogación"],
      [/\bIntroduccion\b/g, "Introducción"],
      [/\bintroduccion\b/g, "introducción"],
      [/\bintencion\b/g, "intención"],
      [/\bIrregularidades es comun\b/g, "Irregularidades es común"],
      [/\bjapones\b/g, "japonés"],
      [/\bJapones\b/g, "Japonés"],
      [/\bleccion\b/g, "lección"],
      [/\bLeccion\b/g, "Lección"],
      [/\blinea\b/g, "línea"],
      [/\blinguistico\b/g, "lingüístico"],
      [/\bLinguistico\b/g, "Lingüístico"],
      [/\blogica\b/g, "lógica"],
      [/\bmas\b/g, "más"],
      [/\bMas\b/g, "Más"],
      [/\bmetodologia\b/g, "metodología"],
      [/\bMetodologia\b/g, "Metodología"],
      [/\bnumero\b/g, "número"],
      [/\bNumeros\b/g, "Números"],
      [/\bnumeros\b/g, "números"],
      [/\bobjetivo\b/g, "objetivo"],
      [/\bobjetos inanimados y cosas, e imasu .* ubicacion de cosas y personas\b/g, "objetos inanimados y cosas, e imasu (います) para personas y animales. Se aprende a describir la ubicación de cosas y personas."],
      [/\boracion\b/g, "oración"],
      [/\bOracion\b/g, "Oración"],
      [/\borganizacion\b/g, "organización"],
      [/\bpais\b/g, "país"],
      [/\bpaises\b/g, "países"],
      [/\bparticula\b/g, "partícula"],
      [/\bParticula\b/g, "Partícula"],
      [/\bparticulas\b/g, "partículas"],
      [/\bParticulas\b/g, "Partículas"],
      [/\bperdon\b/g, "perdón"],
      [/\bpequena\b/g, "pequeña"],
      [/\bpequeno\b/g, "pequeño"],
      [/\bportugues\b/g, "portugués"],
      [/\bPosicion\b/g, "Posición"],
      [/\bposicion\b/g, "posición"],
      [/\bpractica\b autonoma/g, "práctica autónoma"],
      [/\bPractica guiada\b/g, "Práctica guiada"],
      [/\bprecision\b/g, "precisión"],
      [/\bPrecision\b/g, "Precisión"],
      [/\bPresentacion\b/g, "Presentación"],
      [/\bpresentacion\b/g, "presentación"],
      [/\bprohibicion\b/g, "prohibición"],
      [/\bproposito\b/g, "propósito"],
      [/\bpronunciacion\b/g, "pronunciación"],
      [/\bPronunciacion\b/g, "Pronunciación"],
      [/\bpublicos\b/g, "públicos"],
      [/\bque\b es/g, "qué es"],
      [/\brazon\b/g, "razón"],
      [/\bRaiz\b/g, "Raíz"],
      [/\braiz\b/g, "raíz"],
      [/\breconocera\b/g, "reconocerá"],
      [/\bReconocera\b/g, "Reconocerá"],
      [/\breflexion\b/g, "reflexión"],
      [/\brelacion\b/g, "relación"],
      [/\bRelacion\b/g, "Relación"],
      [/\bretencion\b/g, "retención"],
      [/\bSesion\b/g, "Sesión"],
      [/\bsesion\b/g, "sesión"],
      [/\bsi, asi es\b/g, "sí, así es"],
      [/\bsi, como\b/g, "sí, como"],
      [/\bsilaba\b/g, "sílaba"],
      [/\bsilabas\b/g, "sílabas"],
      [/\bsilabario fonetico\b/g, "silabario fonético"],
      [/\bsilabico\b/g, "silábico"],
      [/\bsimbolo\b/g, "símbolo"],
      [/\bSituacion\b/g, "Situación"],
      [/\bsituacion\b/g, "situación"],
      [/\bsolida\b/g, "sólida"],
      [/\bTambien\b/g, "También"],
      [/\btambien\b/g, "también"],
      [/\btecnica\b/g, "técnica"],
      [/\btecnologico\b/g, "tecnológico"],
      [/\bteoria\b/g, "teoría"],
      [/\bTeoria\b/g, "Teoría"],
      [/\btipico\b/g, "típico"],
      [/\btranscripcion\b/g, "transcripción"],
      [/\bubicacion\b/g, "ubicación"],
      [/\butilizara\b/g, "utilizará"],
      [/\bUtilizara\b/g, "Utilizará"],
      [/\bunicamente\b/g, "únicamente"],
      [/\bvision\b/g, "visión"],
      [/\bVision\b/g, "Visión"],
      [/\bvocalica\b/g, "vocálica"],
      [/\bteorica y practica\b/g, "teórica y práctica"],
      [/\bQué es esto\?/g, "¿Qué es esto?"],
      [/\bQue es esto\?/g, "¿Qué es esto?"],
      [/\bQue es eso\?/g, "¿Qué es eso?"],
      [/\bDonde esta el baño\?/g, "¿Dónde está el baño?"],
      [/\bDonde esta la escuela\?/g, "¿Dónde está la escuela?"],
      [/\bA donde vas\?/g, "¿A dónde vas?"],
      [/\bEres estudiante\?/g, "¿Eres estudiante?"],
      [/\bEres profesor\?/g, "¿Eres profesor?"],
      [/\bAquello es una escuela\?/g, "¿Aquello es una escuela?"],
      [/\bCual\b/g, "Cuál"],
      [/\bcual\b/g, "cuál"],
      [/\bPor que\b/g, "Por qué"],
      [/\bpor que\b/g, "por qué"]
    ];

    if (typeof value === "string") {
      return replacements.reduce(function (text, entry) {
        return text.replace(entry[0], entry[1]);
      }, value);
    }

    if (Array.isArray(value)) {
      return value.map(normalizeJaponesN5Text);
    }

    if (value && typeof value === "object") {
      return Object.keys(value).reduce(function (acc, key) {
        acc[key] = normalizeJaponesN5Text(value[key]);
        return acc;
      }, {});
    }

    return value;
  }

  const classModules = createClassModules([
    {
      title: "Introduccion al japones + sistema de escritura",
      description: "Vision general del idioma japones: su historia, importancia y los tres sistemas de escritura (hiragana, katakana y kanji). Se explica como cada sistema se usa en la practica y por que el orden de aprendizaje importa.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera como funciona el idioma japones a nivel general, identificara sus sistemas de escritura y reconocera las principales caracteristicas que lo diferencian de los idiomas occidentales.\n\n## Introduccion al idioma japones\n\nEl japones es un idioma hablado por mas de 120 millones de personas, principalmente en Japon.\n\nA diferencia del espanol, presenta una estructura gramatical distinta, un sistema de escritura mixto y una organizacion del pensamiento mas contextual.\n\nUna de las principales diferencias esta en el orden de la oracion.\n\n- En espanol se usa sujeto-verbo-objeto.\n- En japones se usa sujeto-objeto-verbo.\n\nEspanol: Yo como sushi.\n\nJapones: Yo sushi como.\n\nAdemas, el japones omite con frecuencia el sujeto cuando este se sobreentiende en el contexto, por lo que la comprension depende en gran medida de la situacion comunicativa.\n\n## Sistemas de escritura del japones\n\nEl japones utiliza tres sistemas de escritura que funcionan de manera complementaria.\n\nComprender su logica desde el inicio resulta fundamental para avanzar con bases solidas.\n\n## Hiragana (\u3072\u3089\u304c\u306a)\n\nEs un silabario fonetico utilizado para palabras de origen japones y terminaciones gramaticales.\n\nCada simbolo representa una silaba.\n\nEjemplos:\n\n- \u3042 (a)\n- \u3044 (i)\n- \u3046 (u)\n- \u3048 (e)\n- \u304a (o)\n\nSe utiliza para:\n\n- Palabras nativas\n- Particulas gramaticales\n- Terminaciones verbales\n\n## Katakana (\u30ab\u30bf\u30ab\u30ca)\n\nTambien es un silabario fonetico, pero se emplea principalmente para palabras extranjeras, nombres propios y enfasis.\n\nEjemplos:\n\n- \u30a2 (a)\n- \u30a4 (i)\n- \u30a6 (u)\n- \u30a8 (e)\n- \u30aa (o)\n\nSe utiliza para:\n\n- Palabras extranjeras\n- Nombres extranjeros\n- Onomatopeyas\n\nEjemplo: \u30b3\u30f3\u30d4\u30e5\u30fc\u30bf = computadora.\n\n## Kanji (\u6f22\u5b57)\n\nSon caracteres de origen chino que representan ideas o conceptos.\n\nA diferencia de los silabarios, cada kanji tiene significado propio.\n\nEjemplos:\n\n- \u65e5 (dia / sol)\n- \u4eba (persona)\n- \u6c34 (agua)\n\nEl uso de kanji permite reducir la ambiguedad y condensar informacion en menos caracteres.\n\n## Como se combinan los sistemas\n\nEn una misma oracion japonesa se pueden usar los tres sistemas simultaneamente.\n\nEjemplo:\n\n\u308f\u305f\u3057\u306f\u5b66\u751f\u3067\u3059\n\nWatashi wa gakusei desu - Yo soy estudiante.\n\nDesglose:\n\n- \u308f\u305f\u3057 = hiragana\n- \u306f = particula en hiragana\n- \u5b66\u751f = kanji\n- \u3067\u3059 = hiragana\n\nEn niveles iniciales se comienza con hiragana, luego katakana y finalmente kanji.\n\n## Pronunciacion basica\n\nEl japones tiene una pronunciacion regular y consistente.\n\nCada silaba se pronuncia casi siempre de la misma manera.\n\nCaracteristicas clave:\n\n- Todas las vocales se pronuncian claramente: a, i, u, e, o\n- No hay acentos fuertes como en espanol\n- Cada silaba tiene la misma duracion\n\nEjemplo:\n\n\u3055\u304f\u3089 (sa-ku-ra) se pronuncia de forma uniforme.\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"categorize\",\"title\":\"Identificacion\",\"instruction\":\"Arrastra cada simbolo al sistema de escritura correcto.\",\"bank\":[{\"items\":[\"\u3042\",\"\u30a2\",\"\u6c34\",\"\u3044\",\"\u30ab\"],\"groups\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answers\":{\"\u3042\":\"Hiragana\",\"\u30a2\":\"Katakana\",\"\u6c34\":\"Kanji\",\"\u3044\":\"Hiragana\",\"\u30ab\":\"Katakana\"}},{\"items\":[\"\u304a\",\"\u30aa\",\"\u65e5\",\"\u3046\",\"\u30a4\"],\"groups\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answers\":{\"\u304a\":\"Hiragana\",\"\u30aa\":\"Katakana\",\"\u65e5\":\"Kanji\",\"\u3046\":\"Hiragana\",\"\u30a4\":\"Katakana\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Relacion\",\"instruction\":\"Relaciona cada sistema con su uso principal.\",\"bank\":[{\"targets\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"items\":[\"Gramatica y palabras nativas\",\"Palabras extranjeras\",\"Conceptos e ideas\"],\"answers\":{\"Hiragana\":\"Gramatica y palabras nativas\",\"Katakana\":\"Palabras extranjeras\",\"Kanji\":\"Conceptos e ideas\"}},{\"targets\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"items\":[\"Particulas y terminaciones\",\"Prestamos linguisticos\",\"Significados propios\"],\"answers\":{\"Hiragana\":\"Particulas y terminaciones\",\"Katakana\":\"Prestamos linguisticos\",\"Kanji\":\"Significados propios\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Observacion\",\"instruction\":\"Observa la palabra y responde.\",\"bank\":[{\"word\":\"\u30b3\u30f3\u30d4\u30e5\u30fc\u30bf\",\"questions\":[{\"q\":\"Que sistema de escritura se esta utilizando?\",\"options\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answer\":\"Katakana\"},{\"q\":\"Por que se usa ese sistema?\",\"options\":[\"Es una palabra extranjera\",\"Es una palabra nativa japonesa\",\"Es un concepto escrito con kanji\"],\"answer\":\"Es una palabra extranjera\"}]},{\"word\":\"\u30c6\u30ec\u30d3\",\"questions\":[{\"q\":\"Que sistema de escritura se esta utilizando?\",\"options\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answer\":\"Katakana\"},{\"q\":\"Que tipo de palabra suele escribirse asi?\",\"options\":[\"Palabra extranjera o prestamo\",\"Particula gramatical\",\"Verbo en forma basica\"],\"answer\":\"Palabra extranjera o prestamo\"}]}]}\n\n## Ejercicios autonomos\n\n- Investiga tres palabras en japones escritas en katakana y escribelas con su traduccion al espanol.\n- Escribe cinco ejemplos de hiragana usando una tabla basica.\n- Busca tres kanji y anota su significado.",
      topics: ["Historia del japones", "Hiragana, katakana y kanji", "Diferencias entre sistemas", "Ruta de aprendizaje N5", "Recursos recomendados"]
    },
    {
      title: "Hiragana (parte 1)",
      description: "Introduccion a las vocales del hiragana y a la columna K. Se trabaja reconocimiento visual, pronunciacion, lectura basica y primeros trazos del sistema japones.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante reconocera, leera y escribira las vocales del hiragana y los primeros sonidos de la columna K, comprendiendo su pronunciacion y uso basico.\n\n## Introduccion al hiragana\n\nEl hiragana es el primer sistema de escritura que se debe dominar en japones.\n\nSe trata de un silabario fonetico en el que cada simbolo representa un sonido especifico.\n\nA diferencia del alfabeto espanol, no se combinan letras para formar silabas, sino que cada caracter ya contiene una silaba completa.\n\nEn esta clase se estudiaran las bases del sistema: las cinco vocales y la primera serie consonantica.\n\nEste conjunto constituye el punto de partida para la lectura en japones.\n\n## Las vocales en hiragana\n\nLas vocales son fundamentales, ya que todos los sonidos del japones se construyen a partir de ellas.\n\n- \u3042 = a = como la a de casa\n- \u3044 = i = como la i de vino\n- \u3046 = u = como la u de tu, pero mas suave\n- \u3048 = e = como la e de mesa\n- \u304a = o = como la o de sol\n\nAspectos clave:\n\n- La pronunciacion es constante y no cambia segun la palabra\n- Todas las vocales tienen la misma duracion\n- No existen vocales mudas\n\n## Columna K (\u304b\u884c)\n\nAl agregar la consonante k a cada vocal, se forma la primera serie de silabas.\n\n- \u304b = ka = \u304b\u3055 (kasa - paraguas)\n- \u304d = ki = \u304d\u304f (kiku - escuchar)\n- \u304f = ku = \u304f\u306b (kuni - pais)\n- \u3051 = ke = \u3051\u3080\u308a (kemuri - humo)\n- \u3053 = ko = \u3053\u3053 (koko - aqui)\n\n## Escritura basica\n\nCada caracter tiene un orden de trazos especifico que facilita la escritura correcta y la legibilidad.\n\nPrincipios generales:\n\n- Se escribe de arriba hacia abajo\n- Se escribe de izquierda a derecha\n- Los trazos siguen un orden fijo\n\nEjemplos:\n\n- \u3042 -> 3 trazos\n- \u304d -> 4 trazos\n\nNo es necesario memorizar todos los trazos perfectamente en esta etapa, pero si comenzar a familiarizarse con su forma correcta.\n\n## Lectura basica\n\nA partir de los caracteres aprendidos, ya es posible leer combinaciones simples.\n\n- \u3042\u3044 -> ai\n- \u3044\u3048 -> ie (casa)\n- \u304b\u304a -> kao (cara)\n- \u3053\u3053 -> koko (aqui)\n\nEste tipo de lectura permite al estudiante comenzar a reconocer patrones del idioma.\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Lectura\",\"instruction\":\"Arrastra el sonido correcto a cada hiragana.\",\"bank\":[{\"targets\":[\"\u3042\",\"\u3044\",\"\u304b\",\"\u304d\",\"\u3053\"],\"items\":[\"a\",\"i\",\"ka\",\"ki\",\"ko\"],\"answers\":{\"\u3042\":\"a\",\"\u3044\":\"i\",\"\u304b\":\"ka\",\"\u304d\":\"ki\",\"\u3053\":\"ko\"}},{\"targets\":[\"\u3046\",\"\u3048\",\"\u304a\",\"\u304f\",\"\u3051\"],\"items\":[\"u\",\"e\",\"o\",\"ku\",\"ke\"],\"answers\":{\"\u3046\":\"u\",\"\u3048\":\"e\",\"\u304a\":\"o\",\"\u304f\":\"ku\",\"\u3051\":\"ke\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Asociacion\",\"instruction\":\"Relaciona cada hiragana con su lectura romanizada.\",\"bank\":[{\"targets\":[\"\u3048\",\"\u304f\",\"\u304a\",\"\u3051\"],\"items\":[\"ku\",\"e\",\"ke\",\"o\"],\"answers\":{\"\u3048\":\"e\",\"\u304f\":\"ku\",\"\u304a\":\"o\",\"\u3051\":\"ke\"}},{\"targets\":[\"\u3042\",\"\u304d\",\"\u3046\",\"\u304b\"],\"items\":[\"u\",\"a\",\"ki\",\"ka\"],\"answers\":{\"\u3042\":\"a\",\"\u304d\":\"ki\",\"\u3046\":\"u\",\"\u304b\":\"ka\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Escritura mental\",\"instruction\":\"Selecciona el hiragana correcto para cada sonido.\",\"bank\":[{\"questions\":[{\"q\":\"Cual es el hiragana para a?\",\"options\":[\"\u3042\",\"\u3044\",\"\u3048\"],\"answer\":\"\u3042\"},{\"q\":\"Cual es el hiragana para ki?\",\"options\":[\"\u304d\",\"\u304f\",\"\u3051\"],\"answer\":\"\u304d\"},{\"q\":\"Cual es el hiragana para ko?\",\"options\":[\"\u3053\",\"\u304b\",\"\u304a\"],\"answer\":\"\u3053\"},{\"q\":\"Cual es el hiragana para u?\",\"options\":[\"\u3046\",\"\u304a\",\"\u3048\"],\"answer\":\"\u3046\"},{\"q\":\"Cual es el hiragana para ke?\",\"options\":[\"\u3051\",\"\u304d\",\"\u304f\"],\"answer\":\"\u3051\"}]},{\"questions\":[{\"q\":\"Cual es el hiragana para i?\",\"options\":[\"\u3044\",\"\u3042\",\"\u3048\"],\"answer\":\"\u3044\"},{\"q\":\"Cual es el hiragana para ka?\",\"options\":[\"\u304d\",\"\u304b\",\"\u3053\"],\"answer\":\"\u304b\"},{\"q\":\"Cual es el hiragana para ku?\",\"options\":[\"\u3051\",\"\u3053\",\"\u304f\"],\"answer\":\"\u304f\"},{\"q\":\"Cual es el hiragana para o?\",\"options\":[\"\u304a\",\"\u3046\",\"\u3048\"],\"answer\":\"\u304a\"},{\"q\":\"Cual es el hiragana para e?\",\"options\":[\"\u3048\",\"\u3042\",\"\u3044\"],\"answer\":\"\u3048\"}]}]}\n\n## Ejercicios autonomos\n\n- Practica escribiendo cada caracter diez veces\n- Crea combinaciones simples como \u3042\u304b, \u3044\u3053 y \u3046\u304d\n- Intenta leer palabras cortas buscando ejemplos en internet o en diccionarios basicos.",
      topics: ["Vocales: a i u e o", "Columna k: ka ki ku ke ko", "Pronunciacion basica", "Primeros trazos", "Lectura de combinaciones simples"]
    },
    {
      title: "Hiragana (parte 2)",
      description: "Estudio de las columnas S y T del hiragana, con enfasis en sus irregularidades de pronunciacion, lectura combinada y reconocimiento de palabras simples.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante reconocera, leera y escribira las silabas correspondientes a las columnas S y T del hiragana, comprendiendo sus particularidades de pronunciacion y uso.\n\n## Continuacion del hiragana\n\nEn la clase anterior se abordaron las vocales y la columna K.\n\nEn esta sesion se amplia el repertorio con dos nuevas columnas fundamentales, lo que permite aumentar significativamente la capacidad de lectura de combinaciones simples.\n\nEl aprendizaje del hiragana se construye de manera acumulativa.\n\nPor esta razon, es importante integrar constantemente los caracteres ya vistos con los nuevos contenidos.\n\n## Columna S (さ行)\n\nEsta serie se forma combinando la consonante s con las vocales.\n\nSin embargo, presenta una irregularidad importante en una de sus silabas.\n\n- さ = sa = regular\n- し = shi = irregular, no se pronuncia si\n- す = su = regular\n- せ = se = regular\n- そ = so = regular\n\nAspectos clave:\n\n- し se pronuncia shi, no si\n- Este tipo de irregularidades es comun en japones y debe memorizarse como una unidad completa\n\nEjemplos:\n\n- すし = sushi\n- そこ = soko (alli)\n\n## Columna T (た行)\n\nEsta serie tambien presenta irregularidades importantes en su pronunciacion.\n\n- た = ta = regular\n- ち = chi = irregular\n- つ = tsu = irregular\n- て = te = regular\n- と = to = regular\n\nAspectos clave:\n\n- ち se pronuncia chi\n- つ se pronuncia tsu, un sonido que no existe exactamente en espanol\n- Estas formas deben aprenderse como sonidos independientes\n\nEjemplos:\n\n- ちず = chizu (mapa)\n- つき = tsuki (luna)\n- とも = tomo (amigo, en ciertos contextos)\n\n## Lectura combinada\n\nCon las columnas aprendidas hasta ahora, ya es posible leer una mayor variedad de combinaciones.\n\n- あした -> ashita (manana)\n- さけ -> sake\n- そこ -> soko (alli)\n- たこ -> tako (pulpo)\n- いち -> ichi (uno)\n\nEste avance marca un punto importante, ya que el estudiante comienza a reconocer palabras reales del idioma.\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Lectura\",\"instruction\":\"Arrastra la lectura correcta a cada hiragana.\",\"bank\":[{\"targets\":[\"さ\",\"し\",\"す\",\"た\",\"ち\",\"つ\"],\"items\":[\"sa\",\"shi\",\"su\",\"ta\",\"chi\",\"tsu\"],\"answers\":{\"さ\":\"sa\",\"し\":\"shi\",\"す\":\"su\",\"た\":\"ta\",\"ち\":\"chi\",\"つ\":\"tsu\"}},{\"targets\":[\"せ\",\"そ\",\"て\",\"と\",\"し\",\"つ\"],\"items\":[\"se\",\"so\",\"te\",\"to\",\"shi\",\"tsu\"],\"answers\":{\"せ\":\"se\",\"そ\":\"so\",\"て\":\"te\",\"と\":\"to\",\"し\":\"shi\",\"つ\":\"tsu\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Identificacion\",\"instruction\":\"Relaciona cada hiragana irregular con su pronunciacion correcta.\",\"bank\":[{\"targets\":[\"し\",\"ち\",\"つ\"],\"items\":[\"chi\",\"tsu\",\"shi\"],\"answers\":{\"し\":\"shi\",\"ち\":\"chi\",\"つ\":\"tsu\"}},{\"targets\":[\"し\",\"ち\",\"つ\"],\"items\":[\"shi\",\"tsu\",\"chi\"],\"answers\":{\"し\":\"shi\",\"ち\":\"chi\",\"つ\":\"tsu\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Relacion\",\"instruction\":\"Relaciona correctamente cada hiragana con su lectura.\",\"bank\":[{\"targets\":[\"さ\",\"と\",\"せ\",\"た\"],\"items\":[\"to\",\"sa\",\"se\",\"ta\"],\"answers\":{\"さ\":\"sa\",\"と\":\"to\",\"せ\":\"se\",\"た\":\"ta\"}},{\"targets\":[\"そ\",\"て\",\"す\",\"ち\"],\"items\":[\"so\",\"te\",\"su\",\"chi\"],\"answers\":{\"そ\":\"so\",\"て\":\"te\",\"す\":\"su\",\"ち\":\"chi\"}}]}\n\n## Ejercicios autonomos\n\n- Escribe cada caracter de las columnas S y T al menos diez veces\n- Crea cinco combinaciones nuevas usando caracteres de las clases 2 y 3\n- Practica la lectura en voz alta de palabras simples como すし, たこ y あした",
      topics: ["Columna s: sa shi su se so", "Columna t: ta chi tsu te to", "Irregularidades: shi, chi, tsu", "Lectura de palabras simples", "Integracion con vocales y columna k"]
    },
    {
      title: "Hiragana (parte 3) + combinaciones",
      description: "Cierre del aprendizaje del hiragana con las columnas restantes, combinaciones basicas, consonante doble y vocales largas para una lectura funcional del japones.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante reconocera, leera y escribira las columnas restantes del hiragana, asi como las combinaciones basicas, la consonante doble y las vocales largas, integrando estos elementos en lectura funcional.\n\n## Continuacion y cierre del hiragana\n\nEn las clases anteriores se trabajaron las vocales y las columnas K, S y T.\n\nEn esta sesion se completan las columnas restantes del hiragana y se introducen reglas esenciales que permiten leer japones de manera mas natural.\n\nEste momento es clave, ya que marca el cierre del aprendizaje del hiragana como sistema completo.\n\n## Columnas restantes del hiragana\n\n## Columna N (な行)\n\n- な = na\n- に = ni\n- ぬ = nu\n- ね = ne\n- の = no\n\nEjemplo:\n\n- ねこ -> neko (gato)\n\n## Columna H (は行)\n\n- は = ha, aunque a veces se lee wa como particula\n- ひ = hi\n- ふ = fu, sonido suave entre fu y hu\n- へ = he, aunque a veces se lee e como particula\n- ほ = ho\n\nEjemplo:\n\n- はな -> hana (flor)\n\n## Columna M (ま行)\n\n- ま = ma\n- み = mi\n- む = mu\n- め = me\n- も = mo\n\n## Columna Y (や行)\n\n- や = ya\n- ゆ = yu\n- よ = yo\n\n## Columna R (ら行)\n\n- ら = ra\n- り = ri\n- る = ru\n- れ = re\n- ろ = ro\n\nNota: el sonido r japones es suave, entre r y l.\n\n## Columna W y consonante final\n\n- わ = wa\n- を = o, se usa como particula\n- ん = n\n\nEjemplo:\n\n- ほん -> hon (libro)\n\n## Combinaciones\n\nAlgunos caracteres se combinan con versiones pequenas de や, ゆ, よ para formar nuevos sonidos.\n\n- きゃ = kya\n- きゅ = kyu\n- きょ = kyo\n- しゃ = sha\n- しゅ = shu\n- しょ = sho\n- ちゃ = cha\n- ちゅ = chu\n- ちょ = cho\n\nEjemplo:\n\n- きょう -> kyou (hoy)\n\n## Consonante doble (っ)\n\nEl simbolo pequeno っ indica una pausa breve antes de una consonante, lo que genera una doble consonante.\n\nEjemplo:\n\n- がっこう -> gakkou (escuela)\n\nSe debe hacer una pequena pausa al pronunciar.\n\n## Vocales largas\n\nLas vocales pueden alargarse, lo que cambia el significado de la palabra.\n\nEjemplos:\n\n- おばさん -> obasan (tia)\n- おばあさん -> obaasan (abuela)\n\nLa duracion de la vocal es importante y debe respetarse.\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Lectura\",\"instruction\":\"Arrastra la lectura correcta a cada hiragana.\",\"bank\":[{\"targets\":[\"な\",\"ひ\",\"ま\",\"や\",\"ら\",\"わ\"],\"items\":[\"na\",\"hi\",\"ma\",\"ya\",\"ra\",\"wa\"],\"answers\":{\"な\":\"na\",\"ひ\":\"hi\",\"ま\":\"ma\",\"や\":\"ya\",\"ら\":\"ra\",\"わ\":\"wa\"}},{\"targets\":[\"に\",\"ふ\",\"み\",\"ゆ\",\"り\",\"ん\"],\"items\":[\"ni\",\"fu\",\"mi\",\"yu\",\"ri\",\"n\"],\"answers\":{\"に\":\"ni\",\"ふ\":\"fu\",\"み\":\"mi\",\"ゆ\":\"yu\",\"り\":\"ri\",\"ん\":\"n\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Identificacion\",\"instruction\":\"Relaciona cada combinacion con su lectura correcta.\",\"bank\":[{\"targets\":[\"きゃ\",\"しゃ\",\"ちゃ\"],\"items\":[\"cha\",\"sha\",\"kya\"],\"answers\":{\"きゃ\":\"kya\",\"しゃ\":\"sha\",\"ちゃ\":\"cha\"}},{\"targets\":[\"きゅ\",\"しょ\",\"ちゅ\"],\"items\":[\"kyu\",\"sho\",\"chu\"],\"answers\":{\"きゅ\":\"kyu\",\"しょ\":\"sho\",\"ちゅ\":\"chu\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Comprension\",\"instruction\":\"Observa la palabra y responde las preguntas.\",\"bank\":[{\"word\":\"がっこう\",\"questions\":[{\"q\":\"Que indica el simbolo pequeno っ?\",\"options\":[\"Una pausa breve antes de la consonante\",\"Una vocal larga\",\"Una particula gramatical\"],\"answer\":\"Una pausa breve antes de la consonante\"},{\"q\":\"Como afecta la pronunciacion?\",\"options\":[\"Duplica o refuerza la consonante siguiente\",\"Convierte la palabra en pregunta\",\"Hace muda la ultima vocal\"],\"answer\":\"Duplica o refuerza la consonante siguiente\"}]},{\"word\":\"おばあさん\",\"questions\":[{\"q\":\"Que rasgo aparece en esta palabra?\",\"options\":[\"Vocal larga\",\"Consonante doble\",\"Combinacion con ya\"],\"answer\":\"Vocal larga\"},{\"q\":\"Por que es importante?\",\"options\":[\"Porque cambia el significado de la palabra\",\"Porque elimina una silaba\",\"Porque solo aparece en prestamos linguisticos\"],\"answer\":\"Porque cambia el significado de la palabra\"}]}]}\n\n## Ejercicios autonomos\n\n- Escribe cada nuevo caracter al menos diez veces\n- Practica cinco combinaciones con や, ゆ y よ\n- Lee palabras que incluyan っ y vocales largas",
      topics: ["Columnas n, h, m, y, r, w y ん", "Combinaciones con ya, yu, yo", "Consonante doble っ", "Vocales largas", "Lectura funcional de palabras"]
    },
    {
      title: "Pronunciacion + reglas basicas",
      description: "Fundamentos de la pronunciacion japonesa: estabilidad vocalica, ritmo uniforme, vocales largas, consonante doble, sonido nasal ん y entonacion basica.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera las reglas fundamentales de pronunciacion del japones, aplicara correctamente la entonacion basica y reconocera patrones esenciales que facilitan la lectura y comprension del idioma.\n\n## Introduccion a la pronunciacion japonesa\n\nUna de las ventajas del japones es su sistema de pronunciacion regular.\n\nA diferencia de otros idiomas, los sonidos no cambian dependiendo del contexto, lo que permite una lectura consistente una vez se conocen los caracteres.\n\nSin embargo, esta aparente simplicidad requiere precision, especialmente en la duracion de los sonidos y en la naturalidad del ritmo.\n\n## Vocales: estabilidad y duracion\n\nLas vocales en japones son siempre claras y constantes.\n\n- あ (a)\n- い (i)\n- う (u)\n- え (e)\n- お (o)\n\nAspectos clave:\n\n- No se reducen ni se omiten\n- Todas tienen duracion similar, salvo cuando son largas\n- Se pronuncian de forma limpia, sin diptongos\n\nEjemplo:\n\n- えい -> ei, se pronuncian ambas vocales\n\n## Ritmo silabico\n\nEl japones es un idioma de ritmo uniforme.\n\nCada silaba tiene una duracion similar, lo que genera una cadencia constante.\n\nEjemplo:\n\n- さくら -> sa-ku-ra\n\nCada parte se pronuncia con el mismo peso.\n\nEsto contrasta con el espanol, donde algunas silabas se enfatizan mas que otras.\n\n## Vocales largas\n\nLa duracion de una vocal puede cambiar el significado de una palabra.\n\nEjemplos:\n\n- おじさん -> ojisan (tio)\n- おじいさん -> ojiisan (abuelo)\n\nLa diferencia radica unicamente en la duracion de la vocal.\n\n## Consonante doble (っ)\n\nEl pequeno っ indica una pausa breve antes de una consonante.\n\nEjemplo:\n\n- きって -> kitte (sello postal)\n\nSe debe detener ligeramente el flujo del sonido antes de continuar.\n\n## El sonido ん\n\nEl caracter ん representa un sonido nasal que varia ligeramente segun el contexto.\n\nEjemplos:\n\n- ほん -> hon\n- さん -> san\n\nNo debe confundirse con una n seguida de vocal.\n\n## Entonacion basica\n\nEl japones no utiliza acento fuerte como el espanol.\n\nEn su lugar, presenta un sistema de entonacion mas plano y uniforme.\n\nCaracteristicas:\n\n- No hay silabas fuertemente acentuadas\n- La entonacion depende del contexto\n- Las preguntas suelen tener una ligera elevacion al final\n\nEjemplo:\n\n- ほん? = libro?\n\n## Errores comunes\n\n- Pronunciar し como si en lugar de shi\n- Ignorar la diferencia entre vocal corta y larga\n- No respetar la pausa en っ\n- Aplicar acentos del espanol\n\nReconocer estos errores desde el inicio permite desarrollar una pronunciacion mas natural.\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"choice\",\"title\":\"Identificacion de duracion\",\"instruction\":\"Selecciona la palabra que tiene vocal larga.\",\"bank\":[{\"questions\":[{\"q\":\"Cual palabra tiene vocal larga?\",\"options\":[\"おばさん\",\"おばあさん\"],\"answer\":\"おばあさん\"}]},{\"questions\":[{\"q\":\"Cual palabra tiene vocal larga?\",\"options\":[\"おじさん\",\"おじいさん\"],\"answer\":\"おじいさん\"}]}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Lectura ritmica\",\"instruction\":\"Relaciona cada palabra con su lectura segmentada para practicar el ritmo uniforme.\",\"bank\":[{\"targets\":[\"さくら\",\"たなか\",\"みず\"],\"items\":[\"sa-ku-ra\",\"ta-na-ka\",\"mi-zu\"],\"answers\":{\"さくら\":\"sa-ku-ra\",\"たなか\":\"ta-na-ka\",\"みず\":\"mi-zu\"}},{\"targets\":[\"すし\",\"ねこ\",\"ここ\"],\"items\":[\"su-shi\",\"ne-ko\",\"ko-ko\"],\"answers\":{\"すし\":\"su-shi\",\"ねこ\":\"ne-ko\",\"ここ\":\"ko-ko\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Consonante doble\",\"instruction\":\"Observa las palabras y responde sobre el efecto de っ.\",\"bank\":[{\"word\":\"がっこう / きって\",\"questions\":[{\"q\":\"Que indica el simbolo っ?\",\"options\":[\"Una pausa breve antes de una consonante\",\"Una vocal larga\",\"Una entonacion ascendente\"],\"answer\":\"Una pausa breve antes de una consonante\"},{\"q\":\"Como afecta la pronunciacion?\",\"options\":[\"Refuerza o duplica la consonante siguiente\",\"Suprime la ultima silaba\",\"Convierte la palabra en plural\"],\"answer\":\"Refuerza o duplica la consonante siguiente\"}]},{\"word\":\"きって\",\"questions\":[{\"q\":\"Que debes hacer al pronunciar っ?\",\"options\":[\"Hacer una pequena pausa\",\"Alargar la vocal anterior\",\"Acentuar la ultima silaba\"],\"answer\":\"Hacer una pequena pausa\"},{\"q\":\"Que parte se vuelve mas marcada despues de っ?\",\"options\":[\"La consonante siguiente\",\"La vocal inicial\",\"La particula final\"],\"answer\":\"La consonante siguiente\"}]}]}\n\n## Ejercicios autonomos\n\n- Practica lectura en voz alta durante cinco a diez minutos diarios\n- Repite palabras con vocales largas y cortas\n- Escucha pronunciaciones basicas e intenta imitar el ritmo",
      topics: ["Vocales claras y duracion", "Ritmo silabico uniforme", "Vocales largas", "Consonante doble っ", "Sonido ん y entonacion basica"]
    },
    {
      title: "Primeras palabras (saludos, numeros, pais)",
      description: "Introduccion al primer vocabulario funcional del japones: saludos, expresiones cotidianas, presentacion personal y numeros del 1 al 10 para interacciones basicas.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera y utilizara saludos basicos en japones, reconocera vocabulario inicial de uso cotidiano y comenzara a interactuar mediante expresiones simples en contextos reales.\n\n## Introduccion al uso real del idioma\n\nDespues de haber trabajado el sistema de escritura y la pronunciacion, el siguiente paso consiste en aplicar estos conocimientos en situaciones reales.\n\nEn esta clase se introducen las primeras expresiones funcionales del japones, lo que permite al estudiante iniciar interacciones basicas.\n\nEstas expresiones no solo tienen un valor linguistico, sino tambien cultural, ya que reflejan normas sociales importantes dentro del contexto japones.\n\n## Saludos basicos\n\nLos saludos en japones varian segun el momento del dia y el nivel de formalidad.\n\n- おはようございます = ohayou gozaimasu = buenos dias, formal\n- こんにちは = konnichiwa = buenas tardes\n- こんばんは = konbanwa = buenas noches\n- さようなら = sayounara = adios\n- ありがとう = arigatou = gracias\n- ありがとうございます = arigatou gozaimasu = muchas gracias, formal\n\nAspecto cultural:\n\n- El nivel de formalidad es importante en japones\n- Expresiones como ありがとうございます se utilizan en contextos mas respetuosos\n\n## Presentacion basica\n\nUna de las primeras habilidades comunicativas es presentarse.\n\nEstructura basica:\n\n- わたしは ___ です\n- Watashi wa ___ desu\n- Yo soy ___\n\nEjemplo:\n\n- わたしは Miguel です\n\n## Expresiones comunes\n\n- はい = hai = si\n- いいえ = iie = no\n- すみません = sumimasen = disculpa o permiso\n- おねがいします = onegaishimasu = por favor\n- はじめまして = hajimemashite = mucho gusto\n\n## Numeros basicos (1-10)\n\n- 1 = いち = ichi\n- 2 = に = ni\n- 3 = さん = san\n- 4 = よん / し = yon / shi\n- 5 = ご = go\n- 6 = ろく = roku\n- 7 = なな / しち = nana / shichi\n- 8 = はち = hachi\n- 9 = きゅう / く = kyuu / ku\n- 10 = じゅう = juu\n\n## Ejemplos de uso\n\n- はじめまして。わたしは Ana です。\n- Mucho gusto. Yo soy Ana.\n\n- ありがとうございます\n- Muchas gracias\n\n- すみません\n- Disculpa o perdon\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Traduccion\",\"instruction\":\"Relaciona cada expresion japonesa con su significado en espanol.\",\"bank\":[{\"targets\":[\"ありがとう\",\"はい\",\"すみません\"],\"items\":[\"gracias\",\"si\",\"disculpa o permiso\"],\"answers\":{\"ありがとう\":\"gracias\",\"はい\":\"si\",\"すみません\":\"disculpa o permiso\"}},{\"targets\":[\"こんばんは\",\"いいえ\",\"はじめまして\"],\"items\":[\"buenas noches\",\"no\",\"mucho gusto\"],\"answers\":{\"こんばんは\":\"buenas noches\",\"いいえ\":\"no\",\"はじめまして\":\"mucho gusto\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Completar\",\"instruction\":\"Selecciona la opcion correcta para completar la presentacion.\",\"bank\":[{\"word\":\"わたしは ______ です\",\"questions\":[{\"q\":\"Que elemento completa correctamente la estructura de presentacion?\",\"options\":[\"un nombre o identidad\",\"una pregunta\",\"una despedida\"],\"answer\":\"un nombre o identidad\"}]},{\"word\":\"わたしは Ana です\",\"questions\":[{\"q\":\"Que significa esta oracion?\",\"options\":[\"Yo soy Ana\",\"Buenos dias Ana\",\"Gracias Ana\"],\"answer\":\"Yo soy Ana\"}]}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Relacion\",\"instruction\":\"Relaciona cada saludo con su significado correcto.\",\"bank\":[{\"targets\":[\"おはようございます\",\"こんばんは\",\"ありがとう\"],\"items\":[\"gracias\",\"buenas noches\",\"buenos dias\"],\"answers\":{\"おはようございます\":\"buenos dias\",\"こんばんは\":\"buenas noches\",\"ありがとう\":\"gracias\"}},{\"targets\":[\"こんにちは\",\"さようなら\",\"ありがとうございます\"],\"items\":[\"muchas gracias\",\"buenas tardes\",\"adios\"],\"answers\":{\"こんにちは\":\"buenas tardes\",\"さようなら\":\"adios\",\"ありがとうございます\":\"muchas gracias\"}}]}\n\n## Ejercicios autonomos\n\n- Practica presentarte en voz alta usando tu nombre\n- Memoriza al menos cinco saludos\n- Cuenta del 1 al 10 en japones sin apoyo visual",
      topics: ["Saludos basicos y formalidad", "Presentacion con watashi wa ... desu", "Expresiones cotidianas", "Numeros del 1 al 10", "Primeras interacciones reales"]
    },
    {
      title: "Estructura basica: A wa B desu",
      description: "Introduccion a la estructura basica A は B です para construir oraciones simples de identificacion, afirmacion, negacion e interrogacion en japones.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera y aplicara la estructura basica del japones A は B です, permitiendole construir oraciones simples de identificacion y afirmacion.\n\n## Introduccion a la estructura de la oracion\n\nEn japones, las oraciones siguen una logica diferente al espanol.\n\nMientras que en espanol se usa una estructura sujeto-verbo-objeto, el japones organiza la informacion de forma distinta, ubicando el verbo al final.\n\nLa estructura A は B です es una de las mas importantes, ya que permite expresar identidad, profesion, nacionalidad u otras caracteristicas basicas.\n\n## Estructura A は B です\n\nForma general:\n\n- A は B です\n- A wa B desu\n\nSignificado:\n\n- A es B\n- A soy B, dependiendo del contexto\n\n## Componentes de la estructura\n\n## A (tema)\n\nEs la persona o cosa de la que se habla.\n\nEjemplos:\n\n- わたし = yo\n- あなた = tu\n\n## は (particula)\n\nMarca el tema de la oracion.\n\n- Se escribe は (ha), pero en este caso se pronuncia wa\n- Su funcion no es traducirse literalmente, sino indicar de que se esta hablando\n\n## B (informacion)\n\nEs lo que se dice sobre el tema.\n\nEjemplos:\n\n- がくせい = estudiante\n- せんせい = profesor\n\n## です (verbo)\n\nEquivale aproximadamente a ser o estar en espanol dentro de contextos formales.\n\n- Anade formalidad y cortesia a la oracion\n\n## Ejemplos\n\n- わたしは がくせいです = Yo soy estudiante\n- わたしは Miguel です = Yo soy Miguel\n- あなたは せんせいです = Tu eres profesor\n\n## Variacion: forma negativa\n\nPara negar, se reemplaza です por ではありません.\n\nEstructura:\n\n- A は B ではありません\n\nEjemplo:\n\n- わたしは せんせいではありません = Yo no soy profesor\n\n## Variacion: forma interrogativa\n\nPara hacer preguntas, se anade か al final.\n\nEstructura:\n\n- A は B ですか\n\nEjemplo:\n\n- あなたは がくせいですか = Eres estudiante?\n\nEn japones no es necesario usar signos de interrogacion en todos los casos.\n\n## Respuestas basicas\n\n- はい、そうです = Si, asi es\n- いいえ、ちがいます = No, no es asi\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Traduccion\",\"instruction\":\"Relaciona cada oracion japonesa con su significado correcto.\",\"bank\":[{\"targets\":[\"わたしは がくせいです\",\"あなたは せんせいですか\"],\"items\":[\"Yo soy estudiante\",\"Eres profesor?\"],\"answers\":{\"わたしは がくせいです\":\"Yo soy estudiante\",\"あなたは せんせいですか\":\"Eres profesor?\"}},{\"targets\":[\"わたしは Miguel です\",\"あなたは がくせいですか\"],\"items\":[\"Yo soy Miguel\",\"Eres estudiante?\"],\"answers\":{\"わたしは Miguel です\":\"Yo soy Miguel\",\"あなたは がくせいですか\":\"Eres estudiante?\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Completar\",\"instruction\":\"Selecciona la opcion correcta para completar la estructura.\",\"bank\":[{\"word\":\"わたしは ______ です\",\"questions\":[{\"q\":\"Que tipo de informacion va en el espacio?\",\"options\":[\"Una identidad o profesion\",\"Una despedida\",\"Un numero aleatorio\"],\"answer\":\"Una identidad o profesion\"}]},{\"word\":\"あなたは ______ です\",\"questions\":[{\"q\":\"Que tipo de palabra puede completar la oracion?\",\"options\":[\"Una caracteristica o identificacion\",\"Un signo de puntuacion\",\"Una particula interrogativa sola\"],\"answer\":\"Una caracteristica o identificacion\"}]}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Transformacion\",\"instruction\":\"Observa la oracion y elige la forma negativa correcta.\",\"bank\":[{\"word\":\"わたしは がくせいです\",\"questions\":[{\"q\":\"Cual es la forma negativa correcta?\",\"options\":[\"わたしは がくせいではありません\",\"わたしは がくせいか\",\"わたしは がくせいですか\"],\"answer\":\"わたしは がくせいではありません\"}]},{\"word\":\"わたしは せんせいです\",\"questions\":[{\"q\":\"Cual es la forma negativa correcta?\",\"options\":[\"わたしは せんせいではありません\",\"わたしは せんせいですか\",\"わたしは せんせいはい\"],\"answer\":\"わたしは せんせいではありません\"}]}]}\n\n## Ejercicios autonomos\n\n- Escribe cinco oraciones usando A は B です\n- Crea tres preguntas usando ですか\n- Practica responder afirmativa y negativamente",
      topics: ["Estructura A は B です", "Particula は como tema", "Uso formal de です", "Negacion con ではありません", "Pregunta con ですか y respuestas basicas"]
    },
    {
      id: "mini-examen-1",
      moduleTitle: "Mini examen 1",
      title: "Hiragana, pronunciacion y estructura basica",
      description: "Evaluacion de los 46 caracteres hiragana con combinaciones, reglas de pronunciacion y la estructura A wa B desu. Incluye lectura, escritura y comprension de oraciones simples.",
      content: "## Estructura del examen\n\n- Total de bloques evaluados: 7 grupos de preguntas cerradas y 2 abiertas obligatorias\n- Tipos: seleccion multiple, completar, traduccion y lectura\n- En cada intento se mezclan automaticamente las preguntas\n- Se generan 9 preguntas aproximadas por intento: 7 cerradas y 2 abiertas obligatorias\n\nEXAM::{\"title\":\"Mini examen 1 — Japones N5 (Clases 1-7)\",\"instruction\":\"Responde las preguntas cerradas y completa las abiertas obligatorias. Cada intento mezcla preguntas y selecciona variantes distintas.\",\"note\":\"Tiempo sugerido: 20-30 minutos. Las preguntas abiertas requieren revision manual.\",\"showOpenTitle\":false,\"banks\":[{\"title\":\"Banco 1: Sistemas de escritura\",\"typeLabel\":\"identificacion\",\"pick\":1,\"questions\":[{\"prompt\":\"Que sistema se usa para palabras extranjeras?\",\"options\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answer\":\"Katakana\"},{\"prompt\":\"Que sistema representa ideas o conceptos?\",\"options\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answer\":\"Kanji\"},{\"prompt\":\"あ pertenece a:\",\"options\":[\"Katakana\",\"Hiragana\",\"Kanji\"],\"answer\":\"Hiragana\"},{\"prompt\":\"ア pertenece a:\",\"options\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answer\":\"Katakana\"},{\"prompt\":\"水 pertenece a:\",\"options\":[\"Hiragana\",\"Katakana\",\"Kanji\"],\"answer\":\"Kanji\"}]},{\"title\":\"Banco 2: Vocales y columna K\",\"typeLabel\":\"reconocimiento\",\"pick\":1,\"questions\":[{\"prompt\":\"い corresponde a:\",\"options\":[\"e\",\"i\",\"a\"],\"answer\":\"i\"},{\"prompt\":\"く corresponde a:\",\"options\":[\"ku\",\"ko\",\"ka\"],\"answer\":\"ku\"},{\"prompt\":\"け corresponde a:\",\"options\":[\"ke\",\"ki\",\"ku\"],\"answer\":\"ke\"},{\"prompt\":\"こ corresponde a:\",\"options\":[\"ko\",\"ka\",\"ku\"],\"answer\":\"ko\"}]},{\"title\":\"Banco 3: Columnas S y T\",\"typeLabel\":\"seleccion\",\"pick\":1,\"questions\":[{\"prompt\":\"し se pronuncia:\",\"options\":[\"si\",\"shi\",\"chi\"],\"answer\":\"shi\"},{\"prompt\":\"ち se pronuncia:\",\"options\":[\"chi\",\"ti\",\"shi\"],\"answer\":\"chi\"},{\"prompt\":\"つ se pronuncia:\",\"options\":[\"su\",\"tsu\",\"tu\"],\"answer\":\"tsu\"},{\"prompt\":\"Cual es correcta?\",\"options\":[\"し = si\",\"つ = tsu\",\"ち = ti\"],\"answer\":\"つ = tsu\"}]},{\"title\":\"Banco 4: Hiragana completo y combinaciones\",\"typeLabel\":\"lectura\",\"pick\":1,\"questions\":[{\"prompt\":\"きゃ se lee:\",\"options\":[\"kya\",\"kiya\",\"ka\"],\"answer\":\"kya\"},{\"prompt\":\"しゃ se lee:\",\"options\":[\"sha\",\"sa\",\"shiya\"],\"answer\":\"sha\"},{\"prompt\":\"ちゃ se lee:\",\"options\":[\"cha\",\"ta\",\"chiya\"],\"answer\":\"cha\"},{\"prompt\":\"Que indica っ?\",\"options\":[\"vocal larga\",\"pausa o consonante doble\",\"acento\"],\"answer\":\"pausa o consonante doble\"},{\"prompt\":\"Que indica una vocal larga?\",\"options\":[\"cambio de significado\",\"plural\",\"pasado\"],\"answer\":\"cambio de significado\"}]},{\"title\":\"Banco 5: Pronunciacion\",\"typeLabel\":\"comprension\",\"pick\":1,\"questions\":[{\"prompt\":\"Cual es correcta?\",\"options\":[\"Las vocales cambian segun la palabra\",\"La pronunciacion es constante\",\"Se omiten vocales\"],\"answer\":\"La pronunciacion es constante\"},{\"prompt\":\"Que caracteriza el ritmo japones?\",\"options\":[\"acento fuerte\",\"ritmo uniforme\",\"silabas largas\"],\"answer\":\"ritmo uniforme\"},{\"prompt\":\"Cual palabra tiene vocal larga?\",\"options\":[\"おばさん\",\"おばあさん\",\"おばさ\"],\"answer\":\"おばあさん\"}]},{\"title\":\"Banco 6: Vocabulario basico\",\"typeLabel\":\"traduccion\",\"pick\":1,\"questions\":[{\"prompt\":\"ありがとう\",\"options\":[\"hola\",\"gracias\",\"adios\"],\"answer\":\"gracias\"},{\"prompt\":\"はい\",\"options\":[\"no\",\"si\",\"gracias\"],\"answer\":\"si\"},{\"prompt\":\"すみません\",\"options\":[\"gracias\",\"disculpa\",\"si\"],\"answer\":\"disculpa\"},{\"prompt\":\"おはようございます\",\"options\":[\"buenas noches\",\"buenos dias\",\"gracias\"],\"answer\":\"buenos dias\"},{\"prompt\":\"こんばんは\",\"options\":[\"buenas noches\",\"buenas tardes\",\"adios\"],\"answer\":\"buenas noches\"}]},{\"title\":\"Banco 7: Estructura A は B です\",\"typeLabel\":\"gramatica\",\"pick\":1,\"questions\":[{\"prompt\":\"わたしは がくせいです significa:\",\"options\":[\"Soy profesor\",\"Soy estudiante\",\"Soy medico\"],\"answer\":\"Soy estudiante\"},{\"prompt\":\"Que indica は?\",\"options\":[\"verbo\",\"objeto\",\"tema\"],\"answer\":\"tema\"},{\"prompt\":\"Forma negativa de です:\",\"options\":[\"ではありません\",\"じゃない\",\"でした\"],\"answer\":\"ではありません\"},{\"prompt\":\"Como se forma una pregunta?\",\"options\":[\"cambiando el orden\",\"agregando か\",\"agregando は\"],\"answer\":\"agregando か\"},{\"prompt\":\"あなたは せんせいですか significa:\",\"options\":[\"Eres estudiante\",\"Eres profesor?\",\"Soy profesor\"],\"answer\":\"Eres profesor?\"}]}],\"openTitle\":\"Produccion y lectura\",\"openPick\":2,\"openQuestions\":[{\"prompt\":\"Escribe una oracion usando A は B です.\"},{\"prompt\":\"Escribe una oracion negativa con ではありません.\"},{\"prompt\":\"Escribe una pregunta en japones usando ですか.\"},{\"prompt\":\"Lee わたしは がくせいです y explica que significa.\"},{\"prompt\":\"En わたしは がくせいです, explica que funcion cumple は y cual es el verbo.\"}]}\n\n## Cierre del examen\n\nEste mini examen evalua la comprension de los fundamentos del japones: sistema de escritura, pronunciacion, vocabulario inicial y primera estructura gramatical.\n\nSu objetivo no es solo medir resultados, sino consolidar las bases necesarias para avanzar hacia contenidos mas complejos.",
      topics: ["Sistemas de escritura", "Hiragana y combinaciones", "Pronunciacion y ritmo", "Vocabulario inicial", "Estructura A は B です", "Produccion escrita basica"]
    },
    {
      title: "Particulas wa, no",
      description: "Estudio de la particula de tema wa (は) en contraste con ga (が), y la particula posesiva no (の) para indicar pertenencia y modificacion nominal.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera y utilizara correctamente las particulas は y の, reconociendo su funcion dentro de la oracion y aplicandolas para expresar tema y relacion entre sustantivos.\n\n## Introduccion a las particulas\n\nEn japones, las particulas son elementos gramaticales que indican la funcion de las palabras dentro de la oracion.\n\nA diferencia del espanol, donde el orden y las preposiciones cumplen gran parte de esta funcion, el japones utiliza particulas para organizar la informacion.\n\nEn esta clase se trabajaran dos particulas fundamentales:\n\n- は -> indica el tema\n- の -> indica relacion o posesion\n\n## Particula は\n\nLa particula は marca el tema de la oracion, es decir, aquello sobre lo que se esta hablando.\n\nForma general:\n\n- A は B です\n\nEjemplo:\n\n- わたしは がくせいです\n- Yo soy estudiante\n\nAspectos clave:\n\n- Se escribe は, pero en esta funcion se pronuncia wa\n- No se traduce literalmente palabra por palabra\n- Introduce el contexto o tema principal de la oracion\n\n## Particula の\n\nLa particula の conecta dos sustantivos e indica relacion entre ellos.\n\nEn muchos casos se traduce como de.\n\nForma general:\n\n- A の B\n\nSignificados frecuentes:\n\n- B de A\n- B pertenece a A\n- B esta relacionado con A\n\n## Usos principales de の\n\n## Posesion\n\nEjemplos:\n\n- わたしの ほん -> mi libro\n- Ana の かばん -> el bolso de Ana\n\n## Relacion o pertenencia\n\nEjemplos:\n\n- にほんの がくせい -> estudiante japones\n- だいがくの せんせい -> profesor de universidad\n\n## Identificacion o categoria\n\nEjemplo:\n\n- えいごの ほん -> libro de ingles\n\nAqui の no indica propiedad, sino tipo o clasificacion.\n\n## Combinacion de は y の\n\nAmbas particulas pueden aparecer en una misma oracion.\n\nEjemplo:\n\n- わたしの なまえは Miguel です\n- Mi nombre es Miguel\n\nDesglose:\n\n- わたしの なまえ -> mi nombre\n- は -> tema\n- Miguel です -> es Miguel\n\n## Ejemplos adicionales\n\n- わたしの ともだちは がくせいです -> Mi amigo es estudiante\n- これは わたしの ほんです -> Este es mi libro\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Traduccion\",\"instruction\":\"Relaciona cada expresion japonesa con su significado correcto.\",\"bank\":[{\"targets\":[\"わたしの ほん\",\"Ana の かばん\",\"にほんの がくせい\"],\"items\":[\"mi libro\",\"el bolso de Ana\",\"estudiante japones\"],\"answers\":{\"わたしの ほん\":\"mi libro\",\"Ana の かばん\":\"el bolso de Ana\",\"にほんの がくせい\":\"estudiante japones\"}},{\"targets\":[\"だいがくの せんせい\",\"えいごの ほん\",\"わたしの なまえ\"],\"items\":[\"profesor de universidad\",\"libro de ingles\",\"mi nombre\"],\"answers\":{\"だいがくの せんせい\":\"profesor de universidad\",\"えいごの ほん\":\"libro de ingles\",\"わたしの なまえ\":\"mi nombre\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Completar\",\"instruction\":\"Selecciona la particula correcta para completar cada expresion.\",\"bank\":[{\"questions\":[{\"q\":\"わたし ___ がくせいです\",\"options\":[\"は\",\"の\",\"を\"],\"answer\":\"は\"},{\"q\":\"わたし ___ ほん\",\"options\":[\"は\",\"の\",\"に\"],\"answer\":\"の\"},{\"q\":\"だいがく ___ せんせい\",\"options\":[\"の\",\"は\",\"で\"],\"answer\":\"の\"}]},{\"questions\":[{\"q\":\"Miguel ___ がくせいです\",\"options\":[\"は\",\"の\",\"か\"],\"answer\":\"は\"},{\"q\":\"にほん ___ ほん\",\"options\":[\"は\",\"の\",\"を\"],\"answer\":\"の\"},{\"q\":\"Ana ___ なまえ\",\"options\":[\"の\",\"は\",\"に\"],\"answer\":\"の\"}]}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Construccion\",\"instruction\":\"Observa los elementos y elige la oracion correcta.\",\"bank\":[{\"word\":\"わたし / なまえ / Carlos\",\"questions\":[{\"q\":\"Cual es la construccion correcta?\",\"options\":[\"わたしは Carlos の なまえです\",\"わたしの なまえは Carlos です\",\"わたしの Carlos は なまえです\"],\"answer\":\"わたしの なまえは Carlos です\"}]},{\"word\":\"Ana / かばん\",\"questions\":[{\"q\":\"Cual expresion indica posesion correctamente?\",\"options\":[\"Ana は かばん\",\"Ana の かばん\",\"Ana を かばん\"],\"answer\":\"Ana の かばん\"}]}]}\n\n## Ejercicios autonomos\n\n- Escribe cinco ejemplos usando の para expresar posesion o relacion.\n- Escribe tres oraciones usando は como marcador de tema.\n- Combina ambas particulas en al menos tres oraciones completas.",
      topics: ["Particula は como tema", "Particula の para posesion y relacion", "A の B", "Combinacion de は y の", "Expresiones con nombres y objetos", "Construccion de oraciones simples"]
    },
    {
      title: "Verbos (forma diccionario y masu)",
      description: "Los verbos japoneses y sus dos grupos principales (ichidan y godan). Se aprende la conjugacion en forma -masu para presente afirmativo y el uso en oraciones completas.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante reconocera los verbos en japones, comprendera la diferencia entre la forma diccionario y la forma ます, y sera capaz de utilizar esta ultima en oraciones simples.\n\n## Introduccion a los verbos en japones\n\nLos verbos en japones expresan acciones o estados, y se ubican siempre al final de la oracion.\n\nA diferencia del espanol, no cambian segun la persona, lo que simplifica su uso en niveles iniciales.\n\nEjemplos:\n\n- わたしは たべます -> Yo como\n- あなたは たべます -> Tu comes\n\nEl verbo no cambia; el contexto define el sujeto.\n\n## Forma diccionario\n\nLa forma diccionario es la forma basica del verbo.\n\nSe utiliza en contextos informales y es la forma con la que los verbos aparecen en listas y diccionarios.\n\nEjemplos:\n\n- たべる = taberu = comer\n- のむ = nomu = beber\n- いく = iku = ir\n- みる = miru = ver\n- きく = kiku = escuchar\n\n## Forma ます\n\nLa forma ます se utiliza en contextos formales o neutros.\n\nEs la forma mas importante en nivel inicial porque permite construir oraciones correctas y educadas.\n\nEstructura general:\n\n- raiz del verbo + ます\n\n## Conversion basica a ます\n\nEn esta etapa se presentan los verbos de forma practica, sin clasificar aun todos los grupos en detalle.\n\nConversiones fundamentales:\n\n- たべる -> たべます = comer\n- のむ -> のみます = beber\n- いく -> いきます = ir\n- みる -> みます = ver\n- きく -> ききます = escuchar\n\nObservacion:\n\n- Algunos verbos cambian ligeramente antes de anadir ます\n\n## Uso en oraciones\n\nLa forma ます permite construir oraciones completas de accion.\n\nEjemplos:\n\n- わたしは たべます -> Yo como\n- わたしは みます -> Yo veo\n- わたしは にほんへ いきます -> Yo voy a Japon\n\n## Estructura basica con verbo\n\nForma general:\n\n- A は B を Vます\n\nEjemplo:\n\n- わたしは みずを のみます\n- Yo bebo agua\n\nComponentes:\n\n- は -> tema\n- を -> objeto directo\n- Vます -> accion\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Conversion\",\"instruction\":\"Relaciona cada verbo en forma diccionario con su forma ます.\",\"bank\":[{\"targets\":[\"たべる\",\"のむ\",\"いく\"],\"items\":[\"たべます\",\"のみます\",\"いきます\"],\"answers\":{\"たべる\":\"たべます\",\"のむ\":\"のみます\",\"いく\":\"いきます\"}},{\"targets\":[\"みる\",\"きく\",\"のむ\"],\"items\":[\"ききます\",\"のみます\",\"みます\"],\"answers\":{\"みる\":\"みます\",\"きく\":\"ききます\",\"のむ\":\"のみます\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Traduccion\",\"instruction\":\"Relaciona cada oracion japonesa con su significado correcto.\",\"bank\":[{\"targets\":[\"わたしは たべます\",\"わたしは みます\"],\"items\":[\"Yo como\",\"Yo veo\"],\"answers\":{\"わたしは たべます\":\"Yo como\",\"わたしは みます\":\"Yo veo\"}},{\"targets\":[\"わたしは にほんへ いきます\",\"わたしは みずを のみます\"],\"items\":[\"Yo voy a Japon\",\"Yo bebo agua\"],\"answers\":{\"わたしは にほんへ いきます\":\"Yo voy a Japon\",\"わたしは みずを のみます\":\"Yo bebo agua\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Construccion\",\"instruction\":\"Observa los elementos y elige el orden correcto de la oracion.\",\"bank\":[{\"word\":\"のみます / わたしは / みずを\",\"questions\":[{\"q\":\"Cual es el orden correcto?\",\"options\":[\"みずを わたしは のみます\",\"わたしは みずを のみます\",\"のみます わたしは みずを\"],\"answer\":\"わたしは みずを のみます\"}]},{\"word\":\"いきます / わたしは / にほんへ\",\"questions\":[{\"q\":\"Cual es la construccion correcta?\",\"options\":[\"わたしは にほんへ いきます\",\"にほんへ わたしは いきます です\",\"いきます わたしは にほんへ\"],\"answer\":\"わたしは にほんへ いきます\"}]}]}\n\n## Ejercicios autonomos\n\n- Escribe cinco verbos en forma diccionario y su forma ます.\n- Construye cinco oraciones usando Vます.\n- Practica lectura en voz alta con verbos en forma ます.",
      topics: ["Verbos al final de la oracion", "Forma diccionario", "Forma ます", "Conversion basica a ます", "Estructura A は B を Vます", "Oraciones simples con verbos"]
    },
    {
      title: "Particulas wo, ni, de",
      description: "Tres particulas clave del N5: wo (を) para el objeto directo, ni (に) para destino y tiempo, y de (で) para lugar de accion e instrumento.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera y utilizara correctamente las particulas を, に y で, reconociendo su funcion en la oracion y aplicandolas en combinacion con verbos en forma ます.\n\n## Introduccion a las particulas con verbos\n\nEn japones, las particulas indican la funcion de cada elemento dentro de la oracion.\n\nCuando se usan verbos, estas particulas permiten especificar que se hace, donde se hace y hacia donde se dirige la accion.\n\nEn esta clase se trabajaran tres particulas fundamentales:\n\n- を -> objeto directo\n- に -> destino o punto en el tiempo\n- で -> lugar donde ocurre la accion\n\n## Particula を\n\nLa particula を indica el objeto directo de la accion, es decir, aquello que recibe el efecto del verbo.\n\n- Se escribe を pero se pronuncia o\n\nEstructura:\n\n- A は B を Vます\n\nEjemplos:\n\n- わたしは みずを のみます -> Yo bebo agua\n- わたしは ほんを よみます -> Yo leo un libro\n\n## Particula に\n\nLa particula に tiene varios usos.\n\nEn esta etapa se trabajaran dos principales.\n\n## Destino\n\nIndica hacia donde se dirige la accion.\n\nEjemplo:\n\n- わたしは にほんに いきます -> Yo voy a Japon\n\n## Tiempo especifico\n\nSe utiliza para marcar momentos concretos.\n\nEjemplo:\n\n- 7じに おきます -> Me levanto a las 7\n\n## Particula で\n\nLa particula で indica el lugar donde se realiza una accion.\n\nEjemplos:\n\n- がっこうで べんきょうします -> Estudio en la escuela\n- レストランで たべます -> Como en un restaurante\n\n## Diferencia entre に y で\n\nEsta distincion es fundamental:\n\n- に -> destino o punto final\n- で -> lugar donde ocurre la accion\n\nEjemplo comparativo:\n\n- がっこうに いきます -> Voy a la escuela\n- がっこうで べんきょうします -> Estudio en la escuela\n\n## Ejemplos integrados\n\n- わたしは レストランで みずを のみます -> Yo bebo agua en un restaurante\n- わたしは 7じに がっこうに いきます -> Yo voy a la escuela a las 7\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"choice\",\"title\":\"Seleccion\",\"instruction\":\"Elige la particula correcta para completar cada oracion.\",\"bank\":[{\"questions\":[{\"q\":\"わたしは ほん ___ よみます\",\"options\":[\"に\",\"を\",\"で\"],\"answer\":\"を\"},{\"q\":\"がっこう ___ べんきょうします\",\"options\":[\"に\",\"を\",\"で\"],\"answer\":\"で\"},{\"q\":\"にほん ___ いきます\",\"options\":[\"に\",\"を\",\"で\"],\"answer\":\"に\"}]},{\"questions\":[{\"q\":\"7じ ___ おきます\",\"options\":[\"で\",\"に\",\"を\"],\"answer\":\"に\"},{\"q\":\"レストラン ___ たべます\",\"options\":[\"で\",\"を\",\"に\"],\"answer\":\"で\"},{\"q\":\"みず ___ のみます\",\"options\":[\"に\",\"で\",\"を\"],\"answer\":\"を\"}]}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Traduccion\",\"instruction\":\"Relaciona cada oracion japonesa con su significado correcto.\",\"bank\":[{\"targets\":[\"わたしは みずを のみます\",\"がっこうで べんきょうします\"],\"items\":[\"Yo bebo agua\",\"Estudio en la escuela\"],\"answers\":{\"わたしは みずを のみます\":\"Yo bebo agua\",\"がっこうで べんきょうします\":\"Estudio en la escuela\"}},{\"targets\":[\"わたしは にほんに いきます\",\"7じに おきます\"],\"items\":[\"Yo voy a Japon\",\"Me levanto a las 7\"],\"answers\":{\"わたしは にほんに いきます\":\"Yo voy a Japon\",\"7じに おきます\":\"Me levanto a las 7\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Ordenar\",\"instruction\":\"Observa los elementos y elige el orden correcto de la oracion.\",\"bank\":[{\"word\":\"いきます / わたしは / にほんに\",\"questions\":[{\"q\":\"Cual es el orden correcto?\",\"options\":[\"わたしは にほんに いきます\",\"にほんに わたしは いきます です\",\"いきます わたしは にほんに\"],\"answer\":\"わたしは にほんに いきます\"}]},{\"word\":\"べんきょうします / がっこうで\",\"questions\":[{\"q\":\"Cual construccion expresa correctamente lugar de accion?\",\"options\":[\"がっこうで べんきょうします\",\"がっこうに べんきょうします\",\"べんきょうします がっこうで\"],\"answer\":\"がっこうで べんきょうします\"}]}]}\n\n## Ejercicios autonomos\n\n- Escribe cinco oraciones usando を.\n- Escribe tres oraciones con に para destino o tiempo.\n- Escribe tres oraciones con で para lugar de accion.\n- Combina al menos dos particulas en una misma oracion.",
      topics: ["Particula を como objeto directo", "Particula に para destino y tiempo", "Particula で para lugar de accion", "Diferencia entre に y で", "Oraciones con verbos en forma ます", "Combinacion de particulas en una misma oracion"]
    },
    {
      title: "Presente y negativo",
      description: "Conjugacion completa del presente: afirmativo con -masu y negativo con -masen. Se cubren verbos regulares e irregulares y se forman oraciones en ambas formas.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera y aplicara correctamente las formas ます y ません en presente, construyendo oraciones simples que expresen acciones realizadas o no realizadas.\n\n## Introduccion al tiempo presente en japones\n\nEn japones, la forma ます no solo expresa presente, sino tambien acciones habituales o futuras cercanas, dependiendo del contexto.\n\nEn esta etapa se utilizara principalmente como presente.\n\nEjemplo:\n\n- わたしは たべます\n- Yo como o Yo voy a comer\n\n## Forma afirmativa: ます\n\nEsta forma ya fue introducida en la clase anterior.\n\nEstructura:\n\n- verbo en raiz + ます\n\nEjemplos:\n\n- のみます = beber\n- いきます = ir\n- みます = ver\n\nUso en oracion:\n\n- わたしは みずを のみます\n- Yo bebo agua\n\n## Forma negativa: ません\n\nPara negar una accion en presente, se reemplaza ます por ません.\n\nEstructura:\n\n- verbo en raiz + ません\n\nComparaciones basicas:\n\n- たべます -> たべません = no comer\n- のみます -> のみません = no beber\n- いきます -> いきません = no ir\n- みます -> みません = no ver\n\n## Uso en oraciones\n\nEjemplos:\n\n- わたしは みずを のみません -> Yo no bebo agua\n- わたしは にほんに いきません -> Yo no voy a Japon\n- わたしは テレビを みません -> Yo no veo television\n\n## Comparacion directa\n\n- Afirmativa: たべます -> como\n- Negativa: たべません -> no como\n\nLa estructura general de la oracion no cambia; solo cambia el verbo.\n\n## Uso en respuestas\n\nEn japones, es comun responder directamente con el verbo.\n\nEjemplos:\n\n- たべます -> si, como\n- たべません -> no, no como\n\nTambien se pueden usar respuestas completas:\n\n- はい、たべます\n- いいえ、たべません\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Conversion\",\"instruction\":\"Relaciona cada forma afirmativa con su forma negativa.\",\"bank\":[{\"targets\":[\"のみます\",\"いきます\",\"みます\"],\"items\":[\"いきません\",\"のみません\",\"みません\"],\"answers\":{\"のみます\":\"のみません\",\"いきます\":\"いきません\",\"みます\":\"みません\"}},{\"targets\":[\"たべます\",\"よみます\",\"ききます\"],\"items\":[\"よみません\",\"ききません\",\"たべません\"],\"answers\":{\"たべます\":\"たべません\",\"よみます\":\"よみません\",\"ききます\":\"ききません\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Traduccion\",\"instruction\":\"Relaciona cada oracion japonesa con su traduccion correcta.\",\"bank\":[{\"targets\":[\"わたしは みずを のみません\",\"わたしは テレビを みます\"],\"items\":[\"Yo no bebo agua\",\"Yo veo television\"],\"answers\":{\"わたしは みずを のみません\":\"Yo no bebo agua\",\"わたしは テレビを みます\":\"Yo veo television\"}},{\"targets\":[\"わたしは にほんに いきません\",\"わたしは ほんを よみます\"],\"items\":[\"Yo no voy a Japon\",\"Yo leo un libro\"],\"answers\":{\"わたしは にほんに いきません\":\"Yo no voy a Japon\",\"わたしは ほんを よみます\":\"Yo leo un libro\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Seleccion\",\"instruction\":\"Elige la opcion correcta segun el significado.\",\"bank\":[{\"questions\":[{\"q\":\"No como\",\"options\":[\"たべます\",\"たべません\"],\"answer\":\"たべません\"},{\"q\":\"No voy\",\"options\":[\"いきません\",\"いきます\"],\"answer\":\"いきません\"},{\"q\":\"Yo bebo agua\",\"options\":[\"わたしは みずを のみます\",\"わたしは みずを のみません\"],\"answer\":\"わたしは みずを のみます\"}]},{\"questions\":[{\"q\":\"Yo no veo television\",\"options\":[\"わたしは テレビを みます\",\"わたしは テレビを みません\"],\"answer\":\"わたしは テレビを みません\"},{\"q\":\"Si, como\",\"options\":[\"はい、たべます\",\"いいえ、たべません\"],\"answer\":\"はい、たべます\"},{\"q\":\"No, no bebo\",\"options\":[\"はい、のみます\",\"いいえ、のみません\"],\"answer\":\"いいえ、のみません\"}]}]}\n\n## Ejercicios autonomos\n\n- Escribe cinco oraciones afirmativas.\n- Convierte esas mismas oraciones a negativo.\n- Practica lectura en voz alta alternando afirmacion y negacion.",
      topics: ["Presente afirmativo con ます", "Presente negativo con ません", "Comparacion afirmativa y negativa", "Oraciones simples con verbos", "Respuestas breves con verbos", "Practica de conversion y traduccion"]
    },
    {
      title: "Preguntas (ka, nani, doko)",
      description: "Formacion de preguntas en japones usando la particula ka (か) al final, y los interrogativos nani (何 que), doko (どこ donde), dare (誰 quien), itsu (いつ cuando) y ikura (いくら cuanto).",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante formulara y comprendera preguntas en japones utilizando la particula か y las palabras interrogativas basicas 何 y どこ, aplicandolas en oraciones simples.\n\n## Formacion de preguntas con か\n\nEn japones, las preguntas se forman de manera sencilla: se anade la particula か al final de una oracion afirmativa.\n\nEstructura:\n\n- A は B です -> A は B ですか\n\nEjemplo:\n\n- あなたは がくせいです\n- Tu eres estudiante\n- あなたは がくせいですか\n- Eres estudiante?\n\nAspecto clave:\n\n- No es necesario cambiar el orden de la oracion\n\n## Respuestas basicas\n\nLas respuestas pueden ser afirmativas o negativas.\n\n- はい、そうです -> Si, asi es\n- いいえ、ちがいます -> No, no es asi\n\nTambien es comun responder repitiendo el verbo:\n\n- はい、たべます\n- いいえ、たべません\n\n## Palabra interrogativa: 何\n\nSignificado:\n\n- que\n\nUso basico:\n\n- これは なんですか\n- Que es esto?\n\nObservacion:\n\n- Puede leerse como なに o なん dependiendo del contexto\n\n## Palabra interrogativa: どこ\n\nSignificado:\n\n- donde\n\nUso basico:\n\n- トイレは どこですか -> Donde esta el bano?\n- がっこうは どこですか -> Donde esta la escuela?\n\n## Integracion con estructuras previas\n\nLas preguntas pueden combinarse con estructuras ya aprendidas.\n\nEjemplos:\n\n- あなたは どこに いきますか -> A donde vas?\n- これは なんですか -> Que es esto?\n- あなたは がくせいですか -> Eres estudiante?\n\n## Uso del contexto\n\nEn japones, muchas veces el sujeto se omite si es evidente.\n\nEjemplo:\n\n- がくせいですか\n- Eres estudiante?\n\nEsto es comun en conversaciones reales.\n\n## Ejercicios guiados\n\nDRAG::{\"type\":\"match\",\"title\":\"Transformacion\",\"instruction\":\"Relaciona cada oracion afirmativa con su forma interrogativa.\",\"bank\":[{\"targets\":[\"あなたは がくせいです\",\"これは ほんです\"],\"items\":[\"これは ほんですか\",\"あなたは がくせいですか\"],\"answers\":{\"あなたは がくせいです\":\"あなたは がくせいですか\",\"これは ほんです\":\"これは ほんですか\"}},{\"targets\":[\"トイレは ここです\",\"あなたは せんせいです\"],\"items\":[\"トイレは ここですか\",\"あなたは せんせいですか\"],\"answers\":{\"トイレは ここです\":\"トイレは ここですか\",\"あなたは せんせいです\":\"あなたは せんせいですか\"}}]}\n\nDRAG::{\"type\":\"match\",\"title\":\"Traduccion\",\"instruction\":\"Relaciona cada pregunta japonesa con su traduccion correcta.\",\"bank\":[{\"targets\":[\"これは なんですか\",\"トイレは どこですか\"],\"items\":[\"Que es esto?\",\"Donde esta el bano?\"],\"answers\":{\"これは なんですか\":\"Que es esto?\",\"トイレは どこですか\":\"Donde esta el bano?\"}},{\"targets\":[\"がっこうは どこですか\",\"あなたは がくせいですか\"],\"items\":[\"Donde esta la escuela?\",\"Eres estudiante?\"],\"answers\":{\"がっこうは どこですか\":\"Donde esta la escuela?\",\"あなたは がくせいですか\":\"Eres estudiante?\"}}]}\n\nDRAG::{\"type\":\"choice\",\"title\":\"Completar\",\"instruction\":\"Completa con か, なん o どこ segun corresponda.\",\"bank\":[{\"questions\":[{\"q\":\"これは ___ ですか\",\"options\":[\"か\",\"なん\",\"どこ\"],\"answer\":\"なん\"},{\"q\":\"がっこうは ___ ですか\",\"options\":[\"か\",\"どこ\",\"なん\"],\"answer\":\"どこ\"},{\"q\":\"あなたは がくせいです___\",\"options\":[\"なん\",\"どこ\",\"か\"],\"answer\":\"か\"}]},{\"questions\":[{\"q\":\"トイレは ___ ですか\",\"options\":[\"どこ\",\"なん\",\"か\"],\"answer\":\"どこ\"},{\"q\":\"これは ___ ですか\",\"options\":[\"なん\",\"どこ\",\"を\"],\"answer\":\"なん\"},{\"q\":\"せんせいです___\",\"options\":[\"どこ\",\"か\",\"なん\"],\"answer\":\"か\"}]}]}\n\n## Ejercicios autonomos\n\n- Escribe cinco preguntas usando か.\n- Escribe tres preguntas con なん.\n- Escribe tres preguntas con どこ.\n- Practica responder afirmativa y negativamente.",
      topics: ["Particula か interrogativa", "Preguntas sin cambiar el orden", "何 como que", "どこ como donde", "Integracion con estructuras previas", "Respuestas afirmativas y negativas"]
    },
    {
      title: "Demostrativos (kore, sore, are)",
      description: "Uso de これ, それ y あれ para senalar objetos segun su distancia con respecto al hablante y al oyente. Incluye estructura basica, preguntas con なんですか e integracion con particulas y posesivos.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprendera y utilizara correctamente los demostrativos これ, それ y あれ, diferenciando su uso segun la distancia y aplicandolos en oraciones simples.\n\n## Introduccion a los demostrativos\n\nLos demostrativos en japones permiten senalar objetos dependiendo de su ubicacion respecto al hablante y al oyente. A diferencia del espanol, el japones distingue tres niveles de distancia, lo que aporta mayor precision en la comunicacion.\n\nEstos tres niveles son:\n\n- Cerca del hablante\n- Cerca del oyente\n- Lejos de ambos\n\n## Demostrativos basicos\n\n- これ (kore) -> esto, cerca del hablante\n- それ (sore) -> eso, cerca del oyente\n- あれ (are) -> aquello, lejos de ambos\n\n## Uso en oraciones\n\nEstructura:\n\n- これ / それ / あれ は B です\n\nEjemplos:\n\n- これは ほんです -> Esto es un libro\n- それは みずです -> Eso es agua\n- あれは がっこうです -> Aquello es una escuela\n\n## Preguntas con demostrativos\n\nPara preguntar por objetos, se utiliza la estructura:\n\n- これは なんですか\n\nEjemplos:\n\n- これは なんですか -> Que es esto?\n- それは なんですか -> Que es eso?\n\n## Diferencia clave\n\n- これ -> el objeto esta cerca de quien habla\n- それ -> el objeto esta cerca de quien escucha\n- あれ -> el objeto esta lejos de ambos\n\nEsta distincion es fundamental en japones y se utiliza constantemente en la comunicacion cotidiana.\n\n## Integracion con contenidos previos\n\nSe pueden combinar demostrativos con particulas y estructuras aprendidas:\n\n- これは わたしの ほんです -> Este es mi libro\n- あれは がっこうですか -> Aquello es una escuela?\n\n## Ejercicios guiados\n\nEJ:: Ejercicio 1: Seleccion. Elige la opcion correcta. Objeto cerca del hablante: a) それ, b) あれ, c) これ. Objeto lejos de ambos: a) あれ, b) これ, c) それ.\n\nEJ:: Ejercicio 2: Traduccion. Traduce: これは ほんです. あれは がっこうです.\n\nEJ:: Ejercicio 3: Completar. Completa: ______ は なんですか. それは ______ です.\n\n## Ejercicios autonomos\n\n- Escribe 5 oraciones usando これ, それ y あれ.\n- Formula 3 preguntas con なんですか.\n- Practica describiendo objetos a tu alrededor.",
      topics: ["Demostrativos これ, それ y あれ", "Distancia respecto al hablante y al oyente", "Oraciones con は B です", "Preguntas con なんですか", "Integracion con posesivos y particulas", "Practica guiada y autonoma"]
    },
    {
      title: "Existencia (arimasu / imasu)",
      description: "Uso de あります y います para expresar existencia y ubicación en japonés. Se distingue entre objetos inanimados y seres vivos, y se introduce la partícula に para señalar el lugar donde algo o alguien está.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante comprenderá y utilizará correctamente los verbos あります y います para expresar existencia y ubicación de objetos, animales y personas en japonés.\n\n## Introducción a la existencia en japonés\n\nEn japonés, existen dos verbos diferentes para expresar haber, estar o existir, dependiendo de si aquello que existe es animado o inanimado.\n\nEsta distinción es muy importante y aparece constantemente en conversaciones cotidianas.\n\n- あります -> objetos y cosas inanimadas\n- います -> personas y seres vivos\n\n## Verbo あります\n\nUso:\n\nSe utiliza para:\n\n- objetos\n- lugares\n- cosas inanimadas\n\nEstructura básica:\n\n- A は B に あります\n\nEjemplos:\n\n- ほんは つくえに あります -> El libro está en la mesa\n- がっこうは ここに あります -> La escuela está aquí\n\n## Verbo います\n\nUso:\n\nSe utiliza para:\n\n- personas\n- animales\n- seres vivos\n\nEstructura básica:\n\n- A は B に います\n\nEjemplos:\n\n- せんせいは きょうしつに います -> El profesor está en el salón\n- ねこは いえに います -> El gato está en la casa\n\n## Partícula に en existencia\n\nEn estas estructuras, に indica el lugar donde algo o alguien existe.\n\nEjemplo:\n\n- みずは れいぞうこに あります -> El agua está en el refrigerador\n\n## Diferencia entre あります e います\n\n- あります -> objetos y cosas\n- います -> personas y seres vivos\n\nComparación:\n\n- ほんが あります -> Hay un libro\n- ねこが います -> Hay un gato\n\n## Preguntar existencia\n\nEstructuras:\n\n- A は どこに ありますか -> ¿Dónde está A?\n- A は どこに いますか -> ¿Dónde está A?\n\nEjemplos:\n\n- トイレは どこに ありますか -> ¿Dónde está el baño?\n- 田中さんは どこに いますか -> ¿Dónde está Tanaka?\n\n## Introducción a が\n\nEn expresiones de existencia, frecuentemente aparece la partícula が marcando aquello que existe.\n\nEjemplo:\n\n- ねこが います -> Hay un gato\n\nEn esta etapa basta con reconocer que が suele acompañar expresiones de existencia.\n\n## Ejemplos integrados\n\n- わたしの ほんは つくえに あります -> Mi libro está en la mesa\n- せんせいは がっこうに います -> El profesor está en la escuela\n- いぬが いますか -> ¿Hay un perro?\n\n## Ejercicios guiados\n\nEJ:: Ejercicio 1: Selección. Elige la opción correcta. Para personas se usa: a) あります, b) います. Para objetos se usa: a) あります, b) います.\n\nEJ:: Ejercicio 2: Traducción. Traduce: ほんは つくえに あります. ねこは いえに います.\n\nEJ:: Ejercicio 3: Completar. Completa con あります o います: いぬが ______. ほんが ______. せんせいは きょうしつに ______.\n\n## Ejercicios autónomos\n\n- Escribe 5 oraciones con あります.\n- Escribe 5 oraciones con います.\n- Formula 3 preguntas usando どこに.\n- Describe objetos y personas de tu entorno.",
      topics: ["Uso de あります e います", "Existencia de objetos y seres vivos", "Partícula に para ubicación", "Diferencia entre あります e います", "Preguntas con どこに", "Introducción a が en expresiones de existencia"]
    },
    {
      id: "mini-examen-2",
      moduleTitle: "Mini examen 2",
      title: "Particulas, verbos y gramatica N5 basica",
      description: "Evaluacion de particulas (wa, no, wo, ni, de), conjugacion en presente y negativo, preguntas, demostrativos y verbos de existencia. Incluye comprension de frases y construccion de oraciones.",
      topics: ["Particulas wa, no, wo, ni, de", "Presente masu / masen", "Preguntas con ka e interrogativos", "Demostrativos ko/so/a", "Arimasu e imasu", "Construccion de oraciones completas"]
    },
    {
      title: "Katakana (parte 1)",
      description: "Reconocimiento, lectura y escritura de las vocales y las columnas K, S y T del katakana, con enfoque en su uso para palabras extranjeras, nombres, tecnología y énfasis visual.",
      content: "## Objetivo de la clase\n\nAl finalizar esta clase, el estudiante reconocerá, leerá y escribirá las vocales y las primeras columnas del katakana, comprendiendo su función principal dentro del idioma japonés y diferenciándolo del hiragana.\n\n## Introducción al katakana\n\nEl katakana es uno de los sistemas de escritura del japonés y, al igual que el hiragana, funciona como un silabario fonético. Cada carácter representa una sílaba específica.\n\nSin embargo, su uso es diferente. El katakana se utiliza principalmente para:\n\n- palabras extranjeras\n- nombres extranjeros\n- marcas y tecnología\n- onomatopeyas\n- énfasis visual\n\nEjemplos:\n\n- コンピュータ -> computadora\n- コーヒー -> café\n\n## Diferencia visual entre hiragana y katakana\n\nAunque ambos sistemas representan los mismos sonidos, el katakana tiene una apariencia más recta y angular.\n\nComparación:\n\n- a: あ / ア\n- i: い / イ\n- u: う / ウ\n- e: え / エ\n- o: お / オ\n\nEl sonido es el mismo; solo cambia la escritura y el uso.\n\n## Vocales en katakana\n\n- ア -> a\n- イ -> i\n- ウ -> u\n- エ -> e\n- オ -> o\n\n## Columna K (カ行)\n\n- カ -> ka\n- キ -> ki\n- ク -> ku\n- ケ -> ke\n- コ -> ko\n\nEjemplos:\n\n- ケーキ -> keeki (pastel)\n- コーヒー -> koohii (café)\n\n## Columna S (サ行)\n\n- サ -> sa\n- シ -> shi\n- ス -> su\n- セ -> se\n- ソ -> so\n\nIgual que en hiragana:\n\n- シ = shi\n\n## Columna T (タ行)\n\n- タ -> ta\n- チ -> chi\n- ツ -> tsu\n- テ -> te\n- ト -> to\n\nIgual que en hiragana:\n\n- チ = chi\n- ツ = tsu\n\n## Uso práctico del katakana\n\nMuchas palabras modernas en japonés provienen de otros idiomas y se escriben en katakana.\n\nEjemplos comunes:\n\n- テレビ -> terebi -> television\n- スマホ -> sumaho -> smartphone\n- カメラ -> kamera -> camera\n- ホテル -> hoteru -> hotel\n\n## Vocal larga en katakana\n\nEn katakana se utiliza el símbolo ー para alargar vocales.\n\nEjemplos:\n\n- コーヒー -> koohii\n- ケーキ -> keeki\n\nLa línea prolonga el sonido anterior.\n\n## Ejercicios guiados\n\nEJ:: Ejercicio 1: Identificación. Indica la pronunciación: ア -> ______. シ -> ______. ツ -> ______. コ -> ______.\n\nEJ:: Ejercicio 2: Relación. Relaciona: テレビ -> ______. カメラ -> ______. ホテル -> ______. Opciones: a) hotel, b) televisión, c) cámara.\n\nEJ:: Ejercicio 3: Escritura. Escribe en katakana: ka, shi, to, su.\n\n## Ejercicios autónomos\n\n- Practica cada carácter al menos 10 veces.\n- Busca 5 palabras extranjeras escritas en katakana.\n- Practica lectura en voz alta de palabras simples.",
      topics: ["Vocales en katakana", "Columnas K, S y T", "Diferencia visual entre hiragana y katakana", "Uso del katakana en palabras extranjeras", "Vocal larga con ー", "Lectura y escritura básica en katakana"]
    },
    {
      title: "Katakana (parte 2)",
      description: "Continuacion del katakana con las filas h, m, y, r, w y la consonante n. Se practica lectura de loanwords comunes del ingles, frances y portugues adaptados al japones.",
      topics: ["Filas h, m, y, r, w en katakana", "Consonante n en katakana", "Loanwords: terebi, konpyuuta, resutoran", "Nombres de paises en katakana", "Practica de lectura de menus", "Transcripcion de nombres propios"]
    },
    {
      title: "Katakana (parte 3)",
      description: "Caracteres modificados del katakana, combinaciones especiales para sonidos extranjeros (fa, wi, we, etc.) y lectura fluida de textos con mezcla de hiragana y katakana.",
      topics: ["Dakuten y handakuten en katakana", "Combinaciones especiales: fa, va, wi, we, wo", "Diferencias katakana vs hiragana", "Lectura mixta hiragana-katakana", "Vocabulario tecnologico y de comida", "Practica de escritura de nombres"]
    },
    {
      title: "Adjetivos i",
      description: "Los adjetivos terminados en -i (forma diccionario) y su conjugacion: presente afirmativo, negativo (-ku nai) y la forma atributiva ante sustantivos. Se aprende a describir objetos y personas.",
      topics: ["Forma diccionario de adjetivos-i", "Presente afirmativo con desu", "Negativo: -ku arimasen / -ku nai", "Forma atributiva: ookii kuruma", "Adjetivos comunes: ookii, chiisai, takai, yasui, atsui, samui", "Oraciones descriptivas"]
    },
    {
      title: "Adjetivos na",
      description: "Los adjetivos tipo -na y su comportamiento distinto a los adjetivos -i: uso de na ante sustantivos y conjugacion con desu. Se comparan ambos tipos y se practica con vocabulario de personalidad y ambiente.",
      topics: ["Adjetivos-na: kirei, shizuka, benri, yuumei", "Forma atributiva: kirei na hito", "Negativo: ja arimasen", "Diferencia adjetivo-i vs adjetivo-na", "Preguntas descriptivas", "Vocabulario de personalidad y lugares"]
    },
    {
      title: "Gustos (suki, kirai)",
      description: "Expresar gustos y disgustos con suki (好き) y kirai (嫌い). Se usa la estructura X ga suki desu y se aprende a preguntar preferencias y responder con grados de intensidad.",
      topics: ["Suki (好き): gustar", "Kirai (嫌い): no gustar", "Particula ga con suki/kirai", "Estructura: X ga suki desu ka?", "Grados: dai suki, amari suki ja nai", "Vocabulario de comida, musica y deportes"]
    },
    {
      title: "Cantidades y contadores basicos",
      description: "El sistema de contadores (josushi) del japones: diferentes sufijos segun el tipo de objeto. Se cubren los contadores mas usados en el N5: -tsu, -hon, -mai, -hiki, -dai, -nin y los numeros ordinales.",
      topics: ["Numeros nativos japoneses (hitotsu, futatsu...)", "Contador -tsu (objetos generales)", "Contador -hon (objetos largos)", "Contador -mai (objetos planos)", "Contador -nin (personas)", "Contador -hiki (animales pequenos)", "Contador -dai (maquinas)"]
    },
    {
      id: "mini-examen-3",
      moduleTitle: "Mini examen 3",
      title: "Katakana, adjetivos, gustos y contadores",
      description: "Evaluacion del silabario katakana completo, adjetivos -i y -na con conjugaciones, expresion de gustos con suki/kirai y uso de contadores basicos.",
      topics: ["Lectura y escritura katakana", "Adjetivos-i: formas afirmativa y negativa", "Adjetivos-na: forma atributiva", "Suki / kirai con particula ga", "Contadores -tsu, -hon, -mai, -nin", "Cantidades con numeros nativos"]
    },
    {
      title: "Pasado afirmativo",
      description: "Conjugacion de verbos y adjetivos en tiempo pasado afirmativo: -mashita para verbos y -katta desu para adjetivos-i. Se narra acciones y estados pasados en contextos cotidianos.",
      topics: ["Pasado de verbos: -mashita", "Pasado de adjetivos-i: -katta desu", "Pasado de adjetivos-na: deshita", "Pasado de desu: deshita", "Narracion de ayer y la semana pasada", "Expresiones de tiempo: kinou, senshuu, kyonen"]
    },
    {
      title: "Pasado negativo",
      description: "Conjugacion de verbos y adjetivos en tiempo pasado negativo: -masen deshita para verbos. Se practica la diferencia entre presente negativo y pasado negativo y se refuerza la linea temporal.",
      topics: ["Pasado negativo: -masen deshita", "Adjetivos-i negativo pasado: -ku nakatta", "Adjetivos-na negativo pasado: ja nakatta", "Contraste pasado vs presente negativo", "Uso de linea temporal en conversacion", "Ejercicios de narracion en pasado"]
    },
    {
      title: "Forma te",
      description: "La forma -te del verbo: construccion segun el grupo verbal y sus usos principales: solicitudes, acciones consecutivas y estado resultante con -te imasu.",
      topics: ["Construccion de la forma -te (grupo 1 y 2)", "Forma -te de verbos irregulares", "Acciones consecutivas: tabete nete", "-te imasu: estado o accion en progreso", "Descripcion de actividades habituales", "Errores comunes con la forma -te"]
    },
    {
      title: "Pedir cosas (~te kudasai)",
      description: "Uso de la forma -te + kudasai para hacer pedidos formales. Se distinguen distintos niveles de cortesia y se practica en situaciones de clase, tiendas y situaciones cotidianas.",
      topics: ["-te kudasai: por favor + verbo", "Nivel de cortesia en pedidos", "Verbos comunes en pedidos: kite, mite, kaite", "Pedidos negativos: -nai de kudasai", "Situaciones: en clase, tiendas, calle", "Respuestas: hai, wakarimashita"]
    },
    {
      title: "Permiso y prohibicion",
      description: "Expresiones para dar permiso y prohibir acciones: -te mo ii desu (esta bien hacer) y -te wa ikemasen (no se puede hacer). Se aplican en contextos de reglas y normas cotidianas.",
      topics: ["-te mo ii desu: se puede / esta permitido", "-te wa ikemasen: no se puede / prohibido", "Preguntar permiso: -te mo ii desu ka?", "Responder: hai, ii desu / iie, ikemasen", "Contextos: transporte, lugares publicos, trabajo", "Contraste con -nai de kudasai"]
    },
    {
      title: "Rutinas diarias",
      description: "Vocabulario de actividades diarias y expresiones de tiempo para hablar de rutinas: levantarse, desayunar, ir al trabajo/escuela, dormir. Se combinan particulas, tiempos verbales y expresiones de frecuencia.",
      topics: ["Vocabulario de rutinas: okiru, neru, taberu, iku", "Expresiones de hora: gozen, gogo, -ji, -fun", "Particula ni para tiempo especifico", "Conectores de secuencia: sorekara, soshite", "Narrar un dia tipico", "Preguntar por rutinas ajenas"]
    },
    {
      title: "Frecuencia (yoku, tokidoki)",
      description: "Adverbios de frecuencia para describir con que regularidad se realizan acciones: siempre, a menudo, a veces, casi nunca, nunca. Se integran en oraciones con presente y pasado.",
      topics: ["Itsumo (siempre)", "Yoku (a menudo / bien)", "Tokidoki (a veces)", "Amari + negativo (casi nunca)", "Zenzen + negativo (nunca)", "Posicion del adverbio en la oracion", "Comparacion de frecuencias"]
    },
    {
      id: "mini-examen-4",
      moduleTitle: "Mini examen 4",
      title: "Tiempo pasado, forma te y rutinas",
      description: "Evaluacion del pasado afirmativo y negativo, forma -te con sus usos, pedidos con -te kudasai, permiso y prohibicion, y vocabulario de rutinas y frecuencia.",
      topics: ["Pasado afirmativo y negativo de verbos", "Pasado de adjetivos", "Forma -te: construccion y usos", "-te kudasai y -te wa ikemasen", "Adverbios de frecuencia", "Narracion de rutinas diarias"]
    },
    {
      title: "Conectores (soshite, demo)",
      description: "Conectores discursivos para enlazar oraciones y contrastar ideas: soshite (y ademas / luego), demo (pero / sin embargo), sorekara (despues / y luego) y dakara (por eso).",
      topics: ["Soshite: y ademas / accion siguiente", "Demo (でも): pero / sin embargo", "Sorekara: y luego / despues", "Dakara: por eso / por lo tanto", "Diferencia soshite vs sorekara", "Practicar narraciones fluidas"]
    },
    {
      title: "Razones (kara)",
      description: "La conjuncion kara (から) para expresar razones y causas. Se construyen oraciones con causa + kara + efecto y se practica dar explicaciones en contextos cotidianos.",
      topics: ["Kara (から): porque / ya que", "Estructura: razon + kara + resultado", "Posicion de kara en la oracion", "Respuestas a preguntas naze / doushite", "Kara vs node (diferencia de registro)", "Ejemplos: byouki da kara, yasumimasu"]
    },
    {
      title: "Deseos (~tai)",
      description: "Forma -tai para expresar deseos propios (quiero hacer). Se construye a partir de la raiz verbal y se conjuga como adjetivo-i para afirmativo, negativo y pasado.",
      topics: ["Forma -tai: querer hacer", "Construccion desde la raiz verbal", "-tai desu (formal) vs -tai (informal)", "Negativo: -taku nai / -taku arimasen", "Pasado: -takatta", "Preguntar deseos: -tai desu ka?", "Diferencia: -tai vs hoshii"]
    },
    {
      title: "Invitaciones (~masen ka)",
      description: "Estructura -masen ka para hacer invitaciones y propuestas. Se contrasta con -mashou para sugerir acciones conjuntas y se practica en situaciones sociales.",
      topics: ["-masen ka: invitacion formal (¿no quiere...?)", "-mashou: propuesta conjunta (hagamos)", "-mashou ka: oferta de ayuda", "Respuestas: hai, souimashou / sumimasen, chotto...", "Situaciones: comer juntos, salir, estudiar", "Nivel de cortesia en invitaciones"]
    },
    {
      title: "Planes futuros",
      description: "Expresar planes e intenciones futuras usando -tsumori desu (tengo la intencion de), yotei (plan/agenda) y el presente con contexto temporal para indicar acciones futuras.",
      topics: ["-tsumori desu: tengo la intencion de", "Yotei (予定): plan programado", "Presente como futuro en japones", "Expresiones: rainen, ashita, kondo", "Preguntar por planes: nani o suru tsumori desu ka?", "Diferencia intención vs plan concreto"]
    },
    {
      title: "Experiencias (koto ga aru)",
      description: "La construccion -ta koto ga aru para hablar de experiencias previas (haber hecho algo alguna vez). Se practica con vocabulario de viajes, comidas y actividades.",
      topics: ["-ta koto ga aru: haber hecho alguna vez", "Construccion con forma -ta", "Negativo: -ta koto ga nai", "Preguntar experiencias: -ta koto ga arimasu ka?", "Vocabulario de viajes y aventuras", "Cuantificar experiencias: ichido, nandomo"]
    },
    {
      title: "Comparaciones basicas",
      description: "Estructuras comparativas del N5: A wa B yori + adjetivo (A es mas que B), A to B to dochira ga (entre A y B cual es mas), y el superlativo con ichiban (el mas).",
      topics: ["X yori Y no hou ga...: Y es mas que X", "A to B to dochira ga? (comparacion entre dos)", "Ichiban (一番): el mas / superlativo", "Comparar con adjetivos-i y adjetivos-na", "Responder comparaciones", "Vocabulario de comparacion: takai, hayai, ookii"]
    },
    {
      id: "mini-examen-5",
      moduleTitle: "Mini examen 5",
      title: "Conectores, deseos, invitaciones y comparaciones",
      description: "Evaluacion de conectores (soshite, demo, kara), forma -tai, invitaciones con -masen ka, planes con -tsumori, experiencias con koto ga aru y comparaciones con yori e ichiban.",
      topics: ["Conectores y razon con kara", "Forma -tai: deseos", "-masen ka y -mashou: invitaciones", "-tsumori desu: planes", "-ta koto ga aru: experiencias", "Comparaciones con yori e ichiban"]
    },
    {
      title: "Kanji basicos (numeros, dias)",
      description: "Introduccion a los kanji del nivel N5 relacionados con numeros (一二三四五六七八九十百千万) y los dias de la semana (月火水木金土日). Se practica lectura on'yomi y kun'yomi basicos.",
      topics: ["Kanji numericos: 一 二 三 四 五", "Kanji numericos: 六 七 八 九 十 百 千 万", "Kanji de dias: 月 火 水 木 金 土 日", "On'yomi vs kun'yomi", "Kanji en contexto: fechas y calendarios", "Escritura basica de trazos"]
    },
    {
      title: "Kanji (verbos comunes)",
      description: "Kanji N5 asociados a verbos y acciones cotidianas: 食 飲 見 聞 読 書 来 行 出 入 上 下. Se aprende a reconocerlos en textos simples y en combinaciones con hiragana.",
      topics: ["食 (comer) / 飲 (beber)", "見 (ver) / 聞 (oir/preguntar)", "読 (leer) / 書 (escribir)", "来 (venir) / 行 (ir)", "出 (salir) / 入 (entrar)", "上 (arriba) / 下 (abajo)", "Lectura de frases con kanji"]
    },
    {
      title: "Lectura simple",
      description: "Practica de lectura de textos breves N5: postales, mensajes de texto, avisos y dialogos sencillos. Se desarrolla estrategia de lectura: identificar tema, palabras clave y estructura gramatical.",
      topics: ["Estrategia de lectura N5", "Postales y mensajes simples", "Avisos y carteles (keijiban)", "Dialogos escritos cotidianos", "Inferencia de vocabulario desconocido", "Tiempo de lectura y precision"]
    },
    {
      title: "Comprension auditiva basica",
      description: "Estrategias para el listeningdel examen JLPT N5: identificar palabras clave, anticipar respuestas y discriminar opciones. Se practica con anuncios, conversaciones cortas y preguntas de respuesta multiple.",
      topics: ["Estrategias de escucha activa", "Anuncios y avisos breves", "Conversaciones cortas N5", "Preguntas de opcion multiple", "Discriminar informacion relevante", "Vocabulario de situaciones frecuentes en audio"]
    },
    {
      title: "Conversacion guiada",
      description: "Practica oral y escrita de situaciones comunicativas N5: presentaciones, pedir informacion, comprar en una tienda, reservar, preguntar direcciones y hablar sobre uno mismo.",
      topics: ["Presentacion personal completa", "Pedir y dar direcciones", "Comprar en una tienda", "Pedir en un restaurante", "Hablar de hobbies y rutinas", "Reacciones y respuestas naturales"]
    },
    {
      title: "Repaso general",
      description: "Consolidacion de toda la gramatica, vocabulario y kanji del N5. Se hace un recorrido por los puntos mas frecuentes en el examen real: particulas, tiempos verbales, vocabulario y lectura.",
      topics: ["Repaso de particulas N5", "Repaso de conjugaciones verbales", "Repaso de adjetivos i y na", "Repaso de expresiones clave", "Vocabulario frecuente N5 (800 palabras)", "Kanji N5 (100 kanji)"]
    },
    {
      title: "Estrategias para examen JLPT N5",
      description: "Guia completa para presentar el JLPT N5: estructura del examen (vocabulario, gramatica, lectura y escucha), gestion del tiempo, tipos de preguntas y errores comunes a evitar.",
      topics: ["Estructura del JLPT N5", "Seccion de vocabulario: tipos de preguntas", "Seccion de gramatica y lectura", "Seccion de comprension auditiva", "Gestion del tiempo por seccion", "Errores comunes y como evitarlos", "Dia del examen: consejos practicos"]
    },
    {
      id: "mini-examen-6",
      moduleTitle: "Mini examen 6",
      title: "Kanji, lectura, escucha y repaso final",
      description: "Evaluacion con formato similar al JLPT N5 real: seccion de kanji, comprension de lectura, comprension auditiva y gramatica mixta. Sirve como simulacro antes del examen final.",
      topics: ["Kanji N5 en contexto", "Comprension de lectura breve", "Comprension auditiva", "Gramatica mixta N5", "Vocabulario N5 completo", "Simulacro formato JLPT"]
    },
    {
      id: "examen-final",
      moduleTitle: "Examen final",
      title: "Evaluacion final JLPT N5",
      description: "Examen integral del curso Japones N5 con formato JLPT real: vocabulario, gramatica, lectura y comprension auditiva. Cubre todo el contenido del curso desde la Clase 1 hasta la Clase 47.",
      topics: ["Vocabulario N5 (800 palabras)", "Gramatica N5 completa", "Lectura: textos breves y dialogos", "Comprension auditiva", "Kanji N5 (100 kanji)", "Puntuacion y criterios de aprobacion"]
    }
  ]);

  const normalizedClassModules = normalizeJaponesN5Text(classModules);

  const classModulesWithImage = (function () {
    var classCounter = 0;
    return normalizedClassModules.map(function (moduleItem) {
      const isSpecialModule = /^(Mini\s*examen|Examen\s*final)/i.test(moduleItem.title || "");
      if (!isSpecialModule) classCounter++;
      const num = isSpecialModule ? "00" : String(classCounter).padStart(2, "0");
      const encodedTitle = encodeURIComponent(moduleItem.subtitle || moduleItem.title || ("Clase " + num));
      const encodedSource = encodeURIComponent(moduleItem.sourceFile || (isSpecialModule ? moduleItem.title : "Japones N5"));
      return Object.assign({}, moduleItem, {
        image: "generated:class-" + num + "|" + encodedTitle + "|" + encodedSource
      });
    });
  })();

  return normalizeJaponesN5Text([
    {
      id: "sobre-el-curso",
      title: "Sobre el Curso",
      subtitle: "Japones N5 — Nivel basico JLPT",
      description: "Curso completo para alcanzar el nivel N5 del JLPT (Japanese Language Proficiency Test). Cubre los dos silabarios (hiragana y katakana), gramatica fundamental, vocabulario esencial y los 100 kanji basicos.",
      content:
        "## Introduccion al curso de japones N5\n\nBienvenido al curso de japones nivel N5, un programa disenado para quienes desean iniciar su aprendizaje del idioma japones desde cero mediante una estructura progresiva, clara y orientada a la comprension real del idioma. Este curso tiene como proposito desarrollar las bases fundamentales del japones, integrando escritura, gramatica, vocabulario y comprension en un proceso coherente y acumulativo.\n\nEl nivel N5 corresponde al primer nivel del examen internacional JLPT (Japanese-Language Proficiency Test). En este nivel, el estudiante logra comprender expresiones cotidianas, identificar estructuras basicas y construir oraciones simples. En consecuencia, el enfoque del curso no se limita a la memorizacion, sino que prioriza la comprension del funcionamiento del idioma para su aplicacion en contextos reales.\n\nEl curso se compone de 42 clases organizadas por temas especificos. Cada clase desarrolla un concepto principal y, cuando es necesario, incorpora contenidos complementarios para fortalecer la coherencia del aprendizaje. A lo largo del proceso, el estudiante avanza desde el reconocimiento de los sistemas de escritura hasta la construccion de ideas completas en japones.\n\n## Objetivos del curso\n\nAl finalizar el curso, el estudiante estara en capacidad de:\n\n- Reconocer y utilizar los sistemas de escritura hiragana y katakana de forma fluida.\n- Comprender y aplicar las principales estructuras gramaticales del nivel N5.\n- Manejar un vocabulario basico de uso cotidiano (aproximadamente 600-800 palabras).\n- Construir oraciones simples en presente y pasado, tanto afirmativas como negativas.\n- Comprender preguntas basicas y formular respuestas adecuadas en contextos comunes.\n- Identificar y usar particulas fundamentales del japones (wa, no, wo, ni, de, entre otras).\n- Leer y comprender textos breves adaptados al nivel inicial.\n- Reconocer y utilizar kanji basicos asociados a numeros, tiempo y acciones frecuentes.\n- Desarrollar habilidades iniciales de comprension auditiva en situaciones cotidianas.\n- Prepararse de manera estructurada para presentar el examen JLPT N5.\n\n## Metodologia\n\nEl curso se desarrolla bajo un enfoque progresivo que integra teoria y practica en cada sesion. Cada clase se estructura en cuatro momentos: explicacion conceptual, desarrollo de ejemplos, ejercicios guiados y practica autonoma. Esta organizacion permite que el estudiante no solo comprenda los contenidos, sino que los aplique de manera inmediata.\n\nAdemas, el aprendizaje se refuerza mediante evaluaciones periodicas. Cada siete clases se realiza un mini examen orientado a consolidar los conocimientos adquiridos, mientras que al final del curso se presenta una evaluacion integral que articula todas las competencias desarrolladas. Este sistema favorece la retencion del contenido y permite identificar avances y aspectos por mejorar.\n\nPor otro lado, el curso incorpora elementos de repeticion espaciada, exposicion gradual al vocabulario y practica contextualizada. En general, se busca que el estudiante construya una base solida que le permita avanzar de forma autonoma hacia niveles superiores del idioma, manteniendo un equilibrio entre rigor conceptual y accesibilidad.",
      topics: ["Hiragana y katakana", "Gramatica N5", "100 kanji basicos", "Vocabulario 600-800 palabras", "Preparacion JLPT N5", "Metodologia progresiva"]
    }
  ]).concat(classModulesWithImage);
}

window.PORTFOLIO_DATA = {
  coursesCatalogs: [
    {
      id: "idiomas",
      title: "Idiomas",
      desc: "Rutas de aprendizaje para niveles inicial, intermedio y avanzado.",
      image: "assets/course-idiomas.svg",
      courses: [
        {
          id: "japones-n5",
          title: "Japonés N5",
          image: "assets/course-japones-n5.svg",
          modules: safeCreateModules(createJaponesN5Modules)
        },
        withModules({ id: "japones-n4", title: "Japonés N4", image: "assets/course-japones-n4.svg" })
      ]
    },
    {
      id: "matematicas",
      title: "Matematicas",
      desc: "Cursos para fortalecer bases y resolver problemas aplicados.",
      image: "assets/course-matematicas.svg",
      courses: [
        withModules({ id: "matematicas-basicas", title: "Matemáticas básicas", image: "assets/course-matematicas-basicas.svg" }),
        withModules({ id: "calculo-diferencial", title: "Cálculo diferencial", image: "assets/course-calculo-diferencial.svg" }),
        withModules({ id: "algebra-lineal", title: "Álgebra lineal", image: "assets/course-algebra-lineal.svg" }),
        withModules({ id: "calculo-integral", title: "Cálculo integral", image: "assets/course-calculo-integral.svg" }),
        {
          id: "estadistica-2",
          title: "Estadística 2",
          image: "assets/course-estadistica-2.svg",
          modules: safeCreateModules(createEstadistica2Modules)
        },
        {
          id: "metodos-numericos",
          title: "Métodos numéricos",
          image: "assets/course-metodos-numericos.svg",
          modules: safeCreateModules(createMetodosNumericosModules)
        },
        {
          id: "calculo-multivariable",
          title: "Cálculo multivariable",
          image: "assets/course-calculo-multivariable.svg",
          modules: safeCreateModules(createCalculoMultivariableModules)
        }
      ]
    },
    {
      id: "programacion",
      title: "Programacion",
      desc: "Entrenamiento practico en logica, algoritmos y desarrollo.",
      image: "assets/course-programacion.svg",
      courses: [
        withModules({ id: "fundamentos-programacion", title: "Fundamentos de programación", image: "assets/course-fundamentos-programacion.svg" }),
        withModules({ id: "scratch", title: "Scratch", image: "assets/course-scratch.svg" })
      ]
    }
  ],
  projects: [
    {
      id: 1,
      title: "Sigma-Planner",
      desc: "Software para generar el horario más óptimo para clases universitarias. Permite importar materias del SIA de la UNAL, definir intervalos libres y obtener combinaciones sin conflictos.",
      category: "Software",
      tech: ["Python", "JavaScript", "HTML", "CSS", "MongoDB"],
      repo: "https://github.com/miguerraga10/Sigma-Planner",
      demo: "Sigma-planner-web/sigma.html",
      image: "assets/Sigma-Planner.png"
    },
    {
      id: 2,
      title: "Quantaris",
      desc: "Software para predecir movimientos de acciones de la bolsa de valores mediante modelos cuantitativos y análisis de series de tiempo.",
      category: "Software",
      tech: ["Python"],
      repo: "",
      demo: "",
      image: ""
    }
  ]
};

window.PORTFOLIO_COURSE_RELEASE = {
  enabledCourses: [
    "japones-n5",
    "matematicas-basicas",
    "calculo-diferencial",
    "algebra-lineal",
    "calculo-integral",
    "estadistica-2",
    "metodos-numericos",
    "calculo-multivariable",
    "fundamentos-programacion",
    "scratch"
  ]
};

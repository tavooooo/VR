/* =====================================================================
   Hobbiton AR Experience — Central configuration
   ---------------------------------------------------------------------
   Edit this file to add/replace points of interest, 3D models and the
   trilingual copy. Everything the app shows is driven from here, so a
   non-developer can manage the whole experience from one place.
   ===================================================================== */

/* ---- Points of interest ---------------------------------------------
   trigger: "qr"  -> opens ar.html  (model-viewer, places character on
                     the ground where the visitor points the camera)
   trigger: "gps" -> opens gps.html (AR.js, anchors the model in the sky
                     above real-world GPS coordinates)
   model:   path to a .glb file inside /models
   gps:     { lat, lng, alt } only required for "gps" points. `alt` is
            metres above the visitor used to make the dragon fly high.
--------------------------------------------------------------------- */
const POINTS = [
  {
    id: "frodo",
    trigger: "qr",
    page: "mindar.html",
    model: "models/frodo.glb",
    scale: "1 1 1",
    icon: "door",
    accent: "#4a6b3a",
    coords: "Bag End · Hobbiton",
  },
  {
    id: "gandalf",
    trigger: "qr",
    model: "models/gandalf.glb",
    scale: "1 1 1",
    icon: "spark",
    accent: "#7c6aa8",
    coords: "Party Field · Hobbiton",
  },
  {
    id: "dragon",
    trigger: "gps",
    model: "models/dragon.glb",
    scale: "12 12 12",
    icon: "dragon",
    accent: "#a8442a",
    // The Green Dragon Inn at Hobbiton (APPROXIMATE). Stand in front of
    // the inn with capture.html and paste the exact reading here.
    gps: { lat: -37.872900, lng: 175.683800, alt: 25 },
    coords: "The Green Dragon Inn · Hobbiton",
  },
];

/* ---- Trilingual copy -------------------------------------------------
   Languages: en (English) · zh (Mandarin) · es (Spanish)
--------------------------------------------------------------------- */
const I18N = {
  en: {
    langName: "English",
    appTitle: "Hobbiton",
    appSubtitle: "Augmented Reality Experience",
    intro: "Walk the Shire and watch its heroes come to life. Choose a location to begin.",
    chooseLang: "Choose your language",
    enter: "Enter the Shire",
    start: "Begin experience",
    back: "Back to map",
    qrBadge: "Scan on site",
    gpsBadge: "Find by location",
    instructionsTitle: "How it works",
    instrQr: "Point your camera at the open space, then tap to place the character and walk around them.",
    instrGps: "Allow location & motion access, then raise your phone above The Green Dragon Inn to see the paper dragon circling overhead.",
    arCta: "See in your real world",
    realBgHint: "Opens your camera — the character appears in the real scene",
    camExit: "Close camera",
    camDenied: "Camera blocked. Allow camera access in your browser settings.",
    storyLabel: "Story",
    allow: "Allow camera & sensors",
    locating: "Locating the dragon… aim your phone above the inn",
    loading: "Summoning…",
    notSupported: "Your browser does not support AR. Try Safari (iOS) or Chrome (Android).",
    points: {
      frodo: {
        name: "Frodo Baggins",
        place: "Bag End",
        story: "Here at the green round door of Bag End, Frodo Baggins began the journey that would decide the fate of Middle-earth. Stand where the Ring-bearer once stood.",
      },
      gandalf: {
        name: "Gandalf the Grey",
        place: "The Party Field",
        story: "On this field Gandalf lit the fireworks that delighted every hobbit of the Shire. The wandering wizard returns to share his magic with you.",
      },
      dragon: {
        name: "The Dragon",
        place: "The Green Dragon Inn",
        story: "Look to the skies above The Green Dragon Inn. A dragon of paper and legend wheels overhead — the old tales come alive over the rooftops of Hobbiton.",
      },
    },
  },
  zh: {
    langName: "中文",
    appTitle: "霍比屯",
    appSubtitle: "增强现实体验",
    intro: "漫步夏尔，见证英雄们栩栩如生。选择一个地点开始旅程。",
    chooseLang: "选择您的语言",
    enter: "进入夏尔",
    start: "开始体验",
    back: "返回地图",
    qrBadge: "现场扫描",
    gpsBadge: "按位置寻找",
    instructionsTitle: "使用方法",
    instrQr: "将摄像头对准开阔处，轻触放置角色，并绕着他走动。",
    instrGps: "请允许位置和动作权限，然后将手机举向绿龙酒馆上空，即可看到纸巨龙在空中盘旋。",
    arCta: "在真实环境中查看",
    realBgHint: "开启相机——角色将出现在真实场景中",
    camExit: "关闭相机",
    camDenied: "相机被阻止。请在浏览器设置中允许使用相机。",
    storyLabel: "故事",
    allow: "允许摄像头与传感器",
    locating: "正在定位巨龙……请将手机对准酒馆上空",
    loading: "召唤中……",
    notSupported: "您的浏览器不支持 AR。请尝试 Safari（iOS）或 Chrome（安卓）。",
    points: {
      frodo: {
        name: "佛罗多·巴金斯",
        place: "袋底洞",
        story: "在袋底洞这扇绿色的圆门前，佛罗多·巴金斯踏上了决定中土命运的旅程。站在持戒者曾经站立的地方。",
      },
      gandalf: {
        name: "灰袍甘道夫",
        place: "宴会草坪",
        story: "在这片草坪上，甘道夫点燃了令每个夏尔霍比特人欢欣的烟花。漫游的巫师归来，与你分享他的魔法。",
      },
      dragon: {
        name: "巨龙",
        place: "绿龙酒馆",
        story: "仰望绿龙酒馆上空。一条纸与传说折成的巨龙在空中盘旋——古老的故事在霍比屯的屋顶上苏醒。",
      },
    },
  },
  es: {
    langName: "Español",
    appTitle: "Hobbiton",
    appSubtitle: "Experiencia de Realidad Aumentada",
    intro: "Recorre la Comarca y mira cómo cobran vida sus héroes. Elige un lugar para comenzar.",
    chooseLang: "Elige tu idioma",
    enter: "Entrar a la Comarca",
    start: "Comenzar experiencia",
    back: "Volver al mapa",
    qrBadge: "Escanea en el lugar",
    gpsBadge: "Buscar por ubicación",
    instructionsTitle: "Cómo funciona",
    instrQr: "Apunta la cámara al espacio abierto, toca para colocar al personaje y camina a su alrededor.",
    instrGps: "Permite el acceso a ubicación y movimiento, luego levanta el teléfono sobre la posada El Dragón Verde para ver al dragón de papel volando en círculos.",
    arCta: "Ver en tu entorno real",
    realBgHint: "Abre tu cámara — el personaje aparece en la escena real",
    camExit: "Cerrar cámara",
    camDenied: "Cámara bloqueada. Permití el acceso a la cámara en los ajustes del navegador.",
    storyLabel: "Historia",
    allow: "Permitir cámara y sensores",
    locating: "Localizando al dragón… apunta el teléfono sobre la posada",
    loading: "Invocando…",
    notSupported: "Tu navegador no soporta AR. Prueba Safari (iOS) o Chrome (Android).",
    points: {
      frodo: {
        name: "Frodo Bolsón",
        place: "Bolsón Cerrado",
        story: "Aquí, en la puerta verde y redonda de Bolsón Cerrado, Frodo Bolsón comenzó el viaje que decidiría el destino de la Tierra Media. Párate donde estuvo el Portador del Anillo.",
      },
      gandalf: {
        name: "Gandalf el Gris",
        place: "El Campo de la Fiesta",
        story: "En este campo Gandalf encendió los fuegos artificiales que deleitaron a cada hobbit de la Comarca. El mago errante regresa para compartir su magia contigo.",
      },
      dragon: {
        name: "El Dragón",
        place: "El Dragón Verde",
        story: "Mira al cielo sobre la posada El Dragón Verde. Un dragón de papel y leyenda gira en lo alto — los viejos cuentos cobran vida sobre los tejados de Hobbiton.",
      },
    },
  },
};

/* ---- Tiny shared helpers --------------------------------------------- */
const Store = {
  get lang() {
    return localStorage.getItem("hobbiton_lang") || "en";
  },
  set lang(v) {
    localStorage.setItem("hobbiton_lang", v);
  },
};

function getPoint(id) {
  return POINTS.find((p) => p.id === id);
}

function t(lang) {
  return I18N[lang] || I18N.en;
}

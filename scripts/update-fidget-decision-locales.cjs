const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '../public/locales');
const masterKeysFile = path.resolve(__dirname, 'master-keys.json');

const newKeys = {
  // Decision Wheel
  "Choice Paralysis Helper": {
    de: "Hilfe bei Entscheidungsschwierigkeiten",
    el: "Βοηθός παράλυσης επιλογής",
    es: "Ayuda para la parálisis de elección",
    fr: "Aide à la paralysie du choix",
    fr_ca: "Aide à la paralysie du choix",
    ja: "選択麻痺ヘルパー",
    ko: "선택 마비 도우미",
    ru: "Помощник при трудностях выбора",
    vi: "Trợ lý chống khó xử khi chọn",
    zh: "选择困难小帮手"
  },
  "Decision Wheel": {
    de: "Entscheidungsrad",
    el: "Τροχός αποφάσεων",
    es: "Rueda de decisiones",
    fr: "Roue des décisions",
    fr_ca: "Roue des décisions",
    ja: "ルーレット",
    ko: "결정 돌림판",
    ru: "Колесо решений",
    vi: "Vòng quay quyết định",
    zh: "大转盘"
  },
  "The wheel chose!": {
    de: "Das Rad hat gewählt!",
    el: "Ο τροχός επέλεξε!",
    es: "¡La rueda ha elegido!",
    fr: "La roue a choisi !",
    fr_ca: "La roue a choisi !",
    ja: "ルーレットが決まりました！",
    ko: "돌림판이 선택했습니다!",
    ru: "Колесо сделало выбор!",
    vi: "Vòng quay đã chọn!",
    zh: "转盘选中啦！"
  },
  "Spin the Wheel!": {
    de: "Rad drehen!",
    el: "Γυρίστε τον τροχό!",
    es: "¡Girar la rueda!",
    fr: "Faire tourner la roue !",
    fr_ca: "Faire tourner la roue !",
    ja: "ルーレットを回す！",
    ko: "돌림판 돌리기!",
    ru: "Крутить колесо!",
    vi: "Quay bánh xe!",
    zh: "开始旋转！"
  },
  "Spinning...": {
    de: "Dreht sich...",
    el: "Περιστρέφεται...",
    es: "Girando...",
    fr: "Rotation en cours...",
    fr_ca: "Rotation en cours...",
    ja: "回転中...",
    ko: "회전 중...",
    ru: "Вращение...",
    vi: "Đang quay...",
    zh: "旋转中..."
  },
  "Spin again": {
    de: "Erneut drehen",
    el: "Περιστρέψτε ξανά",
    es: "Girar de nuevo",
    fr: "Tourner à nouveau",
    fr_ca: "Tourner à nouveau",
    ja: "もう一度回す",
    ko: "다시 돌리기",
    ru: "Крутить снова",
    vi: "Quay lại",
    zh: "再转一次"
  },
  "Edit Options": {
    de: "Optionen bearbeiten",
    el: "Επεξεργασία επιλογών",
    es: "Editar opciones",
    fr: "Modifier les options",
    fr_ca: "Modifier les options",
    ja: "選択肢を編集",
    ko: "옵션 편집",
    ru: "Редактировать варианты",
    vi: "Chỉnh sửa tùy chọn",
    zh: "编辑选项"
  },
  "Add option...": {
    de: "Option hinzufügen...",
    el: "Προσθήκη επιλογής...",
    es: "Añadir opción...",
    fr: "Ajouter une option...",
    fr_ca: "Ajouter une option...",
    ja: "選択肢を追加...",
    ko: "옵션 추가...",
    ru: "Добавить вариант...",
    vi: "Thêm tùy chọn...",
    zh: "添加选项..."
  },
  "Add option to decision wheel": {
    de: "Option zum Entscheidungsrad hinzufügen",
    el: "Προσθήκη επιλογής στον τροχό αποφάσεων",
    es: "Añadir opción a la rueda de decisiones",
    fr: "Ajouter l'option à la roue des décisions",
    fr_ca: "Ajouter l'option à la roue des décisions",
    ja: "選択肢をルーレットに追加",
    ko: "결정 돌림판에 옵션 추가",
    ru: "Добавить вариант в колесо решений",
    vi: "Thêm tùy chọn vào vòng quay quyết định",
    zh: "将选项添加到大转盘"
  },

  // Fidget Modal
  "Tappy-Style Sensory Hub": {
    de: "Sensorisches Tappy-Zentrum",
    el: "Αισθητηριακό κέντρο τύπου Tappy",
    es: "Centro sensorial estilo Tappy",
    fr: "Centre sensoriel style Tappy",
    fr_ca: "Centre sensoriel style Tappy",
    ja: "タッピースタイル感覚ハブ",
    ko: "태피 스타일 감각 허브",
    ru: "Сенсорный центр Tappy",
    vi: "Trung tâm xúc giác phong cách Tappy",
    zh: "触感解压感官中心"
  },
  "Tactile Fidget Toys": {
    de: "Taktile Fidget-Spielzeuge",
    el: "Απτικά παιχνίδια fidget",
    es: "Juguetes táctiles antiestrés",
    fr: "Jouets tactiles anti-stress",
    fr_ca: "Jouets tactiles anti-stress",
    ja: "触感フィジェットトイ",
    ko: "촉각 피젯 토이",
    ru: "Тактильные антистресс-игрушки",
    vi: "Đồ chơi xúc giác giảm căng thẳng",
    zh: "触觉解压玩具"
  },
  "Mute sound": {
    de: "Ton stummschalten",
    el: "Σίγαση ήχου",
    es: "Silenciar sonido",
    fr: "Couper le son",
    fr_ca: "Couper le son",
    ja: "音をミュート",
    ko: "음소거",
    ru: "Отключить звук",
    vi: "Tắt tiếng",
    zh: "静音"
  },
  "Unmute sound": {
    de: "Ton einschalten",
    el: "Κατάργηση σίγασης",
    es: "Activar sonido",
    fr: "Activer le son",
    fr_ca: "Activer le son",
    ja: "音を有効化",
    ko: "소리 켜기",
    ru: "Включить звук",
    vi: "Bật tiếng",
    zh: "开启声音"
  },
  "Disable vibration": {
    de: "Vibration deaktivieren",
    el: "Απενεργοποίηση δόνησης",
    es: "Desactivar vibración",
    fr: "Désactiver les vibrations",
    fr_ca: "Désactiver les vibrations",
    ja: "振動をオフ",
    ko: "진동 끄기",
    ru: "Отключить вибрацию",
    vi: "Tắt rung",
    zh: "关闭震动"
  },
  "Enable vibration": {
    de: "Vibration aktivieren",
    el: "Ενεργοποίηση δόνησης",
    es: "Activar vibración",
    fr: "Activer les vibrations",
    fr_ca: "Activer les vibrations",
    ja: "振動をオン",
    ko: "진동 켜기",
    ru: "Включить вибрацию",
    vi: "Bật rung",
    zh: "开启震动"
  },
  "Pop-It": {
    de: "Pop-It",
    el: "Pop-It",
    es: "Pop-It",
    fr: "Pop-It",
    fr_ca: "Pop-It",
    ja: "ポップイット",
    ko: "팝잇",
    ru: "Поп-ит",
    vi: "Pop-It",
    zh: "灭鼠板 Pop-It"
  },
  "Silicone shapes": {
    de: "Silikonformen",
    el: "Σχήματα σιλικόνης",
    es: "Formas de silicona",
    fr: "Formes en silicone",
    fr_ca: "Formes en silicone",
    ja: "シリコンの形",
    ko: "실리콘 모양",
    ru: "Силиконовые формы",
    vi: "Khuôn silicon",
    zh: "硅胶形状"
  },
  "Clickers": {
    de: "Klicker",
    el: "Κλικ",
    es: "Teclas mecánicas",
    fr: "Boutons poussoirs",
    fr_ca: "Boutons poussoirs",
    ja: "クリッカー",
    ko: "클리커",
    ru: "Кнопки",
    vi: "Nút bấm",
    zh: "机械按键"
  },
  "Key switches": {
    de: "Tastenschalter",
    el: "Διακόπτες πλήκτρων",
    es: "Interruptores de teclado",
    fr: "Interrupteurs de touches",
    fr_ca: "Interrupteurs de touches",
    ja: "キースイッチ",
    ko: "키 스위치",
    ru: "Переключатели клавиш",
    vi: "Công tắc phím",
    zh: "键轴开关"
  },
  "Spinner": {
    de: "Spinner",
    el: "Spinner",
    es: "Fidget Spinner",
    fr: "Toupie spinner",
    fr_ca: "Toupie spinner",
    ja: "スピナー",
    ko: "스피너",
    ru: "Спиннер",
    vi: "Con quay",
    zh: "指尖陀螺"
  },
  "Physics RPM": {
    de: "Physik U/min",
    el: "Φυσική RPM",
    es: "Física RPM",
    fr: "Physique tr/min",
    fr_ca: "Physique tr/min",
    ja: "物理演算 RPM",
    ko: "물리 RPM",
    ru: "Физика об/мин",
    vi: "Vật lý RPM",
    zh: "物理转速 RPM"
  },
  "Switches": {
    de: "Schalter",
    el: "Διακόπτες",
    es: "Interruptores",
    fr: "Interrupteurs",
    fr_ca: "Interrupteurs",
    ja: "スイッチ",
    ko: "스위치",
    ru: "Переключатели",
    vi: "Công tắc",
    zh: "开关面板"
  },
  "Relays & sliders": {
    de: "Relais & Schieberegler",
    el: "Ρελέ & ρυθμιστές",
    es: "Relés y controles deslizantes",
    fr: "Relais et curseurs",
    fr_ca: "Relais et curseurs",
    ja: "リレー＆スライダー",
    ko: "릴레이 & 슬라이더",
    ru: "Реле и ползунки",
    vi: "Rơ-le & thanh trượt",
    zh: "继电器与滑块"
  },
  "Slime": {
    de: "Schleim",
    el: "Slime",
    es: "Slime",
    fr: "Pâte gluante",
    fr_ca: "Pâte gluante",
    ja: "スライム",
    ko: "슬라임",
    ru: "Слайм",
    vi: "Slime",
    zh: "解压果冻"
  },
  "Squishy stress ball": {
    de: "Knautschiger Antistressball",
    el: "Μαλακή μπάλα κατά του στρες",
    es: "Pelota antiestrés blanda",
    fr: "Balle anti-stress spongieuse",
    fr_ca: "Balle anti-stress spongieuse",
    ja: "もちもちスクイーズ",
    ko: "말랑한 스트레스 볼",
    ru: "Мягкий мячик-антистресс",
    vi: "Bóng bóp mềm giảm stress",
    zh: "捏捏乐解压球"
  },
  "Starlight": {
    de: "Sternenlicht",
    el: "Αστροφεγγιά",
    es: "Luz estelar",
    fr: "Lumière stellaire",
    fr_ca: "Lumière stellaire",
    ja: "スターライト",
    ko: "별빛",
    ru: "Звездный свет",
    vi: "Ánh sao",
    zh: "星空星芒"
  },
  "Calm galaxy flow": {
    de: "Beruhigender Galaxiestrom",
    el: "Ήρεμη ροή γαλαξία",
    es: "Flujo galáctico relajante",
    fr: "Flux galactique apaisant",
    fr_ca: "Flux galactique apaisant",
    ja: "穏やかな銀河の流れ",
    ko: "차분한 은하 흐름",
    ru: "Спокойное космическое свечение",
    vi: "Dòng chảy ngân hà êm dịu",
    zh: "静心星河微粒"
  },
  "Worry Stone": {
    de: "Sorgenstein",
    el: "Πέτρα ανησυχίας",
    es: "Piedra de preocupación",
    fr: "Pierre d'apaisement",
    fr_ca: "Pierre d'apaisement",
    ja: "ウォリーストーン",
    ko: "워리 스톤",
    ru: "Камень беспокойства",
    vi: "Đá tĩnh tâm",
    zh: "抚慰抚平石"
  },
  "Fidget cube pad": {
    de: "Fidget-Cube-Pad",
    el: "Πλακέτα fidget cube",
    es: "Pad de cubo antiestrés",
    fr: "Bloc cube anti-stress",
    fr_ca: "Bloc cube anti-stress",
    ja: "フィジェットキューブパッド",
    ko: "피젯 큐브 패드",
    ru: "Панель фиджет-кубика",
    vi: "Đệm xúc giác lập phương",
    zh: "减压魔方触碰垫"
  },
  "Grid": {
    de: "Gitter",
    el: "Πλέγμα",
    es: "Cuadrícula",
    fr: "Grille",
    fr_ca: "Grille",
    ja: "グリッド",
    ko: "격자",
    ru: "Сетка",
    vi: "Lưới",
    zh: "方格"
  },
  "Heart": {
    de: "Herz",
    el: "Καρδιά",
    es: "Corazón",
    fr: "Cœur",
    fr_ca: "Cœur",
    ja: "ハート",
    ko: "하트",
    ru: "Сердце",
    vi: "Trái tim",
    zh: "爱心"
  },
  "Star": {
    de: "Stern",
    el: "Αστέρι",
    es: "Estrella",
    fr: "Étoile",
    fr_ca: "Étoile",
    ja: "星",
    ko: "별",
    ru: "Звезда",
    vi: "Ngôi sao",
    zh: "五角星"
  },
  "Hex": {
    de: "Wabe",
    el: "Εξάγωνο",
    es: "Hexágono",
    fr: "Hexagone",
    fr_ca: "Hexagone",
    ja: "六角形",
    ko: "육각형",
    ru: "Соты",
    vi: "Lục giác",
    zh: "蜂巢六角"
  },
  "Pops": {
    de: "Plopps",
    el: "Pops",
    es: "Pops",
    fr: "Bulles",
    fr_ca: "Bulles",
    ja: "ポップ数",
    ko: "터뜨림",
    ru: "Хлопки",
    vi: "Lần bấm",
    zh: "按压数"
  },
  "Flip & Reset": {
    de: "Umdrehen & Zurücksetzen",
    el: "Αναστροφή & επαναφορά",
    es: "Voltear y reiniciar",
    fr: "Retourner et réinitialiser",
    fr_ca: "Retourner et réinitialiser",
    ja: "裏返してリセット",
    ko: "뒤집고 재설정",
    ru: "Перевернуть и сбросить",
    vi: "Lật & Đặt lại",
    zh: "翻面重置"
  },
  "Pop All": {
    de: "Alle ploppen",
    el: "Όλα pop",
    es: "Presionar todos",
    fr: "Tout éclater",
    fr_ca: "Tout éclater",
    ja: "全部押す",
    ko: "모두 터뜨리기",
    ru: "Хлопнуть все",
    vi: "Bấm tất cả",
    zh: "全部按下"
  },
  "Press mechanical key switches": {
    de: "Mechanische Schalter drücken",
    el: "Πατήστε μηχανικούς διακόπτες πλήκτρων",
    es: "Presione interruptores mecánicos",
    fr: "Appuyez sur les touches mécaniques",
    fr_ca: "Appuyez sur les touches mécaniques",
    ja: "メカニカルキースイッチを押す",
    ko: "기계식 키 스위치 누르기",
    ru: "Нажимайте механические переключатели",
    vi: "Nhấn công tắc phím cơ",
    zh: "敲击机械键盘轴体"
  },
  "clicks": {
    de: "Klicks",
    el: "κλικ",
    es: "clics",
    fr: "clics",
    fr_ca: "clics",
    ja: "回クリック",
    ko: "회 클릭",
    ru: "кликов",
    vi: "lần nhấp",
    zh: "次点击"
  },
  "Blue Clicky": {
    de: "Blau (Klickend)",
    el: "Μπλε κλικ",
    es: "Azul Sonoro",
    fr: "Bleu Clic net",
    fr_ca: "Bleu Clic net",
    ja: "青軸 (クリッキー)",
    ko: "청축 (경쾌한 클릭)",
    ru: "Синий щелкающий",
    vi: "Xanh cơ học (giòn giã)",
    zh: "青轴（清脆段落）"
  },
  "Loud & Crisp": {
    de: "Laut & Knackig",
    el: "Δυνατό & καθαρό",
    es: "Fuerte y nítido",
    fr: "Fort et net",
    fr_ca: "Fort et net",
    ja: "大きくてクリスピー",
    ko: "크고 명확한 소리",
    ru: "Громко и четко",
    vi: "To & Giòn giã",
    zh: "响亮清脆"
  },
  "Brown Tactile": {
    de: "Braun (Taktil)",
    el: "Καφέ απτικό",
    es: "Marrón Táctil",
    fr: "Marron Tactile",
    fr_ca: "Marron Tactile",
    ja: "茶軸 (タクタイル)",
    ko: "갈축 (부드러운 걸림)",
    ru: "Коричневый тактильный",
    vi: "Nâu xúc giác",
    zh: "茶轴（微段落触感）"
  },
  "Soft Bump": {
    de: "Sanfter Widerstand",
    el: "Απαλό χτύπημα",
    es: "Toque suave",
    fr: "Léger ressaut",
    fr_ca: "Léger ressaut",
    ja: "やわらかな感触",
    ko: "부드러운 반발력",
    ru: "Мягкий упор",
    vi: "Gờ nhẹ êm ái",
    zh: "轻柔顿落"
  },
  "Red Linear": {
    de: "Rot (Linear)",
    el: "Κόκκινο γραμμικό",
    es: "Rojo Lineal",
    fr: "Rouge Linéaire",
    fr_ca: "Rouge Linéaire",
    ja: "赤軸 (リニア)",
    ko: "적축 (리니어)",
    ru: "Красный линейный",
    vi: "Đỏ thẳng (tuyến tính)",
    zh: "红轴（线性直上直下）"
  },
  "Smooth Bounce": {
    de: "Sanftes Federn",
    el: "Ομαλή επαναφορά",
    es: "Rebote suave",
    fr: "Rebond fluide",
    fr_ca: "Rebond fluide",
    ja: "なめらかな弾力",
    ko: "부드러운 반동",
    ru: "Плавный отскок",
    vi: "Độ nảy mượt mà",
    zh: "轻盈回弹"
  },
  "Relay Clicker": {
    de: "Relais-Klicker",
    el: "Κλικ ρελέ",
    es: "Relé industrial",
    fr: "Bouton relais",
    fr_ca: "Bouton relais",
    ja: "リレークリッカー",
    ko: "릴레이 클리커",
    ru: "Реле-щелкатель",
    vi: "Bấm rơ-le",
    zh: "继电器按扭"
  },
  "Industrial Snap": {
    de: "Industrieller Schnappton",
    el: "Βιομηχανικό κλικ",
    es: "Chasquido industrial",
    fr: "Déclic industriel",
    fr_ca: "Déclic industriel",
    ja: "インダストリアルな重厚音",
    ko: "단단한 기계음",
    ru: "Промышленный щелчок",
    vi: "Tiếng ngắt cơ khí",
    zh: "重工业机械感"
  },
  "Big Spacebar Clicker": {
    de: "Große Leertaste",
    el: "Μεγάλη μπάρα διαστήματος",
    es: "Barra espaciadora gigante",
    fr: "Grande barre d'espace",
    fr_ca: "Grande barre d'espace",
    ja: "大きなスペースバー",
    ko: "대형 스페이스바 클리커",
    ru: "Большой пробел",
    vi: "Phím cách lớn",
    zh: "大空格键点击器"
  },
  "Bee": {
    de: "Biene",
    el: "Μέλισσα",
    es: "Abeja",
    fr: "Abeille",
    fr_ca: "Abeille",
    ja: "ミツバチ",
    ko: "꿀벌",
    ru: "Пчела",
    vi: "Chú ong",
    zh: "小蜜蜂"
  },
  "Neon": {
    de: "Neon",
    el: "Νέον",
    es: "Neón",
    fr: "Néon",
    fr_ca: "Néon",
    ja: "ネオン",
    ko: "네온",
    ru: "Неон",
    vi: "Neon",
    zh: "霓虹"
  },
  "Galaxy": {
    de: "Galaxie",
    el: "Γαλαξίας",
    es: "Galaxia",
    fr: "Galaxie",
    fr_ca: "Galaxie",
    ja: "ギャラクシー",
    ko: "은하",
    ru: "Галактика",
    vi: "Ngân hà",
    zh: "银河"
  },
  "Speed": {
    de: "Geschwindigkeit",
    el: "Ταχύτητα",
    es: "Velocidad",
    fr: "Vitesse",
    fr_ca: "Vitesse",
    ja: "速度",
    ko: "속도",
    ru: "Скорость",
    vi: "Tốc độ",
    zh: "旋转速度"
  },
  "Max": {
    de: "Max",
    el: "Μέγ.",
    es: "Máx.",
    fr: "Max",
    fr_ca: "Max",
    ja: "最高",
    ko: "최대",
    ru: "Макс.",
    vi: "Tối đa",
    zh: "峰值"
  },
  "Flick Left": {
    de: "Nach links schnippen",
    el: "Τίναγμα αριστερά",
    es: "Impulsar izquierda",
    fr: "Pichenette à gauche",
    fr_ca: "Pichenette à gauche",
    ja: "左にスピン",
    ko: "왼쪽으로 튕기기",
    ru: "Влево",
    vi: "Gạt sang trái",
    zh: "向左拨动"
  },
  "Stop": {
    de: "Stopp",
    el: "Διακοπή",
    es: "Detener",
    fr: "Arrêter",
    fr_ca: "Arrêter",
    ja: "止める",
    ko: "정지",
    ru: "Стоп",
    vi: "Dừng",
    zh: "停止"
  },
  "Flick Right": {
    de: "Nach rechts schnippen",
    el: "Τίναγμα δεξιά",
    es: "Impulsar derecha",
    fr: "Pichenette à droite",
    fr_ca: "Pichenette à droite",
    ja: "右にスピン",
    ko: "오른쪽으로 튕기기",
    ru: "Вправо",
    vi: "Gạt sang phải",
    zh: "向右拨动"
  },
  "Satisfying switches, latches & relays": {
    de: "Angenehme Schalter, Riegel & Relais",
    el: "Ικανοποιητικοί διακόπτες, μάνταλα & ρελέ",
    es: "Interruptores, pestillos y relés agradables",
    fr: "Interrupteurs, loquets et relais satisfaisants",
    fr_ca: "Interrupteurs, loquets et relais satisfaisants",
    ja: "心地よいスイッチ・ラッチ・リレー",
    ko: "만족스러운 스위치, 래치 및 릴레이",
    ru: "Приятные переключатели, защелки и реле",
    vi: "Công tắc, chốt & rơ-le êm tay",
    zh: "解压趣味开关、卡扣与继电器"
  },
  "Relay active": {
    de: "Relais aktiv",
    el: "Ρελέ ενεργό",
    es: "Relé activo",
    fr: "Relais activé",
    fr_ca: "Relais activé",
    ja: "リレー通電中",
    ko: "릴레이 활성화",
    ru: "Реле активно",
    vi: "Rơ-le hoạt động",
    zh: "继电器连通"
  },
  "Master Circuit": {
    de: "Hauptstromkreis",
    el: "Κύριο κύκλωμα",
    es: "Circuito principal",
    fr: "Circuit principal",
    fr_ca: "Circuit principal",
    ja: "メイン回路",
    ko: "메인 회로",
    ru: "Главная цепь",
    vi: "Mạch điện chính",
    zh: "主电源总闸"
  },
  "Main illuminated rocker": {
    de: "Beleuchteter Hauptkippschalter",
    el: "Κύριος φωτιζόμενος διακόπτης",
    es: "Balancín principal iluminado",
    fr: "Bascule principale éclairée",
    fr_ca: "Bascule principale éclairée",
    ja: "点灯式ロッカースイッチ",
    ko: "발광 락커 스위치",
    ru: "Главная подсвеченная клавиша",
    vi: "Công tắc bập bênh phát sáng",
    zh: "发光摇臂总开关"
  },
  "ON": {
    de: "EIN",
    el: "ON",
    es: "ON",
    fr: "MARCHE",
    fr_ca: "MARCHE",
    ja: "ON",
    ko: "켜짐",
    ru: "ВКЛ",
    vi: "BẬT",
    zh: "开"
  },
  "OFF": {
    de: "AUS",
    el: "OFF",
    es: "OFF",
    fr: "ARRÊT",
    fr_ca: "ARRÊT",
    ja: "OFF",
    ko: "꺼짐",
    ru: "ВЫКЛ",
    vi: "TẮT",
    zh: "关"
  },
  "Sensory Frequency Slider": {
    de: "Sensorischer Frequenz-Schieberegler",
    el: "Ρυθμιστής αισθητηριακής συχνότητας",
    es: "Control deslizante de frecuencia sensorial",
    fr: "Curseur de fréquence sensorielle",
    fr_ca: "Curseur de fréquence sensorielle",
    ja: "感覚周波数スライダー",
    ko: "감각 주파수 슬라이더",
    ru: "Ползунок сенсорной частоты",
    vi: "Thanh trượt tần số xúc giác",
    zh: "感官频率滑动条"
  },
  "Touch, drag & squish the stress blob": {
    de: "Berühren, ziehen & kneten Sie den Stressball",
    el: "Αγγίξτε, σύρετε & ζουλήξτε το blob άγχους",
    es: "Toca, arrastra y aprieta la masa antiestrés",
    fr: "Touchez, glissez et pressez la balle anti-stress",
    fr_ca: "Touchez, glissez et pressez la balle anti-stress",
    ja: "触って、引っ張って、ぷにぷに揉む",
    ko: "터치하고 당기며 스트레스 볼을 주무르세요",
    ru: "Касайтесь, тяните и сжимайте антистресс-массу",
    vi: "Chạm, kéo & bóp khối giải tỏa căng thẳng",
    zh: "触摸、拖拽并揉捏解压凝胶"
  },
  "Touch and guide calming cosmic starlight particles": {
    de: "Berühren und leiten Sie beruhigende Sternenpartikel",
    el: "Αγγίξτε και οδηγήστε τα χαλαρωτικά σωματίδια αστεριών",
    es: "Toca y guía las relajantes partículas de luz estelar",
    fr: "Touchez et guidez les particules cosmiques apaisantes",
    fr_ca: "Touchez et guidez les particules cosmiques apaisantes",
    ja: "触って導く、心落ち着く星空の微粒子",
    ko: "터치하여 차분한 우주 별빛 입자를 이끌어보세요",
    ru: "Коснитесь и направляйте успокаивающие частицы звездного света",
    vi: "Chạm và điều hướng các hạt ánh sao êm dịu",
    zh: "触碰并引导舒缓的宇宙星光微粒"
  },
  "Tactile pad & soothing worry stone": {
    de: "Taktiles Pad & beruhigender Sorgenstein",
    el: "Απτική πλακέτα & κατευναστική πέτρα ανησυχίας",
    es: "Pad táctil y piedra de relajación",
    fr: "Surface tactile et pierre d'apaisement",
    fr_ca: "Surface tactile et pierre d'apaisement",
    ja: "触感パッド＆癒しのウォリーストーン",
    ko: "촉각 패드 및 마음을 달래는 워리 스톤",
    ru: "Тактильная панель и успокаивающий камень",
    vi: "Đệm xúc giác & đá làm dịu tâm trí",
    zh: "触感按键与舒缓解压石"
  },
  "smooth strokes": {
    de: "sanfte Berührungen",
    el: "απαλές κινήσεις",
    es: "caricias suaves",
    fr: "caresses douces",
    fr_ca: "caresses douces",
    ja: "回のなめらかな撫で",
    ko: "회 부드러운 문지름",
    ru: "плавных поглаживаний",
    vi: "lần vuốt êm",
    zh: "次平滑轻抚"
  },
  "5-Click Die": {
    de: "5-Klick-Würfel",
    el: "Ζάρι 5 κλικ",
    es: "Dado de 5 clics",
    fr: "Dé à 5 boutons",
    fr_ca: "Dé à 5 boutons",
    ja: "5ボタンダイス",
    ko: "5-클릭 주사위",
    ru: "5-кнопочный кубик",
    vi: "Hột xúc xắc 5 nút",
    zh: "五键骰子面"
  },
  "3 clicky, 2 silent": {
    de: "3 mit Klick, 2 leise",
    el: "3 με κλικ, 2 αθόρυβα",
    es: "3 audibles, 2 silenciosos",
    fr: "3 clics sonores, 2 silencieux",
    fr_ca: "3 clics sonores, 2 silencieux",
    ja: "3個カチカチ、2個静音",
    ko: "3개 클릭음, 2개 무음",
    ru: "3 со щелчком, 2 тихие",
    vi: "3 nút kêu, 2 nút êm",
    zh: "3枚有声，2枚静音"
  },
  "Rub thumb gently": {
    de: "Sanft mit dem Daumen reiben",
    el: "Τρίψτε απαλά με τον αντίχειρα",
    es: "Frota el pulgar suavemente",
    fr: "Frottez doucement avec le pouce",
    fr_ca: "Frottez doucement avec le pouce",
    ja: "親指でやさしく撫でてください",
    ko: "엄지손가락으로 부드럽게 문지르세요",
    ru: "Мягко поглаживайте большим пальцем",
    vi: "Xoa nhẹ ngón tay cái",
    zh: "用大拇指轻柔抚摩凹槽"
  },

  // Caregiver Medications Tab & Live Alert Banner
  "Configure medications, scheduled dose times, dosages, and keep track of remaining pill supply for": {
    de: "Konfigurieren Sie Medikamente, Dosiszeiten und behalten Sie den Vorrat im Blick für",
    el: "Διαμορφώστε τα φάρμακα, τις ώρες δόσεων και παρακολουθήστε το απόθεμα για",
    es: "Configura medicamentos, horarios de dosis y controla el suministro restante para",
    fr: "Configurez les médicaments, horaires de prises et suivez le stock restant pour",
    fr_ca: "Configurez les médicaments, horaires de prises et suivez le stock restant pour",
    ja: "の服薬、投与時間、用量を設定し、残りの薬の在庫を管理します：",
    ko: "의 복약, 복용 시간, 용량을 설정하고 남은 약 재고를 추적하세요:",
    ru: "Настройте прием лекарств, расписание доз и отслеживайте остаток запасов для",
    vi: "Định cấu hình thuốc, thời gian dùng liều và theo dõi lượng thuốc còn lại cho",
    zh: "配置用药提醒、服药时间、剂量并跟踪剩余药量："
  },
  "Medication Name": {
    de: "Medikamentenname",
    el: "Όνομα φαρμάκου",
    es: "Nombre del medicamento",
    fr: "Nom du médicament",
    fr_ca: "Nom du médicament",
    ja: "お薬の名前",
    ko: "약 이름",
    ru: "Название лекарства",
    vi: "Tên thuốc",
    zh: "药品名称"
  },
  "How Many They Have (Total Quantity in Stock)": {
    de: "Vorhandene Menge (Gesamtbestand)",
    el: "Πόσα έχουν (Συνολική ποσότητα σε απόθεμα)",
    es: "Cantidad que tienen (Stock total)",
    fr: "Quantité en stock (Total disponible)",
    fr_ca: "Quantité en stock (Total disponible)",
    ja: "現在の手持ち数量（合計在庫量）",
    ko: "현재 보유 수량 (총 재고량)",
    ru: "Количество в наличии (Общий запас)",
    vi: "Số lượng hiện có (Tổng tồn kho)",
    zh: "现有库存总量"
  },
  "How Often Should They Take It (Frequency)": {
    de: "Wie oft einzunehmen (Häufigkeit)",
    el: "Πόσο συχνά πρέπει να το λαμβάνουν (Συχνότητα)",
    es: "Con qué frecuencia deben tomarlo (Frecuencia)",
    fr: "Fréquence des prises",
    fr_ca: "Fréquence des prises",
    ja: "服薬の頻度",
    ko: "복용 주기 (빈도)",
    ru: "Как часто принимать (Частота)",
    vi: "Tần suất uống",
    zh: "服药频次"
  },
  "Once a Day": {
    de: "Einmal täglich",
    el: "Μία φορά την ημέρα",
    es: "Una vez al día",
    fr: "Une fois par jour",
    fr_ca: "Une fois par jour",
    ja: "1日1回",
    ko: "하루 1회",
    ru: "Раз в день",
    vi: "Một lần mỗi ngày",
    zh: "每日一次"
  },
  "Twice a Day": {
    de: "Zweimal täglich",
    el: "Δύο φορές την ημέρα",
    es: "Dos veces al día",
    fr: "Deux fois par jour",
    fr_ca: "Deux fois par jour",
    ja: "1日2回",
    ko: "하루 2회",
    ru: "Дважды в день",
    vi: "Hai lần mỗi ngày",
    zh: "每日两次"
  },
  "3 Times a Day": {
    de: "Dreimal täglich",
    el: "3 φορές την ημέρα",
    es: "3 veces al día",
    fr: "3 fois par jour",
    fr_ca: "3 fois par jour",
    ja: "1日3回",
    ko: "하루 3회",
    ru: "3 раза в день",
    vi: "3 lần mỗi ngày",
    zh: "每日三次"
  },
  "As Needed (PRN)": {
    de: "Bei Bedarf (PRN)",
    el: "Όπως απαιτείται (PRN)",
    es: "Según sea necesario (PRN)",
    fr: "Au besoin (PRN)",
    fr_ca: "Au besoin (PRN)",
    ja: "必要時 (頓服)",
    ko: "필요 시 (PRN)",
    ru: "По необходимости (PRN)",
    vi: "Khi cần thiết (PRN)",
    zh: "按需服用（PRN）"
  },
  "Edit Medication Reminder": {
    de: "Medikamentenerinnerung bearbeiten",
    el: "Επεξεργασία υπενθύμισης φαρμάκου",
    es: "Editar recordatorio de medicación",
    fr: "Modifier le rappel de médicament",
    fr_ca: "Modifier le rappel de médicament",
    ja: "服薬リマインダーを編集",
    ko: "복약 알림 편집",
    ru: "Изменить напоминание о лекарстве",
    vi: "Chỉnh sửa nhắc nhở dùng thuốc",
    zh: "编辑用药提醒"
  },
  "Add New Medication Reminder": {
    de: "Neue Medikamentenerinnerung hinzufügen",
    el: "Προσθήκη νέας υπενθύμισης φαρμάκου",
    es: "Añadir nuevo recordatorio de medicación",
    fr: "Ajouter un nouveau rappel de médicament",
    fr_ca: "Ajouter un nouveau rappel de médicament",
    ja: "新しい服薬リマインダーを追加",
    ko: "새 복약 알림 추가",
    ru: "Добавить новое напоминание о лекарстве",
    vi: "Thêm lời nhắc dùng thuốc mới",
    zh: "添加新用药提醒"
  },
  "Update Medication": {
    de: "Medikament aktualisieren",
    el: "Ενημέρωση φαρμάκου",
    es: "Actualizar medicamento",
    fr: "Mettre à jour le médicament",
    fr_ca: "Mettre à jour le médicament",
    ja: "お薬を更新",
    ko: "약 정보 업데이트",
    ru: "Обновить лекарство",
    vi: "Cập nhật thuốc",
    zh: "更新用药信息"
  },
  "Save Medication": {
    de: "Medikament speichern",
    el: "Αποθήκευση φαρμάκου",
    es: "Guardar medicamento",
    fr: "Enregistrer le médicament",
    fr_ca: "Enregistrer le médicament",
    ja: "お薬を保存",
    ko: "약 저장",
    ru: "Сохранить лекарство",
    vi: "Lưu thuốc",
    zh: "保存用药设置"
  },
  "Configured Medications": {
    de: "Eingerichtete Medikamente",
    el: "Διαμορφωμένα φάρμακα",
    es: "Medicamentos configurados",
    fr: "Médicaments configurés",
    fr_ca: "Médicaments configurés",
    ja: "設定済みのお薬",
    ko: "설정된 약 목록",
    ru: "Настроенные лекарства",
    vi: "Thuốc đã thiết lập",
    zh: "已配置药品列表"
  },
  "Dose": {
    de: "Dosis",
    el: "Δόση",
    es: "Dosis",
    fr: "Dose",
    fr_ca: "Dose",
    ja: "用量",
    ko: "복용량",
    ru: "Доза",
    vi: "Liều lượng",
    zh: "单次剂量"
  },
  "Frequency": {
    de: "Häufigkeit",
    el: "Συχνότητα",
    es: "Frecuencia",
    fr: "Fréquence",
    fr_ca: "Fréquence",
    ja: "頻度",
    ko: "빈도",
    ru: "Частота",
    vi: "Tần suất",
    zh: "频次"
  },
  "remaining": {
    de: "verbleibend",
    el: "απομένουν",
    es: "restantes",
    fr: "restant",
    fr_ca: "restant",
    ja: "残り",
    ko: "남음",
    ru: "осталось",
    vi: "còn lại",
    zh: "剩余"
  },
  "Add supply to": {
    de: "Vorrat aufstocken für",
    el: "Προσθήκη αποθέματος σε",
    es: "Añadir suministro a",
    fr: "Ajouter du stock pour",
    fr_ca: "Ajouter du stock pour",
    ja: "在庫を追加：",
    ko: "재고 추가:",
    ru: "Пополнить запас для",
    vi: "Bổ sung nguồn cung cho",
    zh: "增加库存："
  },
  "Delete reminder for": {
    de: "Erinnerung löschen für",
    el: "Διαγραφή υπενθύμισης για",
    es: "Eliminar recordatorio de",
    fr: "Supprimer le rappel pour",
    fr_ca: "Supprimer le rappel pour",
    ja: "のリマインダーを削除：",
    ko: "알림 삭제:",
    ru: "Удалить напоминание для",
    vi: "Xóa lời nhắc cho",
    zh: "删除提醒："
  },
  "Live Emergency Alert from": {
    de: "Dringende Live-Warnung von",
    el: "Ζωντανή ειδοποίηση έκτακτης ανάγκης από",
    es: "Alerta de emergencia en vivo de",
    fr: "Alerte d'urgence en direct de",
    fr_ca: "Alerte d'urgence en direct de",
    ja: "からの緊急ライブ通知：",
    ko: "의 실시간 긴급 알림:",
    ru: "Срочное оповещение от",
    vi: "Cảnh báo khẩn cấp trực tiếp từ",
    zh: "实时紧急求助："
  },
  "Location:": {
    de: "Ort:",
    el: "Τοποθεσία:",
    es: "Ubicación:",
    fr: "Lieu :",
    fr_ca: "Lieu :",
    ja: "場所：",
    ko: "위치:",
    ru: "Местоположение:",
    vi: "Vị trí:",
    zh: "地点："
  },
  "school": {
    de: "Schule",
    el: "Σχολείο",
    es: "Colegio",
    fr: "école",
    fr_ca: "école",
    ja: "学校",
    ko: "학교",
    ru: "школа",
    vi: "trường học",
    zh: "学校"
  },
  "Child requested immediate support.": {
    de: "Kind hat sofortige Unterstützung angefordert.",
    el: "Το παιδί ζήτησε άμεση υποστήριξη.",
    es: "El niño solicitó asistencia inmediata.",
    fr: "L'enfant a demandé une assistance immédiate.",
    fr_ca: "L'enfant a demandé une assistance immédiate.",
    ja: "お子様が即時のサポートを求めています。",
    ko: "아이가 즉각적인 도움을 요청했습니다.",
    ru: "Ребенок запросил немедленную помощь.",
    vi: "Trẻ yêu cầu hỗ trợ ngay lập tức.",
    zh: "已发起即时支持协助请求。"
  },
  "Open Alerts Inbox": {
    de: "Warnungs-Postfach öffnen",
    el: "Άνοιγμα εισερχομένων ειδοποιήσεων",
    es: "Abrir bandeja de alertas",
    fr: "Ouvrir la boîte des alertes",
    fr_ca: "Ouvrir la boîte des alertes",
    ja: "アラート受信箱を開く",
    ko: "알림 수신함 열기",
    ru: "Открыть входящие оповещения",
    vi: "Mở hộp thư cảnh báo",
    zh: "打开预警收件箱"
  },

  // Alert quick replies
  "Take All Time You Need": {
    de: "Nimm dir alle Zeit",
    el: "Πάρε όλο τον χρόνο σου",
    es: "Tómate todo el tiempo",
    fr: "Prends tout ton temps",
    fr_ca: "Prends tout ton temps",
    ja: "ゆっくり休んでね",
    ko: "충분히 쉬어도 돼",
    ru: "Отдохни сколько нужно",
    vi: "Cứ bình tĩnh nghỉ ngơi",
    zh: "慢慢来，不着急"
  },
  "🧘 Take All Time You Need": {
    de: "🧘 Nimm dir alle Zeit",
    el: "🧘 Πάρε όλο τον χρόνο σου",
    es: "🧘 Tómate todo el tiempo",
    fr: "🧘 Prends tout ton temps",
    fr_ca: "🧘 Prends tout ton temps",
    ja: "🧘 ゆっくり休んでね",
    ko: "🧘 충분히 쉬어도 돼",
    ru: "🧘 Отдохни сколько нужно",
    vi: "🧘 Cứ bình tĩnh nghỉ ngơi",
    zh: "🧘 慢慢来，不着急"
  },
  "Great Choice to Rest": {
    de: "Gute Wahl, sich auszuruhen",
    el: "Σπουδαία επιλογή να ξεκουραστείς",
    es: "Buena elección para descansar",
    fr: "Très bon choix de te reposer",
    fr_ca: "Très bon choix de te reposer",
    ja: "休憩するのは良いことだよ",
    ko: "쉬기로 한 건 잘한 선택이야",
    ru: "Отличное решение отдохнуть",
    vi: "Lựa chọn tốt để nghỉ ngơi",
    zh: "休息是非常好的选择"
  },
  "👍 Great Choice to Rest": {
    de: "👍 Gute Wahl, sich auszuruhen",
    el: "👍 Σπουδαία επιλογή να ξεκουραστείς",
    es: "👍 Buena elección para descansar",
    fr: "👍 Très bon choix de te reposer",
    fr_ca: "👍 Très bon choix de te reposer",
    ja: "👍 休憩するのは良いことだよ",
    ko: "👍 쉬기로 한 건 잘한 선택이야",
    ru: "👍 Отличное решение отдохнуть",
    vi: "👍 Lựa chọn tốt để nghỉ ngơi",
    zh: "👍 休息是非常好的选择"
  },
  "I'm Here If Needed": {
    de: "Ich bin da, wenn du mich brauchst",
    el: "Είμαι εδώ αν με χρειαστείς",
    es: "Aquí estoy si me necesitas",
    fr: "Je suis là si besoin",
    fr_ca: "Je suis là si besoin",
    ja: "必要ならそばにいるよ",
    ko: "필요하면 언제든 여기 있어",
    ru: "Я рядом, если понадоблюсь",
    vi: "Mình ở đây nếu bạn cần",
    zh: "随时在身边陪你"
  },
  "❤️ I'm Here If Needed": {
    de: "❤️ Ich bin da, wenn du mich brauchst",
    el: "❤️ Είμαι εδώ αν με χρειαστείς",
    es: "❤️ Aquí estoy si me necesitas",
    fr: "❤️ Je suis là si besoin",
    fr_ca: "❤️ Je suis là si besoin",
    ja: "❤️ 必要ならそばにいるよ",
    ko: "❤️ 필요하면 언제든 여기 있어",
    ru: "❤️ Я рядом, если понадоблюсь",
    vi: "❤️ Mình ở đây nếu bạn cần",
    zh: "❤️ 随时在身边陪你"
  },

  // Badges
  "Alert": {
    de: "Warnung",
    el: "Ειδοποίηση",
    es: "Alerta",
    fr: "Alerte",
    fr_ca: "Alerte",
    ja: "アラート",
    ko: "알림",
    ru: "Оповещение",
    vi: "Cảnh báo",
    zh: "警报"
  },
  "Active": {
    de: "Aktiv",
    el: "Ενεργό",
    es: "Activo",
    fr: "Actif",
    fr_ca: "Actif",
    ja: "有効",
    ko: "활성",
    ru: "Активно",
    vi: "Hoạt động",
    zh: "活跃"
  },
  "Paired": {
    de: "Gekoppelt",
    el: "Συνδεδεμένο",
    es: "Emparejado",
    fr: "Jumelé",
    fr_ca: "Jumelé",
    ja: "ペアリング済み",
    ko: "연결됨",
    ru: "Сопряжено",
    vi: "Đã ghép nối",
    zh: "已配对"
  },
  "Pair": {
    de: "Koppeln",
    el: "Σύνδεση",
    es: "Emparejar",
    fr: "Jumeler",
    fr_ca: "Jumeler",
    ja: "ペアリング",
    ko: "연결하기",
    ru: "Сопряжение",
    vi: "Ghép nối",
    zh: "配对"
  },
  "Library": {
    de: "Bibliothek",
    el: "Βιβλιοθήκη",
    es: "Biblioteca",
    fr: "Bibliothèque",
    fr_ca: "Bibliothèque",
    ja: "ライブラリ",
    ko: "라이브러리",
    ru: "Библиотека",
    vi: "Thư viện",
    zh: "图库"
  },
  "Low Stock": {
    de: "Niedriger Bestand",
    el: "Χαμηλό απόθεμα",
    es: "Poco stock",
    fr: "Stock faible",
    fr_ca: "Stock faible",
    ja: "残量低下",
    ko: "재고 부족",
    ru: "Мало запасов",
    vi: "Sắp hết",
    zh: "库存偏低"
  },
  "Therapy": {
    de: "Therapie",
    el: "Θεραπεία",
    es: "Terapia",
    fr: "Thérapie",
    fr_ca: "Thérapie",
    ja: "セラピー",
    ko: "테라피",
    ru: "Терапия",
    vi: "Trị liệu",
    zh: "疗愈"
  },
  "Entries": {
    de: "Einträge",
    el: "Καταχωρίσεις",
    es: "Entradas",
    fr: "Entrées",
    fr_ca: "Entrées",
    ja: "件のエントリー",
    ko: "개 항목",
    ru: "записей",
    vi: "mục nhật ký",
    zh: "条日记"
  },
  "Day": {
    de: "Tag",
    el: "Ημέρα",
    es: "Día",
    fr: "Jour",
    fr_ca: "Jour",
    ja: "日目",
    ko: "일차",
    ru: "День",
    vi: "Ngày",
    zh: "第"
  },
  "Studio": {
    de: "Studio",
    el: "Στούντιο",
    es: "Estudio",
    fr: "Studio",
    fr_ca: "Studio",
    ja: "スタジオ",
    ko: "스튜디오",
    ru: "Студия",
    vi: "Studio",
    zh: "工坊"
  }
};

const supportedLocales = ['de', 'el', 'es', 'fr', 'fr_ca', 'ja', 'ko', 'ru', 'vi', 'zh'];

// 1. Update master-keys.json
let masterKeys = [];
try {
  masterKeys = JSON.parse(fs.readFileSync(masterKeysFile, 'utf8'));
} catch (e) {
  masterKeys = [];
}
const masterSet = new Set(masterKeys);
for (const key of Object.keys(newKeys)) {
  masterSet.add(key);
}
fs.writeFileSync(masterKeysFile, JSON.stringify(Array.from(masterSet), null, 2), 'utf8');
console.log(`Updated master-keys.json with ${Object.keys(newKeys).length} new keys.`);

// 2. Update each locale file
for (const locale of supportedLocales) {
  const filePath = path.join(localesDir, `${locale}.json`);
  let dict = {};
  try {
    dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    dict = {};
  }

  let count = 0;
  for (const [key, translations] of Object.entries(newKeys)) {
    if (translations[locale]) {
      dict[key] = translations[locale];
      count++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), 'utf8');
  console.log(`Updated ${locale}.json: added/updated ${count} translations.`);
}

console.log('All locales successfully updated!');

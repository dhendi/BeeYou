import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Volume2, 
  Home, 
  Camera, 
  Sparkles, 
  Layers, 
  Lock, 
  Mic, 
  Folder, 
  Smile, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { GridStage, DwellMode, STORAGE_KEYS } from '../../types/aac';
import { speakText, stopSpeaking, playChime } from '../../utils/audio';
import { autocorrectAacGrammar, adjustSentenceTokensOnTheSpot } from '../../utils/aacGrammar';
import { getMulberrySymbolUrl } from '../../services/symbolService';
import { useApp } from '../../context/AppContext';
import { LanguageDropdown } from '../LanguageDropdown';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStage?: GridStage;
}

// Multilingual Tile Dictionary for AAC Onboarding Tour
export const TOUR_TRANSLATIONS: Record<string, { label: Record<string, string>; speech: Record<string, string> }> = {
  want: {
    label: { en: 'WANT', es: 'QUIERO', fr: 'VEUX', de: 'WILL', zh: '想要', ja: 'ほしい', ko: '원해요', ru: 'ХОЧУ', vi: 'MUỐN', el: 'ΘΕΛΩ' },
    speech: { en: 'I want', es: 'Quiero', fr: 'Je veux', de: 'Ich will', zh: '我想要', ja: 'ほしい', ko: '원해요', ru: 'Я хочу', vi: 'Tôi muốn', el: 'Θέλω' }
  },
  more: {
    label: { en: 'MORE', es: 'MÁS', fr: 'PLUS', de: 'MEHR', zh: '更多', ja: 'もっと', ko: '더', ru: 'ЕЩЕ', vi: 'THÊM', el: 'ΠΕΡΙΣΣΟΤΕΡΟ' },
    speech: { en: 'More, please', es: 'Más, por favor', fr: "Plus, s'il vous plaît", de: 'Mehr, bitte', zh: '还要，请', ja: 'もっとください', ko: '더 주세요', ru: 'Еще, пожалуйста', vi: 'Thêm, làm ơn', el: 'Περισσότερο παρακαλώ' }
  },
  stop: {
    label: { en: 'STOP', es: 'PARAR', fr: 'ARRÊT', de: 'STOPP', zh: '停止', ja: 'とめて', ko: '멈춰', ru: 'СТОП', vi: 'DỪNG', el: 'ΣΤΟΠ' },
    speech: { en: 'Stop, all done', es: 'Parar, terminado', fr: 'Arrête, fini', de: 'Stopp, fertig', zh: '停止，做完了', ja: 'とめて、おしまい', ko: '멈춰, 다 끝났어', ru: 'Стоп, всё готово', vi: 'Dừng, xong rồi', el: 'Στοπ, τέλος' }
  },
  help: {
    label: { en: 'HELP', es: 'AYUDA', fr: 'AIDE', de: 'HILFE', zh: '帮助', ja: 'たすけて', ko: '도와줘', ru: 'ПОМОЩЬ', vi: 'GIÚP', el: 'ΒΟΗΘΕΙΑ' },
    speech: { en: 'I need help', es: 'Necesito ayuda', fr: "J'ai besoin d'aide", de: 'Ich brauche Hilfe', zh: '我需要帮助', ja: '手伝ってください', ko: '도움이 필요해요', ru: 'Мне нужна помощь', vi: 'Tôi cần giúp đỡ', el: 'Χρειάζομαι βοήθεια' }
  },
  go: {
    label: { en: 'GO', es: 'IR', fr: 'ALLER', de: 'GEHEN', zh: '去', ja: 'いく', ko: '가자', ru: 'ИДТИ', vi: 'ĐI', el: 'ΠΑΩ' },
    speech: { en: 'Go', es: 'Ir', fr: 'Aller', de: 'Gehen', zh: '去', ja: 'いく', ko: '가자', ru: 'Идти', vi: 'Đi', el: 'Πάω' }
  },
  like: {
    label: { en: 'LIKE', es: 'GUSTA', fr: 'AIMER', de: 'MAG', zh: '喜欢', ja: 'すき', ko: '좋아', ru: 'НРАВИТСЯ', vi: 'THÍCH', el: "Μ' ΑΡΕΣΕΙ" },
    speech: { en: 'I like this', es: 'Me gusta esto', fr: "J'aime ça", de: 'Das gefällt mir', zh: '我喜欢这个', ja: 'これがすき', ko: '이거 좋아', ru: 'Мне это нравится', vi: 'Tôi thích cái này', el: 'Μου αρέσει αυτό' }
  },
  yes: {
    label: { en: 'YES', es: 'SÍ', fr: 'OUI', de: 'JA', zh: '是', ja: 'はい', ko: '네', ru: 'ДА', vi: 'CÓ', el: 'ΝΑΙ' },
    speech: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', zh: '是的', ja: 'はい', ko: '네', ru: 'Да', vi: 'Vâng', el: 'Ναι' }
  },
  no: {
    label: { en: 'NO', es: 'NO', fr: 'NON', de: 'NEIN', zh: '不要', ja: 'いいえ', ko: '아니요', ru: 'НЕТ', vi: 'KHÔNG', el: 'ΟΧΙ' },
    speech: { en: 'No thank you', es: 'No, gracias', fr: 'Non merci', de: 'Nein danke', zh: '不用了，谢谢', ja: 'いいえ、けっこうです', ko: '괜찮아요', ru: 'Нет, спасибо', vi: 'Không, cảm ơn', el: 'Όχι ευχαριστώ' }
  },
  me: {
    label: { en: 'ME', es: 'YO', fr: 'MOI', de: 'ICH', zh: '我', ja: 'わたし', ko: '나', ru: 'Я', vi: 'TÔI', el: 'ΕΓΩ' },
    speech: { en: 'Me', es: 'Yo', fr: 'Moi', de: 'Ich', zh: '我', ja: 'わたし', ko: '나', ru: 'Я', vi: 'Tôi', el: 'Εγώ' }
  },
  you: {
    label: { en: 'YOU', es: 'TÚ', fr: 'TOI', de: 'DU', zh: '你', ja: 'あなた', ko: '너', ru: 'ТЫ', vi: 'BẠN', el: 'ΕΣΥ' },
    speech: { en: 'You', es: 'Tú', fr: 'Toi', de: 'Du', zh: '你', ja: 'あなた', ko: '너', ru: 'Ты', vi: 'Bạn', el: 'Εσύ' }
  },
  eat: {
    label: { en: 'EAT', es: 'COMER', fr: 'MANGER', de: 'ESSEN', zh: '吃', ja: 'たべる', ko: '먹기', ru: 'ЕСТЬ', vi: 'ĂN', el: 'ΤΡΩΩ' },
    speech: { en: 'I want to eat', es: 'Quiero comer', fr: 'Je veux manger', de: 'Ich möchte essen', zh: '我想吃', ja: 'たべたい', ko: '먹고 싶어요', ru: 'Я хочу есть', vi: 'Tôi muốn ăn', el: 'Θέλω να φάω' }
  },
  play: {
    label: { en: 'PLAY', es: 'JUGAR', fr: 'JOUER', de: 'SPIELEN', zh: '玩', ja: 'あそぶ', ko: '놀기', ru: 'ИГРАТЬ', vi: 'CHƠI', el: 'ΠΑΙΖΩ' },
    speech: { en: 'Let us play', es: 'Vamos a jugar', fr: 'Jouons', de: 'Lass uns spielen', zh: '我们玩吧', ja: 'あそぼう', ko: '놀자', ru: 'Давай поиграем', vi: 'Cùng chơi nào', el: 'Ας παίξουμε' }
  },
  look: {
    label: { en: 'LOOK', es: 'MIRAR', fr: 'REGARDER', de: 'SCHAUEN', zh: '看', ja: 'みる', ko: '보기', ru: 'СМОТРЕТЬ', vi: 'NHÌN', el: 'ΚΟΙΤΑ' },
    speech: { en: 'Look', es: 'Mira', fr: 'Regarde', de: 'Schau', zh: '看', ja: 'みて', ko: '봐', ru: 'Посмотри', vi: 'Nhìn kìa', el: 'Κοίτα' }
  },
  drink: {
    label: { en: 'DRINK', es: 'BEBER', fr: 'BOIRE', de: 'TRINKEN', zh: '喝', ja: 'のむ', ko: '마시기', ru: 'ПИТЬ', vi: 'UỐNG', el: 'ΠΙΝΩ' },
    speech: { en: 'Drink', es: 'Beber', fr: 'Boire', de: 'Trinken', zh: '喝', ja: 'のみたい', ko: '마시고 싶어', ru: 'Пить', vi: 'Uống', el: 'Πίνω' }
  },
  happy: {
    label: { en: 'HAPPY', es: 'FELIZ', fr: 'CONTENT', de: 'GLÜCKLICH', zh: '高兴', ja: 'うれしい', ko: '행복해', ru: 'СЧАСТЛИВЫЙ', vi: 'VUI VẺ', el: 'ΧΑΡΟΥΜΕΝΟΣ' },
    speech: { en: 'I feel happy', es: 'Me siento feliz', fr: 'Je suis content', de: 'Ich bin glücklich', zh: '我很高兴', ja: 'うれしいです', ko: '기분이 좋아요', ru: 'Я счастлив', vi: 'Tôi vui vẻ', el: 'Είμαι χαρούμενος' }
  },
  tired: {
    label: { en: 'TIRED', es: 'CANSADO', fr: 'FATIGUÉ', de: 'MÜDE', zh: '累了', ja: 'つかれた', ko: '피곤해', ru: 'УСТАЛ', vi: 'MỆT', el: 'ΚΟΥΡΑΣΜΕΝΟΣ' },
    speech: { en: 'I am tired', es: 'Estoy cansado', fr: 'Je suis fatigué', de: 'Ich bin müde', zh: '我累了', ja: 'つかれました', ko: '피곤해요', ru: 'Я устал', vi: 'Tôi mệt', el: 'Είμαι κουρασμένος' }
  },
  good: {
    label: { en: 'GOOD', es: 'BIEN', fr: 'BIEN', de: 'GUT', zh: '好', ja: 'いい', ko: '좋아', ru: 'ХОРОШО', vi: 'TỐT', el: 'ΚΑΛΟ' },
    speech: { en: 'Good', es: 'Bien', fr: 'Bien', de: 'Gut', zh: '很好', ja: 'いいですね', ko: '좋아요', ru: 'Хорошо', vi: 'Tốt', el: 'Καλό' }
  },
  big: {
    label: { en: 'BIG', es: 'GRANDE', fr: 'GRAND', de: 'GROSS', zh: '大', ja: 'おおきい', ko: '커', ru: 'БОЛЬШОЙ', vi: 'LỚN', el: 'ΜΕΓΑΛΟ' },
    speech: { en: 'Big', es: 'Grande', fr: 'Grand', de: 'Groß', zh: '很大', ja: 'おおきい', ko: '커요', ru: 'Большой', vi: 'Lớn', el: 'Μεγάλο' }
  },
  apple: {
    label: { en: 'Apple', es: 'Manzana', fr: 'Pomme', de: 'Apfel', zh: '苹果', ja: 'りんご', ko: '사과', ru: 'Яблоко', vi: 'Táo', el: 'Μήλο' },
    speech: { en: 'I want an apple', es: 'Quiero una manzana', fr: 'Je veux une pomme', de: 'Ich möchte einen Apfel', zh: '我想吃苹果', ja: 'りんごがほしい', ko: '사과 주세요', ru: 'Я хочу яблоко', vi: 'Tôi muốn một quả táo', el: 'Θέλω ένα μήλο' }
  },
  cookie: {
    label: { en: 'Cookie', es: 'Galleta', fr: 'Biscuit', de: 'Keks', zh: '饼干', ja: 'クッキー', ko: '쿠키', ru: 'Печенье', vi: 'Bánh quy', el: 'Μπισκότο' },
    speech: { en: 'I want a cookie', es: 'Quiero una galleta', fr: 'Je veux un biscuit', de: 'Ich möchte einen Keks', zh: '我想吃饼干', ja: 'クッキーがほしい', ko: '쿠키 주세요', ru: 'Я хочу печенье', vi: 'Tôi muốn bánh quy', el: 'Θέλω ένα μπισκότο' }
  },
  crackers: {
    label: { en: 'Crackers', es: 'Galletitas', fr: 'Craquelins', de: 'Cracker', zh: '苏打饼干', ja: 'クラッカー', ko: '크래커', ru: 'Крекеры', vi: 'Bánh giòn', el: 'Κράκερ' },
    speech: { en: 'Crackers please', es: 'Galletitas, por favor', fr: "Des craquelins s'il vous plaît", de: 'Cracker bitte', zh: '请给我饼干', ja: 'クラッカーください', ko: '크래커 주세요', ru: 'Крекеры, пожалуйста', vi: 'Bánh giòn làm ơn', el: 'Κράκερ παρακαλώ' }
  },
  water: {
    label: { en: 'Water', es: 'Agua', fr: 'Eau', de: 'Wasser', zh: '水', ja: 'みず', ko: '물', ru: 'Вода', vi: 'Nước', el: 'Νερό' },
    speech: { en: 'Water please', es: 'Agua, por favor', fr: "De l'eau s'il vous plaît", de: 'Wasser bitte', zh: '请给我水', ja: 'おみずください', ko: '물 주세요', ru: 'Воду, пожалуйста', vi: 'Nước làm ơn', el: 'Νερό παρακαλώ' }
  },
};

// Multilingual UI Strings for Onboarding Tour
export const TOUR_STRINGS: Record<string, Record<string, string>> = {
  s1_badge: { en: 'Stage 1: Cause & Effect', es: 'Etapa 1: Causa y Efecto', fr: 'Étape 1 : Cause et effet', de: 'Stufe 1: Ursache & Wirkung', zh: '阶段 1：因果关系' },
  s1_title: { en: 'Tap any button to hear the voice!', es: '¡Toca cualquier botón para escuchar la voz!', fr: 'Appuyez sur un bouton pour entendre la voix !', de: 'Tippe auf eine Taste, um die Stimme zu hören!', zh: '点击任意按钮收听语音！' },
  s1_subtitle: { en: 'Start simple. Giant tactile clay buttons make communication easy with zero clutter.', es: 'Empieza simple. Los botones gigantes facilitan la comunicación sin distracciones.', fr: 'Commencez simplement. Des boutons géants facilitent la communication sans encombrement.', de: 'Einfach anfangen. Große Tasten machen Kommunikation leicht.', zh: '从简单开始。大号触觉按钮让交流更轻松，毫无杂乱。' },
  s1_lock: { en: '✓ Perfect for Now! (Start with 4 Tiles)', es: '✓ ¡Perfecto por ahora! (Empezar con 4 casillas)', fr: "✓ Parfait pour l'instant ! (Commencer avec 4 cases)", de: '✓ Perfekt für jetzt! (Mit 4 Tasten starten)', zh: '✓ 现在这样就很合适！（以 4 个按钮开始）' },
  s1_next: { en: 'Next: See 12 Tiles', es: 'Siguiente: Ver 12 casillas', fr: 'Suivant : Voir 12 cases', de: 'Weiter: 12 Tasten ansehen', zh: '下一步：查看 12 个按钮' },

  s2_badge: { en: 'Stage 2: Motor Continuity', es: 'Etapa 2: Continuidad Motora', fr: 'Étape 2 : Continuité motrice', de: 'Stufe 2: Motorkontinuität', zh: '阶段 2：肌肉记忆延续' },
  s2_title: { en: 'Growing to 12 Words', es: 'Creciendo a 12 palabras', fr: 'Passer à 12 mots', de: 'Erweiterung auf 12 Wörter', zh: '扩展到 12 个词语' },
  s2_subtitle: { en: "Notice how the first 4 words didn't move? That's muscle memory!", es: '¿Notas cómo las 4 primeras palabras no se movieron? ¡Eso es memoria muscular!', fr: "Remarquez comment les 4 premiers mots n'ont pas bougé ? C'est la mémoire musculaire !", de: 'Fällt dir auf, dass die ersten 4 Wörter am selben Platz blieben? Das ist Muskelgedächtnis!', zh: '注意前 4 个词的位置没有改变吗？这就是肌肉记忆！' },
  s2_lock: { en: '✓ Lock at 12 Tiles', es: '✓ Bloquear en 12 casillas', fr: '✓ Verrouiller à 12 cases', de: '✓ Bei 12 Tasten festlegen', zh: '✓ 锁定为 12 个按钮' },
  s2_next: { en: 'Next: See Full Board', es: 'Siguiente: Ver tablero completo', fr: 'Suivant : Voir tout le tableau', de: 'Weiter: Vollständiges Raster', zh: '下一步：查看完整面板' },
  s2_note: { en: 'Permanent Spatial Coordinates: In BeeYou, high-frequency core words never shift positions as vocabulary expands, preventing motor frustration.', es: 'Coordenadas espaciales permanentes: En BeeYou, las palabras esenciales nunca cambian de posición a medida que el vocabulario crece, evitando la frustración motora.', fr: "Coordonnées spatiales permanentes : Dans BeeYou, les mots clés ne changent jamais de place lorsque le vocabulaire s'enrichit.", de: 'Feste Koordinaten: In BeeYou bleiben Kernwörter immer am selben Platz, um Frustration zu vermeiden.', zh: '固定空间坐标：在 BeeYou 中，核心高频词汇位置永不移动，避免动作规划挫折。' },

  s3_badge: { en: 'Stage 3: Full Vocabulary Matrix', es: 'Etapa 3: Matriz de Vocabulario Completa', fr: 'Étape 3 : Matrice complète', de: 'Stufe 3: Vollständige Matrix', zh: '阶段 3：完整词汇矩阵' },
  s3_title: { en: 'Full Vocabulary Matrix', es: 'Matriz de vocabulario completa', fr: 'Matrice de vocabulaire complète', de: 'Vollständige Wortmatrix', zh: '完整词汇矩阵' },
  s3_subtitle: { en: 'For communicators ready to build complete multi-word sentences.', es: 'Para comunicadores listos para construir oraciones completas.', fr: 'Pour les communicateurs prêts à construire des phrases complètes.', de: 'Für Sprecher, die vollständige Sätze bilden möchten.', zh: '适合准备构建完整句子的沟通者。' },
  s3_lock: { en: '✓ Use Full Board', es: '✓ Usar tablero completo', fr: '✓ Utiliser tout le tableau', de: '✓ Vollständiges Board verwenden', zh: '✓ 使用完整面板' },
  s3_next: { en: 'Next: How Folders Work', es: 'Siguiente: Cómo funcionan las carpetas', fr: 'Suivant : Comment fonctionnent les dossiers', de: 'Weiter: So funktionieren Ordner', zh: '下一步：文件夹如何工作' },
  s3_prompt: { en: 'Tap tiles below to build a sentence...', es: 'Toca las casillas abajo para formar una oración...', fr: 'Touchez les tuiles ci-dessous pour créer une phrase...', de: 'Tippe auf Tasten unten, um einen Satz zu bauen...', zh: '点击下方按钮构建句子...' },
  s3_speak: { en: 'SPEAK', es: 'HABLAR', fr: 'PARLER', de: 'SPRECHEN', zh: '朗读' },

  s4_badge: { en: 'Step 4: Smart Navigation', es: 'Paso 4: Navegación Inteligente', fr: 'Étape 4 : Navigation intelligente', de: 'Schritt 4: Intelligente Navigation', zh: '步骤 4：智能导航' },
  s4_title: { en: 'Organized in Folders', es: 'Organizado en carpetas', fr: 'Organisé en dossiers', de: 'In Ordnern organisiert', zh: '按文件夹分类' },
  s4_subtitle: { en: 'Group specific snacks, toys, and activities without ever getting lost.', es: 'Agrupa meriendas, juguetes y actividades sin perderte nunca.', fr: 'Regroupez collations, jouets et activités sans jamais vous perdre.', de: 'Gruppiere Snacks, Spielzeug und Aktivitäten ohne dich zu verirren.', zh: '分类存放零食、玩具与活动，永远不会迷路。' },
  s4_tip: { en: "Tap 'Home' anytime to snap straight back.", es: "Toca 'Inicio' en cualquier momento para regresar directamente.", fr: "Touchez 'Accueil' à tout moment pour revenir directement.", de: "Tippe jederzeit auf 'Home', um sofort zurückzukehren.", zh: "随时轻点“主页”即可瞬间返回。" },
  s4_folder: { en: 'Snacks Folder', es: 'Carpeta Meriendas', fr: 'Dossier Collations', de: 'Snacks-Ordner', zh: '零食文件夹' },
  s4_folder_desc: { en: 'Tap to open ➜', es: 'Toca para abrir ➜', fr: 'Ouvrir ➜', de: 'Öffnen ➜', zh: '轻点打开 ➜' },
  s4_next: { en: 'Next: Adding Photo Tiles', es: 'Siguiente: Añadir casillas con foto', fr: 'Suivant : Ajouter des tuiles photo', de: 'Weiter: Fototasten hinzufügen', zh: '下一步：添加照片按钮' },

  s5_badge: { en: 'Step 5: Personalized Tiles', es: 'Paso 5: Casillas Personalizadas', fr: 'Étape 5 : Tuiles personnalisées', de: 'Schritt 5: Eigene Tasten', zh: '步骤 5：个性化定制' },
  s5_title: { en: 'Make It Personal', es: 'Hazlo personal', fr: 'Personnalisez-le', de: 'Persönlich gestalten', zh: '个性化定制' },
  s5_subtitle: { en: 'Snap real photos of their actual shoes, favorite blanket, or pet. Our AI cuts out the background into a clean clay tile.', es: 'Toma fotos reales de sus zapatos, manta favorita o mascota. Nuestra IA elimina el fondo creando una casilla limpia.', fr: "Prenez en photo leurs vraies chaussures, leur couverture ou leur animal. Notre IA détourne l'arrière-plan en une tuile nette.", de: 'Fotografiere ihre echten Schuhe, Lieblingsdecke oder Haustier. Unsere KI schneidet den Hintergrund sauber aus.', zh: '拍摄真实照片（他们的鞋子、喜爱的毯子或宠物）。AI 自动抠图，转化为清晰的触觉按钮。' },
  s5_next: { en: 'Next: Custom Voices & Grammar', es: 'Siguiente: Voces personalizadas y gramática', fr: 'Suivant : Voix personnalisées et grammaire', de: 'Weiter: Stimmen & Grammatik', zh: '下一步：自定义声音与语法' },

  s6_badge: { en: 'Step 6: Voice & Grammar', es: 'Paso 6: Voz y Gramática', fr: 'Étape 6 : Voix et grammaire', de: 'Schritt 6: Stimme & Grammatik', zh: '步骤 6：声音与语法' },
  s6_title: { en: 'Their Voice, Their Way', es: 'Su voz, a su manera', fr: 'Leur voix, à leur façon', de: 'Ihre Stimme, ihr Weg', zh: '专属声音，表达自我' },
  s6_subtitle: { en: 'Type phonetic pronunciations, record family voices, or hold any action word to reveal grammar tenses!', es: '¡Escribe pronunciaciones fonéticas, graba voces familiares o mantén presionado cualquier verbo para ver sus formas gramaticales!', fr: 'Tapez des prononciations phonétiques, enregistrez des voix de la famille ou maintenez un verbe pour voir sa conjugaison !', de: 'Tippe Lautschriften ein, nimm Stimmen der Familie auf oder halte ein Verb gedrückt, um Grammatikformen anzuzeigen!', zh: '输入发音注音、录制家人的声音，或长按任意动词展开语法时态！' },
  s6_finish: { en: '🚀 All Set! Enter BeeYou', es: '🚀 ¡Todo listo! Entrar a BeeYou', fr: "🚀 C'est prêt ! Entrer dans BeeYou", de: '🚀 Alles bereit! BeeYou starten', zh: '🚀 全部就绪！进入 BeeYou' },

  universal_skip: { en: 'Skip & Jump to App', es: 'Saltar y entrar a la app', fr: "Passer et ouvrir l'app", de: 'Überspringen & zur App', zh: '跳过并进入应用' },
  universal_spoke: { en: 'Spoke:', es: 'Dijo:', fr: 'A dit :', de: 'Gesprochen:', zh: '已朗读：' },
  universal_touch: { en: 'Touch any card above to test voice output!', es: '¡Toca cualquier casilla arriba para probar la voz!', fr: 'Touchez une case ci-dessus pour tester la voix !', de: 'Tippe auf eine Karte oben, um die Stimme zu testen!', zh: '轻触上方任意卡片测试语音朗读！' },
  universal_step: { en: 'BeeYou Interactive Tour • Step', es: 'Recorrido Interactivo BeeYou • Paso', fr: 'Visite interactive BeeYou • Étape', de: 'Interaktive BeeYou Tour • Schritt', zh: 'BeeYou 互动教程 • 步骤' },
  universal_home: { en: 'Home', es: 'Inicio', fr: 'Accueil', de: 'Home', zh: '主页' },
};

// 4-Tile Starter Core Words (Cause & Effect) with Official Mulberry AAC Symbols
const STAGE_1_TILES = [
  { id: 'want', label: 'WANT', speech: 'I want', symbolUrl: getMulberrySymbolUrl('want_,_to'), emoji: '🤲', color: 'verb', row: 0, col: 0 },
  { id: 'more', label: 'MORE', speech: 'More, please', symbolUrl: getMulberrySymbolUrl('more'), emoji: '➕', color: 'descriptor', row: 0, col: 1 },
  { id: 'stop', label: 'STOP', speech: 'Stop, all done', symbolUrl: getMulberrySymbolUrl('backstop'), emoji: '🛑', color: 'alert', row: 1, col: 0 },
  { id: 'help', label: 'HELP', speech: 'I need help', symbolUrl: getMulberrySymbolUrl('help_,_to'), emoji: '🆘', color: 'social', row: 1, col: 1 },
];

// 12-Tile Motor Expansion with Official Mulberry AAC Symbols
const STAGE_2_TILES = [
  // Row 0
  { id: 'want', label: 'WANT', speech: 'I want', symbolUrl: getMulberrySymbolUrl('want_,_to'), emoji: '🤲', color: 'verb', row: 0, col: 0, isOriginal: true },
  { id: 'more', label: 'MORE', speech: 'More, please', symbolUrl: getMulberrySymbolUrl('more'), emoji: '➕', color: 'descriptor', row: 0, col: 1, isOriginal: true },
  { id: 'go', label: 'GO', speech: 'Go', symbolUrl: getMulberrySymbolUrl('go_,_to'), emoji: '🟢', color: 'verb', row: 0, col: 2, isNew: true },
  { id: 'like', label: 'LIKE', speech: 'I like this', symbolUrl: getMulberrySymbolUrl('good'), emoji: '👍', color: 'verb', row: 0, col: 3, isNew: true },
  
  // Row 1
  { id: 'stop', label: 'STOP', speech: 'Stop, all done', symbolUrl: getMulberrySymbolUrl('backstop'), emoji: '🛑', color: 'alert', row: 1, col: 0, isOriginal: true },
  { id: 'help', label: 'HELP', speech: 'I need help', symbolUrl: getMulberrySymbolUrl('help_,_to'), emoji: '🆘', color: 'social', row: 1, col: 1, isOriginal: true },
  { id: 'yes', label: 'YES', speech: 'Yes', symbolUrl: getMulberrySymbolUrl('good'), emoji: '✅', color: 'social', row: 1, col: 2, isNew: true },
  { id: 'no', label: 'NO', speech: 'No thank you', symbolUrl: getMulberrySymbolUrl('mistake_no_wrong'), emoji: '❌', color: 'social', row: 1, col: 3, isNew: true },
  
  // Row 2
  { id: 'me', label: 'ME', speech: 'Me', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👤', color: 'person', row: 2, col: 0, isNew: true },
  { id: 'you', label: 'YOU', speech: 'You', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👥', color: 'person', row: 2, col: 1, isNew: true },
  { id: 'eat', label: 'EAT', speech: 'I want to eat', symbolUrl: getMulberrySymbolUrl('eat_,_to'), emoji: '🥪', color: 'action', row: 2, col: 2, isNew: true },
  { id: 'play', label: 'PLAY', speech: 'Let us play', symbolUrl: getMulberrySymbolUrl('play_,_to'), emoji: '⚽', color: 'action', row: 2, col: 3, isNew: true },
];

// Full Matrix Core Preview with Official Mulberry AAC Symbols
const STAGE_3_TILES = [
  { id: 'me', label: 'ME', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👤', color: 'person' },
  { id: 'you', label: 'YOU', symbolUrl: getMulberrySymbolUrl('good_person'), emoji: '👥', color: 'person' },
  { id: 'want', label: 'WANT', symbolUrl: getMulberrySymbolUrl('want_,_to'), emoji: '🤲', color: 'verb', isOriginal: true },
  { id: 'like', label: 'LIKE', symbolUrl: getMulberrySymbolUrl('good'), emoji: '❤️', color: 'verb' },
  { id: 'go', label: 'GO', symbolUrl: getMulberrySymbolUrl('go_,_to'), emoji: '🟢', color: 'verb' },
  { id: 'look', label: 'LOOK', symbolUrl: getMulberrySymbolUrl('look_,_to'), emoji: '👀', color: 'verb' },
  { id: 'more', label: 'MORE', symbolUrl: getMulberrySymbolUrl('more'), emoji: '➕', color: 'descriptor', isOriginal: true },
  { id: 'good', label: 'GOOD', symbolUrl: getMulberrySymbolUrl('good'), emoji: '🌟', color: 'descriptor' },
  { id: 'big', label: 'BIG', symbolUrl: getMulberrySymbolUrl('big'), emoji: '🐘', color: 'descriptor' },
  { id: 'stop', label: 'STOP', symbolUrl: getMulberrySymbolUrl('backstop'), emoji: '🛑', color: 'alert', isOriginal: true },
  { id: 'help', label: 'HELP', symbolUrl: getMulberrySymbolUrl('help_,_to'), emoji: '🆘', color: 'social', isOriginal: true },
  { id: 'yes', label: 'YES', symbolUrl: getMulberrySymbolUrl('good'), emoji: '✅', color: 'social' },
  { id: 'no', label: 'NO', symbolUrl: getMulberrySymbolUrl('mistake_no_wrong'), emoji: '❌', color: 'social' },
  { id: 'eat', label: 'EAT', symbolUrl: getMulberrySymbolUrl('eat_,_to'), emoji: '🥪', color: 'action' },
  { id: 'drink', label: 'DRINK', symbolUrl: getMulberrySymbolUrl('drink'), emoji: '🧃', color: 'action' },
  { id: 'play', label: 'PLAY', symbolUrl: getMulberrySymbolUrl('play_,_to'), emoji: '🎮', color: 'action' },
  { id: 'happy', label: 'HAPPY', symbolUrl: getMulberrySymbolUrl('happy_man'), emoji: '😊', color: 'feeling' },
  { id: 'tired', label: 'TIRED', symbolUrl: getMulberrySymbolUrl('sleep_male_,_to'), emoji: '😴', color: 'feeling' },
];

// Fitzgerald Key Theme Helper
const getColorClasses = (type: string) => {
  switch (type) {
    case 'verb':
    case 'action':
      return 'border-[#22C55E] bg-[#F0FDF4] text-[#14532D] shadow-[0_6px_0_0_#16A34A,0_10px_20px_rgba(22,163,74,0.15)] active:shadow-[0_2px_0_0_#16A34A]';
    case 'descriptor':
      return 'border-[#0284C7] bg-[#F0F9FF] text-[#0C4A6E] shadow-[0_6px_0_0_#0284C7,0_10px_20px_rgba(2,132,199,0.15)] active:shadow-[0_2px_0_0_#0284C7]';
    case 'alert':
      return 'border-[#F43F5E] bg-[#FFF1F2] text-[#881337] shadow-[0_6px_0_0_#E11D48,0_10px_20px_rgba(225,29,72,0.15)] active:shadow-[0_2px_0_0_#E11D48]';
    case 'social':
      return 'border-[#EAB308] bg-[#FEFCE8] text-[#713F12] shadow-[0_6px_0_0_#CA8A04,0_10px_20px_rgba(202,138,4,0.15)] active:shadow-[0_2px_0_0_#CA8A04]';
    case 'person':
      return 'border-[#F59E0B] bg-[#FFFBEB] text-[#78350F] shadow-[0_6px_0_0_#D97706,0_10px_20px_rgba(217,119,6,0.15)] active:shadow-[0_2px_0_0_#D97706]';
    case 'noun':
      return 'border-[#F97316] bg-[#FFF7ED] text-[#7C2D12] shadow-[0_6px_0_0_#EA580C,0_10px_20px_rgba(234,88,12,0.15)] active:shadow-[0_2px_0_0_#EA580C]';
    case 'feeling':
      return 'border-[#A855F7] bg-[#FAF5FF] text-[#581C87] shadow-[0_6px_0_0_#9333EA,0_10px_20px_rgba(147,51,234,0.15)] active:shadow-[0_2px_0_0_#9333EA]';
    default:
      return 'border-amber-400 bg-white text-stone-900 shadow-[0_6px_0_0_#D97706,0_10px_20px_rgba(217,119,6,0.12)] active:shadow-[0_2px_0_0_#D97706]';
  }
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialStage = 1,
}) => {
  const { settings } = useApp();
  const activeLang = (settings?.language || 'en').toLowerCase().split('-')[0];

  const tTour = (key: string, fallback: string): string => {
    return TOUR_STRINGS[key]?.[activeLang] || TOUR_STRINGS[key]?.['en'] || fallback;
  };

  const getTileL = (id: string, defaultLabel: string): string => {
    return TOUR_TRANSLATIONS[id]?.label[activeLang] || TOUR_TRANSLATIONS[id]?.label['en'] || defaultLabel;
  };

  const getTileS = (id: string, defaultSpeech: string): string => {
    return TOUR_TRANSLATIONS[id]?.speech[activeLang] || TOUR_TRANSLATIONS[id]?.speech['en'] || defaultSpeech;
  };

  const [step, setStep] = useState<number>(1);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [lastTappedId, setLastTappedId] = useState<string | null>(null);

  // Step 3 Sentence Builder Strip State
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);

  // Step 4 Folder State
  const [currentFolder, setCurrentFolder] = useState<'root' | 'snacks'>('root');

  // Step 5 Photo Tile State
  const [photoCutoutActive, setPhotoCutoutActive] = useState<boolean>(true);

  // Step 6 Grammar Conjugation State
  const [grammarTense, setGrammarTense] = useState<'Wait' | 'Waited' | 'Waiting' | 'Waits'>('Wait');
  const [phoneticTestWord, setPhoneticTestWord] = useState<string>('Quinoa');
  const [phoneticSpelling, setPhoneticSpelling] = useState<string>('KEEN-wah');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBuiltSentence([]);
      setCurrentFolder('root');
      setPhotoCutoutActive(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Speak and trigger tactile feedback in user's active language
  const handleTileTap = (id: string, speech: string) => {
    setLastTappedId(id);
    setActiveSpeechText(speech);
    playChime('tap');
    stopSpeaking();
    speakText(speech, { force: true, lang: activeLang });
    setTimeout(() => setLastTappedId(null), 300);
  };

  // Complete and lock stage
  const handleSaveAndLockStage = (stage: GridStage) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      localStorage.setItem(STORAGE_KEYS.GRID_STAGE, stage.toString());
      window.dispatchEvent(new CustomEvent('beeyou_grid_stage_change', { detail: { stage } }));
    } catch {}
    playChime('complete');
    onClose();
  };

  // Escape hatch: Skip & Jump to App
  const handleSkipToApp = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      if (!localStorage.getItem(STORAGE_KEYS.GRID_STAGE)) {
        localStorage.setItem(STORAGE_KEYS.GRID_STAGE, '1');
      }
    } catch {}
    playChime('tap');
    onClose();
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-amber-50/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 select-none text-slate-800"
    >
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-[#FAF8F5] border-3 border-amber-300 rounded-3xl shadow-[0_20px_60px_rgba(217,119,6,0.18)] overflow-hidden">
        
        {/* TOP BAR / PERSISTENT ESCAPE HATCH */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-100/90 to-amber-50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-base shadow-xs">
              🐝
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                {tTour('universal_step', 'BeeYou Interactive Tour • Step')} {step} / 6
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      playChime('tap');
                      setStep(i);
                    }}
                    aria-label={`Go to step ${i}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      step === i 
                        ? 'w-6 bg-amber-500 shadow-xs' 
                        : i < step 
                        ? 'w-2.5 bg-amber-300' 
                        : 'w-2 bg-stone-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Language Switcher & Escape Hatch Button */}
          <div className="flex items-center gap-2">
            <LanguageDropdown />

            <button
              type="button"
              onClick={handleSkipToApp}
              className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 text-stone-600 hover:text-rose-600 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Skip onboarding and open app"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{tTour('universal_skip', 'Skip & Jump to App')}</span>
              <span className="sm:hidden">Skip</span>
            </button>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">

          {/* STEP 1: 4-TILE STARTER (CAUSE & EFFECT) */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wide border border-emerald-300">
                  {tTour('s1_badge', 'Stage 1: Cause & Effect')}
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {tTour('s1_title', 'Tap any button to hear the voice!')}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {tTour('s1_subtitle', 'Start simple. Giant tactile clay buttons make communication easy with zero clutter.')}
                </p>
              </div>

              {/* 2x2 Oversized Clay Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto p-3 bg-amber-100/50 rounded-3xl border-2 border-amber-200/80">
                {STAGE_1_TILES.map((tile) => {
                  const label = getTileL(tile.id, tile.label);
                  const speech = getTileS(tile.id, tile.speech);
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleTileTap(tile.id, speech)}
                      className={`h-32 sm:h-36 rounded-3xl border-3 flex flex-col items-center justify-center gap-1.5 p-3 transition-all duration-150 cursor-pointer select-none ${getColorClasses(tile.color)} ${
                        lastTappedId === tile.id ? 'translate-y-1 scale-95' : 'hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center pointer-events-none">
                        <img
                          src={tile.symbolUrl}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'block';
                            }
                          }}
                        />
                        <span aria-hidden="true" className="hidden text-4xl sm:text-5xl drop-shadow-xs">
                          {tile.emoji}
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-black tracking-wider uppercase">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Spoken Output Banner */}
              <div className="max-w-md mx-auto p-3 rounded-2xl bg-white border-2 border-amber-200 flex items-center justify-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm shadow-xs">
                <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {activeSpeechText 
                    ? `${tTour('universal_spoke', 'Spoke:')} "${activeSpeechText}"` 
                    : tTour('universal_touch', 'Touch any card above to test voice output!')}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: 12-TILE EXPANSION (MOTOR PLANNING CONTINUITY) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-black uppercase tracking-wide border border-sky-300">
                  {tTour('s2_badge', 'Stage 2: Motor Continuity')}
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {tTour('s2_title', 'Growing to 12 Words')}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {tTour('s2_subtitle', "Notice how the first 4 words didn't move? That's muscle memory!")}
                </p>
              </div>

              {/* 3x4 Grid with original 4 locked in place */}
              <div className="max-w-xl mx-auto p-3 sm:p-4 bg-amber-100/50 rounded-3xl border-2 border-amber-200/80">
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {STAGE_2_TILES.map((tile) => {
                    const label = getTileL(tile.id, tile.label);
                    const speech = getTileS(tile.id, tile.speech);
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => handleTileTap(tile.id, speech)}
                        className={`relative h-20 sm:h-24 rounded-2xl sm:rounded-3xl border-2 sm:border-3 flex flex-col items-center justify-center gap-1 p-1.5 transition-all duration-150 cursor-pointer select-none ${getColorClasses(tile.color)} ${
                          lastTappedId === tile.id ? 'translate-y-1 scale-95' : 'hover:-translate-y-0.5'
                        }`}
                      >
                        {tile.isOriginal && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 border border-white text-white flex items-center justify-center text-[10px] shadow-xs" title="Position locked for muscle memory">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center pointer-events-none">
                          <img
                            src={tile.symbolUrl}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'block';
                              }
                            }}
                          />
                          <span aria-hidden="true" className="hidden text-2xl sm:text-3xl">
                            {tile.emoji}
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase leading-none">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motor Continuity Explainer Callout */}
              <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950 font-bold">
                <div className="w-6 h-6 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs">
                  🔒
                </div>
                <div>
                  {tTour('s2_note', 'Permanent Spatial Coordinates: In BeeYou, high-frequency core words never shift positions as vocabulary expands, preventing motor frustration.')}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FULL GRID (STAGE 3) */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wide border border-purple-300">
                  {tTour('s3_badge', 'Stage 3: Full Vocabulary Matrix')}
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {tTour('s3_title', 'Full Vocabulary Matrix')}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {tTour('s3_subtitle', 'For communicators ready to build complete multi-word sentences.')}
                </p>
              </div>

              {/* Live Interactive Sentence Strip Preview */}
              <div className="max-w-2xl mx-auto p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-sm flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2 overflow-x-auto min-h-[38px] p-1">
                  {builtSentence.length === 0 ? (
                    <span className="text-xs font-bold text-stone-400 italic">
                      {tTour('s3_prompt', 'Tap tiles below to build a sentence...')}
                    </span>
                  ) : (
                    <>
                      {builtSentence.map((word, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-xs"
                        >
                          {word}
                        </span>
                      ))}
                      {builtSentence.length > 1 && (
                        <span className="ml-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 shrink-0 animate-in fade-in">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>&quot;{autocorrectAacGrammar(builtSentence, activeLang)}&quot;</span>
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {builtSentence.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('clear');
                        setBuiltSentence([]);
                      }}
                      className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold cursor-pointer"
                      title="Clear strip"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (builtSentence.length === 0) return;
                      const phrase = autocorrectAacGrammar(builtSentence, activeLang);
                      handleTileTap('strip', phrase);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-xs hover:from-emerald-600 hover:to-teal-600 active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{tTour('s3_speak', 'SPEAK')}</span>
                  </button>
                </div>
              </div>

              {/* Full Matrix Grid Preview */}
              <div className="max-w-2xl mx-auto p-3 bg-amber-100/50 rounded-3xl border-2 border-amber-200/80">
                <div className="grid grid-cols-6 gap-2">
                  {STAGE_3_TILES.map((tile) => {
                    const label = getTileL(tile.id, tile.label);
                    const speech = getTileS(tile.id, tile.label);
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => {
                          handleTileTap(tile.id, speech);
                          setBuiltSentence((prev) => adjustSentenceTokensOnTheSpot([...prev, label], activeLang));
                        }}
                        className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${getColorClasses(tile.color)} ${
                          lastTappedId === tile.id ? 'translate-y-1 scale-95' : 'hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="w-7 h-7 flex items-center justify-center pointer-events-none">
                          <img
                            src={tile.symbolUrl}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'block';
                              }
                            }}
                          />
                          <span aria-hidden="true" className="hidden text-xl">
                            {tile.emoji}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight leading-none mt-0.5">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FOLDERS & BREADCRUMB NAVIGATION */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wide border border-amber-300">
                  {tTour('s4_badge', 'Step 4: Smart Navigation')}
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {tTour('s4_title', 'Organized in Folders')}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {tTour('s4_subtitle', 'Group specific snacks, toys, and activities without ever getting lost.')}
                </p>
              </div>

              {/* Interactive Folder Simulation Card */}
              <div className="max-w-lg mx-auto bg-white border-3 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                
                {/* Persistent Top Home Breadcrumb with Visual Pulse */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playChime('tap');
                        setCurrentFolder('root');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        currentFolder !== 'root'
                          ? 'bg-amber-500 text-white ring-4 ring-amber-300 animate-pulse'
                          : 'bg-white text-stone-700 border border-stone-200'
                      }`}
                      title="Snap straight back home"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>{tTour('universal_home', 'Home')}</span>
                    </button>
                    {currentFolder === 'snacks' && (
                      <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                        <span>/</span> <span>{tTour('s4_folder', 'Snacks')}</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-extrabold text-amber-800">
                    {currentFolder === 'snacks' 
                      ? `👉 ${tTour('s4_tip', "Tap 'Home' anytime to snap straight back.")}`
                      : `📁 ${tTour('s4_folder_desc', 'Tap Snacks to open ➜')}`}
                  </span>
                </div>

                {/* Folder Content Display */}
                {currentFolder === 'root' ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        playChime('tap');
                        setCurrentFolder('snacks');
                      }}
                      className="h-28 rounded-3xl border-3 border-amber-400 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center gap-1 shadow-[0_6px_0_0_#D97706,0_10px_20px_rgba(217,119,6,0.1)] active:translate-y-1 active:shadow-[0_2px_0_0_#D97706] cursor-pointer"
                    >
                      <div className="w-12 h-12 flex items-center justify-center pointer-events-none">
                        <img
                          src={getMulberrySymbolUrl('apple')}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-black text-sm text-amber-950">{tTour('s4_folder', 'Snacks Folder')}</span>
                      <span className="text-[10px] font-bold text-amber-700">{tTour('s4_folder_desc', 'Tap to open ➜')}</span>
                    </button>

                    <div className="h-28 rounded-3xl border-2 border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-1 opacity-60">
                      <div className="w-12 h-12 flex items-center justify-center pointer-events-none">
                        <img
                          src={getMulberrySymbolUrl('toy')}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-bold text-sm text-stone-600">Toys Folder</span>
                      <span className="text-[10px] text-stone-400">Locked in demo</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in zoom-in-95">
                    {[
                      { id: 'apple', defaultLabel: 'Apple', defaultSpeech: 'Apple', symbolUrl: getMulberrySymbolUrl('apple') },
                      { id: 'crackers', defaultLabel: 'Crackers', defaultSpeech: 'Crackers', symbolUrl: getMulberrySymbolUrl('cracker') },
                      { id: 'cookie', defaultLabel: 'Cookie', defaultSpeech: 'Cookie', symbolUrl: getMulberrySymbolUrl('cookie') },
                      { id: 'water', defaultLabel: 'Water', defaultSpeech: 'Water', symbolUrl: getMulberrySymbolUrl('drink') },
                    ].map((item) => {
                      const label = getTileL(item.id, item.defaultLabel);
                      const speech = getTileS(item.id, item.defaultSpeech);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTileTap(item.id, speech)}
                          className="h-20 rounded-2xl border-2 border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-950 flex flex-col items-center justify-center p-1.5 shadow-[0_4px_0_0_#EA580C] active:translate-y-0.5 cursor-pointer"
                        >
                          <div className="w-8 h-8 flex items-center justify-center pointer-events-none">
                            <img
                              src={item.symbolUrl}
                              alt=""
                              aria-hidden="true"
                              className="w-full h-full object-contain filter drop-shadow-xs pointer-events-none"
                              loading="lazy"
                            />
                          </div>
                          <span className="text-xs font-black mt-0.5">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: 20-SECOND PHOTO TILE ("MY STUFF") */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-[11px] font-black uppercase tracking-wide border border-rose-300">
                  {tTour('s5_badge', 'Step 5: Personalized Tiles')}
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {tTour('s5_title', 'Make It Personal')}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {tTour('s5_subtitle', 'Snap real photos of their actual shoes, favorite blanket, or pet. Our AI cuts out the background into a clean clay tile.')}
                </p>
              </div>

              {/* Photo to Clay Tile Transformation Demo */}
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* 1. Camera Photo Preview */}
                <div className="p-4 rounded-3xl bg-white border-2 border-stone-200 flex flex-col items-center text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
                    1. Real Camera Snapshot
                  </span>
                  <div className="w-28 h-28 rounded-2xl bg-amber-50 border-2 border-stone-200 overflow-hidden flex items-center justify-center relative">
                    <span className="text-5xl">👟</span>
                    <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/60 text-white text-[9px] font-bold">
                      Messy Room BG
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-600">Actual Red Shoes</span>
                </div>

                {/* 2. Claymorphic Cutout Output */}
                <div className="p-4 rounded-3xl bg-amber-50 border-3 border-amber-400 flex flex-col items-center text-center space-y-2 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-700 tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>2. AI Clay Cutout</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTileTap('shoes', 'My red shoes')}
                    className="w-28 h-28 rounded-3xl border-3 border-amber-500 bg-white flex flex-col items-center justify-center shadow-[0_8px_0_0_#D97706,0_12px_24px_rgba(217,119,6,0.15)] active:translate-y-1 active:shadow-[0_2px_0_0_#D97706] cursor-pointer transition-all"
                  >
                    <span className="text-4xl drop-shadow-sm">👟</span>
                    <span className="text-xs font-black text-amber-950 mt-1">My Shoes</span>
                  </button>

                  <span className="text-[11px] font-extrabold text-amber-800">
                    {tTour('universal_touch', 'Tap to hear voice output!')}
                  </span>
                </div>
              </div>

              {/* Instant Cutout Feature Callout */}
              <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-3 text-xs font-bold text-stone-700">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Takes less than 20 seconds to photograph and add to any folder.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CUSTOM VOICES & HOLD-TO-EXPAND GRAMMAR */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wide border border-emerald-300">
                  {tTour('s6_badge', 'Step 6: Voice & Grammar')}
                </span>
                <h2 id="onboarding-tour-title" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {tTour('s6_title', 'Their Voice, Their Way')}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {tTour('s6_subtitle', 'Type phonetic pronunciations, record family voices, or hold any action word to reveal grammar tenses!')}
                </p>
              </div>

              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Demo A: Hold-to-Expand Grammar Conjugation */}
                <div className="p-4 rounded-3xl bg-white border-2 border-amber-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      🔤 Grammar Tenses
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Hold to expand
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center gap-2">
                    <span className="text-2xl">⏳</span>
                    <span className="font-black text-sm text-amber-950">Selected: {grammarTense}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Wait', 'Waited', 'Waiting', 'Waits'] as const).map((tense) => (
                      <button
                        key={tense}
                        type="button"
                        onClick={() => {
                          setGrammarTense(tense);
                          handleTileTap(tense, tense);
                        }}
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
                          grammarTense === tense
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-102'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {tense}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demo B: Custom Phonetic TTS */}
                <div className="p-4 rounded-3xl bg-white border-2 border-amber-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      🗣️ Phonetic TTS
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Accurate Voice
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-600 block">
                      Name or Word:
                    </label>
                    <input 
                      type="text" 
                      value={phoneticTestWord} 
                      onChange={(e) => setPhoneticTestWord(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-600 block">
                      Sounds like (Phonetic):
                    </label>
                    <input 
                      type="text" 
                      value={phoneticSpelling} 
                      onChange={(e) => setPhoneticSpelling(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTileTap('phonetic-test', phoneticSpelling)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Pronunciation</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left Action: Lock Stage / Back Button */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  setStep((prev) => prev - 1);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {/* Explicit "Keep This Stage" Action on Grid Stages 1, 2, 3 */}
            {step === 1 && (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(1)}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>{tTour('s1_lock', '✓ Perfect for Now! (Start with 4 Tiles)')}</span>
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(2)}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>{tTour('s2_lock', '✓ Lock at 12 Tiles')}</span>
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(3)}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>{tTour('s3_lock', '✓ Use Full Board')}</span>
              </button>
            )}
          </div>

          {/* Right Action: Next / Finish Button */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2">
            {step < 6 ? (
              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  setStep((prev) => prev + 1);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                <span>
                  {step === 1 && `➜ ${tTour('s1_next', 'Next: See 12 Tiles')}`}
                  {step === 2 && `➜ ${tTour('s2_next', 'Next: See Full Board')}`}
                  {step === 3 && `➜ ${tTour('s3_next', 'Next: How Folders Work')}`}
                  {step === 4 && `➜ ${tTour('s4_next', 'Next: Adding Photo Tiles')}`}
                  {step === 5 && `➜ ${tTour('s5_next', 'Next: Custom Voices & Grammar')}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveAndLockStage(3)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#047857] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                <span>{tTour('s6_finish', '🚀 All Set! Enter BeeYou')}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

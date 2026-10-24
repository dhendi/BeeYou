import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Loader2, CheckCircle2, ArrowRight, Mic } from 'lucide-react';
import { preloadVoicePack, PreloadProgress } from '../../services/aacPreloadService';
import { playChime } from '../../utils/audio/chimes';
import { getVoicePersonaById } from '../../data/voicePersonasData';
import { t, subscribeToLanguage, getLanguage } from '../../services/translator';

const SYNC_LOADING_STRINGS: Record<string, Record<string, string>> = {
  es: {
    'Preparing Your Voice': 'Preparando tu voz',
    'Loading Your Voice': 'Preparando tu voz',
    'Voice Ready!': '¡Voz lista!',
    'Voice Pack Ready!': '¡Voz lista!',
    'Pre-caching core speech tiles for instant playback.': 'Preparando casillas de voz para comunicación instantánea.',
    'Pre-caching every speech tile for instantaneous communication.': 'Preparando casillas de voz para comunicación instantánea.',
    'All AAC tiles are cached for instant 0ms speech.': 'Todas las casillas están listas para hablar al instante.',
    'Speech Tiles Ready': 'Casillas listas',
    'Speech Tiles Cached': 'Casillas listas',
    'Voice Model': 'Modelo de voz',
    'Ready for communication!': '¡Listo para comunicarse!',
    'Connecting to neural speech engine...': 'Conectando con el motor de voz...',
    'Preparing speech cache...': 'Preparando la voz...',
    'Continue to app': 'Continuar a la aplicación',
    'Downloading voice model...': 'Descargando modelo de voz...',
    'Downloading neural voice model...': 'Descargando modelo de voz...',
    'Preparing neural speech engine...': 'Preparando motor de voz...',
    'Speech engine ready': 'Motor de voz listo',
    'Voice model ready': 'Modelo de voz listo',
    'Optimizing speech tiles...': 'Optimizando casillas...',
    'Voice': 'Voz',
  },
  fr: {
    'Preparing Your Voice': 'Préparation de votre voix',
    'Loading Your Voice': 'Préparation de votre voix',
    'Voice Ready!': 'Voix prête !',
    'Voice Pack Ready!': 'Voix prête !',
    'Pre-caching core speech tiles for instant playback.': 'Mise en mémoire des cases pour une parole instantanée.',
    'Pre-caching every speech tile for instantaneous communication.': 'Mise en mémoire des cases pour une parole instantanée.',
    'All AAC tiles are cached for instant 0ms speech.': 'Toutes les cases CAA sont prêtes pour parler sans délai.',
    'Speech Tiles Ready': 'Cases prêtes',
    'Speech Tiles Cached': 'Cases prêtes',
    'Voice Model': 'Modèle vocal',
    'Ready for communication!': 'Prêt pour la communication !',
    'Connecting to neural speech engine...': 'Connexion au moteur vocal...',
    'Preparing speech cache...': 'Préparation de la synthèse vocale...',
    'Continue to app': 'Continuer vers l\'application',
    'Downloading voice model...': 'Téléchargement du modèle vocal...',
    'Downloading neural voice model...': 'Téléchargement du modèle vocal...',
    'Preparing neural speech engine...': 'Préparation du moteur vocal...',
    'Speech engine ready': 'Moteur vocal prêt',
    'Voice model ready': 'Modèle vocal prêt',
    'Optimizing speech tiles...': 'Optimisation des cases vocales...',
    'Voice': 'Voix',
  },
  fr_ca: {
    'Preparing Your Voice': 'Préparation de votre voix québécoise',
    'Loading Your Voice': 'Préparation de votre voix québécoise',
    'Voice Ready!': 'Voix québécoise prête !',
    'Voice Pack Ready!': 'Voix québécoise prête !',
    'Pre-caching core speech tiles for instant playback.': 'Mise en mémoire des cases pour une parole immédiate.',
    'Pre-caching every speech tile for instantaneous communication.': 'Mise en mémoire des cases pour une parole immédiate.',
    'All AAC tiles are cached for instant 0ms speech.': 'Toutes les cases CAA sont prêtes pour parler sans délai.',
    'Speech Tiles Ready': 'Cases prêtes',
    'Speech Tiles Cached': 'Cases prêtes',
    'Voice Model': 'Modèle vocal',
    'Ready for communication!': 'Prêt pour la communication !',
    'Connecting to neural speech engine...': 'Connexion au moteur vocal québécois...',
    'Preparing speech cache...': 'Préparation de la voix québécoise...',
    'Continue to app': 'Aller à l\'application',
    'Downloading voice model...': 'Téléchargement du modèle québécois...',
    'Downloading neural voice model...': 'Téléchargement du modèle québécois...',
    'Preparing neural speech engine...': 'Préparation du moteur de voix québécois...',
    'Speech engine ready': 'Moteur vocal prêt',
    'Voice model ready': 'Modèle vocal prêt',
    'Optimizing speech tiles...': 'Optimisation des cases...',
    'Voice': 'Voix',
  },
  de: {
    'Preparing Your Voice': 'Bereite deine Stimme vor',
    'Loading Your Voice': 'Bereite deine Stimme vor',
    'Voice Ready!': 'Stimme bereit!',
    'Voice Pack Ready!': 'Stimme bereit!',
    'Pre-caching core speech tiles for instant playback.': 'Lade Sprachfelder für sofortige Sprachausgabe vor.',
    'Pre-caching every speech tile for instantaneous communication.': 'Jedes Sprachfeld wird für sofortige Kommunikation vorgeladen.',
    'All AAC tiles are cached for instant 0ms speech.': 'Alle UK-Karten sind für sofortige Sprache bereit.',
    'Speech Tiles Ready': 'Sprachfelder bereit',
    'Speech Tiles Cached': 'Sprachfelder bereit',
    'Voice Model': 'Sprachmodell',
    'Ready for communication!': 'Bereit zur Kommunikation!',
    'Connecting to neural speech engine...': 'Verbindung zum Sprachmodul...',
    'Preparing speech cache...': 'Sprachspeicher wird vorbereitet...',
    'Continue to app': 'Weiter zur App',
    'Downloading voice model...': 'Lade Sprachmodell herunter...',
    'Downloading neural voice model...': 'Lade Sprachmodell herunter...',
    'Preparing neural speech engine...': 'Bereite neuronales Sprachmodul vor...',
    'Speech engine ready': 'Sprachmodul einsatzbereit',
    'Voice model ready': 'Sprachmodell einsatzbereit',
    'Optimizing speech tiles...': 'Optimiere Sprachfelder...',
    'Voice': 'Stimme',
  },
  it: {
    'Loading Your Voice': 'Caricamento della tua voce',
    'Voice Pack Ready!': 'Pacchetto vocale pronto!',
    'Pre-caching every speech tile for instantaneous communication.': 'Pre-caricamento di ogni casella per una comunicazione istantanea.',
    'All AAC tiles are cached for instant 0ms speech.': 'Tutte le tessere CAA sono pronte per una voce immediata a 0 ms.',
    'Speech Tiles Cached': 'Tessere vocali salvate',
    'Ready for communication!': 'Pronto per comunicare!',
    'Connecting to neural speech engine...': 'Connessione al motore vocale...',
    'Preparing speech cache...': 'Preparazione della voce...',
    'Continue to app': 'Continua con l\'app',
    'Downloading neural voice model...': 'Download del modello vocale neurale...',
    'Preparing neural speech engine...': 'Preparazione del motore vocale neurale...',
    'Voice model ready': 'Modello vocale pronto',
    'Voice': 'Voce',
  },
  pt: {
    'Loading Your Voice': 'Carregando sua voz',
    'Voice Pack Ready!': 'Pacote de voz pronto!',
    'Pre-caching every speech tile for instantaneous communication.': 'Pré-carregando cada botão para comunicação instantânea.',
    'All AAC tiles are cached for instant 0ms speech.': 'Todos os cartões de CAA estão prontos para fala imediata.',
    'Speech Tiles Cached': 'Botões de voz salvos',
    'Ready for communication!': 'Pronto para comunicação!',
    'Connecting to neural speech engine...': 'Conectando ao motor de voz...',
    'Preparing speech cache...': 'Preparando a voz...',
    'Continue to app': 'Continuar para o aplicativo',
    'Downloading neural voice model...': 'Baixando modelo de voz neural...',
    'Preparing neural speech engine...': 'Preparando motor de voz neural...',
    'Voice model ready': 'Modelo de voz pronto',
    'Voice': 'Voz',
  },
  ru: {
    'Loading Your Voice': 'Загрузка вашего голоса',
    'Voice Pack Ready!': 'Голосовой пакет готов!',
    'Pre-caching every speech tile for instantaneous communication.': 'Кэширование карточек для мгновенной речи.',
    'All AAC tiles are cached for instant 0ms speech.': 'Все карточки ААК готовы к мгновенному озвучиванию.',
    'Speech Tiles Cached': 'Карточки подготовлены',
    'Ready for communication!': 'Готов к общению!',
    'Connecting to neural speech engine...': 'Подключение к голосовому движку...',
    'Preparing speech cache...': 'Подготовка голосовой памяти...',
    'Continue to app': 'Перейти в приложение',
    'Downloading neural voice model...': 'Загрузка нейросетевой модели...',
    'Preparing neural speech engine...': 'Инициализация голосовой нейросети...',
    'Voice model ready': 'Голосовая модель готова',
    'Voice': 'Голос',
  },
  vi: {
    'Loading Your Voice': 'Đang tải giọng nói của bạn',
    'Voice Pack Ready!': 'Gói giọng nói đã sẵn sàng!',
    'Pre-caching every speech tile for instantaneous communication.': 'Đang chuẩn bị từng thẻ AAC để phát giọng nói tức thì.',
    'All AAC tiles are cached for instant 0ms speech.': 'Tất cả thẻ AAC đã được lưu để phát âm 0ms ngay lập tức.',
    'Speech Tiles Cached': 'Thẻ giọng nói đã lưu',
    'Ready for communication!': 'Sẵn sàng giao tiếp!',
    'Connecting to neural speech engine...': 'Đang kết nối động cơ giọng nói...',
    'Preparing speech cache...': 'Đang chuẩn bị bộ nhớ giọng nói...',
    'Continue to app': 'Tiếp tục vào ứng dụng',
    'Downloading neural voice model...': 'Đang tải mô hình giọng nói nơ-ron...',
    'Preparing neural speech engine...': 'Đang chuẩn bị động cơ phát âm nơ-ron...',
    'Voice model ready': 'Mô hình giọng nói đã sẵn sàng',
    'Voice': 'Giọng nói',
  },
  zh: {
    'Loading Your Voice': '正在载入您的专属语音',
    'Voice Pack Ready!': '语音包已准备就绪！',
    'Pre-caching every speech tile for instantaneous communication.': '正在预存每个交流卡片，实现即时发声。',
    'All AAC tiles are cached for instant 0ms speech.': '所有辅助沟通卡片已缓存，零延迟极速发声。',
    'Speech Tiles Cached': '已缓存卡片',
    'Ready for communication!': '准备好沟通交流了！',
    'Connecting to neural speech engine...': '正在连接神经网络语音引擎...',
    'Preparing speech cache...': '正在准备发声缓存...',
    'Continue to app': '进入应用',
    'Downloading neural voice model...': '正在下载神经网络语音模型...',
    'Preparing neural speech engine...': '正在准备神经网络发声引擎...',
    'Voice model ready': '语音模型已就绪',
    'Voice': '发音角色',
  },
  el: {
    'Loading Your Voice': 'Φόρτωση της φωνής σας',
    'Voice Pack Ready!': 'Το πακέτο φωνής είναι έτοιμο!',
    'Pre-caching every speech tile for instantaneous communication.': 'Προσωρινή αποθήκευση κάθε κάρτας για άμεση ομιλία.',
    'All AAC tiles are cached for instant 0ms speech.': 'Όλες οι κάρτες ΕΕΚ είναι έτοιμες για άμεση εκφώνηση.',
    'Speech Tiles Cached': 'Κάρτες αποθηκευμένες',
    'Ready for communication!': 'Έτοιμο για επικοινωνία!',
    'Connecting to neural speech engine...': 'Σύνδεση με τη μηχανή φωνής...',
    'Preparing speech cache...': 'Προετοιμασία μνήμης φωνής...',
    'Continue to app': 'Συνέχεια στην εφαρμογή',
    'Downloading neural voice model...': 'Λήψη νευρωνικού μοντέλου φωνής...',
    'Preparing neural speech engine...': 'Προετοιμασία νευρωνικής μηχανής ομιλίας...',
    'Voice model ready': 'Το μοντέλο φωνής είναι έτοιμο',
    'Voice': 'Φωνή',
  },
};

function translateLoadingText(text: string, lang: string): string {
  if (!text) return '';
  const norm = (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' : (lang === 'zh' || lang.startsWith('zh')) ? 'zh' : lang.substring(0, 2).toLowerCase();
  if (SYNC_LOADING_STRINGS[norm]?.[text]) {
    return SYNC_LOADING_STRINGS[norm][text];
  }
  return t(text, lang);
}

interface AacVoiceLoadingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  persona?: string;
  language?: string;
}

export const AacVoiceLoadingScreen: React.FC<AacVoiceLoadingScreenProps> = ({
  isOpen,
  onComplete,
  persona = 'amy',
  language = 'en',
}) => {
  const [currentUiLang, setCurrentUiLang] = useState(language || getLanguage() || 'en');
  const [, setRevision] = useState(0);
  const [progress, setProgress] = useState<PreloadProgress>({
    loaded: 0,
    total: 83,
    percent: 0,
    currentPhrase: 'Preparing speech cache...',
  });
  const [isFinished, setIsFinished] = useState(false);
  const personaObj = getVoicePersonaById(persona);

  useEffect(() => {
    return subscribeToLanguage((newLang) => {
      setCurrentUiLang(newLang);
      setRevision((r) => r + 1);
    });
  }, []);

  useEffect(() => {
    if (language) {
      setCurrentUiLang(language);
      setRevision((r) => r + 1);
    }
  }, [language]);

  const formatProgressPhrase = (phrase: string): string => {
    if (!phrase) return '';
    if (phrase.startsWith('Downloading neural voice model')) return translateLoadingText('Downloading voice model...', currentUiLang);
    if (phrase.startsWith('Downloading voice model')) return translateLoadingText('Downloading voice model...', currentUiLang);
    if (phrase.startsWith('Preparing neural speech engine')) return translateLoadingText('Preparing neural speech engine...', currentUiLang);
    if (phrase.startsWith('Speech engine ready')) return translateLoadingText('Speech engine ready', currentUiLang);
    if (phrase.startsWith('Voice model ready')) return translateLoadingText('Voice model ready', currentUiLang);
    if (phrase.startsWith('Connecting to neural speech engine')) return translateLoadingText('Connecting to neural speech engine...', currentUiLang);
    if (phrase.startsWith('Preparing speech cache')) return translateLoadingText('Preparing speech cache...', currentUiLang);
    if (phrase.startsWith('Optimizing tile:')) {
      const tileName = phrase.replace('Optimizing tile:', '').trim();
      return `${translateLoadingText('Optimizing speech tiles...', currentUiLang)} (${tileName})`;
    }
    return translateLoadingText(phrase, currentUiLang);
  };

  // Keep a stable ref to onComplete to avoid triggering re-renders or restarting preloads
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const activeOpRef = useRef<string | null>(null);
  const highestPercentRef = useRef(0);
  const highestLoadedRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      activeOpRef.current = null;
      setIsFinished(false);
      highestPercentRef.current = 0;
      highestLoadedRef.current = 0;
      setProgress({
        loaded: 0,
        total: 82,
        percent: 0,
        currentPhrase: 'Preparing speech cache...',
      });
      return;
    }

    const opKey = `${persona}_${language}`;
    if (activeOpRef.current === opKey) {
      // Already running for this exact persona and language, do not restart
      return;
    }
    activeOpRef.current = opKey;
    setIsFinished(false);
    highestPercentRef.current = 0;
    highestLoadedRef.current = 0;
    setProgress({
      loaded: 0,
      total: 82,
      percent: 0,
      currentPhrase: 'Preparing speech cache...',
    });

    let isSubscribed = true;

    // Safety fail-safe threshold: Dismiss gracefully if network connection drops
    const maxSafetyTimer = setTimeout(() => {
      if (!isSubscribed) return;
      console.warn('[Voice Loading Screen] Safety threshold reached, dismissing modal.');
      setIsFinished(true);
      try { playChime('complete'); } catch {}
      setTimeout(() => {
        if (isSubscribed) {
          onCompleteRef.current?.();
        }
      }, 300);
    }, 30000);

    // Trigger genuine background pre-caching of neural voice model and core AAC tiles
    preloadVoicePack(
      persona,
      language,
      (p) => {
        if (!isSubscribed) return;
        highestLoadedRef.current = Math.max(highestLoadedRef.current, p.loaded);
        highestPercentRef.current = Math.max(highestPercentRef.current, p.percent);
        setProgress({
          loaded: p.loaded,
          total: p.total,
          percent: highestPercentRef.current,
          currentPhrase: p.currentPhrase,
          loadedBytes: p.loadedBytes,
          totalBytes: p.totalBytes,
          stage: p.stage,
        });
      }
    )
      .then(() => {
        if (!isSubscribed) return;
        clearTimeout(maxSafetyTimer);
        setIsFinished(true);
        try {
          playChime('complete');
        } catch {}
        setTimeout(() => {
          if (isSubscribed) {
            onCompleteRef.current?.();
          }
        }, 350);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        clearTimeout(maxSafetyTimer);
        console.warn('[Voice Preload Notice]:', err);
        setIsFinished(true);
        onCompleteRef.current?.();
      });

    return () => {
      isSubscribed = false;
      clearTimeout(maxSafetyTimer);
    };
  }, [isOpen, persona, language]);

  if (!isOpen) return null;

  const displayLanguage = language.toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aac-loading-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#2B231D]/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-md bg-[#FAF8F5] border-3 border-amber-300 rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(217,119,6,0.25)] text-center overflow-hidden flex flex-col items-center">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Animated mascot / voice icon badge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 border-3 border-amber-500 shadow-md flex items-center justify-center mb-5 animate-pulse">
          <Mic className="w-10 h-10 text-amber-950" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <Volume2 className="w-4 h-4" />
          </div>
        </div>

        {/* Headline */}
        <h3 id="aac-loading-title" className="text-xl sm:text-2xl font-black text-[#2D241E] tracking-tight">
          {isFinished ? translateLoadingText('Voice Ready!', currentUiLang) : translateLoadingText('Preparing Your Voice', currentUiLang)}
        </h3>
        <p className="text-xs sm:text-sm text-[#7A6C60] font-semibold mt-1 max-w-xs">
          {isFinished
            ? translateLoadingText('All AAC tiles are cached for instant 0ms speech.', currentUiLang)
            : translateLoadingText('Pre-caching core speech tiles for instant playback.', currentUiLang)}
        </p>

        {/* Live Progress Bar */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5 truncate max-w-[240px]">
              {isFinished ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
              )}
              <span className="truncate">
                {isFinished ? translateLoadingText('Ready for communication!', currentUiLang) : formatProgressPhrase(progress.currentPhrase)}
              </span>
            </span>
            <span className="tabular-nums font-extrabold shrink-0 text-amber-700">
              {progress.percent}%
            </span>
          </div>

          <div className="w-full h-3.5 bg-amber-100 rounded-full overflow-hidden p-0.5 border border-amber-300">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 rounded-full transition-all duration-150 ease-out shadow-xs"
              style={{ width: `${Math.min(100, Math.max(4, progress.percent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-bold px-0.5">
            <span>
              {progress.stage === 'tiles'
                ? translateLoadingText('Speech Tiles Ready', currentUiLang)
                : translateLoadingText('Voice Model', currentUiLang)}
            </span>
            <span className="tabular-nums font-extrabold">
              {progress.stage === 'tiles'
                ? `${progress.loaded} / ${progress.total}`
                : progress.totalBytes && progress.totalBytes > 0
                ? `${(progress.loadedBytes ? progress.loadedBytes / (1024 * 1024) : 0).toFixed(1)} MB of ${(progress.totalBytes / (1024 * 1024)).toFixed(1)} MB done`
                : `${progress.percent}% done`}
            </span>
          </div>
        </div>

        {/* Selected Persona Badge */}
        <div className="mt-5 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2">
          <span>{translateLoadingText('Voice', currentUiLang)}: <strong>{personaObj.name}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-800 text-[11px] font-black">{displayLanguage}</span>
        </div>

        {/* Manual Dismiss Button if needed */}
        <button
          type="button"
          onClick={() => {
            try { playChime('tap'); } catch {}
            onCompleteRef.current?.();
          }}
          className="mt-6 text-xs text-[#7A6C60] hover:text-[#2D241E] font-bold underline cursor-pointer flex items-center gap-1 transition"
        >
          <span>{translateLoadingText('Continue to app', currentUiLang)}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

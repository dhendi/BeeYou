import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { getArasaacImageUrl } from '../services/arasaacService';
import {
  ASL_ALPHABET,
  ASL_ALPHABET_NOTES,
  ASL_BASICS,
  ASL_BUILDER_PALETTE,
  ASL_CATEGORIES,
  ASL_IMAGES,
  ASL_NUMBER_NOTES,
  ASL_PHRASES,
  ASL_SIGNS,
  ASL_SIGN_MAP,
  ASL_STARTER_IDS,
  ASL_VIDEOS,
  ASL_VIDEO_MAP,
  getExternalSignLinks,
  getFingerspellingUrl,
  type ASLSign,
  type ASLVideo,
} from '../data/aslData';

type Tab = 'dictionary' | 'learn' | 'aac' | 'needs' | 'videos';
type DictFilter = 'all' | 'favorites' | 'recent' | string;

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'dictionary', label: 'Dictionary', emoji: '📖' },
  { id: 'learn', label: 'Learn', emoji: '🎓' },
  { id: 'aac', label: 'ASL + AAC', emoji: '🗣️' },
  { id: 'needs', label: 'Needs & Feelings', emoji: '💛' },
  { id: 'videos', label: 'Videos', emoji: '🎬' },
];

const FAV_KEY = 'lumina_asl_favorites';
const RECENT_KEY = 'lumina_asl_recent';
const LEARNED_KEY = 'lumina_asl_learned';

function loadList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function useStoredList(key: string): [string[], (next: string[]) => void] {
  const [list, setList] = useState<string[]>(() => loadList(key));
  const update = (next: string[]) => {
    setList(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore storage errors */
    }
  };
  return [list, update];
}

const SignPicture: React.FC<{ sign: ASLSign; size?: string }> = ({ sign, size = 'w-16 h-16' }) => {
  if (sign.arasaacId) {
    return (
      <img
        src={getArasaacImageUrl(sign.arasaacId, 300)}
        alt=""
        className={`${size} object-contain`}
        loading="lazy"
      />
    );
  }
  return <span className="text-5xl leading-none" aria-hidden="true">{sign.emoji}</span>;
};

const VideoCard: React.FC<{ video: ASLVideo }> = ({ video }) => (
  <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
    <h3 className="font-black text-lg text-slate-900">{video.title}</h3>
    <p className="text-sm text-slate-700 mb-3">{video.description}</p>
    <video
      className="w-full rounded-xl bg-black max-h-64"
      muted
      loop
      playsInline
      controls
      preload="metadata"
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.ogv} type="video/ogg" />
      Your browser can't play this video.
    </video>
    <p className="text-xs text-slate-600 mt-2">
      By {video.author} ·{' '}
      <a href={video.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">
        {video.license}
      </a>{' '}
      ·{' '}
      <a href={video.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">
        Wikimedia Commons
      </a>
    </p>
  </div>
);

export const ASLView: React.FC = () => {
  const { speak, addToSentence, addAacItem, aacItems } = useApp();

  const [tab, setTab] = useState<Tab>('dictionary');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<DictFilter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [favorites, setFavorites] = useStoredList(FAV_KEY);
  const [recent, setRecent] = useStoredList(RECENT_KEY);
  const [learned, setLearned] = useStoredList(LEARNED_KEY);

  // learn
  const [speller, setSpeller] = useState('');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizPick, setQuizPick] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [cardFlip, setCardFlip] = useState(false);

  // builder
  const [built, setBuilt] = useState<string[]>([]);

  // needs
  const [needsOpen, setNeedsOpen] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const openSign = (id: string) => {
    setOpenId(id);
    setRecent([id, ...recent.filter((r) => r !== id)].slice(0, 12));
    playChime('tap');
  };

  const toggleFav = (id: string) => {
    setFavorites(favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id]);
  };

  const sayWord = (s: ASLSign) => speak(s.phrase || s.speech || s.word);

  const alreadyInAac = (s: ASLSign) =>
    (aacItems || []).some((a) => a.label.trim().toLowerCase() === s.word.trim().toLowerCase());

  const addSignToAac = (s: ASLSign) => {
    if (alreadyInAac(s)) {
      flash(`"${s.word}" is already on your AAC board`);
      return;
    }
    addAacItem({
      label: s.word,
      speechText: s.speech || s.word,
      emoji: s.emoji,
      arasaacId: s.arasaacId,
      category: 'core',
      colorType: 'noun',
      isCustom: true,
      isFavorite: true,
    });
    playChime('star');
    flash(`Added "${s.word}" to your AAC board`);
  };

  const sendToSentence = (s: ASLSign) => {
    addToSentence({
      id: `asl-${s.id}-${Date.now()}`,
      label: s.word,
      speechText: s.speech || s.word,
      emoji: s.emoji,
      arasaacId: s.arasaacId,
      category: 'core',
      colorType: 'noun',
      motorIndex: 0,
    });
    flash(`"${s.word}" sent to your AAC sentence bar`);
  };

  const visibleSigns = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = ASL_SIGNS;
    if (filter === 'favorites') list = list.filter((s) => favorites.includes(s.id));
    else if (filter === 'recent') list = recent.map((id) => ASL_SIGN_MAP[id]).filter(Boolean);
    else if (filter !== 'all') list = list.filter((s) => s.category === filter);
    if (q) {
      list = list.filter(
        (s) => s.word.toLowerCase().includes(q) || (s.aliases || []).some((a) => a.toLowerCase().includes(q))
      );
    }
    return list;
  }, [query, filter, favorites, recent]);

  const openSignObj = openId ? ASL_SIGN_MAP[openId] : null;

  // ---------- Sign detail ----------
  const renderDetail = (s: ASLSign) => {
    const cat = ASL_CATEGORIES.find((c) => c.id === s.category);
    const isLearned = learned.includes(s.id);
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label={`How to sign ${s.word}`}
        onClick={() => setOpenId(null)}
      >
        <div
          className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <SignPicture sign={s} size="w-20 h-20" />
              <div>
                <h2 className="text-3xl font-black text-slate-900">{s.word}</h2>
                {cat && <span className="text-sm font-bold text-slate-600">{cat.emoji} {cat.label}</span>}
              </div>
            </div>
            <button
              onClick={() => setOpenId(null)}
              className="min-w-[48px] min-h-[48px] rounded-full bg-slate-100 text-xl font-black"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
            <p className="text-xs font-black uppercase tracking-wide text-purple-800">Handshape: {s.handshape}</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{s.howTo}</p>
            {s.tip && <p className="mt-2 text-sm text-purple-900">💡 {s.tip}</p>}
          </div>

          {(s.videoIds || []).map((vid) => ASL_VIDEO_MAP[vid] && (
            <div key={vid} className="mt-4"><VideoCard video={ASL_VIDEO_MAP[vid]} /></div>
          ))}
          {s.imageId && ASL_IMAGES[s.imageId] && (() => {
            const img = ASL_IMAGES[s.imageId!];
            return (
              <figure className="mt-4">
                <img src={img.url} alt={img.caption} className="w-full max-h-64 object-contain rounded-xl bg-slate-50" loading="lazy" />
                <figcaption className="text-xs text-slate-600 mt-1">
                  {img.caption} · By {img.author} ·{' '}
                  <a href={img.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">{img.license}</a> ·{' '}
                  <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">Source</a>
                </figcaption>
              </figure>
            );
          })()}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => sayWord(s)} className="min-h-[52px] rounded-2xl bg-amber-400 text-amber-950 font-black">🔊 Speak</button>
            <button onClick={() => toggleFav(s.id)} className="min-h-[52px] rounded-2xl bg-rose-100 text-rose-900 font-black border-2 border-rose-300">
              {favorites.includes(s.id) ? '❤️ Favorited' : '🤍 Favorite'}
            </button>
            <button onClick={() => sendToSentence(s)} className="min-h-[52px] rounded-2xl bg-sky-100 text-sky-900 font-black border-2 border-sky-300">➕ To AAC sentence</button>
            <button
              onClick={() => addSignToAac(s)}
              disabled={alreadyInAac(s)}
              className="min-h-[52px] rounded-2xl bg-emerald-100 text-emerald-900 font-black border-2 border-emerald-300 disabled:opacity-50"
            >
              {alreadyInAac(s) ? '✅ On my board' : '📌 Add to my board'}
            </button>
            <button
              onClick={() => setLearned(isLearned ? learned.filter((l) => l !== s.id) : [...learned, s.id])}
              className="col-span-2 min-h-[52px] rounded-2xl bg-indigo-100 text-indigo-900 font-black border-2 border-indigo-300"
            >
              {isLearned ? '🌟 Learned (tap to undo)' : '⭐ Mark as learned'}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-black uppercase text-slate-600">See it signed (opens another site)</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {getExternalSignLinks(s.word).map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-900 text-sm font-bold underline">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">ASL varies by region and signer. This shows a widely used form.</p>
        </div>
      </div>
    );
  };

  const SignTile: React.FC<{ s: ASLSign; onClick: () => void }> = ({ s, onClick }) => {
    const cat = ASL_CATEGORIES.find((c) => c.id === s.category);
    return (
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center gap-1 p-3 min-h-[116px] rounded-2xl border-2 font-black text-center active:scale-95 transition ${cat?.color || 'bg-white border-slate-300 text-slate-900'}`}
      >
        {favorites.includes(s.id) && <span className="absolute top-1 right-2 text-sm">❤️</span>}
        {learned.includes(s.id) && <span className="absolute top-1 left-2 text-sm">🌟</span>}
        <SignPicture sign={s} />
        <span className="text-base">{s.word}</span>
      </button>
    );
  };

  // ---------- Tabs ----------
  const renderDictionary = () => (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search signs…"
        aria-label="Search ASL signs"
        className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-slate-300 text-lg font-semibold"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All', emoji: '✨' },
          { id: 'favorites', label: 'Favorites', emoji: '❤️' },
          { id: 'recent', label: 'Recent', emoji: '🕘' },
          ...ASL_CATEGORIES.map((c) => ({ id: c.id as string, label: c.label, emoji: c.emoji })),
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 min-h-[44px] px-3 rounded-full border-2 font-bold text-sm ${
              filter === c.id ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-slate-800 border-slate-300'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
      {visibleSigns.length === 0 ? (
        <p className="text-center text-slate-600 font-semibold py-8">
          {filter === 'favorites' ? 'No favorites yet. Open a sign and tap the heart.'
            : filter === 'recent' ? 'No recent signs yet. Open a sign to see it here.'
            : 'No signs found.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {visibleSigns.map((s) => <SignTile key={s.id} s={s} onClick={() => openSign(s.id)} />)}
        </div>
      )}
    </div>
  );

  const quizSigns = useMemo(() => ASL_STARTER_IDS.map((id) => ASL_SIGN_MAP[id]).filter(Boolean), []);
  const quizQuestion = quizSigns[quizIdx % Math.max(quizSigns.length, 1)];
  const quizOptions = useMemo(() => {
    if (!quizQuestion) return [];
    const others = quizSigns.filter((s) => s.id !== quizQuestion.id);
    const picks = [...others].sort((a, b) => ((a.id + quizIdx).length * 7 + a.id.charCodeAt(0) * (quizIdx + 3)) % 11 - ((b.id + quizIdx).length * 7 + b.id.charCodeAt(0) * (quizIdx + 3)) % 11).slice(0, 3);
    return [...picks, quizQuestion].sort((a, b) => (a.id.charCodeAt(1) * (quizIdx + 5)) % 7 - (b.id.charCodeAt(1) * (quizIdx + 5)) % 7);
  }, [quizQuestion, quizIdx, quizSigns]);

  const renderLearn = () => {
    const letters = speller.toUpperCase().replace(/[^A-Z]/g, '').split('');
    const card = quizSigns[cardIdx % Math.max(quizSigns.length, 1)];
    return (
      <div className="space-y-6">
        <section>
          <h2 className="font-black text-xl text-slate-900 mb-2">🌱 ASL basics</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ASL_BASICS.map((b) => (
              <div key={b.id} className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                <h3 className="font-black text-slate-900">{b.emoji} {b.title}</h3>
                <p className="text-sm text-slate-700 mt-1">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-black text-xl text-slate-900 mb-1">🔤 Fingerspelling A–Z</h2>
          <p className="text-xs text-slate-600 mb-2">Images: public domain (Wikimedia Commons).</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {ASL_ALPHABET.map((l) => (
              <div key={l} className="bg-white border-2 border-slate-200 rounded-xl p-1 text-center">
                <img src={getFingerspellingUrl(l, 160)} alt={`Fingerspelling letter ${l}`} className="w-full aspect-square object-contain" loading="lazy" />
                <span className="font-black">{l}</span>
              </div>
            ))}
          </div>
          <ul className="mt-2 text-sm text-slate-700 space-y-1">
            {Object.entries(ASL_ALPHABET_NOTES).map(([l, n]) => <li key={l}><b>{l}:</b> {n}</li>)}
          </ul>
          <div className="mt-3">
            <input
              value={speller}
              onChange={(e) => setSpeller(e.target.value)}
              placeholder="Type a name or word to fingerspell…"
              aria-label="Fingerspell a word"
              className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-slate-300 font-semibold"
            />
            {letters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {letters.map((l, i) => (
                  <div key={i} className="w-16 bg-white border-2 border-purple-300 rounded-xl p-1 text-center">
                    <img src={getFingerspellingUrl(l, 120)} alt={l} className="w-full aspect-square object-contain" />
                    <span className="font-black">{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-black text-xl text-slate-900 mb-2">🔢 Numbers</h2>
          <ul className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-800 space-y-1">
            {ASL_NUMBER_NOTES.map((n) => <li key={n.n}><b>{n.n}:</b> {n.how}</li>)}
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl text-slate-900 mb-1">⭐ Starter signs</h2>
          <p className="text-sm text-slate-600 mb-2">
            {quizSigns.filter((s) => learned.includes(s.id)).length} of {quizSigns.length} learned
          </p>
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden mb-3">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${(quizSigns.filter((s) => learned.includes(s.id)).length / Math.max(quizSigns.length, 1)) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {quizSigns.map((s) => <SignTile key={s.id} s={s} onClick={() => openSign(s.id)} />)}
          </div>
        </section>

        {card && (
          <section>
            <h2 className="font-black text-xl text-slate-900 mb-2">🃏 Flashcards</h2>
            <button
              onClick={() => setCardFlip(!cardFlip)}
              className="w-full min-h-[200px] bg-white border-4 border-purple-300 rounded-3xl p-5 text-center"
            >
              {cardFlip ? (
                <>
                  <p className="text-xs font-black uppercase text-purple-800">{card.handshape}</p>
                  <p className="text-lg font-semibold text-slate-900 mt-2">{card.howTo}</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center"><SignPicture sign={card} size="w-24 h-24" /></div>
                  <p className="text-3xl font-black mt-2">{card.word}</p>
                  <p className="text-sm text-slate-600 mt-1">Tap to see how to sign it</p>
                </>
              )}
            </button>
            <button
              onClick={() => { setCardIdx(cardIdx + 1); setCardFlip(false); }}
              className="mt-2 w-full min-h-[52px] rounded-2xl bg-purple-500 text-white font-black"
            >
              Next card →
            </button>
          </section>
        )}

        {quizQuestion && (
          <section>
            <h2 className="font-black text-xl text-slate-900 mb-1">🧠 Quiz</h2>
            <p className="text-sm text-slate-600 mb-2">Score: {quizScore}</p>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
              <p className="font-black text-slate-900">Which sign is this?</p>
              <p className="text-sm text-slate-800 mt-1">{quizQuestion.howTo}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {quizOptions.map((o) => {
                  const picked = quizPick !== null;
                  const correct = o.id === quizQuestion.id;
                  return (
                    <button
                      key={o.id}
                      disabled={picked}
                      onClick={() => {
                        setQuizPick(o.id);
                        if (correct) { setQuizScore(quizScore + 1); playChime('star'); } else playChime('tap');
                      }}
                      className={`min-h-[52px] rounded-xl border-2 font-black ${
                        picked && correct ? 'bg-emerald-200 border-emerald-500'
                          : picked && quizPick === o.id ? 'bg-rose-200 border-rose-500'
                          : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      {o.word}
                    </button>
                  );
                })}
              </div>
              {quizPick !== null && (
                <button
                  onClick={() => { setQuizIdx(quizIdx + 1); setQuizPick(null); }}
                  className="mt-3 w-full min-h-[48px] rounded-xl bg-purple-500 text-white font-black"
                >
                  Next question →
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderAac = () => (
    <div className="space-y-6">
      <section>
        <h2 className="font-black text-xl text-slate-900 mb-1">🧩 Sentence builder</h2>
        <p className="text-sm text-slate-600 mb-2">Tap signs to build a sentence, then speak it or send it to your AAC bar.</p>
        <div className="min-h-[64px] bg-white border-2 border-purple-300 rounded-2xl p-3 flex flex-wrap gap-2 items-center">
          {built.length === 0 && <span className="text-slate-500 font-semibold">Your sentence appears here…</span>}
          {built.map((id, i) => {
            const s = ASL_SIGN_MAP[id];
            return s ? (
              <span key={i} className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-black">{s.emoji} {s.word}</span>
            ) : null;
          })}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <button onClick={() => speak(built.map((id) => ASL_SIGN_MAP[id]?.speech || ASL_SIGN_MAP[id]?.word).filter(Boolean).join(' '))} disabled={!built.length} className="col-span-2 min-h-[52px] rounded-2xl bg-amber-400 text-amber-950 font-black disabled:opacity-50">🔊 Speak</button>
          <button onClick={() => setBuilt(built.slice(0, -1))} disabled={!built.length} className="min-h-[52px] rounded-2xl bg-slate-100 font-black disabled:opacity-50">⌫ Undo</button>
          <button onClick={() => setBuilt([])} disabled={!built.length} className="min-h-[52px] rounded-2xl bg-slate-100 font-black disabled:opacity-50">Clear</button>
          <button
            onClick={() => { built.forEach((id) => { const s = ASL_SIGN_MAP[id]; if (s) sendToSentence(s); }); }}
            disabled={!built.length}
            className="col-span-4 min-h-[52px] rounded-2xl bg-sky-100 text-sky-900 border-2 border-sky-300 font-black disabled:opacity-50"
          >
            ➕ Send to AAC sentence bar
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 mt-3">
          {ASL_BUILDER_PALETTE.map((id) => {
            const s = ASL_SIGN_MAP[id];
            return s ? (
              <button
                key={id}
                onClick={() => { setBuilt([...built, id]); playChime('tap'); }}
                className="min-h-[64px] rounded-xl border-2 border-slate-300 bg-white font-black text-sm active:scale-95"
              >
                <span className="text-2xl block">{s.emoji}</span>{s.word}
              </button>
            ) : null;
          })}
        </div>
      </section>

      <section>
        <h2 className="font-black text-xl text-slate-900 mb-2">💬 Everyday phrases</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ASL_PHRASES.map((p) => (
            <div key={p.id} className="bg-white border-2 border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-black text-slate-900">{p.emoji} {p.text}</h3>
                <button onClick={() => speak(p.text)} className="min-w-[48px] min-h-[48px] rounded-full bg-amber-400 text-lg" aria-label={`Speak: ${p.text}`}>🔊</button>
              </div>
              <ol className="mt-2 flex flex-wrap gap-2">
                {p.signs.map((id, i) => {
                  const s = ASL_SIGN_MAP[id];
                  return s ? (
                    <li key={i}>
                      <button onClick={() => openSign(id)} className="px-3 py-1 min-h-[40px] rounded-full bg-purple-100 text-purple-900 font-bold text-sm">
                        {i + 1}. {s.word}
                      </button>
                    </li>
                  ) : null;
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderNeeds = () => {
    const groups = (['needs', 'feelings'] as const).map((id) => ({
      cat: ASL_CATEGORIES.find((c) => c.id === id)!,
      signs: ASL_SIGNS.filter((s) => s.category === id),
    }));
    const open = needsOpen ? ASL_SIGN_MAP[needsOpen] : null;
    return (
      <div className="space-y-5">
        {open && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4">
            <h3 className="font-black text-xl text-slate-900">{open.emoji} {open.phrase || open.word}</h3>
            <p className="text-xs font-black uppercase text-purple-800 mt-1">{open.handshape}</p>
            <p className="text-slate-900 font-semibold mt-1">{open.howTo}</p>
            <button onClick={() => openSign(open.id)} className="mt-2 min-h-[44px] px-4 rounded-xl bg-white border-2 border-purple-300 font-black text-sm">More details</button>
          </div>
        )}
        {groups.map(({ cat, signs }) => (
          <section key={cat.id}>
            <h2 className="font-black text-xl text-slate-900 mb-2">{cat.emoji} {cat.label}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {signs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setNeedsOpen(s.id); sayWord(s); }}
                  className={`flex flex-col items-center justify-center gap-1 p-4 min-h-[130px] rounded-3xl border-2 font-black text-lg active:scale-95 transition ${cat.color}`}
                >
                  <SignPicture sign={s} size="w-20 h-20" />
                  {s.word}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  const renderVideos = () => (
    <div className="space-y-4">
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-sm text-amber-950">
        Only a handful of ASL clips are openly licensed for reuse, so this section is small. All clips are shared under
        Creative Commons with credit shown. For many more signs, use the "See it signed" links inside each dictionary entry, or browse{' '}
        <a
          className="underline font-bold"
          target="_blank"
          rel="noopener noreferrer"
          href="https://commons.wikimedia.org/wiki/Category:Videos_of_American_Sign_Language"
        >
          Wikimedia Commons
        </a>.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ASL_VIDEOS.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  );

  return (
    <div className="p-4 pb-28 max-w-5xl mx-auto">
      <header className="mb-3">
        <h1 className="text-3xl font-black text-slate-900">🤟 Sign Language (ASL)</h1>
        <p className="text-sm text-slate-600">Learn signs and use them with your AAC board.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); playChime('tap'); }}
            className={`shrink-0 min-h-[48px] px-4 rounded-2xl border-2 font-black ${
              tab === t.id ? 'bg-purple-500 text-white border-purple-600 shadow-md' : 'bg-white text-slate-800 border-slate-300'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === 'dictionary' && renderDictionary()}
      {tab === 'learn' && renderLearn()}
      {tab === 'aac' && renderAac()}
      {tab === 'needs' && renderNeeds()}
      {tab === 'videos' && renderVideos()}

      {openSignObj && renderDetail(openSignObj)}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold shadow-xl" role="status">
          {toast}
        </div>
      )}
    </div>
  );
};

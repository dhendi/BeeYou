const fs = require('fs');
const path = require('path');

const masterKeys = JSON.parse(fs.readFileSync(path.join(__dirname, 'master-keys.json'), 'utf8'));

// Language code map for Google Translate API
const LANG_MAP = {
  vi: 'vi',
  zh: 'zh-CN',
  el: 'el',
  de: 'de',
  ru: 'ru',
  ko: 'ko',
};

// Curated overrides for AAC pronouns, language labels, and core buttons
const CURATED_OVERRIDES = {
  vi: {
    'Choose Language': 'Chọn ngôn ngữ',
    'Select your preferred language': 'Chọn ngôn ngữ bạn muốn sử dụng',
    'Instant zero-download speech and vocabulary translation': 'Dịch giọng nói và từ vựng tức thì không cần tải thêm',
    'English': 'Tiếng Anh',
    'English (US)': 'Tiếng Anh (Mỹ)',
    'Filipino': 'Tiếng Filipino',
    'Wikang Filipino / Tagalog': 'Tiếng Filipino / Tagalog',
    'Spanish': 'Tiếng Tây Ban Nha',
    'Español': 'Tiếng Tây Ban Nha',
    'French (France)': 'Tiếng Pháp (Pháp)',
    'French (Canadian)': 'Tiếng Pháp (Canada)',
    'Français (France)': 'Tiếng Pháp (Pháp)',
    'Français (Canada)': 'Tiếng Pháp (Canada)',
    'Français (Canada / QC)': 'Tiếng Pháp (Canada / QC)',
    'German': 'Tiếng Đức',
    'Deutsch': 'Tiếng Đức',
    'Greek': 'Tiếng Hy Lạp',
    'Ελληνικά': 'Tiếng Hy Lạp',
    'Russian': 'Tiếng Nga',
    'Русский': 'Tiếng Nga',
    'Vietnamese': 'Tiếng Việt',
    'Tiếng Việt': 'Tiếng Việt',
    'Chinese': 'Tiếng Trung',
    '中文': 'Tiếng Trung',
    'Japanese': 'Tiếng Nhật',
    '日本語': 'Tiếng Nhật',
    'Korean': 'Tiếng Hàn',
    '한국어': 'Tiếng Hàn',
    'I / Me': 'Tôi',
    'My / Mine': 'Của tôi',
    'Hurt / Pain': 'Đau',
    'Toilet / Potty': 'Nhà vệ sinh',
    'See / Look': 'Nhìn',
    'Don\'t / Not': 'Không',
  },
  zh: {
    'Choose Language': '选择语言',
    'Select your preferred language': '请选择您的首选语言',
    'Instant zero-download speech and vocabulary translation': '即时免下载语音与词汇翻译',
    'English': '英语',
    'English (US)': '英语（美国）',
    'Filipino': '菲律宾语',
    'Wikang Filipino / Tagalog': '菲律宾语 / 他加禄语',
    'Spanish': '西班牙语',
    'Español': '西班牙语',
    'French (France)': '法语（法国）',
    'French (Canadian)': '法语（加拿大）',
    'Français (France)': '法语（法国）',
    'Français (Canada)': '法语（加拿大）',
    'Français (Canada / QC)': '法语（加拿大 / 魁北克）',
    'German': '德语',
    'Deutsch': '德语',
    'Greek': '希腊语',
    'Ελληνικά': '希腊语',
    'Russian': '俄语',
    'Русский': '俄语',
    'Vietnamese': '越南语',
    'Tiếng Việt': '越南语',
    'Chinese': '中文',
    '中文': '中文',
    'Japanese': '日语',
    '日本語': '日语',
    'Korean': '韩语',
    '한국어': '韩语',
    'I / Me': '我',
    'My / Mine': '我的',
    'Hurt / Pain': '痛',
    'Toilet / Potty': '厕所',
    'See / Look': '看',
    'Don\'t / Not': '不要',
  },
  el: {
    'Choose Language': 'Επιλέξτε γλώσσα',
    'Select your preferred language': 'Επιλέξτε την προτιμώμενη γλώσσα σας',
    'Instant zero-download speech and vocabulary translation': 'Άμεση μετάφραση ομιλίας και λεξιλογίου χωρίς λήψη',
    'English': 'Αγγλικά',
    'English (US)': 'Αγγλικά (ΗΠΑ)',
    'Filipino': 'Φιλιππινέζικα',
    'Wikang Filipino / Tagalog': 'Φιλιππινέζικα / Ταγκαλόγκ',
    'Spanish': 'Ισπανικά',
    'Español': 'Ισπανικά',
    'French (France)': 'Γαλλικά (Γαλλία)',
    'French (Canadian)': 'Γαλλικά (Καναδάς)',
    'Français (France)': 'Γαλλικά (Γαλλία)',
    'Français (Canada)': 'Γαλλικά (Καναδάς)',
    'Français (Canada / QC)': 'Γαλλικά (Καναδάς / QC)',
    'German': 'Γερμανικά',
    'Deutsch': 'Γερμανικά',
    'Greek': 'Ελληνικά',
    'Ελληνικά': 'Ελληνικά',
    'Russian': 'Ρωσικά',
    'Русский': 'Ρωσικά',
    'Vietnamese': 'Βιετναμέζικα',
    'Tiếng Việt': 'Βιετναμέζικα',
    'Chinese': 'Κινεζικά',
    '中文': 'Κινεζικά',
    'Japanese': 'Ιαπωνικά',
    '日本語': 'Ιαπωνικά',
    'Korean': 'Κορεατικά',
    '한국어': 'Κορεατικά',
    'I / Me': 'Εγώ',
    'My / Mine': 'Δικό μου',
    'Hurt / Pain': 'Πόνος',
    'Toilet / Potty': 'Τουαλέτα',
    'See / Look': 'Κοιτάζω',
    'Don\'t / Not': 'Όχι',
  },
  de: {
    'Choose Language': 'Sprache wählen',
    'Select your preferred language': 'Wählen Sie Ihre bevorzugte Sprache',
    'Instant zero-download speech and vocabulary translation': 'Sofortige Übersetzung von Sprache und Vokabular ohne Download',
    'English': 'Englisch',
    'English (US)': 'Englisch (USA)',
    'Filipino': 'Filipino',
    'Wikang Filipino / Tagalog': 'Filipino / Tagalog',
    'Spanish': 'Spanisch',
    'Español': 'Spanisch',
    'French (France)': 'Französisch (Frankreich)',
    'French (Canadian)': 'Französisch (Kanada)',
    'Français (France)': 'Französisch (Frankreich)',
    'Français (Canada)': 'Französisch (Kanada)',
    'Français (Canada / QC)': 'Französisch (Kanada / QC)',
    'German': 'Deutsch',
    'Deutsch': 'Deutsch',
    'Greek': 'Griechisch',
    'Ελληνικά': 'Griechisch',
    'Russian': 'Russisch',
    'Русский': 'Russisch',
    'Vietnamese': 'Vietnamesisch',
    'Tiếng Việt': 'Vietnamesisch',
    'Chinese': 'Chinesisch',
    '中文': 'Chinesisch',
    'Japanese': 'Japanisch',
    '日本語': 'Japanisch',
    'Korean': 'Koreanisch',
    '한국어': 'Koreanisch',
    'I / Me': 'Ich',
    'My / Mine': 'Mein',
    'Hurt / Pain': 'Schmerz',
    'Toilet / Potty': 'Toilette',
    'See / Look': 'Sehen',
    'Don\'t / Not': 'Nicht',
  },
  ru: {
    'Choose Language': 'Выберите язык',
    'Select your preferred language': 'Выберите желаемый язык',
    'Instant zero-download speech and vocabulary translation': 'Мгновенный перевод речи и словарного запаса без загрузок',
    'English': 'Английский',
    'English (US)': 'Английский (США)',
    'Filipino': 'Филиппинский',
    'Wikang Filipino / Tagalog': 'Филиппинский / Тагальский',
    'Spanish': 'Испанский',
    'Español': 'Испанский',
    'French (France)': 'Французский (Франция)',
    'French (Canadian)': 'Французский (Канада)',
    'Français (France)': 'Французский (Франция)',
    'Français (Canada)': 'Французский (Канада)',
    'Français (Canada / QC)': 'Французский (Канада / QC)',
    'German': 'Немецкий',
    'Deutsch': 'Немецкий',
    'Greek': 'Греческий',
    'Ελληνικά': 'Греческий',
    'Russian': 'Русский',
    'Русский': 'Русский',
    'Vietnamese': 'Вьетнамский',
    'Tiếng Việt': 'Вьетнамский',
    'Chinese': 'Китайский',
    '中文': 'Китайский',
    'Japanese': 'Японский',
    '日本語': 'Японский',
    'Korean': 'Корейский',
    '한국어': 'Корейский',
    'I / Me': 'Я',
    'My / Mine': 'Мой',
    'Hurt / Pain': 'Больно',
    'Toilet / Potty': 'Туалет',
    'See / Look': 'Смотреть',
    'Don\'t / Not': 'Не надо',
  },
  ko: {
    'Choose Language': '언어 선택',
    'Select your preferred language': '원하는 언어를 선택하세요',
    'Instant zero-download speech and vocabulary translation': '다운로드 없는 즉각적인 음성 및 어휘 번역',
    'English': '영어',
    'English (US)': '영어 (미국)',
    'Filipino': '필리핀어',
    'Wikang Filipino / Tagalog': '필리핀어 / 타갈로그어',
    'Spanish': '스페인어',
    'Español': '스페인어',
    'French (France)': '프랑스어 (프랑스)',
    'French (Canadian)': '프랑스어 (캐나다)',
    'Français (France)': '프랑스어 (프랑스)',
    'Français (Canada)': '프랑스어 (캐나다)',
    'Français (Canada / QC)': '프랑스어 (캐나다 / 퀘벡)',
    'German': '독일어',
    'Deutsch': '독일어',
    'Greek': '그리스어',
    'Ελληνικά': '그리스어',
    'Russian': '러시아어',
    'Русский': '러시아어',
    'Vietnamese': '베트남어',
    'Tiếng Việt': '베트남어',
    'Chinese': '중국어',
    '中文': '중국어',
    'Japanese': '일본어',
    '日本語': '일본어',
    'Korean': '한국어',
    '한국어': '한국어',
    'I / Me': '나',
    'My / Mine': '내 것',
    'Hurt / Pain': '아파요',
    'Toilet / Potty': '화장실',
    'See / Look': '보기',
    'Don\'t / Not': '안 돼요',
  },
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateBatch(items, targetLang) {
  const text = items.join('\n');
  const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (res.ok) {
        const data = await res.json();
        const fullTranslated = (data[0] || []).map(entry => entry[0]).join('');
        const lines = fullTranslated.split('\n').map(l => l.trim());
        
        // Match 1:1 if line count matches
        if (lines.length >= items.length) {
          const result = {};
          for (let i = 0; i < items.length; i++) {
            result[items[i]] = lines[i] || items[i];
          }
          return result;
        }
      }
    } catch (e) {
      // Retry after backoff
    }
    await sleep(200 * attempt);
  }

  // Fallback: translate individually
  const result = {};
  for (const item of items) {
    try {
      const itemUrl = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(item)}`;
      const res = await fetch(itemUrl);
      if (res.ok) {
        const data = await res.json();
        result[item] = data?.[0]?.[0]?.[0] || item;
      } else {
        result[item] = item;
      }
    } catch {
      result[item] = item;
    }
    await sleep(30);
  }
  return result;
}

async function buildLocale(langKey) {
  const targetGoogleLang = LANG_MAP[langKey];
  console.log(`\n========================================`);
  console.log(`Generating locale [${langKey}] (${targetGoogleLang})...`);
  console.log(`========================================`);

  const dict = {};
  const overrides = CURATED_OVERRIDES[langKey] || {};

  // Check if existing file has some keys
  const targetPath = path.join(__dirname, '..', 'public', 'locales', `${langKey}.json`);
  if (fs.existsSync(targetPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      Object.assign(dict, existing);
    } catch {}
  }

  // Apply curated overrides
  Object.assign(dict, overrides);

  // Find remaining untranslated keys
  const needed = masterKeys.filter(k => !dict[k]);
  console.log(`Total keys: ${masterKeys.length}, Already translated: ${Object.keys(dict).length}, Remaining needed: ${needed.length}`);

  const BATCH_SIZE = 20;
  for (let i = 0; i < needed.length; i += BATCH_SIZE) {
    const chunk = needed.slice(i, i + BATCH_SIZE);
    const translatedMap = await translateBatch(chunk, targetGoogleLang);
    Object.assign(dict, translatedMap);
    
    // Save progress periodically
    process.stdout.write(`  Progress: ${Math.min(i + BATCH_SIZE, needed.length)} / ${needed.length} keys...\r`);
    await sleep(80);
  }

  // Re-apply curated overrides so high-priority AAC & language terms are pristine
  Object.assign(dict, overrides);

  // Write finalized JSON
  fs.writeFileSync(targetPath, JSON.stringify(dict, null, 2), 'utf8');
  console.log(`\n[SUCCESS] Wrote ${Object.keys(dict).length} keys to public/locales/${langKey}.json`);
}

async function main() {
  const langs = ['vi', 'zh', 'el', 'de', 'ru', 'ko'];
  for (const l of langs) {
    await buildLocale(l);
  }
  console.log('\nAll 6 locales built successfully!');
}

main().catch(console.error);

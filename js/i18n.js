(() => {
  const LANG_KEY = 'miray.lang';
  const SUPPORTED = ['en', 'tr'];
  const DEFAULT_LANG = 'en';

  let translations = null;
  let currentLang = null;

  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();

  const getInitialLang = () => {
    const stored = localStorage.getItem(LANG_KEY);
    if (SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.language || '').split('-')[0].toLowerCase();
    return SUPPORTED.includes(browser) ? browser : DEFAULT_LANG;
  };

  const apply = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;
    const dict = (translations && translations[lang]) || null;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!textOriginals.has(el)) textOriginals.set(el, el.textContent);
      const original = textOriginals.get(el);
      el.textContent = dict && dict[key] !== undefined ? dict[key] : original;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      let bag = attrOriginals.get(el);
      if (!bag) { bag = {}; attrOriginals.set(el, bag); }
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (!attr || !key) return;
        if (bag[attr] === undefined) bag[attr] = el.getAttribute(attr) ?? '';
        el.setAttribute(attr, dict && dict[key] !== undefined ? dict[key] : bag[attr]);
      });
    });

    document.querySelectorAll('#lang-switch').forEach(sel => { sel.value = lang; });
  };

  const wireDropdown = () => {
    document.querySelectorAll('#lang-switch').forEach(sel => {
      if (sel.dataset.i18nBound) return;
      sel.dataset.i18nBound = '1';
      sel.value = currentLang;
      sel.addEventListener('change', () => {
        const lang = sel.value;
        localStorage.setItem(LANG_KEY, lang);
        console.info('[i18n] switching to', lang);
        apply(lang);
      });
      console.info('[i18n] dropdown wired');
    });
  };

  const boot = async () => {
    currentLang = getInitialLang();
    try {
      const res = await fetch('/i18n/translations.json?v=3', { cache: 'no-cache' });
      translations = await res.json();
      console.info('[i18n] loaded. initial lang:', currentLang, 'tr keys:', Object.keys(translations.tr || {}).length);
    } catch (err) {
      console.error('[i18n] translations load failed:', err);
      translations = {};
    }
    apply(currentLang);
    wireDropdown();
  };

  boot();

  document.addEventListener('partials:loaded', () => {
    apply(currentLang);
    wireDropdown();
  });
})();

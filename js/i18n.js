(() => {
  const LANG_KEY = 'miray.lang';
  const SUPPORTED = ['en', 'tr'];
  const DEFAULT_LANG = 'en';

  let translations = null;
  let currentLang = null;

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
      const original = el.dataset.i18nOriginal ?? el.textContent;
      if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = original;
      el.textContent = dict && dict[key] !== undefined ? dict[key] : original;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const pairs = el.dataset.i18nAttr.split(',');
      pairs.forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (!attr || !key) return;
        const storeKey = 'i18nOrigAttr_' + attr;
        const original = el.dataset[storeKey] ?? el.getAttribute(attr) ?? '';
        if (!el.dataset[storeKey]) el.dataset[storeKey] = original;
        el.setAttribute(attr, dict && dict[key] !== undefined ? dict[key] : original);
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
        apply(lang);
      });
    });
  };

  const boot = async () => {
    currentLang = getInitialLang();
    try {
      const res = await fetch('/i18n/translations.json');
      translations = await res.json();
    } catch (err) {
      console.error('i18n load failed:', err);
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

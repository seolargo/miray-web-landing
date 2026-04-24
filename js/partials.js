(async () => {
  const body = document.body;
  const headerUrl = body.dataset.header || '/partials/header.html';
  const footerUrl = body.dataset.footer || '/partials/footer.html';

  const inject = async (id, url) => {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      el.outerHTML = await res.text();
    } catch (err) {
      console.error('partial load failed:', url, err);
    }
  };

  await Promise.all([
    inject('site-header', headerUrl),
    inject('site-footer', footerUrl)
  ]);

  const page = body.dataset.page;
  if (page) {
    document.querySelectorAll(`nav a[data-page="${page}"]`).forEach(a => {
      a.classList.remove('hover:text-primary');
      a.classList.add('text-primary', 'font-bold');
    });
  }
})();

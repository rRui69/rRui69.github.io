document.addEventListener('DOMContentLoaded', () => {
  const script = document.currentScript || (function(){ const s = document.getElementsByTagName('script'); return s[s.length-1]; })();
  const base = script && script.src ? script.src.replace(/include-sidebar-clean\.js.*$/, '') : './';

  fetch(base + 'sidebar.html')
    .then(r => r.text())
    .then(html => {
      const placeholder = document.getElementById('sidebar-placeholder');
      if (!placeholder) return;
      placeholder.innerHTML = html;

      // ensure admin-dashboard css is loaded
      const cssHref = base + 'admin-dashboard.css';
      if (!document.querySelector(`link[href="${cssHref}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
      }

      // wire toggle button and nav behavior
      const sidebar = document.getElementById('sidebar');
      const toggle = document.getElementById('sidebarToggle');
      toggle && toggle.addEventListener('click', () => sidebar.classList.toggle('show'));

      // mark active link by matching href with current location
      const links = document.querySelectorAll('#sidebarMenu .nav-link');
      const current = window.location.pathname.split('/').pop() || 'dashboard.html';
      links.forEach(a => {
        const href = a.getAttribute('href').split('/').pop();
        if (href === current) a.classList.add('active');
      });
    })
    .catch(err => console.error('Loading sidebar failed', err));
});

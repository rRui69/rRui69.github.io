document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  toggle && toggle.addEventListener('click', () => sidebar.classList.toggle('show'));

  document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href !== '#') return; // allow normal navigation for real pages
      e.preventDefault();
      document.querySelectorAll('#sidebarMenu .nav-link').forEach(n => n.classList.remove('active'));
      link.classList.add('active');
      const text = link.textContent.trim();
      const contentArea = document.getElementById('contentArea');
      if(contentArea) contentArea.innerHTML = `<h2>${text}</h2><p>Content for ${text} goes here.</p>`;
      if(window.innerWidth < 768) sidebar.classList.remove('show');
    });
  });
});

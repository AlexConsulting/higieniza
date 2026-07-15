// =============================================
// HIGIENIZA AÍ — app-lite.js (versão leve, só WhatsApp)
// =============================================

// THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
themeToggle?.addEventListener('click', () => {
  const atual = htmlEl.getAttribute('data-theme');
  const novo = atual === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', novo);
  localStorage.setItem('theme', novo);
});

// MENU MOBILE
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');
navBurger?.addEventListener('click', () => {
  navMobile?.classList.toggle('open');
  navBurger.classList.toggle('active');
});
// Fecha o menu ao clicar num link
document.querySelectorAll('.nav-mobile a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile?.classList.remove('open');
    navBurger?.classList.remove('active');
  });
});

// SCROLL SUAVE para âncoras internas
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const alvo = document.querySelector(link.getAttribute('href'));
    if (alvo) {
      e.preventDefault();
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// NAVBAR com sombra ao rolar
const nav = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) nav?.classList.add('scrolled');
  else nav?.classList.remove('scrolled');
});

// RASTREAMENTO DE CLIQUES NO WHATSAPP (importante para medir os anúncios)
document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
  btn.addEventListener('click', () => {
    // Meta Pixel — evento de Lead
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', { content_name: 'Clique WhatsApp' });
    }
    // Google Tag Manager — evento personalizado
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({ event: 'clique_whatsapp' });
    }
  });
});

// ANIMAÇÃO DE ENTRADA dos elementos ao rolar
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .step-card, .testimonial-card, .benefit-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

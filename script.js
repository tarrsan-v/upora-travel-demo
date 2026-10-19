(() => {
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('mainNav');
  const menuToggle = document.getElementById('menuToggle');
  const floating = document.querySelector('.floating-enquire');
  let lastY = window.scrollY;
  let ticking = false;

  function updateScrollState() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    if (window.innerWidth > 780) {
      if (y > 180 && y > lastY + 5) header.classList.add('header-hidden');
      else if (y < lastY - 4 || y < 80) header.classList.remove('header-hidden');
    } else header.classList.remove('header-hidden');
    floating.classList.toggle('visible', y > 650);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(updateScrollState); ticking = true; } }, { passive: true });
  updateScrollState();

  function closeMenu() {
    nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation'); document.body.classList.remove('menu-open');
  }
  menuToggle.addEventListener('click', () => {
    const opening = !nav.classList.contains('open');
    nav.classList.toggle('open', opening); menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation'); document.body.classList.toggle('menu-open', opening);
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); closeMenu(); target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', id); }
  }));
  window.addEventListener('resize', () => { if (window.innerWidth > 780) closeMenu(); });

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  const quoteObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); }), { threshold: .25 });
  quoteObserver.observe(document.querySelector('.quote-section'));

  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const cards = [...document.querySelectorAll('.package-card')];
  const packageCount = document.getElementById('packageCount');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.toggle('active', b === button));
    const filter = button.dataset.filter; let visible = 0;
    cards.forEach(card => { const show = filter === 'all' || card.dataset.category === filter; card.classList.toggle('is-hidden', !show); if (show) { visible++; card.classList.remove('is-visible'); requestAnimationFrame(() => card.classList.add('is-visible')); } });
    packageCount.textContent = String(visible).padStart(2, '0');
  }));
  document.querySelectorAll('[data-destination]').forEach(card => card.addEventListener('click', () => {
    const destination = card.dataset.destination;
    const filter = destination === 'Kerala' ? 'kerala' : destination === 'Ooty' ? 'hills' : 'coast';
    filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    let visible = 0; cards.forEach(c => { const show = c.dataset.category === filter; c.classList.toggle('is-hidden', !show); if (show) visible++; }); packageCount.textContent = String(visible).padStart(2, '0');
  }));
  document.querySelectorAll('[data-package]').forEach(button => button.addEventListener('click', () => {
    const select = document.querySelector('select[name="destination"]');
    const msg = document.querySelector('textarea[name="message"]');
    const packageName = button.dataset.package;
    if (msg) msg.value = `I'm interested in the ${packageName} package. Please share the full itinerary and availability.`;
    if (select) { const map = packageName.includes('Pondicherry') ? 'Pondicherry' : packageName.includes('Ooty') || packageName.includes('Kodaikanal') ? 'Ooty / Kodaikanal' : packageName.includes('Munnar') || packageName.includes('Backwater') || packageName.includes('Wayanad') ? 'Kerala' : ''; if (map) select.value = map; }
  }));

  const reviews = [
    { quote: '“Everything felt easy, from the first conversation to the little details along the way. We came back with photos, stories and a list of places to visit next.”', name: 'Ananya K.', initials: 'AK', trip: 'Sample guest · Kerala getaway' },
    { quote: '“The itinerary had the right balance of exploring and slowing down. The little café stops and scenic detours became our favourite memories.”', name: 'Rahul & Meera', initials: 'RM', trip: 'Sample guests · Hill escape' },
    { quote: '“Planning a short break felt surprisingly simple. We knew what to expect, had time to ourselves and came home already talking about our next trip.”', name: 'Divya S.', initials: 'DS', trip: 'Sample guest · Coastal break' }
  ];
  let reviewIndex = 0;
  const reviewCard = document.querySelector('.testimonial-card');
  function renderReview() {
    const r = reviews[reviewIndex];
    reviewCard.querySelector('blockquote').textContent = r.quote;
    reviewCard.querySelector('.reviewer-avatar').textContent = r.initials;
    reviewCard.querySelector('.reviewer strong').textContent = r.name;
    reviewCard.querySelector('.reviewer>div:nth-child(2) span').textContent = r.trip;
    reviewCard.querySelector('.testimonial-controls>span').innerHTML = `<b>${String(reviewIndex + 1).padStart(2, '0')}</b> / 03`;
  }
  document.getElementById('prevReview').addEventListener('click', () => { reviewIndex = (reviewIndex + reviews.length - 1) % reviews.length; renderReview(); });
  document.getElementById('nextReview').addEventListener('click', () => { reviewIndex = (reviewIndex + 1) % reviews.length; renderReview(); });

  const form = document.getElementById('enquiryForm');
  const status = document.getElementById('formStatus');
  const toast = document.getElementById('toast'); let toastTimer;
  function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3600); }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Trip enquiry — ${data.get('destination')} | Upora Travels`;
    const body = [`Name: ${data.get('name')}`, `Phone: ${data.get('phone')}`, `Email: ${data.get('email') || 'Not provided'}`, `Destination: ${data.get('destination')}`, `Travellers: ${data.get('travellers')}`, `Message: ${data.get('message') || 'Please contact me with package details.'}`].join('\n');
    status.textContent = 'Your email app will open with your enquiry details. This demo does not send or store information.';
    showToast('Enquiry prepared — choose an email app to continue.');
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();

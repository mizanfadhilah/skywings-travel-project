(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobile navigation
  const menuButton = $('#menu-btn');
  const navLinks = $('#nav-links');
  function closeMenu() {
    if (!menuButton || !navLinks) return;
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    const icon = $('i', menuButton);
    if (icon) icon.className = 'ri-menu-line';
  }
  if (menuButton && navLinks) {
    menuButton.setAttribute('role', 'button');
    menuButton.setAttribute('tabindex', '0');
    menuButton.setAttribute('aria-label', 'Buka atau tutup menu navigasi');
    menuButton.setAttribute('aria-expanded', 'false');
    const toggleMenu = () => {
      const open = navLinks.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      const icon = $('i', menuButton);
      if (icon) icon.className = open ? 'ri-close-line' : 'ri-menu-line';
    };
    menuButton.addEventListener('click', toggleMenu);
    menuButton.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
    });
    $$('.nav__links a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  }

  // Navbar shadow while scrolling
  const nav = $('nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal sections as they enter the viewport
  const revealTargets = $$('.section__header, .section__description, .destination__card, .journey__card, .showcase__image, .showcase__content, .banner__card, .discover__card, .client__card, .footer__col');
  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(index % 3) * 80}ms`;
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => observer.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  // Swiper testimonial carousel, with a graceful fallback if CDN is unavailable
  if (window.Swiper && $('.swiper')) {
    new Swiper('.swiper', {
      loop: true,
      spaceBetween: 24,
      autoplay: { delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpoints: {
        0: { slidesPerView: 1 },
        680: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  } else if ($('.swiper-wrapper')) {
    $('.swiper-wrapper').style.gap = '20px';
    $$('.swiper-slide').forEach(slide => { slide.style.minWidth = 'min(100%, 320px)'; });
  }

  // Small toast notifications
  let toastTimer;
  function showToast(message) {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3600);
  }

  // Booking modal is created dynamically so the original HTML can stay simple
  let modal;
  function createBookingModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'presentation');
    modal.innerHTML = `
      <section class="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button type="button" class="modal-close" aria-label="Tutup formulir">&times;</button>
        <h2 id="booking-title">Rencanakan perjalananmu</h2>
        <p>Isi detail awal perjalanan. Tim Skywings dapat menghubungimu untuk konfirmasi.</p>
        <form class="booking-form">
          <label>Nama lengkap<input name="name" autocomplete="name" required maxlength="80" placeholder="Nama kamu"></label>
          <label>Email<input name="email" type="email" autocomplete="email" required placeholder="nama@email.com"></label>
          <label>Destinasi pilihan
            <select name="destination" required>
              <option value="">Pilih destinasi</option>
              <option>Bali, Indonesia</option><option>Paris, France</option><option>New York City, USA</option><option>Swiss Alps</option><option>Destinasi lainnya</option>
            </select>
          </label>
          <label>Tanggal keberangkatan<input name="date" type="date" required></label>
          <button class="btn" type="submit">Kirim permintaan <i class="ri-arrow-right-line"></i></button>
        </form>
      </section>`;
    document.body.appendChild(modal);
    const close = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    };
    $('.modal-close', modal).addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
    const dateInput = $('input[name="date"]', modal);
    const today = new Date();
    dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    $('.booking-form', modal).addEventListener('submit', e => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const request = {
        name: String(form.get('name') || '').trim(),
        email: String(form.get('email') || '').trim(),
        destination: String(form.get('destination') || ''),
        date: String(form.get('date') || '')
      };
      if (!request.name || !request.email || !request.destination || !request.date) {
        showToast('Lengkapi semua kolom terlebih dahulu.');
        return;
      }
      // Demo only: no booking is sent to a server.
      close();
      e.currentTarget.reset();
      showToast(`Terima kasih, ${request.name}! Permintaan demo untuk ${request.destination} sudah tercatat di halaman ini.`);
      console.info('Demo booking request (not sent to a server):', request);
    });
    return modal;
  }
  function openBooking() {
    const box = createBookingModal();
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => $('input[name="name"]', box).focus(), 80);
  }
  // Any booking-like button opens the same form
  $$('button, .nav__links a').forEach(el => {
    const label = (el.textContent || '').trim().toLowerCase();
    if (label.includes('book trip') || label.includes('book a trip') || label.includes('book a flight') || label === 'book trip now') {
      el.addEventListener('click', e => {
        e.preventDefault();
        openBooking();
      });
    }
  });

  // The play icon presents a helpful explainer instead of navigating to "#"
  const playLink = $('.header__btns a');
  if (playLink) {
    playLink.setAttribute('aria-label', 'Tentang pengalaman perjalanan Skywings');
    playLink.addEventListener('click', e => {
      e.preventDefault();
      $('#about')?.scrollIntoView({ behavior: 'smooth' });
      showToast('Temukan inspirasi destinasi perjalananmu di bawah ini.');
    });
  }

  // Subscribe form: front-end validation only
  const subscribeForm = $('footer form');
  if (subscribeForm) {
    const email = $('input', subscribeForm);
    if (email) {
      email.type = 'email';
      email.name = email.name || 'email';
      email.required = true;
      email.setAttribute('aria-label', 'Alamat email untuk berlangganan');
    }
    subscribeForm.addEventListener('submit', e => {
      e.preventDefault();
      if (email && email.checkValidity() && email.value.trim()) {
        showToast('Terima kasih sudah berlangganan! (Demo: belum terhubung ke server.)');
        subscribeForm.reset();
      } else if (email) {
        email.reportValidity();
      }
    });
  }

  // Highlight the current navigation section
  const sections = $$('header#home, section[id], footer#contact');
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          $$('.nav__links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Ensure the copyright year stays current
  const footerBar = $('.footer__bar');
  if (footerBar) footerBar.innerHTML = footerBar.innerHTML.replace(/Copyright ©\\s*\\d{4}/i, `Copyright © ${new Date().getFullYear()}`);
})();

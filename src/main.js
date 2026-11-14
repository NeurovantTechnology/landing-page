import { createClient } from '@supabase/supabase-js';

const viteEnv = /** @type {ImportMeta & {env: {VITE_SUPABASE_URL?: string, VITE_SUPABASE_PUBLISHABLE_KEY?: string}}} */ (import.meta).env;
const supabaseUrl = viteEnv.VITE_SUPABASE_URL;
const supabasePublishableKey = viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const menuLabel = menuToggle?.querySelector('.sr-only');
const projectDropdown = document.querySelector('[data-project-dropdown]');
const projectToggle = projectDropdown?.querySelector('[data-project-toggle]');
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];
const contentLinks = navLinks;
const sections = [...document.querySelectorAll('main section[id]')];
const logoScrollTrack = document.querySelector('[data-logo-scroll-track]');
const logoIntro = document.querySelector('[data-logo-intro]');
const logoFill = document.querySelector('[data-logo-fill]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavigation = window.matchMedia('(max-width: 50rem)');
const revealItems = [...document.querySelectorAll('[data-reveal]')];
const contactForm = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('#form-status');
const leaderboard = document.querySelector('[data-leaderboard]');
const referralCodeInput = document.querySelector('[data-referral-code]');
const referralPanel = document.querySelector('[data-referral-panel]');
const referralLinkInput = document.querySelector('[data-referral-link]');

if (referralCodeInput instanceof HTMLInputElement) {
  referralCodeInput.value = new URLSearchParams(window.location.search).get('ref')?.trim().slice(0, 16) ?? '';
}

async function loadLeaderboard() {
  if (!(leaderboard instanceof HTMLOListElement)) return;
  if (!supabase) {
    leaderboard.innerHTML = '<li class="nv-leaderboard__empty">The waitlist is getting ready.</li>';
    return;
  }
  const { data, error } = await supabase.functions.invoke('waitlist-leaderboard', { method: 'GET' });
  leaderboard.replaceChildren();
  if (error || !Array.isArray(data)) {
    const item = document.createElement('li');
    item.className = 'nv-leaderboard__empty';
    item.textContent = 'Leaderboard temporarily unavailable.';
    leaderboard.append(item);
    return;
  }
  if (!data.length) {
    const item = document.createElement('li');
    item.className = 'nv-leaderboard__empty';
    item.textContent = 'Be the first to join the list.';
    leaderboard.append(item);
    return;
  }
  data.slice(0, 50).forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'nv-leaderboard__row';
    const rank = document.createElement('span');
    rank.className = 'nv-leaderboard__rank';
    rank.textContent = String(entry.rank).padStart(2, '0');
    const name = document.createElement('span');
    name.className = 'nv-leaderboard__name';
    name.textContent = entry.display_name;
    const count = document.createElement('span');
    count.className = 'nv-leaderboard__count';
    count.textContent = String(entry.referral_count);
    item.append(rank, name, count);
    leaderboard.append(item);
  });
}

async function showReferralLink(userId) {
  if (!supabase || !(referralPanel instanceof HTMLElement) || !(referralLinkInput instanceof HTMLInputElement)) return;
  const { data } = await supabase.from('waitlist_members').select('referral_code').eq('user_id', userId).maybeSingle();
  if (!data?.referral_code) return;
  referralLinkInput.value = new URL('/?ref=' + encodeURIComponent(data.referral_code), window.location.origin).toString();
  referralPanel.hidden = false;
}

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) showReferralLink(data.session.user.id);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) queueMicrotask(() => showReferralLink(session.user.id));
  });
}
loadLeaderboard();

function setProjectMenu(open, { focusFirst = false, returnFocus = false } = {}) {
  if (!(projectToggle instanceof HTMLButtonElement) || !(projectDropdown instanceof HTMLElement)) return;

  projectToggle.setAttribute('aria-expanded', String(open));
  projectDropdown.classList.toggle('is-open', open);

  if (open && focusFirst) {
    const firstItem = projectDropdown.querySelector('a');
    if (firstItem instanceof HTMLElement) firstItem.focus();
  }

  if (!open && returnFocus) projectToggle.focus();
}

function setMenu(open, { focusFirst = false, returnFocus = false } = {}) {
  if (!menuToggle || !nav) return;
  setProjectMenu(false);
  menuToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  if (mobileNavigation.matches) {
    nav.setAttribute('aria-hidden', String(!open));
  } else {
    nav.removeAttribute('aria-hidden');
  }
  document.body.classList.toggle('menu-open', open);
  if (menuLabel) menuLabel.textContent = open ? 'Close navigation' : 'Open navigation';

  if (open && focusFirst && navLinks[0] instanceof HTMLElement) navLinks[0].focus();
  if (!open && returnFocus && menuToggle instanceof HTMLElement) menuToggle.focus();
}

if (nav && mobileNavigation.matches) nav.setAttribute('aria-hidden', 'true');
mobileNavigation.addEventListener?.('change', (event) => {
  if (event.matches) {
    nav?.setAttribute('aria-hidden', 'true');
  } else {
    setMenu(false);
  }
});

function updateHeader() {
  const trackRect = logoScrollTrack instanceof HTMLElement ? logoScrollTrack.getBoundingClientRect() : null;
  const logoFramePinned = trackRect && logoIntro instanceof HTMLElement
    && trackRect.top <= 0
    && trackRect.bottom > logoIntro.offsetHeight;

  header?.classList.toggle('is-scrolled', window.scrollY > 24 && !logoFramePinned);
}

function updateActiveSection() {
  const threshold = window.innerHeight * 0.42;
  let activeId = sections[0]?.id;

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= threshold) activeId = section.id;
  });

  contentLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('is-active', isActive && !link.classList.contains('button'));
    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateScrollState() {
  updateHeader();
  updateActiveSection();
  updateLogoFill();
}

function updateLogoFill() {
  if (!(logoScrollTrack instanceof HTMLElement) || !(logoIntro instanceof HTMLElement) || !(logoFill instanceof HTMLElement)) return;

  const scrollDistance = logoScrollTrack.offsetHeight - logoIntro.offsetHeight;
  const progress = reducedMotion.matches || scrollDistance <= 0
    ? 1
    : Math.min(1, Math.max(0, -logoScrollTrack.getBoundingClientRect().top / scrollDistance));

  logoFill.style.setProperty('--logo-fill-progress', `${progress * 100}%`);
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenu(!isOpen, { focusFirst: !isOpen });
});

projectToggle?.addEventListener('click', () => {
  const isOpen = projectToggle.getAttribute('aria-expanded') === 'true';
  setProjectMenu(!isOpen);
});

projectToggle?.addEventListener('keydown', (event) => {
  if (!(event instanceof KeyboardEvent)) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setProjectMenu(true, { focusFirst: true });
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    setProjectMenu(true, { focusFirst: true });
  }
});

projectDropdown?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setProjectMenu(false));
});

document.addEventListener('pointerdown', (event) => {
  if (!(projectDropdown instanceof HTMLElement) || !(event.target instanceof Node)) return;
  if (!projectDropdown.contains(event.target)) setProjectMenu(false);
});

anchorLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false, { returnFocus: true });
    return;
  }

  if (projectToggle?.getAttribute('aria-expanded') === 'true') setProjectMenu(false, { returnFocus: true });
});

if (reducedMotion.matches) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

function setFormMessage(message, state = '') {
  if (!(formStatus instanceof HTMLElement)) return;
  formStatus.textContent = message;
  if (state) {
    formStatus.dataset.state = state;
  } else {
    formStatus.removeAttribute('data-state');
  }
}

function clearFormError() {
  if (!(contactForm instanceof HTMLFormElement)) return;
  contactForm.removeAttribute('data-form-state');
  setFormMessage('');
}

contactForm?.addEventListener('input', () => {
  const email = contactForm.querySelector('input[type="email"]');
  if (!(email instanceof HTMLInputElement)) return;
  const hasFormMessage = formStatus instanceof HTMLElement && Boolean(formStatus.dataset.state);
  if (email.getAttribute('aria-invalid') === 'true' || hasFormMessage) {
    email.setAttribute('aria-invalid', 'false');
    clearFormError();
  }
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!(contactForm instanceof HTMLFormElement)) return;
  const email = contactForm.querySelector('input[type="email"]');
  const displayName = contactForm.querySelector('input[name="display_name"]');
  if (!(email instanceof HTMLInputElement) || !(displayName instanceof HTMLInputElement)) return;
  const submitButton = contactForm.querySelector('button[type="submit"]');

  const value = email.value.trim();
  if (!value) {
    email.setAttribute('aria-invalid', 'true');
    contactForm.dataset.formState = 'error';
    setFormMessage('Please enter your email address.', 'error');
    email.focus();
    return;
  }

  if (!email.checkValidity()) {
    email.setAttribute('aria-invalid', 'true');
    contactForm.dataset.formState = 'error';
    setFormMessage('That email address looks incomplete. Try name@example.com.', 'error');
    email.focus();
    return;
  }

  const name = displayName.value.trim();
  if (!name || name.length > 40) {
    displayName.setAttribute('aria-invalid', 'true');
    contactForm.dataset.formState = 'error';
    setFormMessage('Enter a display name of 1–40 characters.', 'error');
    displayName.focus();
    return;
  }

  if (!supabase) {
    contactForm.dataset.formState = 'error';
    setFormMessage('The waitlist is not configured yet. Please try again soon.', 'error');
    return;
  }

  email.value = value;
  email.setAttribute('aria-invalid', 'false');
  contactForm.dataset.formState = 'pending';
  contactForm.setAttribute('aria-busy', 'true');
  setFormMessage('Joining the list…', 'pending');

  let originalButtonLabel = 'Join the list';
  if (submitButton instanceof HTMLButtonElement) {
    originalButtonLabel = submitButton.textContent?.trim() || originalButtonLabel;
    submitButton.disabled = true;
    submitButton.textContent = 'Joining…';
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + window.location.pathname,
        data: {
          signup_context: 'waitlist',
          display_name: name,
          referral_code: referralCodeInput instanceof HTMLInputElement ? referralCodeInput.value : '',
        },
      },
    });
    if (error) throw error;
    contactForm.dataset.formState = 'success';
    setFormMessage('Check your email for a sign-in link. Your referral counts after you verify.', 'success');
  } catch {
    contactForm.dataset.formState = 'error';
    setFormMessage('We could not save your email. Please try again.', 'error');
  } finally {
    contactForm.removeAttribute('aria-busy');
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonLabel;
    }
  }
});

document.querySelector('[data-copy-referral]')?.addEventListener('click', async () => {
  if (!(referralLinkInput instanceof HTMLInputElement) || !referralLinkInput.value) return;
  await navigator.clipboard.writeText(referralLinkInput.value);
  setFormMessage('Referral link copied.', 'success');
});

document.querySelectorAll('[data-year]').forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);
reducedMotion.addEventListener?.('change', () => window.location.reload());
updateScrollState();

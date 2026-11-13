import './homepage.css';
import { mountNeuroPortalFolder } from './project-folder.tsx';
import { mountHeroActions } from './hero-actions.tsx';
import { mountMissionControlStatus } from './mission-control.js';

/**
 * Mount the homepage into a host element. Call this before importing
 * `/src/main.js`, which captures navigation and signup elements at startup.
 */
export function mountNeurovantHomepage(rootElement) {
  if (!(rootElement instanceof HTMLElement)) {
    throw new TypeError('mountNeurovantHomepage requires an HTMLElement.');
  }

  rootElement.classList.add('nv-home');
  rootElement.innerHTML = `
    <header class="nv-header" data-header>
      <div class="nv-header__inner">
        <a class="nv-brand" href="#top" aria-label="Neurovant Technology home">
          <img src="/neurovant-logo.png" alt="" width="72" height="44">
          <span>Neurovant <span>Technology</span></span>
        </a>
        <button class="nv-menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" data-menu-toggle>
          <span class="sr-only">Open navigation</span><i aria-hidden="true"></i><i aria-hidden="true"></i>
        </button>
        <nav class="nv-nav-links nav-links" id="primary-navigation" aria-label="Primary navigation" data-nav>
          <a href="#about">About</a>
          <a href="#principles">Our approach</a>
          <a href="#mission-control">Mission Control</a>
          <div class="nv-dropdown" data-project-dropdown>
            <button type="button" aria-expanded="false" aria-haspopup="true" aria-controls="project-menu" data-project-toggle>
              Projects <svg class="nv-dropdown__caret" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4"></path></svg>
            </button>
            <div class="nv-dropdown__menu" id="project-menu">
              <a href="./projects/neurofit/">
                <span>NeuroPortal</span><small>A clearer view of your digital day</small>
              </a>
            </div>
          </div>
          <a href="#team">Team</a>
          <div class="nv-nav-actions">
            <a class="nv-nav-join" href="#contact">Join the list</a>
            <a class="nv-nav-discord" href="https://discord.gg/NQ3qjFDCMn" target="_blank" rel="noopener noreferrer">Discord <span aria-hidden="true">↗</span></a>
            <a class="nv-nav-support" href="https://gofund.me/3c60fae9b" target="_blank" rel="noopener noreferrer"><span class="nv-nav-support__content">Support us! <span aria-hidden="true">↗</span></span></a>
          </div>
        </nav>
      </div>
    </header>

    <main class="nv-main" id="main">
      <div class="nv-logo-scroll-track" data-logo-scroll-track>
        <section class="nv-logo-intro" id="top" data-logo-intro aria-label="Neurovant Technology logo reveal">
          <div class="nv-logo-intro__mark" aria-hidden="true">
            <div class="nv-logo-intro__fill-mask" data-logo-fill>
              <img class="nv-logo-intro__fill" src="/neurovant-logo.png" alt="" width="1254" height="1254">
            </div>
            <svg class="nv-logo-intro__outline" viewBox="140 277 1002 783" preserveAspectRatio="none" focusable="false">
              <defs>
                <linearGradient id="nv-logo-outline-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#493dff"></stop>
                  <stop offset="52%" stop-color="#a228eb"></stop>
                  <stop offset="100%" stop-color="#f10ca8"></stop>
                </linearGradient>
              </defs>
              <path d="M 1122 299 L 1119 296 L 1113 295 L 878 418 L 858 431 L 836 449 L 825 460 L 807 485 L 797 506 L 789 538 L 788 585 L 791 608 L 798 637 L 807 664 L 821 697 L 837 728 L 850 748 L 850 752 L 832 738 L 556 469 L 496 418 L 458 396 L 422 382 L 390 374 L 358 370 L 322 369 L 278 373 L 241 381 L 195 396 L 163 410 L 158 419 L 159 1037 L 164 1041 L 173 1039 L 398 930 L 422 913 L 442 893 L 452 879 L 462 860 L 470 832 L 472 815 L 471 779 L 466 749 L 457 713 L 443 669 L 425 625 L 426 624 L 706 922 L 747 962 L 791 994 L 827 1012 L 859 1024 L 905 1035 L 938 1038 L 977 1036 L 1011 1029 L 1039 1019 L 1074 999 L 1098 977 L 1107 965 L 1118 943 L 1123 919 Z" pathLength="1" fill="none" stroke="url(#nv-logo-outline-gradient)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </section>
      </div>

      <section class="nv-hero" id="hero" aria-labelledby="hero-title">
        <div class="nv-hero__content">
          <h1 id="hero-title">Intelligence for<br><span>what comes next.</span></h1>
          <p>We explore practical ways technology can support attention, movement, and everyday routines through high-performance applications for desktop and mobile.</p>
          <div class="nv-hero__actions" data-hero-actions></div>
        </div>
      </section>

      <section class="nv-section nv-project" id="projects" aria-labelledby="project-title">
        <div class="nv-shell">
          <div class="nv-project__layout">
            <div class="nv-project__copy">
              <h2 id="project-title">NeuroPortal</h2>
              <p>NeuroPortal is exploring whether messages, email, calendars, and screen-time or app-use data could come together in a useful daily and weekly picture.</p>
              <p class="nv-project__phase">Middle development phase. There is no finished product yet.</p>
              <a class="nv-text-link" href="./projects/neurofit/">View project <span aria-hidden="true">↗</span></a>
            </div>

            <div data-project-folder-root></div>
          </div>
        </div>
      </section>

      <section class="nv-mission-control nv-section" id="mission-control" aria-labelledby="mission-control-title">
        <div class="nv-shell">
          <div class="nv-mission-control__intro">
            <div class="nv-mission-control__copy">
              <p class="nv-mission-control__eyebrow">NEUROVANT TECHNOLOGY / LIVE OFFICE</p>
              <h2 id="mission-control-title">Mission Control<span>.</span></h2>
              <p>See which Neurovant workflows are active and where they are working. This page is a read-only status display; it does not generate or publish work.</p>
            </div>
            <div class="nv-mission-control__readout" data-mission-control-status role="status" aria-live="polite">
              <div class="nv-mission-control__readout-top">
                <span class="nv-mission-control__dot" data-mc-dot aria-hidden="true"></span>
                <span data-mc-connection>Connecting to the office…</span>
              </div>
              <strong data-mc-headline>Checking live status</strong>
              <p data-mc-message>Waiting for the scheduled workflow feed.</p>
              <time data-mc-updated></time>
            </div>
          </div>
          <ul class="nv-mission-control__grid" data-mc-grid aria-label="Neurovant workflow status">
            <li class="nv-mission-control__card" data-mc-workflow="marketing"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Marketing pipeline</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
            <li class="nv-mission-control__card" data-mc-workflow="leads"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Lead follow-up</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
            <li class="nv-mission-control__card" data-mc-workflow="meetings"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Meeting follow-through</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
            <li class="nv-mission-control__card" data-mc-workflow="support"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Customer support</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
            <li class="nv-mission-control__card" data-mc-workflow="projects"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Project operations</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
            <li class="nv-mission-control__card" data-mc-workflow="research"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Research briefing</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
            <li class="nv-mission-control__card" data-mc-workflow="administration"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Administration review</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
            <li class="nv-mission-control__card" data-mc-workflow="website"><span class="nv-mission-control__avatar" aria-hidden="true"><i></i><i></i></span><span class="nv-mission-control__card-copy"><strong data-mc-label>Website upkeep</strong><small data-mc-detail>Office Floor · Standing by</small></span><span class="nv-mission-control__state" data-mc-state>Standing by</span></li>
          </ul>
          <p class="nv-mission-control__note">Display-only activity. No messages, customer data, drafts, or private source text appear here.</p>
        </div>
      </section>

      <section class="nv-section nv-about" id="about" aria-labelledby="about-title">
        <div class="nv-shell nv-about__layout">
          <div class="nv-about__copy">
            <h2 id="about-title">Technology should earn a place in your day.</h2>
            <p>Neurovant Technology is made by two founders exploring small, practical ways technology might be used to create high-performance applications for desktop and mobile.</p>
            <p>We care less about adding more to a tool and more about whether it earns a place in a real routine. If it creates another demand, it needs a good reason to be there.</p>
          </div>
          <div class="nv-focus" aria-label="Neurovant areas of focus">
            <article data-spotlight><span>01 / Platform</span><h3>Desktop<br>&amp; mobile</h3><i aria-hidden="true">↗</i></article>
            <article data-spotlight><span>02 / Themes</span><h3>Attention,<br>movement, routines</h3><i aria-hidden="true">↗</i></article>
            <article data-spotlight><span>03 / Measure</span><h3>Useful in<br>everyday life</h3><i aria-hidden="true">↗</i></article>
          </div>
        </div>
      </section>

      <section class="nv-section nv-approach" id="principles" aria-labelledby="approach-title">
        <div class="nv-shell">
          <div class="nv-approach__heading">
            <div><h2 id="approach-title">Three checks before<br>we keep going.</h2></div>
            <p>Our principles for deciding whether an idea deserves more of someone’s time.</p>
          </div>
          <ol class="nv-steps">
            <li>
              <span class="nv-step__number">01</span>
              <div class="nv-step__body" data-spotlight>
                <h3><button type="button" data-step-toggle aria-expanded="true" aria-controls="step-ask">Ask first <span aria-hidden="true">−</span></button></h3>
                <div class="nv-step__detail" id="step-ask"><p>Start with the problem a person actually has, not the feature we want to build.</p></div>
              </div>
              <span class="nv-step__state" aria-hidden="true"></span>
            </li>
            <li>
              <span class="nv-step__number">02</span>
              <div class="nv-step__body" data-spotlight>
                <h3><button type="button" data-step-toggle aria-expanded="false" aria-controls="step-place">Earn its place <span aria-hidden="true">+</span></button></h3>
                <div class="nv-step__detail" id="step-place" hidden><p>A product should make one part of a day easier. Otherwise, it is just more noise.</p></div>
              </div>
              <span class="nv-step__state" aria-hidden="true"></span>
            </li>
            <li>
              <span class="nv-step__number">03</span>
              <div class="nv-step__body" data-spotlight>
                <h3><button type="button" data-step-toggle aria-expanded="false" aria-controls="step-people">People decide <span aria-hidden="true">+</span></button></h3>
                <div class="nv-step__detail" id="step-people" hidden><p>The person using a tool should understand what it does and choose how to use it.</p></div>
              </div>
              <span class="nv-step__state" aria-hidden="true"></span>
            </li>
          </ol>
        </div>
      </section>

      <section class="nv-section nv-team" id="team" aria-labelledby="team-title">
        <div class="nv-shell">
          <div class="nv-team__heading">
            <div><h2 id="team-title">People behind<br>the work.</h2></div>
          </div>
          <ul class="nv-team__grid" aria-label="Neurovant Technology team">
            <li><a data-spotlight href="https://discord.com/users/1300212275835043881" target="_blank" rel="noopener noreferrer" aria-label="Open enosh.tech's Discord profile in a new tab"><span class="nv-team__index">01 / NT</span><span class="nv-team__role">Founder &amp; Developer</span><strong>enosh.tech</strong><span class="nv-team__handle">@scienceman_pro</span><span class="nv-team__link">Discord profile <i aria-hidden="true">↗</i></span></a></li>
            <li><a data-spotlight href="https://discord.com/users/1480253947984740393" target="_blank" rel="noopener noreferrer" aria-label="Open Jackson.tech's Discord profile in a new tab"><span class="nv-team__index">02 / NT</span><span class="nv-team__role">Founder</span><strong>Jackson.tech</strong><span class="nv-team__handle">@jacksonkarli.</span><span class="nv-team__link">Discord profile <i aria-hidden="true">↗</i></span></a></li>
            <li><a data-spotlight href="https://discord.com/users/1033353984267800576" target="_blank" rel="noopener noreferrer" aria-label="Open SPOONFAM's Discord profile in a new tab"><span class="nv-team__index">03 / NT</span><span class="nv-team__role">Developer</span><strong>SPOONFAM</strong><span class="nv-team__handle">@spoonfam</span><span class="nv-team__link">Discord profile <i aria-hidden="true">↗</i></span></a></li>
            <li><a data-spotlight href="https://discord.com/users/1204912897499598941" target="_blank" rel="noopener noreferrer" aria-label="Open mathewingtonjsebaarionkingcrow's Discord profile in a new tab"><span class="nv-team__index">04 / NT</span><span class="nv-team__role">Team member</span><strong>mathewingtonjsebaarionkingcrow</strong><span class="nv-team__handle">@mathewingtonjsebaarionkingcrow</span><span class="nv-team__link">Discord profile <i aria-hidden="true">↗</i></span></a></li>
            <li><a data-spotlight href="https://discord.com/users/1469187539263815750" target="_blank" rel="noopener noreferrer" aria-label="Open Castle_Crashers's Discord profile in a new tab"><span class="nv-team__index">05 / NT</span><span class="nv-team__role">AI Developer</span><strong>Castle_Crashers</strong><span class="nv-team__handle">@Castle_crashers</span><span class="nv-team__link">Discord profile <i aria-hidden="true">↗</i></span></a></li>
          </ul>
        </div>
      </section>

      <section class="nv-vision" aria-labelledby="vision-title">
        <div class="nv-shell nv-vision__inner">
          <p class="nv-vision__phrase" id="vision-title">Built around real routines.<br><span>Shared when there’s something useful to show.</span></p>
          <a class="nv-text-link" href="./projects/neurofit/">Follow the NeuroPortal project <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section class="nv-section nv-contact" id="contact" aria-labelledby="contact-title">
        <div class="nv-shell nv-contact__layout">
          <div class="nv-contact__copy">
            <h2 id="contact-title">Stay close to<br>what comes next.</h2>
            <p>Get a short note when a project is ready to share. You can also find Neurovant on Discord.</p>
            <a class="nv-text-link" href="https://discord.gg/NQ3qjFDCMn" target="_blank" rel="noopener noreferrer">Join our Discord <span aria-hidden="true">↗</span></a>
          </div>
          <div class="nv-contact__community">
            <form class="nv-form" data-contact-form novalidate>
              <label for="display-name">Display name</label>
              <p id="name-help">This name may appear on the referral leaderboard.</p>
              <input id="display-name" name="display_name" type="text" maxlength="40" autocomplete="nickname" placeholder="Your name" required aria-describedby="name-help form-status signup-note" aria-invalid="false">
              <label for="email">Email address</label>
              <p id="email-help">We’ll email a sign-in link to verify your address.</p>
              <div class="nv-form__control">
                <input id="email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required aria-describedby="email-help form-status signup-note" aria-invalid="false">
                <button type="submit">Join the list <span aria-hidden="true">↗</span></button>
              </div>
              <input type="hidden" name="referral_code" data-referral-code>
              <p class="nv-form__status" id="form-status" role="status" aria-live="polite"></p>
              <p class="nv-form__privacy" id="signup-note">Your email is private. Only your display name and verified referral count appear publicly.</p>
              <div class="nv-form__referral" data-referral-panel hidden>
                <label for="referral-link">Your referral link</label>
                <div class="nv-form__control">
                  <input id="referral-link" data-referral-link readonly aria-label="Your referral link">
                  <button type="button" data-copy-referral>Copy link</button>
                </div>
              </div>
            </form>
            <section class="nv-leaderboard" aria-labelledby="leaderboard-title">
              <div class="nv-leaderboard__heading">
                <div><p class="nv-leaderboard__eyebrow">The community</p><h3 id="leaderboard-title">Referral leaderboard</h3></div>
                <span class="nv-leaderboard__cap">TOP 50</span>
              </div>
              <ol class="nv-leaderboard__list" data-leaderboard aria-live="polite">
                <li class="nv-leaderboard__empty">Loading the leaderboard…</li>
              </ol>
              <p class="nv-leaderboard__note">Only verified signups count.</p>
            </section>
          </div>
        </div>
      </section>
    </main>

    <footer class="nv-footer">
      <div class="nv-shell">
        <div class="nv-footer__main">
          <a class="nv-brand nv-brand--footer" href="#top" aria-label="Neurovant Technology home"><img src="/neurovant-logo.png" alt="" width="72" height="44"><span>Neurovant <span>Technology</span></span></a>
          <nav aria-label="Footer navigation"><a href="#about">About</a><a href="#principles">Our approach</a><a href="#mission-control">Mission Control</a><a href="./projects/neurofit/">Projects</a><a href="#team">Team</a><a href="#contact">Contact</a></nav>
          <a class="nv-footer__discord" href="https://discord.gg/NQ3qjFDCMn" target="_blank" rel="noopener noreferrer">Discord <span aria-hidden="true">↗</span></a>
        </div>
        <div class="nv-footer__bottom"><span>© <span data-year="2026">2026</span> Neurovant Technology</span><span>Independent team.</span></div>
      </div>
    </footer>
  `;

  const heroActions = rootElement.querySelector('[data-hero-actions]');
  if (heroActions instanceof HTMLElement) mountHeroActions(heroActions);

  const folderMount = rootElement.querySelector('[data-project-folder-root]');
  if (folderMount instanceof HTMLElement) mountNeuroPortalFolder(folderMount);

  const missionControlMount = rootElement.querySelector('[data-mission-control-status]');
  if (missionControlMount instanceof HTMLElement) mountMissionControlStatus(missionControlMount);

  rootElement.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch' && event.target instanceof Element) {
      const card = event.target.closest('[data-spotlight]');
      if (card instanceof HTMLElement) {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--nv-spot-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--nv-spot-y', `${event.clientY - bounds.top}px`);
      }
    }
  }, { passive: true });

  rootElement.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-step-toggle]');
    if (!(button instanceof HTMLButtonElement) || !rootElement.contains(button)) return;

    const detail = button.parentElement?.nextElementSibling;
    if (!(detail instanceof HTMLElement)) return;
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.querySelector('span[aria-hidden="true"]').textContent = expanded ? '−' : '+';
    detail.hidden = !expanded;
  });

  return rootElement;
}

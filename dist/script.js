/*
 * Wedding details: edit this block and the whole page updates.
 * Leave a value empty ('') to keep the "to follow" placeholder text.
 */
const WEDDING = {
  partnerOne: 'Ifiok',
  partnerTwo: 'Amarachi',
  // Ceremony start with its UTC offset (Nigeria is +01:00). Before this moment the
  // page shows a countdown, calendar links and RSVP; afterwards it says thank you.
  start: '2026-01-09T11:00:00+01:00',
  end: '2026-01-09T22:00:00+01:00',
  timeZone: 'Africa/Lagos',
  venueName: '',                  // e.g. 'The Garden Pavilion'
  venueCity: '',                  // e.g. 'Lekki, Lagos'
  venueAddress: '',               // full street address shown under "Finding the venue"
  mapUrl: '',                     // a Google/Apple Maps link
  rsvpDeadline: '',               // e.g. '1 December 2026'
  // RSVP: set either or both. Nothing is collected until one is set.
  rsvpEndpoint: '',               // a form service URL, e.g. https://formspree.io/f/xxxxxxx
  rsvpWhatsApp: '',               // international number, digits only, e.g. '2348012345678'
  hidePreviewNote: false          // set true once names, venue and programme are final
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function bind(key, value) {
  if (!value) return;
  $$(`[data-bind="${key}"]`).forEach(el => { el.textContent = value; });
}

/* Details */
const start = WEDDING.start ? new Date(WEDDING.start) : null;
const end = WEDDING.end ? new Date(WEDDING.end) : start && new Date(start.getTime() + 6 * 3600e3);
const hasDate = start && !Number.isNaN(start.getTime());
const isPast = hasDate && Date.now() > end.getTime();
const names = WEDDING.partnerOne && WEDDING.partnerTwo ? `${WEDDING.partnerOne} & ${WEDDING.partnerTwo}` : '';

bind('partnerOne', WEDDING.partnerOne);
bind('partnerTwo', WEDDING.partnerTwo);
bind('venueName', WEDDING.venueName);
bind('venueCity', WEDDING.venueCity);
bind('venueShort', (WEDDING.venueCity || WEDDING.venueName).toUpperCase());
bind('venueAddress', WEDDING.venueAddress);
if (names) document.title = `${names} · Our Nigerian Wedding`;
if (WEDDING.hidePreviewNote) $('[data-preview-note]').remove();

if (WEDDING.mapUrl) {
  const mapLink = $('[data-map-link]');
  mapLink.href = WEDDING.mapUrl;
  mapLink.hidden = false;
}

if (hasDate) {
  const fmt = options => new Intl.DateTimeFormat('en-GB', { timeZone: WEDDING.timeZone, ...options }).format(start);
  const longDate = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
  bind('dateShort', longDate.toUpperCase());
  bind('dateLong', longDate);
  bind('dateNote', `${fmt({ weekday: 'long' })} · ${fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '')}`);
  $('[data-bind="dateShort"]').setAttribute('datetime', WEDDING.start);
}

/* Countdown, calendar and RSVP depend on whether the day is still ahead */
if (hasDate && !isPast) {
  const countdown = $('[data-countdown]');
  countdown.hidden = false;
  const tick = () => {
    const ms = Math.max(0, start.getTime() - Date.now());
    $('[data-unit="days"]').textContent = Math.floor(ms / 864e5);
    $('[data-unit="hours"]').textContent = Math.floor(ms / 36e5) % 24;
    $('[data-unit="minutes"]').textContent = Math.floor(ms / 6e4) % 60;
  };
  tick();
  setInterval(tick, 30e3);
  setupCalendar();
  setupRsvp();
} else if (isPast) {
  $('[data-after-note]').hidden = false;
  $('[data-rsvp-heading]').innerHTML = 'Love, family,<br> <em>always.</em>';
  $('[data-rsvp-intro]').textContent = 'Thank you to everyone who celebrated with us, near and far.';
  $('[data-rsvp-status-text]').textContent = 'RSVPs are now closed';
  $('[data-rsvp-caption]').textContent = 'With love and gratitude.';
  bind('rsvpFaq', 'RSVPs for our wedding have now closed. Thank you for celebrating with us.');
} else {
  setupRsvp();
}

function setupCalendar() {
  const title = names ? `${names}’s Wedding` : 'Our Nigerian Wedding';
  const location = [WEDDING.venueName, WEDDING.venueAddress || WEDDING.venueCity].filter(Boolean).join(', ');
  const utc = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const google = new URL('https://calendar.google.com/calendar/render');
  google.search = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${utc(start)}/${utc(end)}`, location, details: window.location.href });
  $('[data-calendar-google]').href = google.toString();

  const esc = text => text.replace(/[\\,;]/g, m => `\\${m}`).replace(/\n/g, '\\n');
  $('[data-calendar-ics]').addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Our Wedding//EN', 'BEGIN:VEVENT',
      `UID:${utc(start)}-wedding@ourwedding`, `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`,
      `SUMMARY:${esc(title)}`, location && `LOCATION:${esc(location)}`, `URL:${window.location.href}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    link.download = 'our-wedding.ics';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  $('[data-calendar]').hidden = false;
}

function setupRsvp() {
  if (!WEDDING.rsvpEndpoint && !WEDDING.rsvpWhatsApp) return;
  const deadline = WEDDING.rsvpDeadline ? `Kindly respond by ${WEDDING.rsvpDeadline}.` : 'Kindly let us know if you can make it.';
  $('[data-rsvp-status]').hidden = true;
  $('[data-rsvp-caption]').textContent = deadline;
  bind('rsvpFaq', `Use the RSVP section at the bottom of this page. ${deadline}`);

  if (WEDDING.rsvpWhatsApp) {
    const whatsapp = $('[data-rsvp-whatsapp]');
    const text = `Hello! RSVP for ${names || 'your wedding'}: `;
    whatsapp.href = `https://wa.me/${WEDDING.rsvpWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    whatsapp.hidden = false;
  }
  if (!WEDDING.rsvpEndpoint) return;

  const form = $('[data-rsvp-form]');
  const status = $('[data-form-status]');
  form.hidden = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const button = $('button[type="submit"]', form);
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch(WEDDING.rsvpEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(response.statusText);
      const attending = new FormData(form).get('attending') === 'Joyfully accepts';
      form.reset();
      status.textContent = attending ? 'Thank you! We can’t wait to celebrate with you.' : 'Thank you for letting us know. You’ll be missed.';
    } catch {
      status.textContent = 'Sorry, that didn’t send. Please try again, or RSVP on WhatsApp.';
    } finally {
      button.disabled = false;
    }
  });
}

/* Navigation */
const header = $('.site-header');
const menuButton = $('.menu-toggle');
const navigation = $('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('open', !expanded);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 721px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 8), { passive: true });

const navLinks = $$('#navigation a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(link => {
  const section = $(link.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

/* Gentle reveal on scroll */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    revealObserver.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -8% 0px' });
$$('.reveal').forEach(el => revealObserver.observe(el));

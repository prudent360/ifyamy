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
bind('venuePlace', [WEDDING.venueName, WEDDING.venueCity].filter(Boolean).join(', '));
bind('venueAddress', WEDDING.venueAddress);
if (WEDDING.hidePreviewNote) $('[data-preview-note]').remove();

if (WEDDING.mapUrl) {
  const mapLink = $('[data-map-link]');
  mapLink.href = WEDDING.mapUrl;
  mapLink.hidden = false;
}

if (hasDate) {
  const fmt = options => new Intl.DateTimeFormat('en-GB', { timeZone: WEDDING.timeZone, ...options }).format(start);
  bind('dateLong', fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  bind('dateNote', `Starts ${fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '')}, Nigeria time`);
}

/* Countdown, calendar and RSVP depend on whether the day is still ahead */
if (hasDate && !isPast) {
  $('[data-countdown]').hidden = false;
  const tick = () => {
    const days = Math.ceil((start.getTime() - Date.now()) / 864e5);
    bind('countdown', days > 1 ? `${days} days to go` : days === 1 ? 'Tomorrow' : 'Today');
  };
  tick();
  setInterval(tick, 60e3);
  setupCalendar();
  setupRsvp();
} else if (isPast) {
  $('[data-announce]').textContent = 'are married.';
  $('[data-rsvp-heading]').textContent = 'Thank you.';
  $('[data-rsvp-intro]').textContent = 'To everyone who celebrated with us, near and far: thank you for being part of our day.';
  $('[data-rsvp-status]').textContent = 'RSVPs are closed.';
  bind('rsvpShort', 'Closed');
  bind('rsvpFaq', 'RSVPs have closed. Thank you for celebrating with us.');
} else {
  setupRsvp();
}

function setupCalendar() {
  const title = names ? `${names}’s wedding` : 'Our wedding';
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
  const deadline = WEDDING.rsvpDeadline ? `Please reply by ${WEDDING.rsvpDeadline}.` : 'Please let us know if you can make it.';
  $('[data-rsvp-status]').hidden = true;
  $('[data-rsvp-caption]').textContent = deadline;
  bind('rsvpShort', WEDDING.rsvpDeadline ? `By ${WEDDING.rsvpDeadline}` : 'Open now');
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
      status.textContent = attending ? 'Thank you! We can’t wait to see you.' : 'Thank you for letting us know. You’ll be missed.';
    } catch {
      status.textContent = 'Sorry, that didn’t send. Please try again, or RSVP on WhatsApp.';
    } finally {
      button.disabled = false;
    }
  });
}

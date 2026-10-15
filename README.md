# Our Wedding

Ifiok & Amarachi's wedding website: a responsive, typographic design in deep green, paper and marigold, built with HTML, CSS and vanilla JavaScript. Static files are in `dist/`. No build dependencies are required.

Preview with `python3 -m http.server 4173 --directory dist` from this directory.

## Personalisation before guest launch

Most details live in one place: the `WEDDING` block at the top of `dist/script.js`. Fill in names, ceremony start/end (with the `+01:00` offset), venue, map link and RSVP deadline, and the hero, date cards, page title and FAQ update to match.

The page changes with the date:

- **Before the wedding:** a live countdown, Google Calendar and Apple/Outlook (.ics) links, and RSVP if it is configured.
- **After the wedding:** a thank-you message, and RSVP shows as closed.

RSVP stays an honest "coming soon" until you set `rsvpEndpoint` (any service that accepts a form POST, such as Formspree) and/or `rsvpWhatsApp` (a number in international format). Until then no guest data is collected or sent.

The programme, travel, accommodation and FAQ copy are written directly in `dist/index.html`. Set `hidePreviewNote: true` once everything is confirmed.

Typography uses Google Fonts (Gloock and Figtree) with system fallbacks. The page uses no photographs; add real photos of the couple when they are available. The Site is initially private.

## Asset provenance

`assets/garden-original.png` is an AI-generated image from the earlier design. It is not used on the current page. It was generated with the built-in Imagegen tool.

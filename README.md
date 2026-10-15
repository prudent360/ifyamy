# Our Wedding

A responsive ivory-and-sage Nigerian wedding website, built with HTML, CSS and vanilla JavaScript. Static files are in `dist/`. No build dependencies are required.

Preview with `python3 -m http.server 4173 --directory dist` from this directory.

## Personalisation before guest launch

Most details live in one place: the `WEDDING` block at the top of `dist/script.js`. Fill in names, ceremony start/end (with the `+01:00` offset), venue, map link and RSVP deadline, and the hero, date cards, page title and FAQ update to match.

The page changes with the date:

- **Before the wedding:** a live countdown, Google Calendar and Apple/Outlook (.ics) links, and RSVP if it is configured.
- **After the wedding:** a thank-you message, and RSVP shows as closed.

RSVP stays an honest "coming soon" until you set `rsvpEndpoint` (any service that accepts a form POST, such as Formspree) and/or `rsvpWhatsApp` (a number in international format). Until then no guest data is collected or sent.

The programme, travel, accommodation and FAQ copy are written directly in `dist/index.html`. Set `hidePreviewNote: true` once everything is confirmed.

Typography uses Google Fonts with system fallbacks. The garden image is generated inspiration, not a photograph of a confirmed venue. The Site is initially private.

## Asset provenance

`dist/garden.webp` and `dist/garden.jpg` are compressed web versions of `assets/garden-original.png`, which was generated with the built-in Imagegen tool. Prompt: “Use case: photorealistic-natural. Asset type: editorial hero photograph for an elegant ivory and sage wedding website. An intimate outdoor garden wedding table beneath olive trees, ivory linen, delicate white cosmos and garden roses in small vases, pale sage napkins, natural oak chairs, soft late-afternoon sunlight, foliage and a softly blurred old stone garden wall behind. Quiet, romantic, refined, organic. Vertical composition 2:3, generous greenery in upper third, table leading into depth. No people, no words, no logos, no watermark. This is illustrative wedding inspiration, not a specific real venue.”

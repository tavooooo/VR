# Hobbiton — Augmented Reality Experience

A mobile WebAR prototype that lets visitors at **Hobbiton Movie Set** see
characters from Middle-earth come to life on location — no app download
required. Built to pitch the concept to the business owner.

> Think *Pokémon GO*, but the creatures are Frodo, Gandalf and a dragon, and
> they appear at real spots around the Shire.

## What's in the demo

| Point | Character | How it's triggered |
|-------|-----------|--------------------|
| Bag End | **Frodo** | Scan a **QR code** → character is placed on the ground in front of you |
| Party Field | **Gandalf** | Scan a **QR code** → character is placed on the ground in front of you |
| The Great Tree | **The Dragon** | Found by **GPS** → flies in the sky above the real tree |

All three screens are fully **trilingual: English · 中文 · Español**
(language is chosen on the home screen and remembered).

## How it works (tech)

- **WebAR, zero install** — opens in Safari (iOS) / Chrome (Android).
- **QR points** use [`<model-viewer>`](https://modelviewer.dev) — rock-solid
  surface placement via Scene Viewer (Android) and Quick Look (iOS).
- **GPS point** uses [AR.js](https://ar-js-org.github.io/AR.js-Docs/)
  location-based AR to anchor the dragon above real coordinates.
- Everything is driven from one config file: **`js/config.js`**
  (points, models, GPS coordinates, and all translated copy).

## Project structure

```
index.html        Home — language selector + map of points
ar.html           QR experience (Frodo, Gandalf) — model-viewer
gps.html          GPS experience (Dragon) — AR.js
js/config.js      ⬅ EDIT HERE: points, models, GPS, translations
models/           .glb files (placeholders included — swap in real ones)
qr/               Printable QR codes + generator script
```

## Run / deploy

**Locally** (any static server, AR needs HTTPS or localhost):
```bash
python3 -m http.server 8000
# open http://localhost:8000  (camera AR requires HTTPS on a real phone)
```

**GitHub Pages** (free, HTTPS — easiest for the pitch):
1. Push this branch and enable Pages on the repo.
2. URL becomes `https://tavooooo.github.io/VR/`.

**Your VPS:** serve the folder over **HTTPS** (camera/GPS require a secure
context). Then regenerate the QR codes for your domain:
```bash
python3 qr/generate_qr.py https://your-domain.com
```

## On-site setup checklist

1. Add real `frodo.glb`, `gandalf.glb`, `dragon.glb` to `models/`.
2. Measure the **exact GPS coordinates** at the great tree and update
   `gps` in `js/config.js` (and `alt` = how high the dragon flies).
3. Deploy over HTTPS.
4. Run `qr/generate_qr.py <your-url>` and print `qr/frodo.png` & `qr/gandalf.png`.
5. Place the QR signs at Bag End and the Party Field.

## Roadmap (post-pitch)

- Visitor-facing CMS to add/edit points without code
- Per-point analytics (scans, dwell time)
- Ambient audio + soundtrack per location
- Offline caching (PWA)
- Centimetre-accurate placement via ARCore Geospatial / VPS where available

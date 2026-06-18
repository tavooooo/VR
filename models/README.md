# 3D Models

Drop your `.glb` models here using these exact filenames:

| File | Character | Trigger |
|------|-----------|---------|
| `frodo.glb`   | Frodo Baggins   | QR (Bag End) |
| `gandalf.glb` | Gandalf the Grey | QR (Party Field) |
| `dragon.glb`  | The Dragon       | GPS (The Great Tree) |

The repo currently ships **placeholder copies** so the demo runs out of the
box. Replace each file with the real character — keep the same filename and
everything updates automatically.

## Tips for good AR models
- Format: **glTF Binary (.glb)**, embedded textures.
- Keep each model **under ~5 MB** for fast loading on mobile data.
  (Use [gltf.report](https://gltf.report) or `gltf-transform` to compress.)
- Model should face **+Z** and stand on the ground plane (feet at y = 0).
- Real-world scale in metres. Adjust per-point `scale` in `js/config.js`
  if a character looks too big or small.
- The dragon is scaled up and lifted into the sky — tune `scale` and
  `gps.alt` (metres above ground) in `js/config.js`.

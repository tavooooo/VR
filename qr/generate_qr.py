#!/usr/bin/env python3
"""
Generate branded QR codes for the QR-triggered Hobbiton AR points.

Usage:
    python3 qr/generate_qr.py                       # uses default GitHub Pages URL
    python3 qr/generate_qr.py https://your-domain   # custom base URL

Drop the resulting PNGs onto the on-site signage next to each location.
Re-run whenever you change the hosting URL.
"""
import sys
import qrcode
from qrcode.constants import ERROR_CORRECT_H

# QR-triggered points (GPS point "dragon" is found by location, no QR needed)
POINTS = ["frodo", "gandalf"]

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://tavooooo.github.io/VR"

DARK = (15, 20, 16)     # Middle-earth night
GOLD = (201, 162, 39)   # ring gold

for pid in POINTS:
    url = f"{BASE}/ar.html?point={pid}"
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=16, border=3)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=GOLD, back_color=DARK).convert("RGB")
    out = f"qr/{pid}.png"
    img.save(out)
    print(f"  {pid:8s} -> {url}\n            saved {out}  ({img.size[0]}x{img.size[1]})")

print("\nDone. Print these and place them on the signage at each location.")

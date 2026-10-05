"""Erzeugt optimierte WebP-Versionen aller Fotos + die statische „Schmutz“-Textur.

Quelle:  scripts/src-photos/*.jpg   (Originale, Pexels-Lizenz – siehe README)
Ziel:    public/images/photos/<name>-<breite>.webp
Aufruf:  npm run photos
"""
import glob
import os
import random

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "scripts", "src-photos")
OUT = os.path.join(ROOT, "public", "images", "photos")
WIDTHS = (800, 1400, 2200)
os.makedirs(OUT, exist_ok=True)

for path in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
    name = os.path.splitext(os.path.basename(path))[0]
    im = Image.open(path).convert("RGB")
    for w in WIDTHS:
        if w > im.width:
            continue
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, f"{name}-{w}.webp"), "WEBP", quality=78, method=6)
    print("✓", name, im.size)

# Statische Schmutz-Textur für den Vorher/Nachher-Vergleich (einmal gerendert statt live berechnet)
random.seed(7)
W, H = 1600, 1000
tex = Image.new("RGBA", (W, H), (0, 0, 0, 0))
smudge = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(smudge)
for _ in range(16):
    x, y = random.uniform(0, W), random.uniform(0, H)
    rx, ry = random.uniform(120, 380), random.uniform(80, 260)
    d.ellipse((x - rx, y - ry, x + rx, y + ry), fill=(214, 206, 186, random.randint(18, 42)))
tex = Image.alpha_composite(tex, smudge.filter(ImageFilter.GaussianBlur(60)))

streaks = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(streaks)
for _ in range(34):
    x, y = random.uniform(0, W), random.uniform(-80, H * 0.85)
    length = random.uniform(80, 320)
    for i in range(int(length)):
        a = int(70 * (i / length) ** 1.5)
        d.line((x, y + i, x + random.uniform(1.5, 3.5), y + i), fill=(232, 226, 210, a))
tex = Image.alpha_composite(tex, streaks.filter(ImageFilter.GaussianBlur(1.2)))

drops = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(drops)
for _ in range(260):
    x, y, r = random.uniform(0, W), random.uniform(0, H), random.uniform(2, 9 if random.random() > 0.85 else 5)
    d.ellipse((x - r, y - r, x + r, y + r), outline=(245, 245, 250, 110), fill=(255, 255, 255, 22), width=1)
    d.ellipse((x - r * 0.45, y - r * 0.55, x - r * 0.1, y - r * 0.2), fill=(255, 255, 255, 120))
for _ in range(900):
    x, y, r = random.uniform(0, W), random.uniform(0, H), random.uniform(0.6, 1.8)
    d.ellipse((x - r, y - r, x + r, y + r), fill=(50, 44, 34, random.randint(60, 150)))
tex = Image.alpha_composite(tex, drops.filter(ImageFilter.GaussianBlur(0.4)))
tex.save(os.path.join(OUT, "grime.webp"), "WEBP", quality=80)
print("✓ grime texture")

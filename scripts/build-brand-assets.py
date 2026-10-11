"""
Build BeeYou brand assets from the source artwork in assets/brand/.

  assets/brand/app-icon-source.jpg  -> public/pwa-*.png, apple-touch-icon.png, favicon-*.png, icon-1024.png
  assets/brand/logo-source.jpg      -> public/logo.png (transparent, 2x upscaled + sharpened)

Run:  python scripts/build-brand-assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "brand"
PUBLIC = ROOT / "public"


def clean_and_upscale(img: Image.Image, scale: int, sharpen: int = 140) -> Image.Image:
    """Remove JPEG block/mosquito noise, upscale with Lanczos, then re-sharpen edges."""
    img = img.convert("RGB").filter(ImageFilter.MedianFilter(3))
    img = img.resize((img.width * scale, img.height * scale), Image.LANCZOS)
    img = img.filter(ImageFilter.UnsharpMask(radius=2.2, percent=sharpen, threshold=2))
    return img


def is_near_white(px, tol=28):
    return all(c >= 255 - tol for c in px[:3])


# ---------------------------------------------------------------- APP ICON
def build_icon():
    src = Image.open(SRC / "app-icon-source.jpg").convert("RGB")

    # Crop away the white margin around the rounded square
    w, h = src.size
    px = src.load()
    xs, ys = [], []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if not is_near_white(px[x, y]):
                xs.append(x)
                ys.append(y)
    box = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
    src = src.crop(box)
    side = max(src.size)
    src = src.resize((side, side), Image.LANCZOS)

    # Background colour sampled from the icon (left-middle edge, inside the shape)
    bg = src.getpixel((int(side * 0.06), side // 2))

    icon = clean_and_upscale(src, 2)  # ~2048px master
    # Make full-bleed square: fill the white rounded-corner areas with the background colour
    # (iOS/Android/PWA apply their own corner mask)
    W = icon.width
    inset = int(W * 0.03)
    mask = Image.new("L", icon.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (inset, inset, W - 1 - inset, W - 1 - inset), radius=int(W * 0.17), fill=255
    )
    mask = mask.filter(ImageFilter.GaussianBlur(W * 0.004))
    solid = Image.new("RGB", icon.size, bg)
    icon = Image.composite(icon, solid, mask)

    master = icon.resize((1024, 1024), Image.LANCZOS)
    master.save(PUBLIC / "icon-1024.png", optimize=True)

    sizes = {
        "pwa-512x512.png": 512,
        "pwa-maskable-512x512.png": 512,  # bee already sits inside the 80% safe zone
        "pwa-192x192.png": 192,
        "apple-touch-icon.png": 180,
        "favicon-48x48.png": 48,
        "favicon-32x32.png": 32,
    }
    for name, s in sizes.items():
        out = icon.resize((s, s), Image.LANCZOS)
        if s <= 64:
            out = out.filter(ImageFilter.UnsharpMask(radius=0.6, percent=80, threshold=1))
        out.save(PUBLIC / name, optimize=True)
    print("icon background", bg)


# -------------------------------------------------------------------- LOGO
def build_logo():
    src = Image.open(SRC / "logo-source.jpg").convert("RGB")
    big = clean_and_upscale(src, 2, sharpen=90)

    # Convert white background to transparency, un-premultiplying anti-aliased edges
    data = list(big.getdata())
    out = []
    for r, g, b in data:
        m = min(r, g, b)
        a = 255 - m
        a = min(255, int(a * 1.55))  # boost so solid ink is fully opaque
        if a <= 14:
            out.append((255, 255, 255, 0))
            continue
        af = a / 255.0
        # colour = (observed - white*(1-a)) / a
        rr = max(0, min(255, int((r - 255 * (1 - af)) / af)))
        gg = max(0, min(255, int((g - 255 * (1 - af)) / af)))
        bb = max(0, min(255, int((b - 255 * (1 - af)) / af)))
        out.append((rr, gg, bb, a))
    logo = Image.new("RGBA", big.size)
    logo.putdata(out)

    # Trim transparent margins (keep a little breathing room)
    bbox = logo.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    pad = 16
    bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad),
            min(logo.width, bbox[2] + pad), min(logo.height, bbox[3] + pad))
    logo = logo.crop(bbox)
    logo.save(PUBLIC / "logo.png", optimize=True)
    print("logo size", logo.size)


if __name__ == "__main__":
    build_icon()
    build_logo()
    print("done")

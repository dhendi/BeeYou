import os
from PIL import Image, ImageDraw

out_dir = 'public/assets/stickers'
os.makedirs(out_dir, exist_ok=True)

# Image 1 (10 stickers)
img1_path = 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/.user_uploaded/media_1792082448400_33f91960.jpg'
img1 = Image.open(img1_path).convert('RGBA')

img1_stickers = [
    # Row 0
    ('sensory_bright_lights.png', 138, 136, 105.5, 'Bright Lights (Sensory Trigger)'),
    ('sensory_loud_noise.png', 386, 136, 105.5, 'Loud Noise (Sensory Trigger)'),
    ('sensory_social_masking.png', 636, 136, 105.5, 'Social Masking Fatigue'),
    ('coping_lungs_breathing.png', 885, 136, 105.5, 'Deep Breathing Lungs'),
    # Row 1
    ('routine_writing_journal.png', 138, 380, 105.5, 'Writing & Journaling'),
    ('routine_medicine_pill.png', 386, 380, 105.5, 'Medication Capsule Pill'),
    ('routine_toilet_restroom.png', 636, 380, 105.5, 'Toilet / Restroom Routine'),
    ('routine_water_drink.png', 885, 380, 105.5, 'Hydration Water Droplet'),
    # Row 2
    ('adventure_haircut_salon.png', 138, 628, 105.5, 'Haircut Scissors Adventure'),
    ('adventure_doctor_checkup.png', 386, 628, 105.5, 'Doctor Stethoscope Adventure'),
]

# Image 2 (5 stickers)
img2_path = 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/.user_uploaded/media_1792082448401_8ecf4998.jpg'
img2 = Image.open(img2_path).convert('RGBA')

img2_stickers = [
    # Row 0
    ('adventure_swimming_pool.png', 168, 178, 135.5, 'Swimming Pool Adventure'),
    ('adventure_movie_cinema.png', 512, 178, 135.5, 'Movie Cinema Popcorn'),
    ('adventure_bowling_alley.png', 854, 178, 135.5, 'Bowling Alley Adventure'),
    # Row 1
    ('adventure_camping_tent.png', 168, 509, 135.5, 'Camping Tent Adventure'),
    ('adventure_museum_visit.png', 512, 509, 135.5, 'Museum Columns Adventure'),
]

all_extracted = []

def extract_circle(img, cx, cy, rad, filename, label):
    pad = 4
    box = (int(cx - rad - pad), int(cy - rad - pad), int(cx + rad + pad), int(cy + rad + pad))
    cropped = img.crop(box)
    
    cw, ch = cropped.size
    scale = 4
    mask = Image.new('L', (cw * scale, ch * scale), 0)
    draw = ImageDraw.Draw(mask)
    
    mcx = (cx - box[0]) * scale
    mcy = (cy - box[1]) * scale
    mrad = rad * scale
    
    draw.ellipse((mcx - mrad, mcy - mrad, mcx + mrad, mcy + mrad), fill=255)
    mask = mask.resize((cw, ch), Image.Resampling.LANCZOS)
    
    cropped.putalpha(mask)
    # Resize to standard uniform 256x256 high-res sticker
    standard = cropped.resize((256, 256), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(out_dir, filename)
    standard.save(out_path, 'PNG')
    print(f'Saved {filename} (256x256) - {label}')
    all_extracted.append((filename, standard, label))

for fn, cx, cy, rad, label in img1_stickers:
    extract_circle(img1, cx, cy, rad, fn, label)

for fn, cx, cy, rad, label in img2_stickers:
    extract_circle(img2, cx, cy, rad, fn, label)

# Generate a visual preview grid (5 cols x 3 rows) on a soft cream background
preview_w = 5 * 256 + 6 * 20
preview_h = 3 * 256 + 4 * 20
preview = Image.new('RGBA', (preview_w, preview_h), (250, 248, 245, 255))

for idx, (fn, st, label) in enumerate(all_extracted):
    r = idx // 5
    c = idx % 5
    x = 20 + c * (256 + 20)
    y = 20 + r * (256 + 20)
    preview.alpha_composite(st, (x, y))

artifact_dir = 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935'
preview_path = os.path.join(artifact_dir, 'table_c_extracted_preview.png')
preview.save(preview_path, 'PNG')
print(f'Preview saved to {preview_path}')

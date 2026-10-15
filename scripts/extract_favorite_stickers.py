from PIL import Image, ImageDraw
import os

source_path = 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/.user_uploaded/media_1792039881340_b691b5db.jpg'
out_dir = 'public/assets/stickers'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(source_path).convert('RGBA')

items = [
    # (filename, row, col, name)
    ('fav_lego.png', 0, 0, 'I want to play lego'),
    ('fav_bath.png', 0, 1, 'I want to take a bath'),
    ('fav_sandwich.png', 0, 2, 'I am hungry, can I have a snack?'),
    ('fav_water.png', 0, 3, 'I am thirsty, I want water'),
    ('fav_quiet_break.png', 1, 0, 'I need a sensory quiet break'),
    ('fav_help_sos.png', 1, 1, 'Can you help me please?'),
    ('fav_outside.png', 1, 2, 'I want to go outside'),
    ('fav_love_heart.png', 1, 3, 'I love you'),
    ('fav_rest_tired.png', 2, 0, 'I am tired, I want to rest'),
    ('fav_music.png', 2, 1, 'I want to listen to music'),
    ('fav_stop.png', 2, 2, 'I do not want this, stop please'),
    ('fav_happy.png', 2, 3, 'I am happy!')
]

cols_x = [154, 392, 630, 870]
rows_y = [147, 382, 617]
radius = 97.5

for filename, r, c, label in items:
    cx = cols_x[c]
    cy = rows_y[r]
    
    pad = 3
    box = (int(cx - radius - pad), int(cy - radius - pad), int(cx + radius + pad), int(cy + radius + pad))
    cropped = img.crop(box)
    
    cw, ch = cropped.size
    scale = 4
    mask = Image.new('L', (cw * scale, ch * scale), 0)
    draw = ImageDraw.Draw(mask)
    
    mcx = (cx - box[0]) * scale
    mcy = (cy - box[1]) * scale
    mrad = (radius + 0.25) * scale
    
    draw.ellipse((mcx - mrad, mcy - mrad, mcx + mrad, mcy + mrad), fill=255)
    mask = mask.resize((cw, ch), Image.Resampling.LANCZOS)
    
    cropped.putalpha(mask)
    
    out_path = os.path.join(out_dir, filename)
    cropped.save(out_path, 'PNG')
    print(f'Saved {filename} ({cw}x{ch}) for "{label}"')

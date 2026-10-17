import os
import cv2
import numpy as np
from PIL import Image

brain_dir = r'C:\Users\dhenp\.gemini\antigravity\brain\74eea9cb-9d1e-45ad-af1c-852fac63e935\.user_uploaded'
target_dir = r'c:\Users\dhenp\Downloads\Lumina\public\assets\stickers'

sheets = [
    ('dino_', 'media_1792221625221_8e6d2143.jpg'),
    ('turtle_', 'media_1792221625297_75525918.jpg'),
    ('frog_', 'media_1792221678645_35d0e5e2.jpg'),
    ('train_', 'media_1792221754864_4c886b1e.jpg'),
    ('space_', 'media_1792221754921_ee5a983a.jpg')
]

regions = [
    ('birthday_gift_box', 20, 340, 20, 340),
    ('birthday_cake_slice', 20, 340, 350, 670),
    ('game_controller', 20, 340, 680, 1000),
    ('water_bottle', 340, 660, 20, 340),
    ('pants_folded', 340, 660, 350, 670),
    ('birthday_card', 340, 660, 680, 1000)
]

for prefix, fname in sheets:
    p = os.path.join(brain_dir, fname)
    arr = np.array(Image.open(p))
    print(f'Processing {prefix} from {fname}...')

    for name, y1, y2, x1, x2 in regions:
        sub = arr[y1:y2, x1:x2]
        # Not white (R<240 or G<240 or B<240)
        not_white = (sub[:, :, 0] < 240) | (sub[:, :, 1] < 240) | (sub[:, :, 2] < 240)
        ys, xs = np.where(not_white)
        min_x = xs.min() + x1
        max_x = xs.max() + x1
        min_y = ys.min() + y1
        max_y = ys.max() + y1
        cx = (min_x + max_x) / 2.0
        cy = (min_y + max_y) / 2.0
        radius = max(max_x - min_x, max_y - min_y) / 2.0

        pad = 12
        box_size = int(np.ceil(2 * (radius + pad)))
        if box_size % 2 != 0:
            box_size += 1

        sx = int(round(cx - box_size / 2))
        sy = int(round(cy - box_size / 2))

        crop = arr[sy:sy+box_size, sx:sx+box_size].copy()
        h, w = crop.shape[:2]

        rgba = np.dstack([crop, np.full((h, w), 255, dtype=np.uint8)])
        crop_cx = cx - sx
        crop_cy = cy - sy

        Y, X = np.ogrid[:h, :w]
        dist = np.sqrt((X - crop_cx)**2 + (Y - crop_cy)**2)

        # Smooth anti-aliased circular alpha
        alpha = np.clip((radius + 1.0 - dist) * 255.0, 0, 255).astype(np.uint8)
        rgba[:, :, 3] = alpha

        # Ensure background white outside circle has alpha 0
        white = (crop[:, :, 0] > 235) & (crop[:, :, 1] > 235) & (crop[:, :, 2] > 235)
        rgba[white & (dist > radius - 2), 3] = 0

        # Resize to 216x216 with high-quality Lanczos
        pil_im = Image.fromarray(rgba)
        pil_resized = pil_im.resize((216, 216), Image.Resampling.LANCZOS)

        final = Image.new('RGBA', (240, 240), (0, 0, 0, 0))
        final.paste(pil_resized, (12, 12))

        out_name = f'{prefix}{name}.png'
        out_path = os.path.join(target_dir, out_name)
        final.save(out_path)
        print(f'  Saved {out_name}')

print('All 30 themed stickers processed and saved!')

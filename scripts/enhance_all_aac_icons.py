import os
import subprocess
import cv2
import numpy as np
from PIL import Image

EXE = r"C:\Users\dhenp\.gemini\antigravity\brain\74eea9cb-9d1e-45ad-af1c-852fac63e935\scratch\realesrgan\realesrgan-ncnn-vulkan.exe"
TEMP_DIR = r"C:\Users\dhenp\.gemini\antigravity\brain\74eea9cb-9d1e-45ad-af1c-852fac63e935\scratch\hd_pipeline"
OUT_DIR = r"c:\Users\dhenp\Downloads\Lumina\public\assets\stickers"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

pathA = r"C:\Users\dhenp\.gemini\antigravity\brain\74eea9cb-9d1e-45ad-af1c-852fac63e935\.user_uploaded\media_1792031688187_ca980ad5.jpg"
pathB = r"C:\Users\dhenp\.gemini\antigravity\brain\74eea9cb-9d1e-45ad-af1c-852fac63e935\.user_uploaded\media_1792031688187_1c36ade5.jpg"

icons = [
    # Sheet A icons
    {"file": pathA, "cx": 125, "cy": 285, "half": 98, "name": "aac_people.png"},
    {"file": pathA, "cx": 318, "cy": 285, "half": 98, "name": "aac_feelings.png"},
    {"file": pathA, "cx": 512, "cy": 285, "half": 98, "name": "aac_sensory.png"},
    {"file": pathA, "cx": 705, "cy": 285, "half": 98, "name": "aac_all_words.png"},
    {"file": pathA, "cx": 898, "cy": 285, "half": 98, "name": "aac_core.png"},

    # Sheet B icons
    {"file": pathB, "cx": 104, "cy": 217, "half": 85, "name": "aac_sentences.png"},
    {"file": pathB, "cx": 267, "cy": 217, "half": 85, "name": "aac_favorites.png"},
    {"file": pathB, "cx": 430, "cy": 217, "half": 85, "name": "aac_food.png"},
    {"file": pathB, "cx": 593, "cy": 217, "half": 85, "name": "aac_drinks.png"},
    {"file": pathB, "cx": 756, "cy": 217, "half": 85, "name": "aac_activities.png"},
    {"file": pathB, "cx": 919, "cy": 217, "half": 85, "name": "aac_places.png"},
]

def process_icon(item):
    name = item["name"]
    src_file = item["file"]
    cx, cy, half = item["cx"], item["cy"], item["half"]

    print(f"\n--- Processing {name} ---")
    img = Image.open(src_file)
    crop = img.crop((cx - half, cy - half, cx + half, cy + half))
    raw_crop_path = os.path.join(TEMP_DIR, f"raw_{name}")
    crop.save(raw_crop_path, "PNG")

    # Step 1: Real-ESRGAN 4x AI Upscale
    upscaled_path = os.path.join(TEMP_DIR, f"up4x_{name}")
    cmd = [EXE, "-i", raw_crop_path, "-o", upscaled_path, "-n", "realesrgan-x4plus-anime", "-s", "4"]
    subprocess.run(cmd, check=True)

    # Step 2: Read upscaled image
    im = cv2.imread(upscaled_path)
    im_rgb = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    h, w = im.shape[:2]

    # Step 3: Precise circle detection
    mask = np.all(im > [235, 235, 235], axis=2)
    fg_mask = (~mask).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest = max(contours, key=cv2.contourArea)
    (circle_cx, circle_cy), radius = cv2.minEnclosingCircle(largest)

    # Slight inward inset to guarantee zero white fringe on the circular badge edge
    r = radius - 1.5

    # Step 4: Anti-aliased subpixel alpha mask
    y_coords, x_coords = np.ogrid[:h, :w]
    dist = np.sqrt((x_coords - circle_cx)**2 + (y_coords - circle_cy)**2)

    alpha = np.zeros((h, w), dtype=np.uint8)
    inner = dist <= (r - 1.0)
    edge = (dist > (r - 1.0)) & (dist < (r + 1.0))
    alpha[inner] = 255
    alpha[edge] = np.clip((r + 1.0 - dist[edge]) / 2.0 * 255, 0, 255).astype(np.uint8)

    rgba = np.dstack((im_rgb, alpha))
    out_img = Image.fromarray(rgba, "RGBA")

    # Step 5: Tight crop perfectly centered on circle
    half_box = int(radius + 15)
    crop_box = (
        int(circle_cx - half_box),
        int(circle_cy - half_box),
        int(circle_cx + half_box),
        int(circle_cy + half_box)
    )
    tight_crop = out_img.crop(crop_box)

    # Step 6: Standardize to ultra-sharp 1024x1024 PNG
    final_1024 = tight_crop.resize((1024, 1024), Image.Resampling.LANCZOS)
    dest_path = os.path.join(OUT_DIR, name)
    final_1024.save(dest_path, "PNG")
    print(f"Saved HD {name} (1024x1024) to {dest_path}")

def main():
    for item in icons:
        process_icon(item)
    print("\nAll 11 icons have been upscaled to HD (1024x1024) and saved!")

if __name__ == "__main__":
    main()

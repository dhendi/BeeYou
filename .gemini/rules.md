# BeeYou Theming & Icon Prompt Rules

## 1. Option B Copy-Paste Prompts Format (STRICT)
- When presenting icon prompts, NEVER add introductory style paragraphs, preambles, or extra adjectives (e.g., do NOT add "Hand-drawn watercolor stationery sticker aesthetic with soft textured espresso-brown ink outlines...").
- NEVER split the prompts into multiple individual markdown code boxes.
- ALWAYS provide the prompts inside ONE SINGLE ````text ```` code box under `### **Copy-Paste Prompts (Option B)**`.
- Each item must strictly follow this exact 2-line template:
  ```text
  [Number]. [Item Name]:
  A cute hand-drawn [concise visual description], centered in a warm pastel yellow circle (#FCD873), planner sticker style on white background.
  ```

## 2. Icon Replacement Workflow
1. **Find Icons**: Identify obvious non-themed default icons across the app.
2. **Table Recommendations**: Present them in a neat 4-column table: `#`, `Default Icon`, `Themed Replacement`, `What it should look like`.
3. **Single Option B Prompt Box**: Provide the clean Option B prompts in one copy-paste code box.
4. **User Uploads Sheet**: Extract, anti-alias with circular transparency, and save to `public/assets/stickers/`.
5. **Side-by-Side Review**: Present visual comparison table before pushing.
6. **Push**: Commit and push to `origin/main` only after user approval.

## 3. Strict Guardrails
- NEVER touch or replace the 9-tile clinical AAC home dashboard (`TACTILE_AAC_TILES` in `src/components/ChildHomeView.tsx`).
- Zero water ripples in Dino Kingdom. Zero lotus leaves in Turtle Sanctuary.

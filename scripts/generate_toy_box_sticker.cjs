const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function renderSticker() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 512px;
      height: 512px;
      overflow: hidden;
    }
    svg {
      width: 480px;
      height: 480px;
    }
  </style>
</head>
<body>
  <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Subtle warm gradient for the circular badge -->
      <radialGradient id="discGrad" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#FFF0A8" />
        <stop offset="100%" stop-color="#FED676" />
      </radialGradient>
      <!-- Shadow filter -->
      <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#8C6228" flood-opacity="0.15" />
      </filter>
    </defs>

    <!-- Warm Honey Circle Badge -->
    <circle cx="200" cy="200" r="185" fill="url(#discGrad)" />

    <!-- Group for Toy Chest & Toys -->
    <g stroke="#2D241E" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      
      <!-- Back Open Lid of Wooden Chest (Curved vintage toy trunk lid) -->
      <path d="M 85 195 L 98 120 C 104 90 296 90 302 120 L 315 195 Z" fill="#B27A45" />
      <!-- Lid inside depth/shadow -->
      <path d="M 104 125 C 112 102 288 102 296 125 L 305 185 L 95 185 Z" fill="#8E5E32" opacity="0.35" stroke="none" />
      <!-- Wood grain on lid -->
      <path d="M 100 135 C 150 115 250 115 300 135" fill="none" stroke="#8E5E32" stroke-width="4.5" opacity="0.5" />
      <path d="M 94 165 C 150 150 250 150 306 165" fill="none" stroke="#8E5E32" stroke-width="4.5" opacity="0.5" />

      <!-- === TOYS INSIDE CHEST === -->

      <!-- 1. CUTE TEDDY BEAR (Left/Center) -->
      <g id="teddy">
        <!-- Bear Left Ear -->
        <circle cx="130" cy="125" r="22" fill="#B87B44" />
        <circle cx="130" cy="125" r="12" fill="#DEB183" stroke="none" />
        <!-- Bear Right Ear -->
        <circle cx="195" cy="125" r="22" fill="#B87B44" />
        <circle cx="195" cy="125" r="12" fill="#DEB183" stroke="none" />
        <!-- Bear Head -->
        <ellipse cx="162" cy="155" rx="42" ry="36" fill="#C98A50" />
        <!-- Muzzle -->
        <ellipse cx="162" cy="166" rx="20" ry="15" fill="#F3D5B5" stroke="#2D241E" stroke-width="4" />
        <!-- Nose & Mouth -->
        <path d="M 157 160 C 159 157 165 157 167 160 C 168 163 162 167 162 167 C 162 167 156 163 157 160 Z" fill="#2D241E" stroke="none" />
        <path d="M 162 167 L 162 173 M 158 173 C 160 176 164 176 166 173" fill="none" stroke="#2D241E" stroke-width="4" />
        <!-- Eyes -->
        <circle cx="147" cy="148" r="4.5" fill="#2D241E" stroke="none" />
        <circle cx="177" cy="148" r="4.5" fill="#2D241E" stroke="none" />
        <!-- Eye highlights -->
        <circle cx="145.5" cy="146.5" r="1.5" fill="#FFFFFF" stroke="none" />
        <circle cx="175.5" cy="146.5" r="1.5" fill="#FFFFFF" stroke="none" />
        <!-- Rosy Cheeks -->
        <ellipse cx="138" cy="158" rx="6" ry="4" fill="#E67E73" opacity="0.55" stroke="none" />
        <ellipse cx="186" cy="158" rx="6" ry="4" fill="#E67E73" opacity="0.55" stroke="none" />
      </g>

      <!-- 2. WOODEN / LEGO BUILDING BLOCKS & TOY TRAIN (Right) -->
      <g id="toys-right">
        <!-- Cute Wooden Toy Train Engine (Behind blocks) -->
        <g id="toy-train" transform="translate(242, 118)">
          <!-- Train Boiler/Body -->
          <rect x="0" y="24" width="46" height="26" rx="6" fill="#E54B4B" stroke="#2D241E" stroke-width="5" />
          <!-- Train Cab -->
          <rect x="24" y="8" width="28" height="42" rx="4" fill="#3B7CB8" stroke="#2D241E" stroke-width="5" />
          <!-- Train Cab Window -->
          <rect x="30" y="14" width="16" height="15" rx="3" fill="#FFF0A8" stroke="#2D241E" stroke-width="3.5" />
          <!-- Smokestack -->
          <path d="M 8 24 L 6 12 L 18 12 L 16 24 Z" fill="#F5C443" stroke="#2D241E" stroke-width="4.5" />
          <!-- Tiny puff of steam -->
          <circle cx="12" cy="6" r="3.5" fill="#FFFFFF" opacity="0.8" />
        </g>

        <!-- Blue Cube Block -->
        <g transform="translate(202, 136)">
          <!-- Top face -->
          <polygon points="30,0 60,10 30,20 0,10" fill="#72C1EB" />
          <!-- Left face -->
          <polygon points="0,10 30,20 30,52 0,42" fill="#4B9CD3" />
          <!-- Right face -->
          <polygon points="30,20 60,10 60,42 30,52" fill="#3683BD" />
          <!-- Outline -->
          <polygon points="30,0 60,10 60,42 30,52 0,42 0,10" fill="none" stroke-width="5.5" />
          <line x1="30" y1="20" x2="30" y2="52" stroke-width="5.5" />
          <!-- Stud on top -->
          <ellipse cx="30" cy="10" rx="8" ry="4" fill="#9CD8F7" stroke="#2D241E" stroke-width="3.5" />
        </g>

        <!-- Golden / Amber Block (Stacked) -->
        <g transform="translate(236, 154)">
          <!-- Top face -->
          <polygon points="22,0 44,8 22,16 0,8" fill="#FED676" />
          <!-- Left face -->
          <polygon points="0,8 22,16 22,42 0,34" fill="#E6AC39" />
          <!-- Right face -->
          <polygon points="22,16 44,8 44,34 22,42" fill="#C98F20" />
          <!-- Outline -->
          <polygon points="22,0 44,8 44,34 22,42 0,34 0,8" fill="none" stroke-width="5" />
          <line x1="22" y1="16" x2="22" y2="42" stroke-width="5" />
          <!-- Stud on top -->
          <ellipse cx="22" cy="8" rx="6.5" ry="3.5" fill="#FFF0A8" stroke="#2D241E" stroke-width="3" />
        </g>
      </g>

      <!-- 3. COLORFUL BOUNCY TOY BALL (Far Right Peeking) -->
      <g id="ball" transform="translate(275, 175)">
        <circle cx="16" cy="16" r="22" fill="#FFD15C" />
        <!-- Star or stripe on ball -->
        <path d="M 0 6 C 12 16 20 16 32 6 L 35 18 C 22 28 10 28 -2 18 Z" fill="#69C998" stroke="none" />
        <circle cx="16" cy="16" r="22" fill="none" stroke="#2D241E" stroke-width="6" />
      </g>

      <!-- === FRONT BODY OF WOODEN CHEST === -->
      <!-- Main Front Box -->
      <path d="M 82 195 L 318 195 L 306 288 C 304 298 296 304 286 304 L 114 304 C 104 304 96 298 94 288 Z" fill="#C4884E" />
      
      <!-- Top Rim of Box -->
      <rect x="76" y="188" width="248" height="15" rx="7" fill="#D99B5F" stroke="#2D241E" stroke-width="7" />

      <!-- Horizontal Wood Planks Texture Lines -->
      <path d="M 87 228 L 313 228" stroke="#A86E37" stroke-width="4.5" />
      <path d="M 91 264 L 309 264" stroke="#A86E37" stroke-width="4.5" />

      <!-- Bear Paws Resting on Top Rim of Chest -->
      <g id="bear-paws">
        <ellipse cx="132" cy="192" rx="13" ry="9" fill="#C98A50" stroke="#2D241E" stroke-width="5" />
        <ellipse cx="192" cy="192" rx="13" ry="9" fill="#C98A50" stroke="#2D241E" stroke-width="5" />
      </g>

      <!-- Vertical Corner Reinforcement Brackets -->
      <path d="M 84 203 L 102 203 L 108 298 L 94 298 Z" fill="#8F5E2E" stroke="#2D241E" stroke-width="5" />
      <path d="M 316 203 L 298 203 L 292 298 L 306 298 Z" fill="#8F5E2E" stroke="#2D241E" stroke-width="5" />
      
      <!-- Rivets / Brass Studs on Brackets -->
      <circle cx="94" cy="216" r="3" fill="#FEE58F" stroke="#2D241E" stroke-width="2" />
      <circle cx="98" cy="284" r="3" fill="#FEE58F" stroke="#2D241E" stroke-width="2" />
      <circle cx="306" cy="216" r="3" fill="#FEE58F" stroke="#2D241E" stroke-width="2" />
      <circle cx="302" cy="284" r="3" fill="#FEE58F" stroke="#2D241E" stroke-width="2" />

      <!-- Brass Center Lock Latch -->
      <g id="latch" transform="translate(200, 203)">
        <rect x="-16" y="0" width="32" height="28" rx="6" fill="#F5C443" stroke="#2D241E" stroke-width="5" />
        <!-- Keyhole -->
        <circle cx="0" cy="11" r="3.5" fill="#2D241E" stroke="none" />
        <polygon points="-2,11 2,11 3,19 -3,19" fill="#2D241E" stroke="none" />
      </g>

    </g>
  </svg>
</body>
</html>
  `;

  await page.setContent(html);
  const outPath = path.resolve('public/assets/stickers/toy_box_rendered.png');
  await page.screenshot({ path: outPath, omitBackground: true });
  console.log('Successfully rendered toy box sticker to:', outPath);

  await browser.close();
}

renderSticker().catch(err => {
  console.error(err);
  process.exit(1);
});

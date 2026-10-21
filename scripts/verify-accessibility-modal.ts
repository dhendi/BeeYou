import puppeteer from 'puppeteer-core';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('beeyou_app_session_opened', 'true');
    localStorage.setItem('beeyou_asset_cache_version', 'beeyou-webp-v2.3-1366');
    localStorage.setItem('beeyou_asset_full_cache_version', 'beeyou-webp-v2.3-1366');
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_release_version', 'v11-piper-neural-20261021');
    localStorage.setItem('beeyou_voice_persona', 'amy');
    localStorage.setItem('beeyou_active_device_view', 'caregiver');
    localStorage.setItem('beeyou_user_role', 'caregiver');
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Click 'Voice Studio & Sensory' button in top header
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const vsBtn = buttons.find(b => b.textContent && b.textContent.includes('Voice Studio & Sensory'));
    if (vsBtn) vsBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const vsPath = 'C:\\Users\\dhenp\\.gemini\\antigravity\\brain\\74eea9cb-9d1e-45ad-af1c-852fac63e935\\caregiver_voice_studio_verified.png';
  await page.screenshot({ path: vsPath });
  console.log('Voice studio screenshot saved to:', vsPath);

  // Click 'Open Full Preferences Modal' button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const prefBtn = btns.find(b => b.textContent && b.textContent.includes('Open Full Preferences Modal'));
    if (prefBtn) prefBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Click 'Sound & Voice' tab inside Accessibility Preferences Modal
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const soundTab = tabs.find(b => b.textContent && b.textContent.includes('Sound & Voice'));
    if (soundTab) soundTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const screenshotPath = 'C:\\Users\\dhenp\\.gemini\\antigravity\\brain\\74eea9cb-9d1e-45ad-af1c-852fac63e935\\accessibility_modal_sound_tab_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Modal screenshot saved to:', screenshotPath);

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

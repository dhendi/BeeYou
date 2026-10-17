const puppeteer = require('puppeteer-core');
const path = require('path');

const artifactDir = 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });

  console.log('Navigating to Child App...');
  await page.goto('http://localhost:3000/?role=child', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_user_persona', 'child');
    localStorage.setItem('beeyou_active_theme', 'theme-classic');
  });
  await page.goto('http://localhost:3000/?role=child', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Navigate to My Routine
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const routineBtn = btns.find(b => b.textContent && b.textContent.includes('My Routine'));
    if (routineBtn) routineBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Navigate to Adventures subtab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const advBtn = btns.find(b => b.textContent && b.textContent.includes('Adventures'));
    if (advBtn) advBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click Social Stories sub-tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const storyTab = btns.find(b => b.textContent && b.textContent.includes('Social Stories'));
    if (storyTab) storyTab.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot of Social Stories list
  const shotGrid = path.join(artifactDir, 'screenshot_fixed_stories_grid.png');
  await page.screenshot({ path: shotGrid });
  console.log('Saved grid:', shotGrid);

  // Click "Taking Turns with Toys"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const takingTurns = btns.find(b => b.textContent && b.textContent.includes('Taking Turns with Toys'));
    if (takingTurns) takingTurns.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot of Story Reader Page 1
  const shotReader = path.join(artifactDir, 'screenshot_fixed_story_reader.png');
  await page.screenshot({ path: shotReader });
  console.log('Saved reader:', shotReader);

  await browser.close();
  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

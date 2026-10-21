import puppeteer from 'puppeteer-core';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1050 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_voice_persona', 'amy');
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // Open Hub
  await page.evaluate(() => {
    const hubBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Hub'));
    if (hubBtn) hubBtn.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // Enter PIN
  await page.evaluate(() => {
    const keypadButtons = Array.from(document.querySelectorAll('button'));
    ['1', '2', '3', '4'].forEach(digit => {
      const btn = keypadButtons.find(b => b.textContent && b.textContent.trim() === digit);
      if (btn) btn.click();
    });
  });

  await new Promise(r => setTimeout(r, 1000));

  // Click Voice Studio tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const vsTab = tabs.find(b => b.textContent && b.textContent.includes('Voice Studio'));
    if (vsTab) vsTab.click();
  });

  await new Promise(r => setTimeout(r, 800));

  // Click 'Show All Voices' button
  await page.evaluate(() => {
    const showAllBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Show All'));
    if (showAllBtn) showAllBtn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  // Scroll to All Voices section
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent && h.textContent.includes('All Voices'));
    if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  await new Promise(r => setTimeout(r, 500));

  const screenshotPath = 'C:\\Users\\dhenp\\.gemini\\antigravity\\brain\\74eea9cb-9d1e-45ad-af1c-852fac63e935\\piper_all_voices_grid_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('All Voices screenshot saved to:', screenshotPath);

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

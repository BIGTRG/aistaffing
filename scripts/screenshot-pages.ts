import { chromium } from "playwright";

const BASE_URL = "https://preview-ai-staffing-agency-58b75145.viktor.space";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Screenshot 1: Landing page
  console.log("Taking landing page screenshot...");
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/ss-landing.png", fullPage: false });

  // Scroll to agents section
  console.log("Taking agents section screenshot...");
  await page.evaluate(() => {
    const el = document.querySelector('#agents') || document.querySelector('[id*="agent"]');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tmp/ss-agents-section.png", fullPage: false });

  // Scroll to pricing
  console.log("Taking pricing screenshot...");
  await page.evaluate(() => {
    const el = document.querySelector('#pricing') || document.querySelector('[id*="pric"]');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tmp/ss-pricing.png", fullPage: false });

  // Screenshot 2: Login page
  console.log("Taking login page screenshot...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/ss-login.png", fullPage: false });

  // Now sign up / sign in to get to the portal
  console.log("Signing up test user...");
  await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/ss-signup.png", fullPage: false });

  await browser.close();
  console.log("Done! Screenshots saved to tmp/");
}

main().catch((e) => { console.error(e); process.exit(1); });

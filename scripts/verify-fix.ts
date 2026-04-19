import { chromium } from "playwright";

const BASE = "https://app-ai-staffing-agency-btazn1iw7-viktorspaces.vercel.app";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  console.log("1. Landing page...");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/fix-01-landing.png" });

  console.log("2. Login page...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/fix-02-login.png" });

  console.log("3. Signup page...");
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/fix-03-signup.png" });

  await browser.close();
  console.log("Done!");
}

main().catch(e => { console.error(e); process.exit(1); });

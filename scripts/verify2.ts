import { chromium } from "playwright";
const BASE = "https://app-ai-staffing-agency-1o5f5jc9z-viktorspaces.vercel.app";
async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log("Landing...");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/final-01-landing.png" });
  console.log("Login...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/final-02-login.png" });
  await browser.close();
  console.log("Done!");
}
main().catch(e => { console.error(e); process.exit(1); });

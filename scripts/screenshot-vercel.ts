import { chromium } from "playwright";

const BASE = "https://app-ai-staffing-agency-rir8gqesn-viktorspaces.vercel.app";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 1. Landing hero
  console.log("1. Landing hero...");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/v-01-landing.png" });

  // 2. Login
  console.log("2. Login...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/v-02-login.png" });

  // 3. Sign in and get to portal
  console.log("3. Signing in...");
  const testBtn = page.locator("text=Continue as Test User");
  if (await testBtn.isVisible({ timeout: 3000 })) {
    await testBtn.click();
    await page.waitForTimeout(4000);
  }
  console.log("  -> URL: " + page.url());
  await page.screenshot({ path: "tmp/v-03-after-login.png" });

  // 4. Dashboard
  console.log("4. Dashboard...");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/v-04-dashboard.png" });

  // 5. Agents
  console.log("5. Agents...");
  await page.goto(`${BASE}/agents`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/v-05-agents.png" });

  // 6. Admin
  console.log("6. Admin...");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/v-06-admin.png" });

  // 7. Billing
  console.log("7. Billing...");
  await page.goto(`${BASE}/billing`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/v-07-billing.png" });

  // 8. Partners
  console.log("8. Partners...");
  await page.goto(`${BASE}/partners`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/v-08-partners.png" });

  await browser.close();
  console.log("Done!");
}

main().catch(e => { console.error(e); process.exit(1); });

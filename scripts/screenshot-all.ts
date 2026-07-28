import { chromium } from "playwright";

const BASE = "https://preview-ai-staffing-agency-58b75145.viktor.space";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 1. Landing hero
  console.log("1. Landing hero...");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/01-landing-hero.png" });

  // 2. Scroll to agent roster
  console.log("2. Agent roster...");
  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tmp/02-agents-section.png" });

  // 3. Scroll to pricing
  console.log("3. Pricing...");
  await page.evaluate(() => window.scrollTo(0, 5000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tmp/03-pricing.png" });

  // 4. Login
  console.log("4. Login...");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/04-login.png" });

  // 5. Sign up
  console.log("5. Signup...");
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tmp/05-signup.png" });

  // 6. Sign in as test user to get to portal
  console.log("6. Signing in as test user...");
  // Click "Continue as Test User" button
  const testBtn = page.locator("text=Continue as Test User");
  if (await testBtn.isVisible({ timeout: 3000 })) {
    await testBtn.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: "tmp/06-after-login.png" });
    console.log("  -> URL after login: " + page.url());
  }

  // 7. If we're at onboarding, screenshot it
  if (page.url().includes("onboarding") || page.url().includes("dashboard")) {
    console.log("7. Current page after auth...");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/07-portal.png" });
  }

  // 8. Try dashboard
  console.log("8. Dashboard...");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/08-dashboard.png" });

  // 9. Agents page
  console.log("9. Agents page...");
  await page.goto(`${BASE}/agents`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/09-agents.png" });

  // 10. Billing
  console.log("10. Billing...");
  await page.goto(`${BASE}/billing`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/10-billing.png" });

  // 11. Admin
  console.log("11. Admin...");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/11-admin.png" });

  // 12. Partners
  console.log("12. Partners...");
  await page.goto(`${BASE}/partners`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/12-partners.png" });

  await browser.close();
  console.log("All screenshots saved to tmp/");
}

main().catch(e => { console.error(e); process.exit(1); });

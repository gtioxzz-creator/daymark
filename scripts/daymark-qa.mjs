import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] || "http://127.0.0.1:8080";
const outDir = "/workspace/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];

async function shot(page, name) {
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: true });
}

async function run() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot(page, "today-desktop.png");

  // Open chemistry event from today
  const chem = page.getByRole("button", { name: /Chemistry study block/ });
  await chem.click();
  await page.waitForTimeout(300);
  const title = page.locator("h2").filter({ hasText: /Move something|Put it on/ });
  if (!(await title.count())) {
    throw new Error("Event modal did not open");
  }
  await shot(page, "event-modal.png");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  // Add a transaction from today
  await page.getByRole("button", { name: /Transaction/ }).click();
  await page.waitForTimeout(200);
  await page.getByPlaceholder("e.g. Bulla paycheck").fill("Bulla paycheck");
  await page.getByPlaceholder("Amount").fill("186.40");
  await page.getByRole("button", { name: "Save transaction" }).click();
  await page.waitForTimeout(400);
  const balance = await page.locator("text=/\\$207\\.40/").count();
  if (!balance) throw new Error("Transaction did not update the balance");
  await shot(page, "today-after-pay.png");

  await page.goto(`${base}/week`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "week-scrolled.png");
  const eventChip = page.locator("button", { hasText: "Chemistry study block" });
  await eventChip.first().click();
  await page.waitForTimeout(250);
  if (!(await page.getByRole("button", { name: "Save changes" }).count())) {
    throw new Error("Week event click did not open editor");
  }
  await page.keyboard.press("Escape");

  await page.goto(`${base}/money`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  if (!(await page.locator("text=/Bulla paycheck/").count())) {
    throw new Error("Transaction did not persist onto the ledger");
  }
  await shot(page, "money-after-pay.png");

  await page.goto(`${base}/tasks`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Complete task" }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "tasks-after-complete.png");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", (err) => errors.push(`mobile: ${err}`));
  await mobile.goto(base, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(400);
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  await mobile.screenshot({ path: `${outDir}/today-mobile.png`, fullPage: true });
  if (overflow) errors.push("mobile horizontal overflow on today");

  await mobile.goto(`${base}/week`, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: `${outDir}/week-mobile.png`, fullPage: false });

  console.log(JSON.stringify({ ok: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => browser.close());

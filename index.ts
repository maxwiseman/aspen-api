import puppeteer from "puppeteer";

async function getClasses() {
  const browser = await puppeteer.launch({
    headless: process.env.VERCEL_ENV === "production" ? "new" : false,
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  page.setViewport({ width: 1920, height: 1080 });

  // Login
  await page.goto("https://aspen.knoxschools.org");
  await page.waitForSelector("#username", { timeout: 2000 });
  await page.type("#username", process.env.ASPEN_USERNAME || "");
  await page.type("#password", process.env.ASPEN_PASSWORD || "");
  await page.click("#logonButton");
  try {
    await page.waitForSelector(".errorMessageH1", { timeout: 500 });
    console.log("Credentials incorrect!");
    await browser.close();
    return;
  } catch {
    console.log("Login successful!");
  }

  // Go to the Academics tab
  await page.goto(
    "https://aspen.knoxschools.org/aspen/portalClassList.do?navkey=academics.classes.list"
  );
  await page.waitForSelector(".listGrid", { timeout: 2000 });
  await page.screenshot({ path: "output.png" });
  await browser.close();
}

getClasses();

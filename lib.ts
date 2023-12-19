import type { Page } from "puppeteer";

export async function Login(page: Page, onError: () => void) {
  await page.goto("https://aspen.knoxschools.org");
  await page.waitForSelector("#username", { timeout: 2000 });
  await page.type("#username", process.env.ASPEN_USERNAME || "");
  await page.type("#password", process.env.ASPEN_PASSWORD || "");
  await page.click("#logonButton");
  try {
    await page.waitForSelector(".errorMessageH1", { timeout: 500 });
    onError();
  } catch {
    console.log("Login successful!");
  }
}

export async function GoToAcademics(page: Page) {
  await page.goto(
    "https://aspen.knoxschools.org/aspen/portalClassList.do?navkey=academics.classes.list"
  );
  await page.waitForSelector(".listGrid", { timeout: 2000 });
}

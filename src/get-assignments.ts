import puppeteer from "puppeteer";
import { goToAcademics, login } from "./lib";

export async function getAssignments(id: string) {
  const browser = await puppeteer.launch({
    headless: process.env.VERCEL_ENV === "production" ? "new" : false,
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  page.setViewport({ width: 1920, height: 1080 });

  // Login
  await login(page, async () => {
    await browser.close();
  });

  // Go to the Academics tab
  await goToAcademics(page);

  // Go to class by ID
  await page.evaluate(
    `doParamSubmit(2100, document.forms['classListForm'], '${id}');`
  );

  // Go to Assignments page
  await page.waitForSelector("a[title='List of assignments']", {
    timeout: 2000,
  });
  await page.click("a[title='List of assignments']");
  await page.waitForSelector("#dataGrid", { timeout: 2000 });
  if (!process.env.VERCEL_ENV) await page.screenshot({ path: "output.png" });

  // Extract data
  const name = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(2) a",
    elements => elements.map(element => element.innerText)
  );
  const category = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(3)",
    elements => elements.map(element => element.innerText)
  );
  const pointsPossible = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(4)",
    elements => elements.map(element => element.innerText)
  );
  const dateAssigned = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(5)",
    elements => elements.map(element => element.innerText)
  );
  const dateDue = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(6)",
    elements => elements.map(element => element.innerText)
  );
  const extraCredit = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(7)",
    elements => elements.map(element => element.innerText)
  );
  const score = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(8) td:nth-of-type(2)",
    elements => elements.map(element => element.innerText)
  );
  const feedback = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(9)",
    elements => elements.map(element => element.innerText)
  );

  const data = name.map((assignmentName, index) => {
    return {
      name: name[index],
      category: category[index],
      pointsPossible: pointsPossible[index],
      dateAssigned: Date.parse(dateAssigned[index]),
      dateDue: Date.parse(dateDue[index]),
      extraCredit: extraCredit[index] === "Y",
      score: parseFloat(score[index]) || "M",
      feedback: feedback[index],
    };
  });
  console.log(data);

  await browser.close();

  return data;
}

import puppeteer from "puppeteer";
import { GoToAcademics, Login } from "./lib";

export async function getClasses() {
  const browser = await puppeteer.launch({
    headless: process.env.VERCEL_ENV === "production" ? "new" : false,
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  page.setViewport({ width: 1920, height: 1080 });

  // Login
  await Login(page, async () => {
    console.log("Credentials incorrect!");
    await browser.close();
  });

  // Go to the Academics tab
  await GoToAcademics(page);
  await page.screenshot({ path: "output.png" });

  // Get all of the class IDs
  const links = await page.$$eval(
    "tr:not(:first-of-type) > td:nth-of-type(2) > a",
    elements => elements.map(element => element.getAttribute("href"))
  );
  const names = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(2) > a",
    elements => elements.map(element => element.innerText)
  );
  const schedule = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(3)",
    elements => elements.map(element => element.innerText)
  );
  const term = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(4)",
    elements => elements.map(element => element.innerText)
  );
  const teachers = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(5)",
    elements => elements.map(element => element.innerText)
  );
  const teacherEmails = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(6) > a",
    elements => elements.map(element => element.innerText)
  );
  const termGrades = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(7)",
    elements => elements.map(element => element.innerText)
  );
  const absences = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(8)",
    elements => elements.map(element => element.innerText)
  );
  const tardies = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(9)",
    elements => elements.map(element => element.innerText)
  );
  const dismissals = await page.$$eval(
    "#dataGrid tr:not(:first-of-type) > td:nth-of-type(10)",
    elements => elements.map(element => element.innerText)
  );
  const data = links.map((link, index) => {
    return {
      id: /(?<=javascript:doParamSubmit\(2100, document.forms\['classListForm'\], ').*(?='\))/.exec(
        links[index]
      )?.[0],
      name: names[index],
      schedule: schedule[index],
      term: term[index],
      teachers: teachers[index].split(";"),
      teacherEmail: teacherEmails[index],
      termGrade: parseInt(termGrades[index]) || 100,
      absences: parseInt(absences[index]),
      tardies: parseInt(tardies[index]),
      dismissals: parseInt(dismissals[index]),
    };
  });
  console.log(data);
  await browser.close();
}

export interface ClassData {
  id: string;
  name: string;
  schedule: string;
  term: string;
  teachers: string[];
  teacherEmail: string;
  termGrade: number;
  absences: number;
  tardies: number;
  dismissals: number;
}

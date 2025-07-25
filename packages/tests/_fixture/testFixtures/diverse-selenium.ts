import os from "node:os";
import cp from "node:child_process";
import chrome from "selenium-webdriver/chrome";
import { Builder, By, LogInspector, WebDriver } from "selenium-webdriver";
import { TestProvision } from "^jarunc";
import { pollAsync } from "^yapu";

let cached_driver: WebDriver;
const timeout = 4000;

/**
 *
 * see: https://www.selenium.dev/documentation/webdriver/browsers/chrome/
 * doc: https://stackoverflow.com/questions/tagged/selenium-chromedriver%2bjavascript?tab=Frequent
 */
const makeWebDriver = async (prov: TestProvision) => {
  const options = new chrome.Options()

    // .addArguments("--headless=new"); //without `=new` logs disappear
    .addArguments("--headless");
  // .addArguments("--incognito");
  // .addArguments("--start-maximized");
  // .addArguments("--window-size=500,500");

  //https://chromedriver.chromium.org/capabilities#h.p_ID_106
  // .set("goog:chromeOptions", { args: ["window-size=500,500"] })

  // .setPageLoadStrategy("normal"); //none, eager, normal. None makes it break.

  // (options as any).enableBidi();

  const driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  const inspector = await LogInspector(driver);

  //works
  // await inspector.onConsoleEntry(console.log); //needs enableBidi
  //works
  await inspector.onJavascriptException(console.log); //needs enableBidi

  // killing the browser after each test is waste full.
  //  it also makes it impossible to reuse the session
  // prov.finally(() => driver.quit());

  return driver;
};

/**
 *
 */
export const getWebDriverAtUrl = async (prov: TestProvision, url: string) => {
  if (!cached_driver) {
    //quick fix to kill last instance
    //  needed because subprocesses are not killed automatically, when worker thread is terminated.

    if (os.platform() === "win32") {
      cp.execSync("WMIC PROCESS where \"name='chrome.exe'\" delete"); //ignore output
      cp.execSync("WMIC PROCESS where \"name='chromedriver.exe'\" delete"); //ignore output
    } else {
      //Warning only needed in interactive testing, not CI.
      // console.log("Warning: chrome processes will not be properly killed, on platform: " + os.platform()); // prettier-ignore
    }

    cached_driver = await makeWebDriver(prov);
  }

  await cached_driver.get(url);

  return cached_driver;
};

/**
 *
 */
export const getWebDriverAtPath = async (prov: TestProvision, path: string) => {
  const url = "http://localhost:3000/" + path.replace(/^\//, "");

  return getWebDriverAtUrl(prov, url);
};

/**
 *
 */
export const getHtml = async (prov: TestProvision, url: string) =>
  (await getWebDriverAtUrl(prov, url))
    .findElement(By.css("html"))
    .getAttribute("innerHTML");

/**
 *
 */
export const getElementRaw = async (
  driver: WebDriver,
  by: any,
  errorMsg1: string,
  errorMsg2: string
) => {
  const elements = await pollAsync(
    async () => {
      const elms = await driver.findElements(by);

      return { done: elms.length !== 0, value: elms };
    },
    200,
    timeout,
    errorMsg1
  );

  if (elements.length !== 1) {
    throw new Error(errorMsg2);
  }

  return elements[0];
};

/**
 *
 */
export const getElement = async (driver: WebDriver, css: string) =>
  getElementRaw(
    driver,
    By.css(css),
    "Timeout searching for " + css,
    "Found several elements with css: " + css
  );

/**
 *
 */
export const getLink = async (driver: WebDriver, linkText: string) =>
  getElementRaw(
    driver,
    By.linkText(linkText),
    "Timeout searching for link: " + linkText,
    "Found several links: " + linkText
  );

/**
 *
 */
export const pageContains = async (driver: WebDriver, str: string) =>
  elementContains(driver, "body", str);

/**
 *
 */
export const elementContains = async (
  driver: WebDriver,
  css: string,
  str: string
) => {
  const element = await getElement(driver, css);

  //
  // check that text matches.
  //

  await pollAsync(
    async () => (await element.getText()).includes(str),
    200,
    timeout,
    "Timeout waiting for content to appear in: " + css + "\n" + str
  );
};

/**
 *
 */
export const clickLink = async (driver: WebDriver, linkText: string) => {
  const link = await getLink(driver, linkText);

  // ensure link is clickable (in viewport)

  await (driver as any).actions().scroll(0, 0, 0, 0, link).perform();

  //click

  await link.click();
};

/**
 *
 */
export const sendKeys = async (driver: WebDriver, css: string, str: string) => {
  const elm = await getElement(driver, css);

  //send

  await elm.sendKeys(str);
};

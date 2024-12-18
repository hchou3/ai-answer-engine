// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer
import chromium from "@sparticuz/chromium-min";
import { groqResponse } from "@/app/utils/groqClient";
import puppeteer from "puppeteer-core";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;
await chromium.font(
  "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
);

console.log("Print Local Chromium Path");
const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
console.log(isLocal);

console.log("Print Chromium Path");
const executablePath = await chromium.executablePath(
  `https://chromium-executable-39193i921.s3.us-east-1.amazonaws.com/chromium-v131.0.1-pack.tar`
);
console.log(executablePath);

const browser = await puppeteer.launch({
  args: isLocal
    ? puppeteer.defaultArgs()
    : [...chromium.args, "--hide-scrollbars", "--incognito", "--no-sandbox"],
  defaultViewport: chromium.defaultViewport,
  executablePath: process.env.CHROME_EXECUTABLE_PATH || executablePath,
  headless: chromium.headless,
  ignoreDefaultArgs: ["--disable-extensions"],
});

const page = await browser.newPage();
await page.goto(
  "https://edition.cnn.com/2024/12/06/science/nasa-chief-trump-pick-jared-isaacman/index.html",
  { waitUntil: "networkidle2" }
);
const content = await page.content();
await browser.close();

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const urls: string[] =
      message.match(
        /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim
      ) || [];
    console.log("URLS:" + urls);
    const response = await groqResponse(message);
    return Response.json({ message: response });
  } catch (error) {
    console.log("Error: " + error);
  }
}

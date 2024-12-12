// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextResponse, NextRequest } from "next/server";
import * as cheerio from "cheerio";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export async function GET() {}

export async function POST(req: Request, userId: Number) {
  await chromium.font(
    "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
  );

  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
  const browser = await puppeteer.launch({
    args: isLocal
      ? puppeteer.defaultArgs()
      : [...chromium.args, "--hide-scrollbars", "--incognito", "--no-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath()),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto("https://example.com");
  const pageTitle = await page.title();
  await browser.close();

  try {
    //If url in message, u need to parse it
    //U need to user puppeteer to extract dynamic JS url pages
    //if groq rate limit hit, use google gemini models
    //When parsing a URL, check if it exists in your cache first
    const data = await req.json();
    const message = data.body;
    const urls: string[] = message.match("https?:\/\/[^\s/$.?#].[^\s]*") || [];

    const results = await Promise.all(
      urls.map(async (url) =>
        try{
          const article = await fetch(url);
          const contentType = article.headers.get("content-type") || "";
          if (contentType.includes("text/html")) {
            const html = await article.text();
            const $ = cheerio.load(html);
            const title = $("title").text(); // Example: Extract the <title>
            return { url, type: "static", title, html };
          }else{
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle2" });

            const dynamicContent = await page.content(); // Get the HTML of the rendered page
            const title = await page.title(); // Extract the title dynamically
            await browser.close();

            return { url, type: "dynamic", title, html: dynamicContent };

          }
        }
          catch(error){};

      )
    );



    return NextResponse.json({});
  } catch (error) {
    console.log("Not a valid Message!");
  }
}

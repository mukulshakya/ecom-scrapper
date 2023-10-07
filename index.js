require("dotenv").config();
// logger(process.env);
const axios = require("axios");
const logger = require("debug")("scrapper:main");
const Ticker = require("./utils/ticker");
// const flipkartScrapper = require("./utils/flipkart");
const ecomScrapper = require("./utils/ecom");

const TICKER_DURATION = process.env.TICKER_DURATION
  ? parseInt(process.env.TICKER_DURATION)
  : 60 * 1000;

const URLS = [
  // pro 256GB
  "https://www.flipkart.com/apple-iphone-14-pro-space-black-256-gb/p/itmbf9b9d0d108a7",
  "https://www.flipkart.com/apple-iphone-14-pro-deep-purple-256-gb/p/itmfbeb0684432d7",
  "https://www.flipkart.com/apple-iphone-14-pro-gold-256-gb/p/itm9b3566b996597",
  "https://www.flipkart.com/apple-iphone-14-pro-silver-256-gb/p/itm769b7792c9a08",
  // pro 512GB
  "https://www.flipkart.com/apple-iphone-14-pro-gold-512-gb/p/itm2baef06bbd342",
  "https://www.flipkart.com/apple-iphone-14-pro-deep-purple-512-gb/p/itm8b019143e0c10",
  "https://www.flipkart.com/apple-iphone-14-pro-space-black-512-gb/p/itm67843bf67dbae",
  "https://www.flipkart.com/apple-iphone-14-pro-silver-512-gb/p/itm7e2568f4b25ad",
  // pro max 256GB
  "https://www.flipkart.com/apple-iphone-14-pro-max-silver-256-gb/p/itm111e35f4e1caa",
  "https://www.flipkart.com/apple-iphone-14-pro-max-space-black-256-gb/p/itm8a92b3d600e04",
  "https://www.flipkart.com/apple-iphone-14-pro-max-deep-purple-256-gb/p/itm5d37f9e956ec7",
  "https://www.flipkart.com/apple-iphone-14-pro-max-gold-256-gb/p/itmd21bfa03be8c2",
];

async function handler() {
  logger("starting handler");
  try {
    for (const url of URLS) {
      logger(url);
      //   const response = await flipkartScrapper(url);
      const response = await ecomScrapper.getProductDetails(url, "flipkart");
      if (
        response &&
        response.ok &&
        !["Sold Out", "Coming Soon"].includes(response.availability)
      ) {
        logger("Availability:", response);
        // await notify(`${response.link} @ ${response.price}`);
        logger("Notification sent");
      }
      //   logger("response:", response);
    }
  } catch (e) {
    logger("error:", e);
  }
}

async function notify(message) {
  logger(message);
  return axios({
    method: "post",
    url: "https://api.brevo.com/v3/transactionalSMS/sms",
    headers: {
      accept: "application/json",
      "api-key": process.env.API_KEY,
      "content-type": "application/json",
    },
    data: {
      type: "transactional",
      unicodeEnabled: false,
      recipient: process.env.PHONE_NUMBER,
      sender: "ecomscrap",
      content: message,
    },
  });
}

(async function () {
  logger("TICKER_DURATION:", TICKER_DURATION);
  logger("API_KEY:", process.env.API_KEY);
  logger("PHONE_NUMBER:", process.env.PHONE_NUMBER);
  const ticker = new Ticker(handler, TICKER_DURATION);
  ticker.run();
})();

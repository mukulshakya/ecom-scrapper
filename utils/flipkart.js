const cheerio = require("cheerio");
const axios = require("axios");

function findNestedObj(entireObj) {
  let finalObj = {
    title: null,
    pricing: null,
    imageUrl: null,
    webUrl: null,
    availability: "Available",
  };
  try {
    JSON.stringify(entireObj, (_, nestedValue) => {
      for (const key of [
        "pricing",
        "titleComponent",
        "imageUrl",
        "webUrl",
        "widget",
      ]) {
        if (nestedValue && nestedValue[key]) {
          if (
            ["imageUrl", "webUrl"].includes(key) &&
            typeof nestedValue[key] === "string"
          )
            finalObj[key] = nestedValue[key];
          else if (key === "titleComponent")
            finalObj["title"] = nestedValue[key]["value"]["title"];
          else if (key === "pricing" && nestedValue[key]["finalPrice"])
            finalObj["pricing"] = nestedValue[key]["finalPrice"]["value"];
          else if (
            key === "widget" &&
            nestedValue[key]["type"] === "AVAILABILITY"
          )
            finalObj["availability"] =
              nestedValue[key]["data"]["announcementComponent"]["value"][
                "title"
              ];
        }
      }
      return nestedValue;
    });
  } catch (e) {
    // logger(e);
  } finally {
    if (finalObj.pricing) finalObj.pricing = parseInt(finalObj.pricing);
    return finalObj;
  }
}

module.exports = (url) =>
  new Promise((resolve, reject) => {
    axios
      .get(url, {
        headers: {
          "User-Agent": "PostmanRuntime/7.32.3",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
        },
        method: "get",
        maxBodyLength: Infinity,
      })
      .then((response) => {
        const $ = cheerio.load(response.data);
        const elem = $("script#is_script")
          .html()
          .toString()
          .replace(/^window.__INITIAL_STATE__ = /, "")
          .replace(/;$/, "");

        const found = findNestedObj(JSON.parse(elem));
        resolve(found);
      })
      .catch((e) => {
        // logger(e);
        reject(e);
      });
  });

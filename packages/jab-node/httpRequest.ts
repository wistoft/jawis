import http, { RequestOptions } from "http";
import https from "https";

/**
 *
 */
export const httpRequest = (deps: RequestOptions) =>
  new Promise<{ code: string; data: string }>((resolve, reject) => {
    const options: RequestOptions = {
      method: "GET",
      ...deps,
    };

    const module = deps.protocol === "https:" ? https : http;

    const req = module.request(options, (res) => {
      let data = "";
      const code = "" + res.statusCode;

      res.setEncoding("utf8");

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({ code, data });
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    // finish request
    req.end();
  });

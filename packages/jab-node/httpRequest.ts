import http, { RequestOptions } from "http";

/**
 *
 */
export const httpRequest = (deps: RequestOptions) =>
  new Promise<{ code: string; data: string }>((resolve, reject) => {
    const options: RequestOptions = {
      method: "GET",
      ...deps,
    };

    const req = http.request(options, (res) => {
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

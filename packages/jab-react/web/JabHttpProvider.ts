import { err } from "^jab";

/**
 * hacky
 */
export class JabHttpProvider<HttpRequest> {
  constructor(private URL: string) {}

  public apiRequest = (reqBody: HttpRequest) =>
    fetch(this.URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    })
      .then(this.handleRawResponse(reqBody))
      .then(this.handleServerResponse(reqBody));

  /**
   *
   * impl
   *   can't use response.json(). Because response text will be unreachable if json can't be parsed.
   */
  private handleRawResponse = (request: HttpRequest) => (
    responseObject: Response
  ) =>
    responseObject.text().then((json) => {
      try {
        return JSON.parse(json);
      } catch (error) {
        err("Error parsing server response: " + error.message, {
          json,
          request,
          URL: this.URL,
        });
      }
    });

  /**
   *
   */
  private handleServerResponse = (request: HttpRequest) => (response: any) => {
    if (response.status === "ok") {
      return;
    } else if (response.status === "value") {
      return response.value;
    } else if (response.status === "err") {
      err("Server: " + response.message, {
        request,
        URL: this.URL,
      });
    } else {
      err("Invalid response status from server: ", {
        response,
        request,
        URL: this.URL,
      });
    }
  };
}

import React from "react";

import { JsLink } from "^jab-react";
import { JabHttpProvider } from "^jab-react";

import { HttpRequest, ClientMessage } from "^dev-appc";

export type Props = {
  apiSend: (data: ClientMessage) => void;
  httpProv: JabHttpProvider<HttpRequest>;
};

export const ViewHome: React.FC<Props> = (props) => (
  <>
    <br />
    <b>HTTP</b>
    <br />
    <JsLink
      name={"fetch json"}
      onClick={() =>
        props.httpProv.apiRequest({ type: "getSomeJson" }).then((data) => {
          console.log(data);
        })
      }
    />

    <br />
    <br />
    <i>poison</i>
    <br />
    <JsLink
      name={"fetch err message"}
      onClick={() =>
        props.httpProv.apiRequest({ type: "sendErrMessage" }).then((data) => {
          console.log(data);
        })
      }
    />
    <br />
    <JsLink
      name={"fetch invalid response status"}
      onClick={() =>
        props.httpProv
          .apiRequest({ type: "sendInvalidResponseStatus" })
          .then((data) => {
            console.log(data);
          })
      }
    />

    <br />
    <JsLink
      name={"blankResponse"}
      onClick={() => props.httpProv.apiRequest({ type: "poisonBlankResponse" })}
    />
    <br />
    <JsLink
      name={"poisonJabError"}
      onClick={() => props.httpProv.apiRequest({ type: "poisonJabError" })}
    />
    <br />
    <JsLink
      name={"unknownAction"}
      onClick={() =>
        props.httpProv.apiRequest({ type: "nonExistingAction" } as any)
      }
    />
    <br />
    <JsLink
      name={"actionMissing"}
      onClick={() => props.httpProv.apiRequest({ typ: "capice" } as any)}
    />
    <br />
    <JsLink
      name={"invalidErrorObject"}
      onClick={() => props.httpProv.apiRequest({ type: "invalidErrorObject" })}
    />
    <br />
    <br />
    <b>WebSocket</b>
    <br />
    <JsLink
      name={"receiveEmptyObject"}
      onClick={() =>
        props.apiSend({
          type: "poisonReceiveEmptyObject",
        })
      }
    />

    <br />
    <JsLink
      name={"ping server"}
      onClick={() => props.apiSend({ type: "ping" })}
    />
    <br />
    <JsLink
      name={"ping clients"}
      onClick={() => props.apiSend({ type: "pingClients" })}
    />
    <br />
    <br />
    <i>poison</i>
    <br />
    <JsLink
      name={"sendBlankMessage"}
      onClick={() => props.apiSend("" as any)}
    />
    <br />
    <JsLink
      name={"stop server"}
      onClick={() => props.apiSend({ type: "stopServer" })}
    />
  </>
);

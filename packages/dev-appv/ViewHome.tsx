import React from "react";

import { JsLink } from "^jab-react";

import { ClientMessage } from "./internal";

export type ViewHomeProps = {
  apiSend: (data: ClientMessage) => void;
};

/**
 *
 */
export const ViewHome: React.FC<ViewHomeProps> = (props) => (
  <>
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

ViewHome.displayName = "ViewHome";

export type WsStates = "closed" | "connecting" | "connected" | "reconnecting";

export type WebSocketProv<MS, MR> = {
  apiSend: (data: MS) => void;
  wsState: WsStates;
  useWsEffect: UseWsEffect<MR>;
};

export type UseWsEffect<ServerMessage> = (
  deps: UseWsEffectArgs<ServerMessage>
) => void;

export type UseWsEffectArgs<ServerMessage> = {
  onOpen?: () => void;
  onServerMessage: (data: ServerMessage) => void;
};

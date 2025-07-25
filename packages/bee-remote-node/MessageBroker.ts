import { Callback } from "^jab";

type Deps = {
  stdin: NodeJS.ReadStream;
};

/**
 * - Ensures stdin is ref'ed, if there are listeners and unref'ed otherwise.
 * - Handles one message for all listeners, then next message is processed. This
 *    means a listener can remove itself, and guaranteed not to receive next message.
 */
export class MessageBroker {
  private listeners: Array<Callback<any>> = [];
  private working = false;

  constructor(private deps: Deps) {}

  public registerOnMessage = (callback: Callback<any>) => {
    this.listeners.push(callback);

    this.deps.stdin.ref();
  };

  public removeOnMessage = (callback: Callback<any>) => {
    this.listeners = this.listeners.filter((e) => e !== callback);

    if (this.listeners.length === 0) {
      this.deps.stdin.unref();
    }
  };

  public fireEvent = (data: any) => {
    if (this.working) {
      throw new Error("Cannot fire an event before the last message has been processed."); // prettier-ignore
    }

    this.working = true;
    this.listeners.forEach((callback) => callback(data));
    this.working = false;
  };

  public clearListeners = () => {
    this.listeners = [];
    this.deps.stdin.unref();
  };
}

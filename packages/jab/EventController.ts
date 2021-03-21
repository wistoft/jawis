export type Callback<T> = (data: T) => void;

export interface EventStream<T> {
  addListener: (callback: Callback<T>) => void;
  removeListener: (callback: Callback<T>) => void;
}

/**
 *
 */
export class EventController<T> implements EventStream<T> {
  private listeners: Array<Callback<T>> = [];

  public addListener = (callback: Callback<T>) => {
    this.listeners.push(callback);
  };

  public removeListener = (callback: Callback<T>) => {
    this.listeners = this.listeners.filter((e) => e !== callback);
  };

  public fireEvent = (data: T) => {
    this.listeners.forEach((callback) => callback(data));
  };

  public hasListeners = () => {
    return this.listeners.length > 0;
  };
}

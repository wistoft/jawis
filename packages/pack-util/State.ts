import { err } from "^jab";

type Deps<States> = {
  startState: States;
};

type StateType = {
  type: string;
};

type Extract<S extends StateType, T extends S["type"]> = S extends { type: T }
  ? S
  : never;

/**
 * todo: use in waiter too
 */
export class State<States extends StateType> {
  private state: States;

  /**
   *
   */
  constructor(private deps: Deps<States>) {
    this.state = deps.startState;
  }

  /**
   *
   */
  public getState = () => this.state;

  /**
   *
   */
  public getExpectedState = <T extends States["type"]>(type: T) => {
    if (this.state.type !== type) {
      throw err("Was not in the expected state", {
        expected: type,
        actual: this.state,
      });
    }

    return this.state as Extract<States, T>;
  };

  /**
   *
   */
  public assertState = (type: States["type"]) => {
    if (this.state.type !== type) {
      throw err("Was not in the expected state", { type, state: this.state });
    }
  };

  /**
   * Is the state the specified type.
   */
  public is = (type: States["type"]) => this.state.type === type;

  /**
   * Set the state to a new value.
   */
  public set = (newState: States) => {
    this.state = newState;
  };
}

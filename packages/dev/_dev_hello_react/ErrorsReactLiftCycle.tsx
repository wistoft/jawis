import React from "react";
import { JsLink } from "^jab-react";

import {
  ClassThrowOnMount,
  ClassThrowOnRender,
  ClassThrowOnUnmount,
  ClassThrowOnUpdate,
  FuncThrowOnMount,
  FuncThrowOnRender,
  FuncThrowOnUnmount,
  FuncThrowOnUpdate,
} from "./ErrorsReactLiftCycleUtil";

type Props = {};

type State = {
  show?:
    | "componentThrowOnRender"
    | "componentThrowOnMount"
    | "componentThrowOnUpdate"
    | "componentThrowOnUnmount"
    | "fcThrowOnRender"
    | "fcThrowOnMount"
    | "fcThrowOnUpdate"
    | "fcThrowOnUnmount";
};

/**
 *
 */
export class HelloErrorsReactLiftCycle extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  public getAction() {
    if (this.state.show === "componentThrowOnRender") {
      return <ClassThrowOnRender />;
    }
    if (this.state.show === "componentThrowOnMount") {
      return <ClassThrowOnMount />;
    }
    if (this.state.show === "componentThrowOnUpdate") {
      return <ClassThrowOnUpdate />;
    }
    if (this.state.show === "componentThrowOnUnmount") {
      return <ClassThrowOnUnmount />;
    }

    if (this.state.show === "fcThrowOnRender") {
      return <FuncThrowOnRender />;
    }
    if (this.state.show === "fcThrowOnMount") {
      return <FuncThrowOnMount />;
    }
    if (this.state.show === "fcThrowOnUpdate") {
      return <FuncThrowOnUpdate />;
    }
    if (this.state.show === "fcThrowOnUnmount") {
      return <FuncThrowOnUnmount />;
    }
  }

  public render() {
    return (
      <>
        {this.getAction()}
        <br />
        <b>React class errors</b>
        <br />
        <JsLink onClick={() => this.setState({ show: undefined })}>
          reset
        </JsLink>
        <br />
        <JsLink
          onClick={() => this.setState({ show: "componentThrowOnRender" })}
        >
          throwOnRender
        </JsLink>
        <br />
        <JsLink
          onClick={() => this.setState({ show: "componentThrowOnMount" })}
        >
          throwOnMount
        </JsLink>
        <br />
        <JsLink
          onClick={() => this.setState({ show: "componentThrowOnUpdate" })}
        >
          throwOnUpdate
        </JsLink>
        <br />
        <JsLink
          onClick={() => this.setState({ show: "componentThrowOnUnmount" })}
        >
          throwOnUnmount
        </JsLink>
        <br />
        <br />
        <b>React func comp errors</b>
        <br />
        <JsLink onClick={() => this.setState({ show: "fcThrowOnRender" })}>
          throwOnRender
        </JsLink>
        <br />
        <JsLink onClick={() => this.setState({ show: "fcThrowOnMount" })}>
          throwOnMount
        </JsLink>
        <br />
        <JsLink onClick={() => this.setState({ show: "fcThrowOnUpdate" })}>
          throwOnUpdate
        </JsLink>
        <br />
        <JsLink onClick={() => this.setState({ show: "fcThrowOnUnmount" })}>
          throwOnUnmount
        </JsLink>
        <br />
        <br />
      </>
    );
  }
}

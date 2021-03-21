import React, { ReactNode } from "react";

import { JsLink } from ".";

export type EbProps = {
  children: ReactNode;
  renderOnError: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<EbProps, State> {
  constructor(props: EbProps) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch() {
    this.setState({ hasError: true });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <>
          {this.props.renderOnError}
          <br />
          <JsLink
            name="retry"
            onClick={() => this.setState({ hasError: false })}
          />
        </>
      );
    }
    return this.props.children;
  }
}

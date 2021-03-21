import React, { ErrorInfo, useEffect } from "react";

import { JsLink } from "^jab-react";

/**
 *
 */
export const TestComp: React.FC = () => (
  <div>
    <JsLink name={"theName"} onClick={() => {}} />
    <br />
  </div>
);

/**
 *
 */
export const ThrowInRender: React.FC = () => {
  throw new Error("you asked");
};

/**
 *
 */
export const plainHtmlElement = (
  <div>
    hej<div>first div</div>
    <a href="href">name</a>
    <div>beta </div> tree
  </div>
);

/**
 *
 */
export const HelloEffect: React.FC = () => {
  useEffect(() => {
    console.log("hello mount");
    return () => {
      console.log("hello unmount");
    };
  });

  return <div>hello</div>;
};

/**
 *
 */
export const ThrowInEffect: React.FC = () => {
  useEffect(() => {
    throw new Error("thrown in affect");
  });

  return <>hello</>;
};

/**
 *
 */
export class TestErrorBoundary extends React.Component<
  {},
  {
    hasError: boolean;
  }
> {
  public state = { hasError: false };

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.log("TestErrorBoundary", { error, info });

    this.setState({ hasError: true });
  }

  public render() {
    if (this.state.hasError) {
      return "has error";
    } else {
      return this.props.children;
    }
  }
}

import React, { useEffect } from "react";

export class ClassThrowOnRender extends React.Component {
  // eslint-disable-next-line react/require-render-return
  public render(): any {
    throw new Error("ClassThrowOnRender");
  }
}

export class ClassThrowOnMount extends React.Component {
  public componentDidMount() {
    throw new Error("ClassThrowOnMount");
  }

  public render() {
    return null;
  }
}

export class ClassThrowOnUpdate extends React.Component {
  public componentDidUpdate() {
    console.log("update");
    throw new Error("ClassThrowOnUpdate");
  }

  public render() {
    return <>OnUpdate</>;
  }
}

export class ClassThrowOnUnmount extends React.Component {
  public componentWillUnmount() {
    throw new Error("ClassThrowOnWillUnmount");
  }

  public render() {
    return "OnUnmount";
  }
}

export const FuncThrowOnRender = () => {
  throw new Error("FuncThrowOnRender");
};

export const FuncThrowOnMount = () => {
  useEffect(() => {
    throw new Error("FuncThrowOnMount");
  }, []);
  return null;
};

export const FuncThrowOnUpdate = () => {
  useEffect(() => () => {
    throw new Error("FuncThrowOnUpdate");
  });
  return <>OnUpdate</>;
};

export const FuncThrowOnUnmount = () => {
  useEffect(
    () => () => {
      throw new Error("FuncThrowOnUnmount");
    },
    []
  );
  return <>OnUnmount</>;
};

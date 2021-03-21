import React from "react";

import RTR from "react-test-renderer";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  const renderer = RTR.create(<div>hello</div>);

  prov.eq("div", renderer.root.type);
  prov.eq({ children: "hello" }, renderer.root.props);

  prov.imp(renderer.root.findByType("div").props);
};

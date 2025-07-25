import { TestProvision } from "^jarun";

import {
  getScriptPath,
  getWebcsServer,
  testHttpRequest,
} from "../_fixture/index";

export default async (prov: TestProvision) => {
  const server = await getWebcsServer(prov);

  prov.imp(
    await testHttpRequest({
      path: "/webcs/" + getScriptPath("hello.js").replace(/\\/g, "/"),
    })
  );

  return server.shutdown();
};

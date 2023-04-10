import { TestProvision } from "^jarun";
import { makeApp_no_routes, testHttpRequest } from "../_fixture";

export default async (prov: TestProvision) => {
  const server = await makeApp_no_routes(prov);

  prov.log("/doesnotExists", await testHttpRequest({ path: "/doesnotExists" }));
  prov.log("/conf.js", await testHttpRequest({ path: "/conf.js" }));
  prov.log("/hello.js", await testHttpRequest({ path: "/hello.js" }));

  return server.shutdown();
};

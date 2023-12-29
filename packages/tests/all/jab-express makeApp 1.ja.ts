import { TestProvision } from "^jarun";
import {
  filterNodeDeprecation,
  makeApp_no_routes,
  testHttpRequest,
} from "../_fixture";

export default async (prov: TestProvision) => {
  filterNodeDeprecation(prov, "DEP0066");

  const server = await makeApp_no_routes(prov);

  prov.log("/doesnotExists", await testHttpRequest({ path: "/doesnotExists" }));
  prov.log("/conf.js", await testHttpRequest({ path: "/conf.js" }));

  const res = await testHttpRequest({ path: "/hello.js" });

  prov.log("/hello.js", { ...res, data: res.data.replace(/\r/g, "") });

  return server.shutdown();
};

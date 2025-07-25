import { TestProvision } from "^jarun";

import { getPrettyHtml, getJagoView, filterReact } from "../_fixture";

export default async (prov: TestProvision) => {
  filterReact(prov);

  prov.imp(await getPrettyHtml(getJagoView()));
};

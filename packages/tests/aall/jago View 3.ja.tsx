import { TestProvision } from "^jarun";

import { getJagoView } from "../_fixture";
import { render } from "enzyme";

export default (prov: TestProvision) => {
  const container = render(getJagoView());

  //openLink contains right link text.
  prov.eq("script.js", container.find('a[href="/script/scriptId"]').text());
};

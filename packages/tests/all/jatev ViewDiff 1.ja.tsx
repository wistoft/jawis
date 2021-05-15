import React from "react";

import { TestProvision } from "^jarun";

import { ViewDiff } from "^jatev/ViewDiff";

import { getHtmlEnzyme } from "^misc/node";

export default ({ imp }: TestProvision) => {
  imp(getHtmlEnzyme(<ViewDiff left={"dav"} right={"dav"} />));
  imp(getHtmlEnzyme(<ViewDiff left={""} right={"dav"} />));
  imp(getHtmlEnzyme(<ViewDiff left={"dav"} right={""} />));

  imp(getHtmlEnzyme(<ViewDiff left={"dav"} right={"hej"} />));

  imp(getHtmlEnzyme(<ViewDiff left={"dav"} right={"dav "} />));
  imp(getHtmlEnzyme(<ViewDiff left={"dav\n"} right={"dav"} />));

  imp(getHtmlEnzyme(<ViewDiff left={"a b c"} right={"abc"} />));
};

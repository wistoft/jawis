import React from "react";

import { TestProvision } from "^jarun";

import { ViewDiff } from "^jatev/ViewDiff";

import { getPrettyHtml } from "^misc/node";

export default ({ imp }: TestProvision) => {
  imp(getPrettyHtml(<ViewDiff left={"dav"} right={"dav"} />));
  imp(getPrettyHtml(<ViewDiff left={""} right={"dav"} />));
  imp(getPrettyHtml(<ViewDiff left={"dav"} right={""} />));

  imp(getPrettyHtml(<ViewDiff left={"dav"} right={"hej"} />));

  imp(getPrettyHtml(<ViewDiff left={"dav"} right={"dav "} />));
  imp(getPrettyHtml(<ViewDiff left={"dav\n"} right={"dav"} />));

  imp(getPrettyHtml(<ViewDiff left={"a b c"} right={"abc"} />));
};

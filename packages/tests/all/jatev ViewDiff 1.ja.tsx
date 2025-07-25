import React from "react";

import { TestProvision } from "^jarun";

import { ViewDiff } from "^jab-react";

import { getPrettyHtml } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  imp(await getPrettyHtml(<ViewDiff left={"dav"} right={"dav"} />));
  imp(await getPrettyHtml(<ViewDiff left={""} right={"dav"} />));
  imp(await getPrettyHtml(<ViewDiff left={"dav"} right={""} />));

  imp(await getPrettyHtml(<ViewDiff left={"dav"} right={"hej"} />));

  imp(await getPrettyHtml(<ViewDiff left={"dav"} right={"dav "} />));
  imp(await getPrettyHtml(<ViewDiff left={"dav\n"} right={"dav"} />));

  imp(await getPrettyHtml(<ViewDiff left={"a b c"} right={"abc"} />));
};

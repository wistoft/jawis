import React from "react";

import { TestProvision } from "^jarun";

import { ViewDiff } from "^jatev/ViewDiff";

import { getHtmlRTR } from "^misc/node";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(<ViewDiff left={"dav"} right={"dav"} />));
  imp(getHtmlRTR(<ViewDiff left={""} right={"dav"} />));
  imp(getHtmlRTR(<ViewDiff left={"dav"} right={""} />));

  imp(getHtmlRTR(<ViewDiff left={"dav"} right={"hej"} />));

  imp(getHtmlRTR(<ViewDiff left={"dav"} right={"dav "} />));
  imp(getHtmlRTR(<ViewDiff left={"dav\n"} right={"dav"} />));

  imp(getHtmlRTR(<ViewDiff left={"a b c"} right={"abc"} />));
};

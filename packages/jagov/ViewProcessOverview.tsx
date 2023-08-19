import React, { memo } from "react";

import { basename } from "^jab";
import { Link } from "^jab-react";

import {
  getEditLink,
  getRestartLink,
  getScriptColor,
  getStopLink,
  ApiProv,
  State,
} from "./internal";

export type ViewProcessOverviewProps = Pick<State, "processStatus"> & ApiProv;

const showStateAsText = false;

/**
 *
 */
export const ViewProcessOverview: React.FC<ViewProcessOverviewProps> = memo(
  (props) => {
    if (props.processStatus && props.processStatus.length === 0) {
      return <>No scripts.</>;
    }

    const status =
      props.processStatus &&
      props.processStatus.map((entry) => {
        //can't use `useApiSend` because this is not a place for calling hooks.

        return (
          <React.Fragment key={entry.id}>
            {getRestartLink(props, entry.script)}{" "}
            {getStopLink(props, entry.script)}{" "}
            {getEditLink(props, entry.script)}
            {" - "}
            <Link
              to={"script/" + entry.id}
              style={{ color: getScriptColor(entry.status) }}
            >
              {basename(entry.script)}
            </Link>
            {showStateAsText &&
              entry.status !== "stopped" &&
              " - " + entry.status}
            <br />
          </React.Fragment>
        );
      });

    return <>{status}</>;
  }
);

ViewProcessOverview.displayName = "ViewProcessOverview";

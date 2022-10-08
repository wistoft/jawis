import React from "react";

import { assert, err } from "^jab";
import { JsLink } from "^jab-react";

export const Component: React.FC = () => {
  return (
    <>
      <div>
        <br />
        <b>Ordinary</b>
        <br />
        <JsLink
          name="throw exception"
          onClick={() => {
            throw new Error("My hello exception");
          }}
        />
        <br />
        <JsLink
          name="throw jab exception"
          onClick={() => {
            err("Hello jab", 1, 2, undefined);
          }}
        />
        <br />
        <a
          href="#"
          onClick={() => {
            myRejectPromiseHelper("my hello promise");
          }}
        >
          rejected promise
        </a>
        <br />
        <a
          href="#"
          onClick={() => {
            assert(false, "My false assertion", 1, undefined);
          }}
        >
          assert
        </a>
        <br />
        <a
          href="#"
          onClick={() => {
            myNestedThrowExceptionReal();
          }}
        >
          throw exception (nested)
        </a>
        <br />
        <a
          href="#"
          onClick={() => {
            myNestedRejectPromiseReal();
          }}
        >
          rejected promise (nested)
        </a>
      </div>
      <div>
        <br />
        <b>Log</b>
        <br />
        <JsLink
          name="log"
          onClick={() => {
            console.log("hej", 1, [1, 2, 3]);
            console.log("again", { hej: true });
          }}
        />
        <br />
        <JsLink
          name="error"
          onClick={() => {
            console.error("hej", 1, [1, 2, 3]);
            console.error("again", { hej: true });
          }}
        />
        <br />
      </div>
    </>
  );
};

//
//  util
//

const myNestedThrowExceptionReal = () => {
  throw new Error("My nested exception");
};

const myNestedRejectPromiseReal = () => {
  myRejectPromiseHelper("my nested promise");
};

const myRejectPromiseHelper = (str: string) => {
  Promise.reject(new Error(str));
};

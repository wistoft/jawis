import { capture } from "^jab";
import { TestProvision } from "^jarun";

// prototype chains

export default ({ eq }: TestProvision) => {
  //
  // null object
  //

  eq(
    ["object", { protoChain: ["null"], fields: {} }],
    capture(Object.create(null))
  );

  eq(
    ["object", { protoChain: ["null"], fields: { hello: 1 } }],
    capture(withoutPrototype)
  );

  //
  // constructors can't be detected
  //

  eq(["function", "Dav"], capture(Dav));

  //
  // others
  //

  eq(
    ["object", { protoChain: ["Dav", "Object"], fields: { hej: "dav" } }],
    capture(new Dav())
  );

  eq(
    [
      "object",
      {
        protoChain: ["DavDavDav", "DavDav", "Dav", "Object"],
        fields: { hej: "davdav", greeting: "private" },
        toStringValue: "pretty toString: davdav",
      },
    ],
    capture(new DavDavDav())
  );
};

//
// util
//

const withoutPrototype = Object.create(null);
withoutPrototype.hello = 1;

class Dav {
  public hej = "dav";
}

class DavDav extends Dav {
  private greeting = "private";
  public hej = "davdav";
}

class DavDavDav extends DavDav {
  public toString() {
    return "pretty toString: " + this.hej;
  }
}

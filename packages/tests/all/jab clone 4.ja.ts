import { clone } from "^jab";
import { TestProvision } from "^jarun";

// prototype chains

export default ({ eq }: TestProvision) => {
  //
  // null object
  //

  eq(
    ["object", { protoChain: ["null"], fields: {} }],
    clone(Object.create(null))
  );

  eq(
    ["object", { protoChain: ["null"], fields: { hello: 1 } }],
    clone(withoutPrototype)
  );

  //
  // constructors can't be detected
  //

  eq(["function", "Dav"], clone(Dav));

  //
  // others
  //

  eq(
    ["object", { protoChain: ["Dav", "Object"], fields: { hej: "dav" } }],
    clone(new Dav())
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
    clone(new DavDavDav())
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

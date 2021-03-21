import { TestProvision } from "^jarun";
import { getTestLogMatchType } from "^jatev/util";

export default ({ eq }: TestProvision) => {
  //
  // user log
  //

  eq( "different", getTestLogMatchType({ type: "user", name: "user", exp: [1], cur: [2], }) ); // prettier-ignore
  eq( "match", getTestLogMatchType({ type: "user", name: "user", exp: [1], cur: [1], }) ); // prettier-ignore
  eq( "only-current", getTestLogMatchType({ type: "user", name: "user", exp: [], cur: [1], }) ); // prettier-ignore
  eq( "only-expected", getTestLogMatchType({ type: "user", name: "user", exp: [1], cur: [], }) ); // prettier-ignore
  eq( "nothing", getTestLogMatchType({ type: "user", name: "user", exp: [], cur: [], }) ); // prettier-ignore

  //
  // return
  //

  eq( "different", getTestLogMatchType({ type: "return", name: "return", exp: 1, cur: 3, }) ); // prettier-ignore
  eq( "match", getTestLogMatchType({ type: "return", name: "return", exp: 1, cur: 1, }) ); // prettier-ignore
  eq( "only-current", getTestLogMatchType({ type: "return", name: "return",  cur: 1, }) ); // prettier-ignore
  eq( "only-expected", getTestLogMatchType({ type: "return", name: "return",  exp: 1, }) ); // prettier-ignore
  eq( "nothing", getTestLogMatchType({ type: "return", name: "return",   }) ); // prettier-ignore
};

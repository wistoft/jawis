import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.imp("\uD83C\uDF03");
  prov.imp("\u{1f303}");
  prov.imp(String.fromCharCode(0xd83c, 0xdf03));
  prov.imp(String.fromCodePoint(0x1f303));
};

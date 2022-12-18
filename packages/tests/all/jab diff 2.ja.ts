import { diff } from "^assorted-algorithms";
import { TestProvision } from "^jarun";

export default ({ imp }: TestProvision) => {
  imp(diff("hej", "dav"));

  imp(diff("hellothere", ""));
  imp(diff("hellothere", "o"));
  imp(diff("hellothere", "hellothere"));

  imp(diff("", "hellothere"));
  imp(diff("o", "hellothere"));
};

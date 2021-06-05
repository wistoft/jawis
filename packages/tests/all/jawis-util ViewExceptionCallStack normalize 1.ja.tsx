import { TestProvision } from "^jarun";
import { normalize } from "^util-javi/web";

export default ({ eq }: TestProvision) => {
  eq("/", normalize("/"));

  eq("e:/", normalize("e:"));
  eq("e:/", normalize("e:/"));
  eq("e:/", normalize("e:\\"));

  eq("/dir/", normalize("/dir"));
  eq("/dir/", normalize("/dir/"));

  eq("e:/dir/", normalize("e:/dir"));
  eq("e:/dir/", normalize("e:/dir/"));
  eq("e:/dir/", normalize("e:\\dir"));
  eq("e:/dir/", normalize("e:\\dir\\"));
};

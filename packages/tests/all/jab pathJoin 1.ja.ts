import { pathJoin } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq("", pathJoin(""));
  prov.eq("/", pathJoin("/"));
  prov.eq("hej", pathJoin("hej"));
  prov.eq("/hej", pathJoin("/hej"));
  prov.eq("hej/", pathJoin("hej/"));
  prov.eq("/hej/", pathJoin("/hej/"));

  prov.eq("", pathJoin("", ""));
  prov.eq("/", pathJoin("", "/"));
  prov.eq("dav", pathJoin("", "dav"));
  prov.eq("/dav", pathJoin("", "/dav"));
  prov.eq("dav/", pathJoin("", "dav/"));
  prov.eq("/dav/", pathJoin("", "/dav/"));

  prov.eq("/", pathJoin("/", ""));
  prov.eq("/", pathJoin("/", "/"));
  prov.eq("/dav", pathJoin("/", "dav"));
  prov.eq("/dav", pathJoin("/", "/dav"));
  prov.eq("/dav/", pathJoin("/", "dav/"));
  prov.eq("/dav/", pathJoin("/", "/dav/"));

  prov.eq("hej", pathJoin("hej", ""));
  prov.eq("hej/", pathJoin("hej", "/"));
  prov.eq("hej/dav", pathJoin("hej", "dav"));
  prov.eq("hej/dav", pathJoin("hej", "/dav"));
  prov.eq("hej/dav/", pathJoin("hej", "dav/"));
  prov.eq("hej/dav/", pathJoin("hej", "/dav/"));

  prov.eq("/hej", pathJoin("/hej", ""));
  prov.eq("/hej/", pathJoin("/hej", "/"));
  prov.eq("/hej/dav", pathJoin("/hej", "dav"));
  prov.eq("/hej/dav", pathJoin("/hej", "/dav"));
  prov.eq("/hej/dav/", pathJoin("/hej", "dav/"));
  prov.eq("/hej/dav/", pathJoin("/hej", "/dav/"));

  prov.eq("hej/", pathJoin("hej/", ""));
  prov.eq("hej/", pathJoin("hej/", "/"));
  prov.eq("hej/dav", pathJoin("hej/", "/dav"));
  prov.eq("hej/dav/", pathJoin("hej/", "dav/"));
  prov.eq("hej/dav/", pathJoin("hej/", "/dav/"));

  prov.eq("/hej/", pathJoin("/hej/", ""));
  prov.eq("/hej/", pathJoin("/hej/", "/"));
  prov.eq("/hej/dav", pathJoin("/hej/", "/dav"));
  prov.eq("/hej/dav/", pathJoin("/hej/", "dav/"));
  prov.eq("/hej/dav/", pathJoin("/hej/", "/dav/"));
};

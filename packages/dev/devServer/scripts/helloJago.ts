import path from "node:path";
import { outHtml, outLink, outImg, outScriptLink, getParams } from "^jagoc";

console.log(getParams());

outHtml("<b>hej</b>");

outLink("dr.dk", "http://dr.dk");

outScriptLink(path.join(__dirname, "devSiteScript.js"));

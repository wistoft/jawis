import fs from "fs";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  const tmp = () => {
    fs.readFile("dontExist", () => {
      throw new Error("ups");
    });
  };

  tmp();
};

import { TestProvision } from "^jarun";
import { getFullConf } from "^javi/getConf";
import { filterConfig, getFixturePath } from "^tests/_fixture";

//phpunit test framework

export default (prov: TestProvision) => {
  prov.log(
    "inherited binary",
    filterConfig(
      getFullConf(
        {
          phpBinary: "parent-php",
          testFrameworks: {
            phpunit: {
              folders: ["testsuite"],
            },
          },
        },
        getFixturePath(),
        "windows"
      )
    ).testFrameworks
  );

  prov.log(
    "child overwrites binary",
    filterConfig(
      getFullConf(
        {
          phpBinary: "parent-php",
          testFrameworks: {
            phpunit: {
              folders: ["testsuite"],
              phpBinary: "child-php",
            },
          },
        },
        getFixturePath(),
        "windows"
      )
    ).testFrameworks
  );
};

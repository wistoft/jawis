import { PHPUnitAdapter } from "^jate-php-unit";

import { TestProvision } from "^jarunc";
import { getPackagePath } from "^dev/project.conf";
import { makeOnLog } from ".";
import { AbsoluteFile } from "^jabc";

/**
 *
 */
export const getPHPUnitAdapter = (prov: TestProvision) =>
  new PHPUnitAdapter({
    absTestFolder: getPackagePath(
      "dev/devServer/tests-phpunit"
    ) as AbsoluteFile,
    onLog: makeOnLog(prov),
    finally: prov.finally,
  });

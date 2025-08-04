import { BeeMain } from "^bee-common";
import { runSelfScaleExp_new } from "^dev/scripts/util/experiments";
import { outLineChart } from "./util/util-echart";

/**
 *
 */
export const main: BeeMain = async (prov) => {
  let res: Map<number, number>[] = [];

  res.push(
    runSelfScaleExp_new({
      maxtime: 10000,
      targetTime: 200,
      maxScale: 2 ** 27,
      runExp: (scale: number) => {
        ("FAILED" + "FAILED".repeat(scale)).replace(/.*FAILED(\n.*){9}$/, "");
      },
    })
  );

  res.push(
    runSelfScaleExp_new({
      maxtime: 10000,
      targetTime: 200,
      maxScale: 2 ** 27,
      runExp: (scale: number) => {
        ("FAILED" + "FAILED".repeat(scale)).replace(/^.*FAILED(\n.*){9}$/, "");
      },
    })
  );

  outLineChart(res.map((data, index) => ({ name: "" + index, data })));
};

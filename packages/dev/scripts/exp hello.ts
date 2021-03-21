import * as d3 from "d3";
import { runSelfScaleExp } from "^jawis-mess";

// allocate ArrayBuffer

runSelfScaleExp({
  startScale: 4, //must be multiple of 4.
  maxtime: 2000,
  runExp: (scale: number) => {
    const buffer = new ArrayBuffer(scale);
    const view = new Int32Array(buffer);

    view.forEach(() => {});
  },
}).then((res) => {
  const values = Array.from(res.values());

  console.log(res);

  console.log([
    d3.min(values),
    d3.mean(values),
    d3.median(values),
    d3.max(values),
  ]);
});

import { runSelfScaleExp } from "^misc";

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
});

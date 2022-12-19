import { prej } from "^jab";
import { TestProvision } from "^jarun";
import { fullRace, sleepingValue, nightmare } from "^yapu";

export default ({ rej, res, await, imp }: TestProvision) => {
  rej(
    "hej",
    fullRace([{ promise: prej("hej"), fallback: () => imp("unreach") }])
  );

  res(
    "hej",
    fullRace([
      { promise: Promise.resolve("hej"), fallback: () => imp("unreach") },
    ])
  );

  //fallback is called even if the losing promise isn't resolved.

  res(
    "hej",
    fullRace([
      { promise: Promise.resolve("hej"), fallback: () => imp("unreach") },
      {
        promise: new Promise(() => {}),
        fallback: () => imp("lost to resolve"),
      },
    ])
  );

  //tests use the fact, order matters for which wins in Promise.race. That way are timeouts unneeded.

  res(
    "hej",
    fullRace([
      {
        promise: Promise.resolve("hej"),
        fallback: () => imp("unreach"),
      },
      {
        promise: Promise.resolve("dav"),
        fallback: (promise) =>
          await(promise.then((data) => imp("dav equals: " + data))),
      },
    ])
  );

  rej(
    "hej",
    fullRace([
      { promise: nightmare(0, "hej"), fallback: () => imp("unreach") },
      {
        promise: sleepingValue(10, "dav"),
        fallback: () => imp("lost to rejection"),
      },
    ])
  );
};

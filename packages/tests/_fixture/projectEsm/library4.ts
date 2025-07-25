import { fido } from "#library4-1";

export const saySomething = (): void => {
  if (fido !== "fido") {
    console.log("problem loading sublibrary");
  }
  console.log("library4.ts");
};

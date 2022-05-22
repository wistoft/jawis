import { out } from "^jab-node";

// these ipc messages need no special attention in case of exception, or process.exit()

out("1");
out("2");
out("3");

throw new Error("ups");

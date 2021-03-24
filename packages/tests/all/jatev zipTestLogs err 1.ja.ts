import { zipTestLogs } from "^jatec";
import { TestProvision } from "^jarun";

export default ({ imp }: TestProvision) => {
  imp(
    zipTestLogs(
      {
        notValid: ["What you expect"],
        user: {},
      } as any,
      {
        user: {},
      }
    )
  );
};

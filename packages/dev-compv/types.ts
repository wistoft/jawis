export type ComponentDef = {
  name: string;
  path: string;
  urlSafePath: string;
  comp: React.ComponentType<any> | (() => void);
};

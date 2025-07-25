import {
  LintManager,
  LintManagerDeps,
  ProjectFilesystem,
  ProjectFilesystemDeps,
} from "./internal";

type Deps = ProjectFilesystemDeps & Omit<LintManagerDeps, "projectFilesystem">;

/**
 *
 */
export const startProjectWatcher = async (deps: Deps) => {
  const manager = new LintManager({
    ...deps,
    projectFilesystem: new ProjectFilesystem(deps),
  });

  //loop

  manager.start();
};

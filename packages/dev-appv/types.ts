//
// state
//

export type State = {
  clicked: boolean;
};

//
// callbacks/hooks
//

export type StateCallbacks = {
  onClick: () => void;
  useReset: (id: boolean) => () => void;
};

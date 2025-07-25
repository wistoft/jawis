import { ReactNode } from "react";

export type DataProvider = {
  data: DataItem[];
  delete?: (name: string) => void;
  edit?: (oldName: string, name: string, data: string) => void;
  //quick fix, that it also has oldName
  new?: (oldName: string, name: string, data: string) => void;
};

export type DataItem = {
  name: string;
  data: string;
};

export type FormData = {
  name: string;
  data: string;
};

export type ItemActions = (
  name: string
) => { label: string; action: () => void }[];

export type PostActionContent = (name: string) => ReactNode;

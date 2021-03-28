import { PlatformCtx, VariableItem } from "@provider-app/platform-access-spec";

export interface IHyMethod {
  type: "STRING" | "DATE" | "ASYNC" | "MATH";
  namespace: "HY";
  name: string;
  execute: () => unknown;
  describe?: string;
  usage?: string;
  example?: string;
}

export interface ISubmitRes {
  code: string | null;
  body?: string | null;
  relation?: {
    from: string[];
    to: string[];
  };
  methods?: string[];
}

export interface IDefaultVariableListChildren extends VariableItem {
  value: string;
}

export interface IDefaultVariableList {
  title: string;
  value: string;
  disabled: boolean;

  children: IDefaultVariableListChildren[];
}

export interface IProps {
  metaCtx: PlatformCtx["meta"];
  /** 表达式提交回调函数 */
  onSubmit: (transformRes: ISubmitRes) => void;
  defaultValue?: ISubmitRes;
  defaultVariableList?: IDefaultVariableList[];
}

export interface ITransformRes {
  code: string;
  fieldMap: { [key: string]: string };
  titleMap: { [key: string]: string };
}

export interface IDefaultTextMark {
  from: { line: number; ch: number };
  to: { line: number; ch: number };
  item: TVariableItem;
}

export type TVariableItem = VariableItem & {
  field: string;
  widgetRef: string;
};
export type TVariableTree<T> = { [key: string]: T[] };

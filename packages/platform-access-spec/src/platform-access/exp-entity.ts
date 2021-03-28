export interface IExpMethod {
  name: string;
  example: string;
  desc: string;
  usage: string;
  isAsync?: boolean;
}

export interface EditableExpMeta {
  title: string;
  key: string;
  items: IExpMethod[];
}

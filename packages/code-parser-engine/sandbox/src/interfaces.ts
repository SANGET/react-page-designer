export type IFakeWindow = Window & Record<PropertyKey, unknown>

export type IContext = Record<PropertyKey, unknown>

export interface IOptions {
  // window 黑名单属性列表
  blackList?: string[];
}

export interface IBlackMap {
  [other: string]: boolean;
}

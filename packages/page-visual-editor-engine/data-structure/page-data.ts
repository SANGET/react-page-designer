import { PageMetadata } from "@provider-app/platform-access-spec";
import { LayoutInfoActionReducerState } from "./layout";
import { PageState } from "./page-state";
// import { WidgetRelyPropItems } from "./widget";

/**
 * 基础页面数据
 */
export interface BasePageData {
  /** ID */
  id: string
  /** ID */
  pageID: string
  /** 页面名字 */
  name: string
  /** 页面布局内容 */
  content: LayoutInfoActionReducerState
  /** 页面元数据，包括联动、表达式、以及大部分的业务扩展 */
  meta: PageMetadata
  pageState: PageState
}

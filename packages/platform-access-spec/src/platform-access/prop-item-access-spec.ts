/**
 * 属性项接入标准
 */

import { WidgetEntity } from ".";
import { ChangeEntityState } from "../widget-core/meta-helper-ctx";
import { PlatformCtx } from "./platform-ctx-types";

/** TODO: 完善属性项渲染器上下文的存放 */
export interface PropItemRenderContext {
  /** 编辑中的组件实例 */
  readonly widgetEntity: WidgetEntity
  /** 将要编辑的属性的 keys，将通过 PropItemRenderContext.editingWidgetState 传入 */
  readonly editingWidgetState: any
  /** 更改组件实例状态的接口 */
  changeEntityState: ChangeEntityState
  /** 由平台提供的能力的上下文 */
  platformCtx: PlatformCtx
}

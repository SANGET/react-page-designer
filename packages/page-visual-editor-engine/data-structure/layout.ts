import { TreeNodePath } from "../utils";
import { EditableWidgetEntity } from ".";

// export {
//   TreeNodePath
// };

/**
 * state 的数据结构
 */
export type LayoutInfoActionReducerState = EditableWidgetEntity[]

interface FlatLayoutItem extends EditableWidgetEntity {
  treeNodePath: TreeNodePath
}

export interface FlatLayoutItems {
  [entityID: string]: FlatLayoutItem
}

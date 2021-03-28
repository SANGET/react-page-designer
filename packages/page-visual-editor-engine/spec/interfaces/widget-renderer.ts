import { WidgetEntityState } from "@provider-app/platform-access-spec";
import { LayoutWrapperContext } from "../../utils";
import { EditableWidgetEntity } from "../../data-structure";

/**
 * 包装器传给被包装的组件的 props
 */
export interface WidgetRendererProps extends LayoutWrapperContext {
  onClick: React.DOMAttributes<HTMLDivElement>['onClick']
  entity: EditableWidgetEntity
  entityState: WidgetEntityState
}

import {
  SELECT_ENTITY, INIT_ENTITY_STATE,
  SelectEntityAction, INIT_APP, UNSELECT_ENTITY,
  UnselectEntityAction, InitAppAction, ADD_ENTITY, AddEntityAction,
  SortingEntityAction, DelEntityAction, DEL_ENTITY
} from "../actions";
import { SelectEntityState } from "../types";

export const defaultSelectedEntities: SelectEntityState = {
  selectedList: {},
  id: '',
  treeNodePath: [],
  entity: undefined
};

type SelectedEntitiesActions =
  SelectEntityAction |
  UnselectEntityAction |
  InitAppAction |
  AddEntityAction |
  DelEntityAction |
  SortingEntityAction

/**
 * 组件选择状态管理。如果组件未被实例化，则实例化后被选择
 */
export function selectedInfoReducer(
  state: SelectEntityState = defaultSelectedEntities,
  action: SelectedEntitiesActions
): SelectEntityState {
  switch (action.type) {
    case INIT_APP:
    case UNSELECT_ENTITY:
    case DEL_ENTITY:
      return defaultSelectedEntities;
    case ADD_ENTITY:
    case SELECT_ENTITY:
      const { entity, treeNodePath } = action;
      const entityID = entity.id;
      return {
        // entity,
        treeNodePath,
        id: entityID,
      };
    default:
      return state;
  }
}

// import update from 'immutability-helper';
import produce from 'immer';
import { TEMP_ENTITY_ID } from '@provider-app/platform-access-spec';
import { LayoutInfoActionReducerState, FlatLayoutItems } from "../../data-structure";
import {
  ADD_ENTITY, SET_LAYOUT_STATE, DEL_ENTITY,
  AddEntityAction, DelEntityAction, SetLayoutAction,
  SortingEntityAction,
  SORTING_ENTITY,
  UPDATE_ENTITY_STATE,
  UpdateEntityStateAction,
  InitEntityStateAction,
  INIT_ENTITY_STATE,
  INIT_APP,
  InitAppAction,
  CHANGE_ENTITY_TYPE,
  ChangeEntityTypeAction,
  AddTempEntityAction,
  ADD_TEMP_ENTITY
} from '../actions';
import { treeNodeHelper } from '../../utils';

/**
 * action types
 */
export type LayoutInfoActionReducerAction =
  AddEntityAction |
  DelEntityAction |
  SetLayoutAction |
  SortingEntityAction |
  UpdateEntityStateAction |
  InitEntityStateAction |
  ChangeEntityTypeAction |
  AddTempEntityAction |
  InitAppAction

/**
 * 清楚临时的 entity
 */
const clearTmplWidget = (layoutInfoState: LayoutInfoActionReducerState) => {
  return layoutInfoState.filter((item) => item._state !== TEMP_ENTITY_ID);
};

/**
 * 用于处理布局信息的 reducer
 */
export const layoutInfoReducer = (
  state: LayoutInfoActionReducerState = [],
  action: LayoutInfoActionReducerAction
): LayoutInfoActionReducerState => {
  switch (action.type) {
    case INIT_APP:
      const { pageContent } = action;
      return produce(pageContent, (draft) => (draft ? draft.content : state));
    case ADD_ENTITY:
      const addNextStateRes = treeNodeHelper(state, {
        type: 'set',
        locatedIndexOfTree: action.treeNodePath,
        addItem: action.entity,
        spliceCount: 1
      });
      // const addNextStateRes = produce(state, (draft) => {
      //   const { entity: addEntity, treeNodePath } = action;
      //   const addNextState = setItem2NestingArr(draft, {
      //     toNestedLocate: treeNodePath,
      //     addItem: addEntity,
      //     spliceCount: 1
      //   });

      //   return addNextState;
      // });
      return clearTmplWidget(addNextStateRes);
    case ADD_TEMP_ENTITY:
      return treeNodeHelper(state, {
        type: 'set',
        locatedIndexOfTree: action.treeNodePath,
        addItem: action.entity,
        spliceCount: 0
      });
      // return produce(state, (draft) => {
      //   const { entity: addEntity, treeNodePath } = action;
      //   const addNextState = setItem2NestingArr(draft, {
      //     toNestedLocate: treeNodePath,
      //     addItem: addEntity,
      //     spliceCount: 0
      //   });
      //   return addNextState;
      // });
    // case SORTING_ENTITY:
    //   return produce(state, (draft) => {
    //     const { sortOptions } = action;
    //     if(sortOptions.type === 'swap') {
    //       const { sourceItemNestIdx, swapItemNestIdx } = sortOptions;
    //       if(sourceItemNestIdx && swapItemNestIdx && sourceItemNestIdx.length === swapItemNestIdx.length) {
    //         swapItemInNestArray(draft, sourceItemNestIdx, swapItemNestIdx);
    //         return draft;
    //       }
    //       console.error(`交换的 idx 的长度不一致，请检查调用`);
    //     } else {
    //       const { sourceItemNestIdx, putIdx, putItemNestIdx } = sortOptions;
    //       putItemInNestArray(draft, sourceItemNestIdx, putItemNestIdx, putIdx);
    //     }
    //   });
    case SET_LAYOUT_STATE:
      const { state: _state } = action;
      return _state;
    case DEL_ENTITY:
      // const { treeNodePath } = action;
      const nextStateOfDef = treeNodeHelper(state, {
        type: 'set',
        locatedIndexOfTree: action.treeNodePath,
        spliceCount: 1
      });
      return nextStateOfDef;
    case INIT_ENTITY_STATE:
      const nextStateInit = produce(state, (draftState) => {
        const { selectedEntityInfo, defaultEntityState } = action;
        const { treeNodePath } = selectedEntityInfo;
        const targetData = treeNodeHelper(draftState, {
          locatedIndexOfTree: treeNodePath,
          type: 'get'
        });
        if(!targetData) {
          console.log(`没找到对象：`, `selectedEntityInfo:`, selectedEntityInfo, `treeNodePath:`, treeNodePath);
          return draftState;
        }
        targetData.propState = defaultEntityState;
        return draftState;
      });
      return nextStateInit;
    case UPDATE_ENTITY_STATE:
      return produce(state, (draftState) => {
        const { targetEntity, formState } = action;
        const { treeNodePath } = targetEntity;
        const targetData = treeNodeHelper(draftState, {
          locatedIndexOfTree: treeNodePath,
          type: 'get'
        });

        if(!targetData) {
          console.log(`没找到对象：`, `targetEntity:`, targetEntity, `treeNodePath:`, treeNodePath);
          return draftState;
        }
        targetData.propState = formState;
        return draftState;
      });
    case CHANGE_ENTITY_TYPE:
      return produce(state, (draftState) => {
        const { targetEntity: updateSInfo, widgetType } = action;
        const { treeNodePath } = updateSInfo;
        const targetData = treeNodeHelper(draftState, {
          locatedIndexOfTree: treeNodePath,
          type: 'get'
        });
        targetData.widgetRef = widgetType;
        return draftState;
      });
    default:
      return state;
  }
};

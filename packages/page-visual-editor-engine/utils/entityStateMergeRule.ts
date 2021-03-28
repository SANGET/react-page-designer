/* eslint-disable no-param-reassign */
import produce from 'immer';
import { WidgetEntityState, NextEntityStateType } from "../data-structure";

export const entityParams2UpdateObj = (entityStateItemParams: NextEntityStateType) => {
  const _entityStateItemParams = Array.isArray(entityStateItemParams) ? entityStateItemParams : [entityStateItemParams];
  const resData = {};

  _entityStateItemParams.forEach((param) => {
    const { value, attr } = param;
    resData[attr] = typeof value === 'undefined' ? null : value;
  });
  
  return resData;
};

/**
 * 合并实例状态的规则
 *
 * TODO: 完善更新链路
 *
 * @param srcState
 * @param param1
 */
export const entityStateMergeRule = (
  srcEntityState: WidgetEntityState = {},
  entityStateItemParams: NextEntityStateType
): WidgetEntityState => {
  const resState = produce(srcEntityState, (draft) => {
    draft = Object.assign({}, draft, entityParams2UpdateObj(entityStateItemParams));
    return draft;
  });

  return resState;
};

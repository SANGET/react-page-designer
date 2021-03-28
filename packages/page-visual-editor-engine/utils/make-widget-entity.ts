/* eslint-disable no-param-reassign */
import produce from "immer";
import { customAlphabet } from "nanoid";
import {
  EditableWidgetMeta,
  NextEntityState,
  PropItemMeta,
  PropItemRefs,
  TempWidgetEntityType,
  TEMP_ENTITY_ID,
  WidgetEntityState,
} from "@provider-app/platform-access-spec";
import union from "lodash/union";
import {
  entityStateMergeRule,
  increaseID,
} from "@provider-app/page-visual-editor-engine/utils";
import { EditableWidgetEntity } from "@provider-app/page-visual-editor-engine/data-structure";

export type GetPropItemMeta = (propID: string) => PropItemMeta

export type MakeWidgetEntity = (
  widgetType: EditableWidgetMeta,
  getPropItemMeta: GetPropItemMeta,
  options?: {
    state?: string;
  }
) => EditableWidgetEntity;

/**
 * 重要策略：生成组件的 ID 不能带有中划线 - ，否则生成低代码函数时，名字将出错。所以这里通过 nanoid.customAlphabet 生成
 */
const nanoid = customAlphabet("platformWidget", 8);

/**
 * 实例化 widgetType
 */
export const makeWidgetEntity: MakeWidgetEntity = (
  widgetMeta: EditableWidgetMeta,
  getPropItemMeta,
  options
) => {
  const { state = "active" } = options || {};
  const entityID = nanoid();

  /**
   * 1. 如果组件还没被实例化，则实例化组件类
   * 2. 下划线前缀为内部字段，用于表示已经实例化
   */
  const entity = produce(widgetMeta as EditableWidgetEntity, (draft) => {
    draft.id = entityID;
    draft._state = state as 'active';
    draft.propState = getEntityDefaultState(widgetMeta, getPropItemMeta);

    // 最后删除属性项引用
    Reflect.deleteProperty(draft, "propItemsRely");
    // Reflect.deleteProperty(draft, "eventAttr");
    // Reflect.deleteProperty(draft, "varAttr");
    // Reflect.deleteProperty(draft, "icon");
  });

  return entity;
};

export const makeTempWidgetEntity = (props = {}): TempWidgetEntityType => ({
  ...props,
  id: increaseID(Math.random(), TEMP_ENTITY_ID),
  _state: TEMP_ENTITY_ID,
});

export const isTempEntity = (entity) => entity._state === TEMP_ENTITY_ID;

/// -----------------------------------
/// 生成默认的 propState
/// -----------------------------------

function makeArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

/**
 * 包装默认值
 */
const wrapDefaultValues = (propItemMeta: PropItemMeta): NextEntityState[] => {
  const { defaultValues, whichAttr } = propItemMeta;
  const _defaultValues = makeArray(whichAttr).map((attr) => ({
    attr,
    value: defaultValues ? defaultValues[attr] : null,
  }));
  return _defaultValues;
};

/**
 * 设置组件实例状态的默认值
 */
const getEntityDefaultState = (widgetMeta: EditableWidgetMeta, getPropItem: GetPropItemMeta) => {
  const { defaultProps, propItemsRely } = widgetMeta;
  let defaultWidgetState: WidgetEntityState = {};
  if(Array.isArray(propItemsRely?.propItemRefs)) {
    const bindPropItemsMap = takeAllPropItemMetaFormWidget(propItemsRely.propItemRefs, getPropItem);

    Object.keys(bindPropItemsMap).forEach((propID) => {
      const propItemMeta = bindPropItemsMap[propID];
  
      if (propItemMeta) {
        const _defaultValues = wrapDefaultValues(propItemMeta);
        defaultWidgetState = Object.assign(
          {},
          entityStateMergeRule(defaultWidgetState, _defaultValues),
          defaultProps
        );
      }
    });
  }

  return defaultWidgetState;
};

/**
 * 属性项的 map
 */
interface PropItemMetaMap {
  [propID: string]: PropItemMeta;
}


/**
 * 将组件绑定的属性项转换成 PropItemMetaMap
 */
const takeAllPropItemMetaFormWidget = (propItemRefs: PropItemRefs[], getPropItem: GetPropItemMeta) => {
  const propItemMetaMap: PropItemMetaMap = {};

  /**
   * 将 propItemRefs 转换成 PropItemMeta
   */
  propItemRefs.forEach((refItem) => {
    const { propID, editAttr, ...overrideOptions } = refItem;

    // 获取属性项的接口
    const propItemMetaFormInterface = getPropItem(propID);
    if (!propItemMetaFormInterface) return;

    // 合并属性项 meta
    const mergedPropItemMeta = produce(propItemMetaFormInterface, (draft) => {
      if (editAttr) {
        draft.whichAttr = union(makeArray(draft.whichAttr), editAttr);
      }
      Object.assign(draft, overrideOptions);
      return draft;
    });
    propItemMetaMap[propID] = mergedPropItemMeta;
  });
  // rawPropItems.forEach((item) => {
  //   if (item) propItemMetaMap[item.id] = item;
  // });
  return propItemMetaMap;
};

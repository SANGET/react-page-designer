/**
 * PropEditor
 */
import React from "react";
import produce from "immer";
import union from "lodash/union";
import { Debounce } from "@mini-code/base-func";
import {
  PropItemMeta,
  WidgetRelyPropItems,
  EditAttr,
  NextEntityStateType,
  NextEntityState,
  ChangeEntityState,
  WidgetEntityState,
} from "@provider-app/platform-access-spec";
import { GroupPanel, GroupPanelData } from "../GroupPanel";
import { entityStateMergeRule } from "../../utils";

/**
 * 属性项的 map
 */
interface PropItemMetaMap {
  [propID: string]: PropItemMeta;
}

export type PropPanelData = GroupPanelData[];

export type UpdateEntityStateOfEditor = (
  entityState: WidgetEntityState
) => void;
export type InitEntityStateOfEditor = (entityState: WidgetEntityState) => void;

/**
 * 属性项的渲染器标准接口
 */
export interface PropItemRendererProps {
  propItemMeta: PropItemMeta;
  /** 编辑中的所有属性 */
  editingWidgetState: any;
  changeEntityState: ChangeEntityState;
}

export interface PropertiesEditorProps {
  /** 默认的表单数据state */
  entityState?: WidgetEntityState;
  /** 选中的 entity */
  propItemGroupingData: PropPanelData;
  getPropItemMeta: (propItemID: string) => any;
  updateEntityState: (nextState) => void;
  /** 每个属性项的渲染器 */
  propItemRenderer: (props: PropItemRendererProps) => JSX.Element;
}

const debounce = new Debounce();

function makeArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

interface PropertiesEditorState {
  selfEntityState?: WidgetEntityState;
  ready: boolean;
}

/**
 * 属性编辑器面板
 */
class PropertiesEditor extends React.Component<
  PropertiesEditorProps,
  PropertiesEditorState
> {
  state: PropertiesEditorState = {
    ready: true,
    selfEntityState: undefined,
  };

  bindPropItemsMap: PropItemMetaMap | null = null;

  constructor(props) {
    super(props);
    const { entityState } = props;
    if (entityState) {
      this.state.selfEntityState = entityState;
    }
  }

  /**
   * 更新此组件内部的表单状态
   *
   * TODO: 做更强的状态管理工具
   */
  updateEntityStateForSelf = (nextValue: NextEntityStateType) => {
    this.setState(({ selfEntityState }) => {
      const _nextValue = makeArray(nextValue);
      const nextState = entityStateMergeRule(selfEntityState, _nextValue);
      return {
        selfEntityState: nextState,
      };
    });
  };

  takePropItemMeta = (metaID: string) => {
    return this.bindPropItemsMap?.[metaID];
  };

  /**
   * 获取属性项需要的值
   * @param entityState
   * @param propItemMeta
   */
  getPropItemValue = (entityState: WidgetEntityState, editAttr: EditAttr) => {
    const _editAttr = makeArray(editAttr);
    const res = {};
    _editAttr.forEach((attr) => {
      res[attr] = entityState[attr];
    });
    return res;
  };

  changeEntityStateInEditor: ChangeEntityState = (nextValue) => {
    /** 更新自身的数据 */
    this.updateEntityStateForSelf(nextValue);

    /** 延后更新整个应用的数据 */
    debounce.exec(() => {
      const { selfEntityState } = this.state;
      // console.log('selfEntityState :>> ', selfEntityState);
      if (nextValue) this.props.updateEntityState(selfEntityState);
    }, 100);
  };

  /**
   * prop item 渲染器
   * @param propItemID
   * @param groupType
   */
  propItemRendererSelf = (propItemID, groupType) => {
    // const { selectedEntity } = this.props;
    // const { entityState } = this.props;
    /**
     * 为了确保值的更新是准确的，需要内部维护一次数据
     */
    const { propItemRenderer, getPropItemMeta } = this.props;
    const { selfEntityState } = this.state;
    const propItemMeta = getPropItemMeta(propItemID);

    /** 如果组件没有绑定该属性项，则直接返回 */
    if (!selfEntityState || !propItemMeta) return null;

    const editingAttr = propItemMeta.whichAttr;

    /** 将实例状态回填到属性项 */
    const activeState = this.getPropItemValue(selfEntityState, editingAttr);
    return (
      <div key={propItemID}>
        {propItemRenderer({
          propItemMeta,
          changeEntityState: this.changeEntityStateInEditor,
          editingWidgetState: activeState,
        })}
      </div>
    );
  };

  render() {
    const { propItemGroupingData } = this.props;

    return (
      <div className="entity-prop-editor">
        <GroupPanel
          panelData={propItemGroupingData}
          itemRenderer={this.propItemRendererSelf}
        />
      </div>
    );
  }
}

export default PropertiesEditor;

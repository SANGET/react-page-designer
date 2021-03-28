import React from "react";
import Editor, {
  PropertiesEditorProps,
  PropPanelData,
} from "@provider-app/page-visual-editor-engine/components/PropertiesEditor";
import { Modal } from "antd";
import produce from "immer";
import { LoadingTip } from "@provider-app/shared-ui";
import {
  getWidgetMetadata,
  getPropItemGroupingData,
  getWidgetMetadataSync,
} from "@provider-app/provider-app-common/services/widget-loader";
import {
  EditAttr,
  PropItemMeta,
  WidgetEntityState,
  WidgetMeta,
} from "@provider-app/platform-access-spec";
import { PropItemRenderer } from "../PDPropItemRenderer";
import { PlatformContext } from "../../utils";
import { groupPropItem } from "./prop-item-group-shape";
import { getPropItemMeta } from "../../services";

function makeArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

// TODO: 完善属性检查
interface PropsEditorProps {
  pageMetadata;
  platformCtx;
  customConfig?: any;
  selectedEntity;
  entityState: PropertiesEditorProps["entityState"];
  updateEntityState: PropertiesEditorProps["updateEntityState"];
}

const prepareData = async (widgetRef) => {
  const [widgetMeta, propItemGroupingData] = await Promise.all([
    getWidgetMetadata(widgetRef),
    getPropItemGroupingData(),
  ]);

  // const propItemGroupingData = groupPropItem(propItemData);

  return {
    widgetMeta,
    propItemGroupingData,
  };
};

/**
 * Page design prop editor
 */
export class PDPropertiesEditor extends React.Component<
  PropsEditorProps,
  {
    ready: boolean;
    propItemGroupingData?: PropPanelData;
    widgetMeta?: WidgetMeta;
    widgetPropItemMapping: Record<string, any>;
  }
> {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      propItemGroupingData: undefined,
      widgetMeta: undefined,
      widgetPropItemMapping: {},
    };
  }

  componentDidMount = async () => {
    const { selectedEntity } = this.props;

    const { propItemGroupingData, widgetMeta } = await prepareData(
      selectedEntity.widgetRef
    );

    const widgetPropItemMapping = {};
    const { propItemRefs } = widgetMeta.propItemsRely;

    propItemRefs?.forEach((item) => {
      widgetPropItemMapping[item.propID] = true;
    });

    /**
     * 属性项面板的数据的过滤器
     */
    const _propItemGroupingData = this.propItemGroupingDataFilter(
      propItemGroupingData,
      (itemID) => !!widgetPropItemMapping[itemID]
    );

    this.setState({
      propItemGroupingData: _propItemGroupingData,
      widgetMeta,
      widgetPropItemMapping,
      ready: true,
    });
  };

  propItemGroupingDataFilter = (propItemGroupingData, conditionFn) => {
    return produce(propItemGroupingData, (draft) => {
      draft.forEach(({ itemsGroups }) => {
        itemsGroups.forEach(({ items }, idx) => {
          itemsGroups[idx].items = items.filter((item) => {
            return conditionFn(item);
            // if (!conditionFn(item)) {
            //   // delete items[idx];
            //   // items.splice(idx, 1);
            //   // Reflect.deleteProperty(items, idx);
            // }
          });
        });
      });
      return draft;
    });
  };

  componentDidCatch(error, errorInfo) {
    // console.log(error, errorInfo);
    Modal.error({
      title: `属性项渲染错误`,
      content: (
        <div style={{ maxHeight: 300, overflow: "auto" }}>
          {JSON.stringify(errorInfo)}
        </div>
      ),
    });
  }

  propItemRenderFilter = (propItemMeta: PropItemMeta) => {
    const { id } = propItemMeta;
    return !!this.state.widgetPropItemMapping[id];
  };

  /**
   * 合并组件实例和组件 metadata
   */
  mergeWidgetEntityAndMeta = () => {
    const { selectedEntity } = this.props;
    const { widgetMeta } = this.state;
    // const widgetMeta = getWidgetMetadataSync(selectedEntity.widgetRef);
    return Object.assign({}, widgetMeta, selectedEntity);
  };

  /**
   * 属性项的渲染器，这里做业务数据过滤，将组件实例没有绑定的属性项过滤掉
   */
  propItemRenderer = ({
    propItemMeta,
    changeEntityState,
    editingWidgetState,
  }) => {
    // console.log(changeEntityState);
    const { pageMetadata, platformCtx } = this.props;
    const widgetEntity = this.mergeWidgetEntityAndMeta();
    // const isPass = this.propItemRenderFilter(propItemMeta);

    return (
      <PropItemRenderer
        // {...props}
        editingWidgetState={editingWidgetState}
        widgetEntity={widgetEntity}
        propItemMeta={propItemMeta}
        changeEntityState={changeEntityState}
        platformCtx={platformCtx}
        pageMetadata={pageMetadata}
      />
    );
  };

  render() {
    const {
      // initEntityState,
      updateEntityState,
      entityState,
      // platformCtx,
      // selectedEntity,
    } = this.props;
    const { propItemGroupingData, ready } = this.state;
    // const widgetBindedPropItemsMeta = widgetMeta.propItemsRely;
    // const initProps = selectedEntity.defaultProps;
    return ready ? (
      <div>
        <Editor
          // {...otherProps}
          entityState={entityState}
          getPropItemMeta={getPropItemMeta}
          // initProps={initProps}
          updateEntityState={updateEntityState}
          // initEntityState={initEntityState}
          propItemGroupingData={propItemGroupingData}
          // widgetBindedPropItemsMeta={widgetBindedPropItemsMeta}
          propItemRenderer={this.propItemRenderer}
        />
      </div>
    ) : (
      <LoadingTip />
    );
  }
}

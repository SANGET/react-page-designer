import React, { useEffect, useState } from "react";
import { PropItemRenderContext } from "@provider-app/platform-access-spec";
import { Input } from "antd";
import { EditOutlined } from "@ant-design/icons";
import {
  getWidgetMetadata,
  getPropItemGroupingData,
} from "@provider-app/provider-app-common/services/widget-loader";
import { makeWidgetEntity } from "@provider-app/page-visual-editor-engine/utils";
import "./style.scss";

/**
 * 栅格面板中的项
 * @param props grid [{span: 24}] 当前面板渲染比例
 * @param props currentGrid [{span: 12}, {span: 12}] 当前组件的真实渲染比例
 * @param props onClick(grid) 向上通知应该被选中的渲染比例
 * @returns
 */
const Grid = (props) => {
  const { grid, currentGrid, onClick } = props;
  const getFixedClassName = () => {
    const spanFromProps = grid?.map(({ span }) => span).join(":");
    const currentSpan = currentGrid?.map(({ span }) => span).join(":");
    return `float-left w-1/4 pb-2 px-1 cursor-pointer${
      spanFromProps === currentSpan ? " active" : ""
    }`;
  };
  const handleClick = () => {
    onClick(grid);
  };
  const prevGrid = grid?.slice();
  const lastGrid = prevGrid?.pop();
  return (
    <div className={getFixedClassName()} onClick={handleClick}>
      <div className="grid-content border rounded-md border-gray-400 p-1 ant-row">
        {prevGrid?.map(({ span }, index) => (
          <div
            className={`bg-gray-400 h-6 flex-grow ant-col ant-col-${span} border-r border-white`}
            key={index}
          ></div>
        ))}
        <div className={`bg-gray-400 h-6 ant-col-${lastGrid.span}`}></div>
      </div>
    </div>
  );
};
/**
 * 栅格比例面板
 * @param param0
 * @returns
 */
export const GridEditorComp: React.FC<PropItemRenderContext> = ({
  widgetEntity,
  changeEntityState,
  changeOtherEntityState,
  changeLayout,
  editingWidgetState,
  platformCtx: {
    meta: { getPageContent, getPageInfo, getPropItemMeta },
  },
}) => {
  const [editorValue, setEditorValue] = useState("");
  /** 从页面设计器获取最新栅格布局内 body */
  const getBody = () => {
    /** 进行数据转换，页面获取的为树形数据，转换为平铺的对象映射 */
    const getMap = (
      list: {
        widgetRef: string;
        id: string;
        body;
        propState: Record<string, unknown>;
      }[]
    ) => {
      const map: Record<
        string,
        {
          widgetRef: string;
          id: string;
          body;
          propState: Record<string, unknown>;
        }
      > = {};
      list?.forEach((item) => {
        const { id } = item;
        Object.assign(map, { [id]: item });
        Object.assign(map, getMap(item.body));
      });
      return map;
    };
    const { id } = widgetEntity;
    const layoutContent = getPageContent().content || [];
    const layoutItemsMap = getMap(layoutContent);
    const { [id]: lastWidgetEntity } = layoutItemsMap;
    return lastWidgetEntity?.body || [];
  };
  /** 获取组件的唯一标识 */
  const getEntityID = (entity) => {
    return entity?.id || "";
  };
  /** 更改组件内 可以更改的（两者对比的最小长度） 的 Col 所占比例 */
  const changeBodySpan = (pGrid) => {
    const body = getBody();
    /** 不管是变多还是变少，都是要更改两者共有的 Col 集 的所占比例 */
    const min = Math.min(body?.length, pGrid?.length);
    for (let i = 0; i < min; i++) {
      const id = getEntityID(body?.[i]);
      const { propState } = body?.[i] || {};
      const { span } = pGrid[i] || {};
      const nextPropState = {
        ...(propState || {}),
        span,
      };
      /** 向上通知更改对应的 Col 占位 */
      changeOtherEntityState(id, nextPropState);
    }
  };
  /** 判断要进行删除的组件个数 */
  const getSpliceCount = (pBody, pGrid) => {
    const bodyLen = pBody?.length || 0;
    const gridLen = pGrid?.length || 0;
    const minus = bodyLen - gridLen;
    return minus > 0 ? minus : 0;
  };
  /** 生成新的子项 */
  const genCol = (widgetMeta, span) => {
    const updatePropItemRefs = (pSpan) => {
      const { propItemRefs } = widgetMeta.propItemsRely;
      propItemRefs?.some((item) => {
        const { propID, editAttr } = item;
        /** 按参数生成默认的所占比例 */
        if (propID === "prop_flex_config" && editAttr?.includes("span")) {
          item.defaultValues = { span: pSpan };
          return true;
        }
        return false;
      });
      return { propItemRefs };
    };
    const resWidgetMeta = {
      ...widgetMeta,
      propItemsRely: updatePropItemRefs(span),
    };
    return makeWidgetEntity(resWidgetMeta, getPropItemMeta);
  };
  /** 根据变多的比例个数，生成对应的 Col 列表 */
  const genMoreBody = async (pGrid) => {
    const [widgetMeta] = await Promise.all([
      getWidgetMetadata("FlexLayout"),
      getPropItemGroupingData(),
    ]);
    return pGrid.map(({ span }) => genCol(widgetMeta, span));
  };
  /** 进行 push 则意味着是要在最后一项后进行数据添加 */
  const getPushLocatedEntity = (pBody, pGrid) => {
    const bodyLen = pBody?.length || 0;
    const gridLen = pGrid?.length || 0;
    const index = bodyLen < gridLen ? bodyLen - 1 : gridLen - 1;
    return pBody?.[index];
  };
  /** 进行 set 则意味着是要删减数据 */
  const getSetLocatedEntity = (pBody, pGrid) => {
    const bodyLen = pBody?.length || 0;
    const gridLen = pGrid?.length || 0;
    const index = bodyLen < gridLen ? bodyLen - 1 : gridLen - 1;
    return pBody?.[index + 1];
  };
  /** 更改子组件的布局（只涉及 增，删） */
  const changeBodyLayout = async (pGrid) => {
    const body = getBody();
    const spliceCount = getSpliceCount(body, pGrid);
    const addItems = await genMoreBody(pGrid.slice(body?.length || 0));
    if (addItems.length > 0) {
      const locatedEntityID = getEntityID(getPushLocatedEntity(body, pGrid));
      changeLayout({
        locatedEntityID,
        addItems,
        spliceCount,
        type: "push",
      });
    } else if (spliceCount > 0) {
      const locatedEntityID = getEntityID(getSetLocatedEntity(body, pGrid));
      changeLayout({
        locatedEntityID,
        spliceCount,
        type: "set",
      });
    }
  };
  const handleChange = (pGrid) => {
    /** 最少栅格数支持 */
    changeBodySpan(pGrid);
    /** 增、删 内部栅格的支持 */
    changeBodyLayout(pGrid);

    changeEntityState({
      attr: "grid",
      value: pGrid,
    });
  };
  const handleCustomedChange = (value) => {
    setEditorValue(value);
    const lastValue = value
      .replace(/^:/, "2:")
      .replace(/::/, ":2:")
      .replace(/:$/, ":2");
    handleChange(lastValue.split(":").map((span) => ({ span })));
  };
  const handleFixedChange = (grid) => {
    const value = grid?.map(({ span }) => span).join(":") || "";
    setEditorValue(value);
    handleChange(grid);
  };
  const getCustomedClassName = () => {
    const isActive = isCustomed();
    return `float-left w-1/4 pb-2 px-1 relative${isActive ? " active" : ""}`;
  };
  const getValueFromGrid = () => {
    const { grid } = editingWidgetState;
    const value = grid?.map(({ span }) => span).join(":") || "";
    return value;
  };

  useEffect(() => {
    setEditorValue(getValueFromGrid());
  }, []);

  const isCustomed = () => {
    const { grid } = editingWidgetState;
    const gridValue = grid?.map(({ span }) => span).join(":") || "";
    return ![
      "24",
      "12:12",
      "6:18",
      "18:6",
      "8:8:8",
      "6:12:6",
      "6:6:6:6",
      "4:4:4:4:4:4",
    ].includes(gridValue);
  };
  const gridPanel = [
    [{ span: 24 }],
    [{ span: 12 }, { span: 12 }],
    [{ span: 6 }, { span: 18 }],
    [{ span: 18 }, { span: 6 }],
    [{ span: 8 }, { span: 8 }, { span: 8 }],
    [{ span: 6 }, { span: 12 }, { span: 6 }],
    [{ span: 6 }, { span: 6 }, { span: 6 }, { span: 6 }],
    [
      { span: 4 },
      { span: 4 },
      { span: 4 },
      { span: 4 },
      { span: 4 },
      { span: 4 },
    ],
  ];
  const { grid: currentGrid } = editingWidgetState;
  return (
    <div className="grid-helper">
      <div className="clearfix grid-panel">
        {gridPanel.map((grid, index) => (
          <Grid
            currentGrid={currentGrid}
            grid={grid}
            onClick={handleFixedChange}
            key={index}
          />
        ))}
        {/* 自定义 */}
        {isCustomed() && (
          <div className={getCustomedClassName()}>
            <div className=" grid-content border rounded-md border-gray-300 p-1 ant-row">
              <div className="bg-gray-300 h-6 flex-grow ant-col ant-col-4 border-r border-white"></div>
              <div className="bg-gray-300 h-6 flex-grow ant-col ant-col-4 border-r border-white"></div>
              <div className="bg-gray-300 h-6 flex-grow ant-col ant-col-4 border-r border-white"></div>
              <div className="bg-gray-300 h-6 flex-grow ant-col ant-col-4 border-r border-white"></div>
              <div className="bg-gray-300 h-6 flex-grow ant-col ant-col-4 border-r border-white"></div>
              <div className="bg-gray-300 h-6 ant-col-4"></div>
            </div>
            <EditOutlined className="absolute edit" />
          </div>
        )}
      </div>
      <div className="grid-editor ant-row">
        <div className="grid-label ant-col ant-col-10 pl-1">列比例</div>
        <div className="grid-input ant-col ant-col-14">
          <Input
            value={editorValue}
            onChange={(e) => {
              handleCustomedChange(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

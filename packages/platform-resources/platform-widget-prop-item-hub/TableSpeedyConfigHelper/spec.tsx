import React from "react";
import { CloseModal, ShowModal, Tabs, Tab } from "@provider-app/shared-ui";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { ColumnsSpeedyHelper } from "./ColumnsSpeedyHelper";
// import { TableSpeedyConfigComp, SelectedField } from "./comp";

/** 属性项编辑的组件属性 */

const metaAttr = "dataSource";

/**
 * 绑定数据列
 */
@PropItem({
  id: "prop_table_speedy_config_helper",
  label: "快捷配置",
  whichAttr: [
    "ds",
    "columns",
    "typicalQueryList",
    "specialQueryList",
    "keywordQueryList",
  ],
  useMeta: metaAttr,
})
export default class TableSpeedyConfigHelperSpec {
  render({
    editingWidgetState,
    changeEntityState,
    platformCtx,
  }: PropItemRenderContext) {
    const { takeMeta } = platformCtx.meta;
    const datasource = takeMeta({
      metaAttr: "dataSource",
    });
    const handleClick = () => {
      const modalID = ShowModal({
        title: "表格配置",
        type: "normal",
        position: "top",
        width: "85%",
        children: () => {
          return (
            <div className="p-5 pt-0">
              <Tabs>
                <Tab label="列属性">
                  <ColumnsSpeedyHelper
                    dsList={
                      editingWidgetState.ds?.map((dsID) => datasource[dsID]) ||
                      []
                    }
                    fieldList={editingWidgetState.columns || []}
                    typicalQueryList={editingWidgetState.typicalQueryList || []}
                    specialQueryList={editingWidgetState.specialQueryList || []}
                    keywordQueryList={editingWidgetState.keywordQueryList || []}
                    changeEntityState={changeEntityState}
                  />
                </Tab>
                <Tab label="表格按钮">暂未实现</Tab>
                <Tab label="导入导出">暂未实现</Tab>
                <Tab label="颜色字体格式化">暂未实现</Tab>
              </Tabs>
            </div>
          );
        },
      });
    };
    return (
      <span
        onClick={handleClick}
        className="__label bg_default t_white w-full cursor-pointer text-center"
      >
        点击进入表格快捷配置
      </span>
    );
  }
}

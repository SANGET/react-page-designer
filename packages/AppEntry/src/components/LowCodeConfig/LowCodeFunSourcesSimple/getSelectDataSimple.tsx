import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Input, Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string, params?: any) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
  params?: any;
}
export const GetSelectDataSimple: React.FC<IProps> = (props) => {
  const {
    insertValue,
    metaCtx,
    platformCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
    params,
  } = props;
  const [tableName, settableName] = useState<string>(params?.tableName || "");
  const [tableTitle, settableTitle] = useState<string>(
    params?.tableTitle || ""
  );
  const [widget, setwidget] = useState<string>(params?.widget || "");
  const createCode = () => {
    const template = `
/**
 * 下拉数据源
 */
HYCLIB.DataManager.getSelectData({
  ...snippetParams,
  pageId: '${pageId}',
  widgetId: '${widgetId}',
  tableName: '${tableName}',
  widget:'${widget}',
  $A_R: window.$A_R
});`;
    insertValue(template, { tableName, widget, tableTitle });
  };
  const pageStateObj = pageState?.pageState || {};
  const widgetsObj = {};
  Object.keys(pageStateObj)?.forEach((key) => {
    if (
      key.indexOf("InState") !== -1 &&
      pageStateObj[key]?._info?.title &&
      pageStateObj[key]?._info?.widgetRef !== "FormButton"
    ) {
      widgetsObj[key] = pageStateObj[key];
    }
  });
  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div>字典：</div>
        <Input
          style={{ width: 200 }}
          placeholder="选择字典"
          defaultValue={tableTitle}
          value={tableTitle}
          onClick={() => {
            platformCtx?.selector.openDatasourceSelector({
              defaultSelected: [],
              modalType: "normal",
              position: "top",
              single: true,
              typeSingle: true,
              typeArea: ["DICT"],
              onSubmit: ({ close, interDatasources }) => {
                // 由于是单选的，所以只需要取 0
                const bindedDS = interDatasources[0];
                settableName(bindedDS.code);
                settableTitle(bindedDS.name);
                close();
              },
            });
          }}
        />
      </div>
      <div style={{ margin: "10px 0" }}>
        <div>字典控件：</div>
        <Select
          style={{ width: 200 }}
          placeholder="选择控件"
          defaultValue={widget}
          onChange={(val: string) => {
            setwidget(val);
          }}
        >
          {Object.keys(widgetsObj)?.map((id) => (
            <Option value={id} key={id}>
              {widgetsObj[id]?._info?.title}
            </Option>
          ))}
        </Select>
      </div>

      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

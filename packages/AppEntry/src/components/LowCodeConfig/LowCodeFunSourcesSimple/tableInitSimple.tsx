import { Button, Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string, params?: any) => void;
  pageState?: any;
  params?: any;
}
export const TableInitSimple: React.FC<IProps> = (props) => {
  const { insertValue, pageState, params } = props;
  const [pageComponent, setpageComponent] = useState<string>(
    params?.pageComponent
  );
  const createCode = () => {
    const template = `
/**
 * 简单表格初始化配置
 */
let params = snippetParams;
params.widgetInState = "${widget}";
params.pageComponent = "HYCGENCODE.${pageComponent}";
HYCLIB.GeneralTable.initTable(params); 
    `;

    insertValue(template, { pageComponent, widget });
  };

  const [widget, setWidget] = useState<string>(params?.widget || "");
  const pageStateObj = pageState?.pageState || {};
  const widgetsObjForWidget = {};
  Object.keys(pageStateObj)?.forEach((key) => {
    if (
      key.indexOf("InState") !== -1 &&
      pageStateObj[key]?._info?.title &&
      pageStateObj[key]?._info?.widgetRef === "NormalTable"
    ) {
      widgetsObjForWidget[key] = pageStateObj[key];
    }
  });

  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div style={{ display: "inline-block" }}>
          <div>初始化表格：</div>
          <Select
            placeholder="选择表格"
            style={{ width: 200 }}
            defaultValue={widget}
            onChange={(val: string) => {
              setWidget(val);
            }}
          >
            {Object.keys(widgetsObjForWidget)?.map((widgetId) => (
              <Option value={widgetId} key={widgetId}>
                {widgetsObjForWidget[widgetId]?._info?.title}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: "inline-block", marginLeft: "10px" }}>
          <div>编辑页面：</div>
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="选择页面"
            defaultValue={pageComponent}
            onChange={(val: string) => {
              setpageComponent(val);
            }}
          >
            {pageState?.pageList?.map((page) => (
              <Option value={page.value} key={page.value}>
                {page.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

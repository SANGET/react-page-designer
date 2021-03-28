import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string) => void;
  metaCtx: PlatformCtx["meta"];
  pageState?: any;
}
export const TableInit: React.FC<IProps> = (props) => {
  const { insertValue, metaCtx, pageState } = props;
  const createCode = () => {
    const template = `
/**
 * 表格初始化配置
 */
snippetParams.container.setState(
{
  ['${widget}']:
  {
    onAdd: (data) => { // 新增
      
    },
    onEdit: (data) => { // 编辑
      const index = data.triggerIndex;
      const dataSource = data.dataSource;
      snippetParams.container.setState(
        {
          editId: dataSource[index].id
        },()=>{

        }
      );
    },
    onDetail: (data) => { // 详情
      const index = data.triggerIndex;
      const dataSource = data.dataSource;
      snippetParams.container.setState(
        {
          editId: dataSource[index].id
        },()=>{
          
        }
      );
    },
    onRemove: (data) => { // 删除
      const index = data.triggerIndex;
      const dataSource = data.dataSource;
      snippetParams.container.setState(
        {
          editId: dataSource[index].id
        },()=>{
          
        }
      );
    },
  }
});
    `;

    insertValue(template);
  };

  const [widget, setWidget] = useState<string>("");
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
        <div>初始化表格：</div>
        <Select
          placeholder="选择表格"
          style={{ width: 150 }}
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
      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

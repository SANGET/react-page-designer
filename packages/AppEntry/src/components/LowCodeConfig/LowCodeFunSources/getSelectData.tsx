import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Input, Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
}
export const GetSelectData: React.FC<IProps> = (props) => {
  const {
    insertValue,
    metaCtx,
    platformCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
  } = props;
  const [tableName, settableName] = useState<string>("");
  const [tableTitle, settableTitle] = useState<string>("");
  const [widget, setwidget] = useState<string>("");
  const createCode = () => {
    const template = `$A_R.post(HYCCONFIG.SAAS.IP+'/hy/saas/${$R_P.urlManager.currLessee}/${$R_P.urlManager.currApp}/business/__${pageId}__${widgetId}',
{ "businesscode": "__${pageId}__${widgetId}",
  "steps": [
    {
      "function": {
        "code": "TABLE_SELECT",
        "params": {
            "table": "${tableName}",
        }
      }
    }
  ]
}
).then((res) =>{
  console.log(res);
  const dictList = res?.result?.data || [];
  let widgetSource = {};
  dictList.forEach(item => {
    widgetSource[item.code] = item.name;
  });
  snippetParams.container.setState({
    ['${widget}']: {
      ...snippetParams.container.state['${widget}'],
      options: widgetSource          
    }
  });
  console.log(widgetSource);
});`;
    insertValue(template);
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
          showSearch
          style={{ width: 200 }}
          placeholder="选择控件"
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

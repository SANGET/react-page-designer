import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Input } from "antd";
import React, { useState } from "react";

interface IProps {
  insertValue: (lowCode: string) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
}
export const DataBackfill: React.FC<IProps> = (props) => {
  const {
    insertValue,
    platformCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
  } = props;
  const [tableName, settableName] = useState<string>("");
  const [tableCode, settableCode] = useState<string>("");

  const createCode = () => {
    const fields = pageState?.pageState || {};
    const columns: { key: string; field: string }[] = [];
    Object.keys(fields)?.forEach((key) => {
      if (fields[key]._info?.field) {
        const name = fields[key]._info?.field.split(".")[0];
        const field = fields[key]._info?.field.split(".")[1];
        if (name === tableCode) {
          columns.push({ key, field });
        }
      }
    });
    const template = `
if(snippetParams.prevProps?.pageDTO?.id == snippetParams.container?.props?.pageDTO?.id){
  return;
}
let columns = ${JSON.stringify(columns)};
const steps = [{
  "function": {
    "code": "TABLE_SELECT",
    "params": {
      "table": "${tableCode}",
      "condition": {
        "and":[{
          "equ": {
            "id": snippetParams.container?.props?.pageDTO?.id || ""
          }
        }]
      }
    }
  }
}];
$A_R.post(HYCCONFIG.SAAS.IP+'/hy/saas/${$R_P.urlManager.currLessee}/${
      $R_P.urlManager.currApp
    }/business/__${pageId}__${widgetId}',
  { "businesscode": "__${pageId}__${widgetId}",
    "steps": steps
  }
).then((res) =>{
  console.log(res);
  columns.forEach((column)=>{
    snippetParams.container.setState({
      [column.key]: {
        ...snippetParams.container.state[column.key],
        realVal: res?.result?.data[0][column.field] 
      },
    });
  });
});`;
    insertValue(template);
  };

  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div>数据表：</div>
        <Input
          style={{ width: 300 }}
          placeholder="请选择数据表"
          value={tableName}
          onClick={() => {
            platformCtx?.selector.openDatasourceSelector({
              defaultSelected: [],
              modalType: "normal",
              position: "top",
              single: true,
              typeSingle: true,
              typeArea: ["TABLE"],
              onSubmit: ({ close, interDatasources }) => {
                // 由于是单选的，所以只需要取 0
                const bindedDS = interDatasources[0];
                console.log(bindedDS);
                settableName(bindedDS.name);
                settableCode(bindedDS.code);
                close();
              },
            });
          }}
        />
      </div>
      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

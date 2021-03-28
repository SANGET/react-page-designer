import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button } from "antd";
import React from "react";

interface IProps {
  insertValue: (lowCode: string) => void;
  metaCtx: PlatformCtx["meta"];
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
}
export const ModifyData: React.FC<IProps> = (props) => {
  const {
    insertValue,
    metaCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
  } = props;
  const createCode = () => {
    const fields = pageState?.pageState || {};
    const tables: { name: string; columns: any }[] = [];
    Object.keys(fields)?.forEach((key) => {
      if (fields[key]._info?.field && key.indexOf("OutState") !== -1) {
        const tableName = fields[key]._info?.field.split(".")[0];
        const column = fields[key]._info?.field.split(".")[1];
        tables.forEach((item) => {
          if (item.name === tableName) {
            item.columns[column] = key;
          } else {
            tables.push({
              name: tableName,
              columns: {
                [column]: key,
              },
            });
          }
        });
        if (tables.length === 0) {
          tables.push({
            name: tableName,
            columns: {
              [column]: key,
            },
          });
        }
      }
    });
    const template = `
let tables = ${JSON.stringify(tables)};
let steps = [];
tables.forEach(table => {
  Object.keys(table.columns).forEach((column) => {
    if(column != "id"){
      table.columns[column] = snippetParams.container.state[table.columns[column]].realVal
    }
  });
  table.columns.id = snippetParams.container?.props?.pageDTO?.id;
  const step = {
    "function": {
      "code": "TABLE_UPDATE",
      "params": {
        "table": table.name,
        "condition": {
          "and":[
            {
              "equ": {
                "id": table.columns.id
              }
            }
          ]
        },
        "set": [table.columns]
      }
    }
  };
  steps.push(step);
});
$A_R.post(HYCCONFIG.SAAS.IP+'/hy/saas/${$R_P.urlManager.currLessee}/${
      $R_P.urlManager.currApp
    }/business/__${pageId}__${widgetId}',
  { "businesscode": "__${pageId}__${widgetId}",
    "steps": steps
  }
).then((res) =>{
  console.log(res);
  snippetParams.container?.props?.onOk();
});`;

    insertValue(template);
  };

  return (
    <div>
      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button } from "antd";
import React from "react";

interface IProps {
  insertValue: (lowCode: string, params?: any) => void;
  metaCtx: PlatformCtx["meta"];
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
}
export const SubmitDataParamsSimple: React.FC<IProps> = (props) => {
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
                id: "$ID()",
                [column]: key,
              },
            });
          }
        });
        if (tables.length === 0) {
          tables.push({
            name: tableName,
            columns: {
              id: "$ID()",
              [column]: key,
            },
          });
        }
      }
    });
    const template = `
/**
 * 数据提交
 */
HYCLIB.DataManager.submitDataParams({
    ...snippetParams,
    tables: ${JSON.stringify(tables)},
    pageId: '${pageId}',
    widgetId: '${widgetId}',
    $A_R: window.$A_R
});`;

    insertValue(template, {});
  };

  return (
    <div>
      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

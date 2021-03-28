import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Input } from "antd";
import React, { useState } from "react";

interface IProps {
  insertValue: (lowCode: string, params?: any) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
  params?: any;
}
export const DataBackfillSimple: React.FC<IProps> = (props) => {
  const {
    insertValue,
    platformCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
    params,
  } = props;
  const [tableName, settableName] = useState<string>(params?.tableName || "");
  const [tableCode, settableCode] = useState<string>(params?.tableCode || "");

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
/**
 * 数据回填
 */
HYCLIB.DataManager.dataBackfill({
    ...snippetParams,
    columns: ${JSON.stringify(columns)},
    pageId: '${pageId}',
    widgetId: '${widgetId}',
    tableCode: '${tableCode}',
    $A_R: window.$A_R
});`;
    insertValue(template, { tableCode, tableName });
  };

  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div>数据表：</div>
        <Input
          style={{ width: 300 }}
          placeholder="请选择数据表"
          value={tableName}
          defaultValue={tableName}
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

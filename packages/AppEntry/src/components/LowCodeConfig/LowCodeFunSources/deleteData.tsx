import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Input, Select, Table } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
}
const conditions = [
  { value: "equ", label: "等于" },
  { value: "notEqu", label: "不等于" },
  { value: "greater", label: "大于" },
  { value: "less", label: "小于" },
  { value: "greaterEqu", label: "大于等于" },
  { value: "lessEqu", label: "小于等于" },
  // {value: "between", label:"属于"},
  // {value: "notBetween", label:"不属于"},
  { value: "like", label: "模糊等于" },
  { value: "notLike", label: "模糊不等于" },
  { value: "in", label: "包含" },
  { value: "notIn", label: "不包含" },
  { value: "empty", label: "为空" },
  { value: "notEmpty", label: "不为空" },
  { value: "startWith", label: "开头是" },
  { value: "startNotWith", label: "开头不是" },
];
export const DeleteData: React.FC<IProps> = (props) => {
  const {
    insertValue,
    metaCtx,
    platformCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
  } = props;
  const [tableName, settableName] = useState<string>("");
  const [tableCode, settableCode] = useState<string>("");
  const createCode = () => {
    const { condition, field, value } = tableSource[0];
    const template = `
let condition = {"and":[]};
if(snippetParams.container.state.editId){
  condition = {
    "and":[{
      "equ": {
        "id": snippetParams.container.state.editId
      }
    }]
  }
}
if(${(condition && field && value) || false}){
  condition.and.push({
    "${condition}": {
      "${field}": snippetParams.container.state['${value}'].realVal
    }
  })
}
$A_R.post(HYCCONFIG.SAAS.IP+'/hy/saas/${$R_P.urlManager.currLessee}/${
      $R_P.urlManager.currApp
    }/business/__${pageId}__${widgetId}',
{ "businesscode": "__${pageId}__${widgetId}",
  "steps": [
    {
      "function": {
        "code": "TABLE_DELETE",
        "params": {
            "table": "${tableCode}",
            "condition": condition,
        }
      }
    }
  ]
}
).then((res) =>{
    console.log(res);
    ProviderRuntimeCore.antd.message.success('删除成功！');
  });`;

    insertValue(template);
  };

  const [columns, setcolumns] = useState<{ label: string; value: string }[]>();

  const getColumns = (selectedColumns: any) => {
    const result: { label: string; value: string }[] = [];
    Object.keys(selectedColumns).forEach((key) => {
      result.push({
        label: selectedColumns[key].name,
        value: selectedColumns[key].fieldCode,
      });
    });
    return result;
  };
  const [tableSource, settableSource] = useState<
    { field: string; condition: string; value: string; relation: string }[]
  >([{ field: "", condition: "", value: "", relation: "" }]);

  const pageStateObj = pageState?.pageState || {};
  const widgetsObj = {};
  Object.keys(pageStateObj)?.forEach((key) => {
    if (
      key.indexOf("OutState") !== -1 &&
      pageStateObj[key]?._info?.title &&
      pageStateObj[key]?._info?.widgetRef !== "FormButton"
    ) {
      widgetsObj[key] = pageStateObj[key];
    }
  });
  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div>
          <div>数据表：</div>
          <Input
            style={{ width: 200 }}
            placeholder="选择数据表"
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
                  setcolumns(getColumns(bindedDS.columns));
                  close();
                },
              });
            }}
          />
        </div>
      </div>
      <div style={{ margin: "10px 0" }}>
        <Table
          dataSource={tableSource}
          pagination={false}
          size={"small"}
          columns={[
            {
              dataIndex: "id",
              title: "字段名称",
              key: "field",
              width: 120,
              ellipsis: { showTitle: true },
              render: (_t, record, index) => {
                return (
                  <Select
                    style={{ width: "100%" }}
                    defaultValue={record.field}
                    onChange={(val: string) => {
                      const table = tableSource?.slice(0) || [];
                      table[index].field = val;
                      settableSource(table);
                    }}
                  >
                    {columns?.map((item) => (
                      <Option value={item.value} key={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                );
              },
            },
            {
              dataIndex: "id",
              title: "条件",
              key: "condition",
              width: 80,
              ellipsis: { showTitle: true },
              render: (_t, record, index) => {
                return (
                  <Select
                    style={{ width: "100%" }}
                    defaultValue={record.condition}
                    onChange={(val: string) => {
                      const table = tableSource?.slice(0) || [];
                      table[index].condition = val;
                      settableSource(table);
                    }}
                  >
                    {conditions.map((item) => (
                      <Option value={item.value} key={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                );
              },
            },
            {
              dataIndex: "id",
              title: "变量",
              key: "value",
              width: 120,
              ellipsis: { showTitle: true },
              render: (_t, record, index) => {
                return (
                  <Select
                    style={{ width: "100%" }}
                    defaultValue={record.value}
                    onChange={(val: string) => {
                      const table = tableSource?.slice(0) || [];
                      table[index].value = val;
                      settableSource(table);
                    }}
                  >
                    {Object.keys(widgetsObj)?.map((id) => (
                      <Option value={id} key={id}>
                        {widgetsObj[id]?._info?.title}
                      </Option>
                    ))}
                  </Select>
                );
              },
            },
            {
              dataIndex: "id",
              title: "关系",
              key: "relation",
              width: 80,
              ellipsis: { showTitle: true },
              render: (_t, record, index) => {
                return (
                  <Select
                    style={{ minWidth: 60 }}
                    defaultValue={record.relation}
                    onChange={(val: string) => {
                      const table = tableSource?.slice(0) || [];
                      table[index].relation = val;
                      settableSource(table);
                    }}
                  >
                    <Option value={"and"} key={"and"}>
                      并且
                    </Option>
                    <Option value={"or"} key={"or"}>
                      或者
                    </Option>
                  </Select>
                );
              },
            },
          ]}
        ></Table>
      </div>

      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

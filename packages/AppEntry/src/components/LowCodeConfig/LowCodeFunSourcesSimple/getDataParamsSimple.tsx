import { PlusCircleOutlined } from "@ant-design/icons";
import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Input, Select, Table } from "antd";
import React, { useState, useEffect } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string, params?: any) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
  params?: any;
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
  // {value: "empty", label:"为空"},
  // {value: "notEmpty", label:"不为空"},
  { value: "startWith", label: "开头是" },
  { value: "startNotWith", label: "开头不是" },
];
export const GetDataParamsSimple: React.FC<IProps> = (props) => {
  const {
    insertValue,
    metaCtx,
    platformCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
    params,
  } = props;
  const [tableName, settableName] = useState<string>(params?.tableName || "");
  const [tableCode, settableCode] = useState<string>(params?.tableCode || "");
  const [widget, setWidget] = useState<string>(params?.widget || "");

  const [columns, setcolumns] = useState<{ label: string; value: string }[]>(
    params?.columns || []
  );
  const [selectColumns, setselectColumns] = useState<string[]>(
    params?.selectColumns || []
  );

  const [tableSource, settableSource] = useState<
    { field: string; condition: string; value: string; relation: string }[]
  >(
    params?.tableSource || [
      { field: "", condition: "", value: "", relation: "" },
    ]
  );
  const createCode = () => {
    // const {condition, field, value} = tableSource[0];
    const fields: {
      field: string;
      alias?: string;
    }[] = [{ field: "id" }];
    const showFields: {
      title: string;
      dataIndex: string;
      key: string;
    }[] = [];
    selectColumns?.forEach((field) => {
      const { label, value } = JSON.parse(field);
      const item = {
        field: value,
      };
      fields.push(item);
      const showItem = {
        title: label,
        dataIndex: value,
        key: value,
      };
      showFields.push(showItem);
    });

    const template = `
/**
 * 表格数据查询
 */
HYCLIB.DataManager.getDataParams({
    ...snippetParams,
    tableSource: ${JSON.stringify(tableSource)},
    pageId: '${pageId}',
    widgetId: '${widgetId}',
    tableCode: '${tableCode}',
    fields: ${JSON.stringify(fields)},
    widget:'${widget}',
    showFields: ${JSON.stringify(showFields)},
    $A_R: window.$A_R
});`;

    insertValue(template, {
      tableSource,
      tableCode,
      tableName,
      widget,
      columns,
      selectColumns,
    });
  };

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

  // const [widgetsObj, setwidgetsObj] = useState<any>({});
  // const [widgetsObjForWidget, setwidgetsObjForWidget] = useState<any>({});
  // useEffect(() => {
  const widgetsObj = {};
  const widgetsObjForWidget = {};
  const pageStateObj = pageState?.pageState || {};
  Object.keys(pageStateObj)?.forEach((key) => {
    if (
      key.indexOf("OutState") !== -1 &&
      pageStateObj[key]?._info?.title &&
      pageStateObj[key]?._info?.widgetRef !== "FormButton"
    ) {
      widgetsObj[key] = pageStateObj[key];
    }
  });
  Object.keys(pageStateObj)?.forEach((key) => {
    if (
      key.indexOf("InState") !== -1 &&
      pageStateObj[key]?._info?.title &&
      pageStateObj[key]?._info?.widgetRef === "NormalTable"
    ) {
      widgetsObjForWidget[key] = pageStateObj[key];
    }
  });
  //   setwidgetsObj(widgetsObj);
  //   setwidgetsObjForWidget(widgetsObjForWidget);
  // }, [props.pageState]);
  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div style={{ display: "inline-block" }}>
          <div>数据表：</div>
          <Input
            style={{ width: 150 }}
            placeholder="选择数据表"
            defaultValue={tableName}
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
        <div style={{ display: "inline-block", marginLeft: "10px" }}>
          <div>显示字段：</div>
          <Select
            mode="multiple"
            allowClear
            style={{ width: 300 }}
            placeholder="选择显示字段"
            defaultValue={selectColumns}
            onChange={(val: string[]) => {
              setselectColumns(val);
            }}
          >
            {columns?.map((item) => (
              <Option value={JSON.stringify(item)} key={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: "inline-block", marginLeft: "10px" }}>
          <div>表格控件：</div>
          <Select
            placeholder="展示数据的表格"
            style={{ width: 150 }}
            defaultValue={widget}
            onChange={(val: string) => {
              setWidget(val);
            }}
          >
            {Object.keys(widgetsObjForWidget)?.map((tableId) => (
              <Option value={tableId} key={tableId}>
                {widgetsObjForWidget[tableId]?._info?.title}
              </Option>
            ))}
          </Select>
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
                  <div>
                    <Select
                      style={{ minWidth: 60, marginRight: "16px" }}
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
                      {/* <Option value={"or"} key={"or"}>或者</Option> */}
                    </Select>
                    <PlusCircleOutlined
                      onClick={() => {
                        const table = tableSource?.slice(0) || [];
                        table.push({
                          field: "",
                          condition: "",
                          value: "",
                          relation: "",
                        });
                        settableSource(table);
                      }}
                    />
                  </div>
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

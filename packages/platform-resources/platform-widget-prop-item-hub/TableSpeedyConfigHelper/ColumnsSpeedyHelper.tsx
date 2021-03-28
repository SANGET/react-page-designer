import React, { useState } from "react";
import { Table, Switch, Select, Button, InputNumber, Input } from "antd";
import { nanoid } from "nanoid";
import { AlertOutlined } from "@ant-design/icons";

export enum EDataType {
  NORMAL = "NORMAL",
  PK = "PK",
  QUOTE = "QUOTE",
  DICT = "DICT",
  FK = "FK",
  IMG = "IMG",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE"
}
export enum EFieldType {
  dsColumn = "dsColumn",
  customedColumn = "customedColumn"
}
type Align = "left" | "center" | "right";
const AlignMenu = [
  { label: "居左", key: "left", value: "left" },
  { label: "居中", key: "center", value: "center" },
  { label: "居右", key: "right", value: "right" }
];
type DS = {
  name: string;
  columns: { [key: string]: ColumnInDS };
};
type ColumnInDS = {
  id: string;
  name: string;
  dsID: string;
  fieldCode: string;
  species: string;
  colDataType:
    | EDataType.AUDIO
    | EDataType.DICT
    | EDataType.FILE
    | EDataType.FK
    | EDataType.IMG
    | EDataType.NORMAL
    | EDataType.PK
    | EDataType.QUOTE
    | EDataType.VIDEO;
};
type ColumnDSInModal = ColumnInDS & {
  fieldID: string;
  tableTitle: string;
  type: EFieldType.dsColumn;
};
type ColumnInModal = ColumnDSInModal | { type: EFieldType.customedColumn };
type BasicColumnFromTable = {
  title: string;
  id: string;
  dataIndex: string;
  show: boolean;
  width: string;
  align: Align;
  editable: boolean;
};
type ColumnFromDS = BasicColumnFromTable & {
  type: EFieldType.dsColumn;
  dsID: string;
  fieldID: string;
  fieldShowType: "realVal" | "showVal";
};
type ColumnCustomed = BasicColumnFromTable & {
  type: EFieldType.customedColumn;
};
type ColumnInTable = ColumnCustomed | ColumnFromDS;
type Props = {
  changeEntityState;
  dsList: DS[];
  fieldList: ColumnInTable[];
  typicalQueryList: string[];
  specialQueryList: string[];
  keywordQueryList: string[];
};
type State = {
  datasource: string[];
  hideSysColumn: boolean;
  fieldList: ColumnInTable[];
  typicalQueryList: string[];
  specialQueryList: string[];
  keywordQueryList: string[];
};

/**
 * 列宽
 */
/** 列宽单位列表 */
const WIDTH_MENU = [
  { key: "%", value: "%", label: "%" },
  { key: "px", value: "px", label: "px" }
];
type Width = { widthNum: number | undefined; unit: string };
type GetWidth = (param: { widthNum?: string | number | undefined; unit?: string }) => string;
const useWidth = (param = ""): [Width, GetWidth] => {
  const [width, setWidth] = useState<Width>({
    widthNum: param ? parseFloat(param) : undefined,
    unit: !param ? "px" : param?.replace(parseFloat(param).toString(), "")
  });
  const getWidth: GetWidth = ({ widthNum, unit }) => {
    if (!widthNum) {
      widthNum = width.widthNum;
    } else if (typeof widthNum === "string") {
      widthNum = parseFloat(widthNum);
      widthNum = widthNum || width.widthNum;
    }
    unit = unit || width.unit;
    setWidth({ widthNum, unit });
    return `${widthNum || ""}${unit || ""}`;
  };
  return [width, getWidth];
};
const ColumnWidthEditor = ({ value, onChange }) => {
  const [{ widthNum, unit }, getWidth] = useWidth(value);
  return (
    <>
      <div>
        <InputNumber
          className="align-bottom"
          onChange={(changeValue) => {
            onChange(getWidth({ widthNum: changeValue }));
          }}
          value={widthNum}
        />
        <Select
          onChange={(changeValue) => {
            onChange(getWidth({ unit: changeValue }));
          }}
          options={WIDTH_MENU}
          value={unit}
        />
      </div>
    </>
  );
};
export class ColumnsSpeedyHelper extends React.Component<Props> {
  state: State = {
    datasource: [],
    hideSysColumn: true,
    typicalQueryList: [],
    specialQueryList: [],
    keywordQueryList: [],
    fieldList: []
  };

  /** 找到 fields 上对应的字段配置 */
  getRecordInFields = (column) => {
    const { fieldList } = this.state;
    return fieldList.find((item) => column.id === item.id);
  };

  /** 将表格上的 column列表 转为 column集合 */
  initFields = (fieldList) => {
    const fields = {};
    fieldList?.forEach((field) => {
      fields[field.id] = field;
    });
    return fields;
  };

  /** 找到表格字段配置上对应的索引 */
  findIndexInFieldList = (record) => {
    const { fieldList } = this.state;
    const index = fieldList.findIndex((field) => record.id === field.id);
    return index > -1 ? index : fieldList.length;
  };

  componentDidMount() {
    this.constructDsList();
    const { typicalQueryList, specialQueryList, keywordQueryList, fieldList } = this.props;
    this.setState({
      typicalQueryList,
      specialQueryList,
      keywordQueryList,
      fieldList
    });
  }

  /** 转化表格上的字段配置 */
  constructFields = (
    fieldList: ColumnInTable[]
  ): {
    fieldsFromDs: { [key: string]: ColumnFromDS };
    fieldListNotFromDs: ColumnCustomed[];
  } => {
    const fieldsFromDs = {};
    const fieldListNotFromDs: ColumnCustomed[] = [];
    fieldList?.forEach((field) => {
      if (field.type === EFieldType.dsColumn) {
        fieldsFromDs[`${field.dsID}.${field.fieldID}`] = field;
        return;
      }
      fieldListNotFromDs.push(field);
    });
    return { fieldsFromDs, fieldListNotFromDs };
  };

  /** 获取字段 id */
  getNewId = (type) => {
    return `field.${type}.${nanoid(8)}`;
  };

  /** 字段初始化 */
  initDSField = (column: ColumnDSInModal): ColumnInTable => {
    const { colDataType, id, fieldID, dsID, name } = column;
    return {
      title: name,
      id,
      dataIndex: id,
      width: "150px",
      show: false,
      fieldID,
      dsID,
      type: EFieldType.dsColumn,
      fieldShowType: this.getFieldShowType(colDataType),
      align: "left",
      editable: false
    };
  };

  /** 判断是否是引用字段（引用，外键，字典） */
  isReferenceField = (dataType) => {
    return [EDataType.DICT, EDataType.FK, EDataType.QUOTE].includes(dataType);
  };

  /** 获取字段的显示数据类型 */
  getFieldShowType = (colDataType) => {
    return this.isReferenceField(colDataType) ? "realVal" : "showVal";
  };

  /** 对表字段数据进行转化，只要支持非需更新数据展示即可 */
  constructDsList = () => {
    const { dsList, fieldList } = this.props;
    const { fieldsFromDs, fieldListNotFromDs } = this.constructFields(fieldList);
    const fieldListFormDs = dsList.reduce((list: ColumnDSInModal[], ds) => {
      const { name: tableTitle, columns } = ds;
      Object.values(columns || {}).forEach((column) => {
        const { id: fieldID, dsID, ...oldColumn } = column;
        let { id } = fieldsFromDs[`${dsID}.${fieldID}`] || {};
        if (!id) {
          id = this.getNewId(EFieldType.dsColumn);
        }
        list.push({
          ...oldColumn,
          fieldID,
          id,
          dsID,
          tableTitle,
          type: EFieldType.dsColumn
        });
        return list;
      });
      return list;
    }, []);
    this.setState({
      datasource: [...fieldListNotFromDs, ...fieldListFormDs]
    });
  };

  /** 隐藏/显示系统字段 */
  handleHideSysColumn = () => {
    this.setState({
      hideSysColumn: !this.state.hideSysColumn
    });
  };

  /** 过滤表字段的显示（不显示系统字段） */
  filterDatasource = (dataSource) => {
    const { hideSysColumn } = this.state;
    return dataSource.filter((item) => {
      return item.type !== EFieldType.dsColumn || !hideSysColumn || !item.species.includes("SYS");
    });
  };

  /** 用户更改字段配置 */
  handleChangeField = ({ attr, value, record }) => {
    const index = this.findIndexInFieldList(record);
    /** 找到这个字段配置 */
    let prevRecord = this.getRecordInFields(record);
    /** 如果原有没有这个字段配置，则需要初始化这个字段配置，一般出现在数据源字段 */
    if (!prevRecord && record.type === EFieldType.dsColumn) {
      prevRecord = this.initDSField(record);
    }
    if (!prevRecord) return;
    /** 变更后的字段配置数据 */
    const nextRecord: ColumnInTable = {
      ...prevRecord,
      [attr]: value
    };
    /** 通知引擎更改字段配置数据 */
    const { fieldList } = this.state;
    const nextFieldList = fieldList.slice();
    nextFieldList.splice(index, 1, nextRecord);
    this.props.changeEntityState({
      attr: "columns",
      value: nextFieldList
    });
    /** TODO:由于 changeEntityState 的更改是异步的，目前暂时在 state 上维护 fields 数据 */
    this.setState({
      fieldList: nextFieldList
    });
  };

  handleChangeQueryType = ({ attr, value, id }) => {
    const queryTypeListAttr = `${attr}List`;
    const prevQueryList: string[] = this.state?.[queryTypeListAttr].slice() || [];
    let nextQueryList: string[] = [];
    if (value) {
      nextQueryList = [...prevQueryList, id];
    } else {
      nextQueryList = prevQueryList.filter((item) => item !== id);
    }
    this.props.changeEntityState({
      attr: queryTypeListAttr,
      value: nextQueryList
    });
    this.setState({
      [queryTypeListAttr]: nextQueryList
    });
  };

  render() {
    const {
      datasource,
      hideSysColumn,
      fieldList,
      typicalQueryList,
      specialQueryList,
      keywordQueryList
    } = this.state;
    const fields = this.initFields(fieldList);
    console.log(datasource);
    console.log(fields);
    return (
      <>
        <div className="tool-bar my-1">
          <Button type="primary" className="mr-2" size="small">
            添加自定义列（暂未实现）
          </Button>
          <Button type="primary" className="mr-2" size="small">
            添加外键列（暂未实现）
          </Button>
          <Button type="primary" className="mr-2" size="small">
            删除（暂未实现）
          </Button>
          <Button type="primary" className="mr-2" size="small" onClick={this.handleHideSysColumn}>
            {hideSysColumn ? "显示" : "隐藏"}系统字段
          </Button>
        </div>
        <Table
          size="small"
          rowKey="id"
          dataSource={this.filterDatasource(datasource)}
          columns={[
            {
              dataIndex: "id",
              title: "字段名称",
              key: "title",
              width: 80,
              ellipsis: { showTitle: true },
              render: (_t, record) => {
                return (
                  <Input
                    value={fields[_t]?.title || record.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && !/^[a-zA-Z0-9_()\u4e00-\u9fa5]{1,32}$/.test(value)) return;
                      this.handleChangeField({
                        attr: "title",
                        value,
                        record
                      });
                    }}
                  />
                );
              }
            },
            {
              dataIndex: "fieldCode",
              title: "字段编码",
              key: "fieldCode",
              width: 80,
              ellipsis: { showTitle: true }
            },
            {
              dataIndex: "id",
              key: "show",
              title: "显示",
              width: 40,
              render: (_t, record) => {
                return (
                  <Switch
                    size="small"
                    checked={fields[_t]?.show || false}
                    onChange={(checked) => {
                      this.handleChangeField({
                        attr: "show",
                        value: !!checked,
                        record
                      });
                    }}
                  />
                );
              }
            },
            {
              dataIndex: "id",
              key: "width",
              title: "列宽(px|%)",
              width: 80,
              align: "center",
              ellipsis: { showTitle: true },
              render: (_t, record) => {
                return (
                  // <Input
                  //   style={{ width: "100%" }}
                  //   value={fields[_t]?.width || "150px"}
                  //   onChange={(value) => {
                  //     if (!/^[1-9]\d*(\.\d{1-2})?(px|%)$/.test(value)) return;
                  //     this.handleChangeField({ attr: "width", value, record });
                  //   }}
                  // />
                  <ColumnWidthEditor
                    value={fields[_t]?.width || "150px"}
                    onChange={(value) => {
                      this.handleChangeField({ attr: "width", value, record });
                    }}
                  />
                );
              }
            },
            {
              dataIndex: "id",
              key: "editable",
              title: "编辑",
              width: 40,
              render: (_t, record) => {
                return (
                  <Switch
                    size="small"
                    checked={fields[_t]?.editable || false}
                    onChange={(checked) => {
                      this.handleChangeField({
                        attr: "editable",
                        value: !!checked,
                        record
                      });
                    }}
                  />
                );
              }
            },
            {
              dataIndex: "typicalQuery",
              key: "typicalQuery",
              title: "普通查询",
              align: "center",
              width: 60,
              render: (_t, { id, type }) => {
                return type === EFieldType.dsColumn ? (
                  <Switch
                    size="small"
                    checked={typicalQueryList.includes(`${id}`) || false}
                    onChange={(checked) => {
                      this.handleChangeQueryType({
                        attr: "typicalQuery",
                        value: !!checked,
                        id: `${id}`
                      });
                    }}
                  />
                ) : null;
              }
            },
            {
              dataIndex: "specialQuery",
              key: "specialQuery",
              title: "高级查询",
              align: "center",
              width: 60,
              render: (_t, { type, id }) => {
                return type === EFieldType.dsColumn ? (
                  <Switch
                    size="small"
                    checked={specialQueryList.includes(`${id}`) || false}
                    onChange={(checked) => {
                      this.handleChangeQueryType({
                        attr: "specialQuery",
                        value: !!checked,
                        id: `${id}`
                      });
                    }}
                  />
                ) : null;
              }
            },
            {
              dataIndex: "keywordQuery",
              key: "keywordQuery",
              title: "关键字查询",
              align: "center",
              width: 70,
              render: (_t, { id, type }) => {
                return type === EFieldType.dsColumn ? (
                  <Switch
                    size="small"
                    checked={keywordQueryList.includes(`${id}`) || false}
                    onChange={(checked) => {
                      this.handleChangeQueryType({
                        attr: "keywordQuery",
                        value: !!checked,
                        id: `${id}`
                      });
                    }}
                  />
                ) : null;
              }
            },
            {
              dataIndex: "id",
              key: "align",
              title: "对齐方式",
              width: 65,
              ellipsis: { showTitle: true },
              render: (_t, record) => {
                return (
                  <Select
                    size="small"
                    className="w-full"
                    options={AlignMenu}
                    value={fields[_t]?.align || "left"}
                    onChange={(value) => {
                      this.handleChangeField({ attr: "align", value, record });
                    }}
                  />
                );
              }
            },
            {
              dataIndex: "tableTitle",
              key: "tableTitle",
              align: "center",
              title: "列数据源",
              width: 80
            },
            {
              dataIndex: "event",
              key: "event",
              width: 30,
              render: () => {
                return <AlertOutlined />;
              }
            }
          ]}
          pagination={false}
          scroll={{ y: 390 }}
        />
      </>
    );
  }
}

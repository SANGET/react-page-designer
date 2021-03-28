import React, { useEffect } from "react";
import {
  Form,
  Input,
  TreeSelect,
  InputNumber,
  Divider,
  Select,
  Button,
  Space,
} from "antd";

export const SHOW_TYPE_OPTIONS = [
  {
    key: 1,
    value: 1,
    label: "表格",
  },
  {
    key: 2,
    value: 2,
    label: "树形（应用端暂不支持）",
  },
  {
    key: 3,
    value: 3,
    label: "左树右表（应用端暂不支持）",
  },
  {
    key: 4,
    value: 4,
    label: "自定义（暂不支持）",
  },
];
export const SELECT_TYPE_OPTIONS = [
  {
    key: 1,
    value: 1,
    label: "单选",
  },
  {
    key: 2,
    value: 2,
    label: "多选",
  },
];
/**
 * 基础弹窗配置
 */
export const BasicForm = () => {
  return (
    <>
      <Form.Item
        className="w-1/2 float-left px-6"
        name="title"
        label="弹窗标题"
        rules={[
          { required: true, message: "弹窗标题必填" },
          {
            pattern: /^[\u4e00-\u9fa5a-zA-Z]{1,32}$/,
            message: "支持32字符内的中英文",
          },
        ]}
      >
        <Input placeholder="请输入弹窗标题" />
      </Form.Item>
      <Form.Item
        className="w-1/2 float-left px-6"
        name="showType"
        label="展示类型"
        rules={[{ required: true, message: "展示类型必填" }]}
      >
        <Select placeholder="请输入展示类型" options={SHOW_TYPE_OPTIONS} />
      </Form.Item>
      <Form.Item
        className="w-1/2 float-left px-6"
        name="selectType"
        label="选择方式"
        rules={[{ required: true, message: "选择方式必填" }]}
      >
        <Select placeholder="请输入选择方式" options={SELECT_TYPE_OPTIONS} />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.selectType !== currentValues.selectType
        }
      >
        {({ getFieldValue }) => {
          return getFieldValue("selectType") === 2 ? (
            <Form.Item
              className="w-1/2 float-left px-6"
              name="selectCount"
              label="最多选择个数"
              rules={[
                { required: true, message: "最多选择个数必填" },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "支持整数",
                },
              ]}
            >
              <InputNumber placeholder="请输入最多选择个数" />
            </Form.Item>
          ) : null;
        }}
      </Form.Item>
    </>
  );
};
/**
 * 数据源
 * @param param0
 */
/**
 * 数据源选择弹窗，支持带回附属表，返回可能为多个数据表
 * @param param0
 */
export const BasicDsHelper = ({ platformCtx, code, label, onChange }) => {
  const getInterDatasources = (getFieldValue) => {
    const dsInfo = getFieldValue(`${code}Info`);
    return dsInfo || [];
  };
  return (
    <Form.Item noStyle shouldUpdate>
      {({ getFieldValue, getFieldsValue, setFieldsValue }) => {
        return (
          <Form.Item
            className="w-1/2 float-left px-6"
            name={`${code}Title`}
            label={label}
            rules={[{ required: true, message: "数据源必填" }]}
          >
            <Input
              placeholder="请选择数据源"
              readOnly
              onClick={() => {
                const closeModal = platformCtx.selector.openDatasourceSelector({
                  defaultSelected: getInterDatasources(getFieldValue),
                  modalType: "normal",
                  typeArea: ["TABLE"],
                  position: "top",
                  single: true,
                  onSubmit: ({ interDatasources }) => {
                    onChange(interDatasources, {
                      setFieldsValue,
                      getFieldsValue,
                    });
                    closeModal();
                  },
                });
              }}
            />
          </Form.Item>
        );
      }}
    </Form.Item>
  );
};
/**
 * 对数据源中的字段，进行过滤
 * @param param0
 */

const getFieldOptions = (interDatasource) => {
  let result =
    (Array.isArray(interDatasource) &&
      interDatasource.map((ds) => ({
        title: ds.name,
        value: ds.id,
        disabled: true,
        children: Object.values(ds.columns || {}).map((column) => ({
          title: column.name,
          value: `${ds.id}.${column.id}`,
        })),
      }))) ||
    [];
  /** 如果只有一个表，就不用专门分两层数据展示了 */
  if (interDatasource?.length === 1) {
    result = result[0].children;
  }
  return result;
};
export const TableOrTreeDsHelper = ({ platformCtx }) => {
  return (
    <BasicDsHelper
      platformCtx={platformCtx}
      code="ds"
      label="数据源"
      onChange={(interDataSource, { setFieldsValue, getFieldsValue }) => {
        const { ds: oldDs } = getFieldsValue(["ds"]);
        const { id: ds, name: dsTitle } = interDataSource[0] || {};
        setFieldsValue({
          dsInfo: interDataSource,
          dsTitle,
          ds,
          fieldOptions: getFieldOptions(interDataSource),
        });
        if (oldDs !== ds) {
          setFieldsValue({
            returnValue: undefined,
            // returnText: [],
            showColumn: undefined,
            tagField: undefined,
            sortColumnInfo: undefined,
            superiorColumn: undefined,
            relatedSuperiorColumn: undefined,
          });
        }
      }}
    />
  );
};

export const TreeDsHelper = ({ platformCtx }) => {
  return (
    <BasicDsHelper
      platformCtx={platformCtx}
      code="treeDs"
      label="数据源"
      onChange={(interDataSource, { setFieldsValue, getFieldValue }) => {
        const oldDs = getFieldValue("treeDs");
        const { id: treeDs, name: treeDsTitle } = interDataSource[0] || {};
        setFieldsValue({
          treeDsInfo: interDataSource,
          treeDsTitle,
          treeDs,
          treeFieldOptions: getFieldOptions(interDataSource),
        });
        if (oldDs !== treeDs) {
          setFieldsValue({
            treeShowColumn: undefined,
            treeSortColumnInfo: undefined,
            treeSuperiorColumn: undefined,
            treeRelatedSuperiorColumn: undefined,
            treeReturnValue: undefined,
          });
        }
      }}
    />
  );
};

export const TableDsHelper = ({ platformCtx }) => {
  return (
    <BasicDsHelper
      platformCtx={platformCtx}
      code="tableDsTitle"
      label="数据源"
      onChange={(interDataSource, { setFieldsValue, getFieldValue }) => {
        const oldDs = getFieldValue("tableDs");
        const { id: tableDs, name: tableDsTitle } = interDataSource[0] || {};
        setFieldsValue({
          tableDsInfo: interDataSource,
          tableDsTitle,
          tableDs,
          tableFieldOptions: getFieldOptions(interDataSource),
        });
        if (oldDs !== tableDs) {
          setFieldsValue({
            tableShowColumn: undefined,
            treeSortColumnInfo: undefined,
            // tableReturnText: undefined,
            tableReturnValue: undefined,
            tableTreeRelatedColumn: undefined,
          });
        }
      }}
    />
  );
};
/**
 * 字段选择，树形下拉
 */
type PropsFieldHelper = {
  name: string;
  label: string;
  multiple?: boolean;
  onChange?: (
    param1: { value; label },
    param2: { getFieldValue; setFieldsValue }
  ) => void;
  fieldOptions;
};
export class BasicFieldHelper extends React.Component {
  render() {
    const { name, label, multiple, fieldOptions, onChange } = this.props;
    return (
      <Form.Item
        className="w-1/2 float-left px-6"
        name={name}
        label={label}
        rules={[{ required: true, message: `${label}必填` }]}
      >
        <TreeSelect
          allowClear
          maxLength={1}
          filterTreeNode={(value, treeNode) => {
            return (treeNode?.title || "").toString().includes(value) || false;
          }}
          multiple={multiple || false}
          treeData={fieldOptions || []}
          onChange={(value, labelChange) => {
            if (typeof onChange === "function") {
              onChange({ value, label: labelChange });
            }
          }}
        />
      </Form.Item>
    );
  }
}
export const FieldHelper = ({
  name,
  label,
  multiple,
  onChange,
  fieldOptions,
}: PropsFieldHelper) => {
  return (
    <Form.Item
      className="w-1/2 float-left px-6"
      name={name}
      label={label}
      rules={[{ required: true, message: `${label}必填` }]}
    >
      <TreeSelect
        allowClear
        maxLength={1}
        filterTreeNode={(value, treeNode) => {
          return (treeNode?.title || "").toString().includes(value) || false;
        }}
        multiple={multiple || false}
        treeData={fieldOptions || []}
      />
    </Form.Item>
  );
};
/**
 * 排序字段
 */
export const SortField = (props) => {
  return (
    <Form.Item className="w-1/2 float-left px-6" name="title" label="排序字段">
      <Input placeholder="暂不支持" />
    </Form.Item>
  );
};
/**
 * 返回文本
 * 有特殊操作，标记字段默认为第一个返回文本字段，方便用户配置
 * @param props
 */
export const ReturnText = (props) => {
  return (
    <FieldHelper
      label="返回文本"
      name="returnText"
      multiple
      fieldOptionsCode="fieldOptions"
      onChange={({ value }, { getFieldValue, setFieldsValue }) => {
        // 标记字段默认是返回文本的第一个元素
        if (!getFieldValue("tagField") && Array.isArray(value) && value[0]) {
          setFieldsValue({ tagField: value[0] });
        }
      }}
    />
  );
};
/**
 * 展示类型为表格时的对应字段配置
 * @param props
 */
export const TableForm = (props) => {
  return (
    <>
      <TableOrTreeDsHelper {...props} />
      <Form.Item name="ds" className="hidden">
        <Input />
      </Form.Item>
      <Form.Item name="dsInfo" className="hidden">
        <Input />
      </Form.Item>
      <SortField />
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          return prev.fieldOptions !== next.fieldOptions;
        }}
      >
        {({ getFieldValue }) => {
          const fieldOptions = getFieldValue("fieldOptions");
          return (
            <>
              <FieldHelper
                name="returnValue"
                label="返回值"
                multiple
                fieldOptions={fieldOptions || []}
              />
              <FieldHelper
                name="tagField"
                label="底部栏标记字段"
                fieldOptions={fieldOptions || []}
              />
              <FieldHelper
                name="showColumn"
                label="显示字段"
                multiple
                fieldOptions={fieldOptions || []}
              />
            </>
          );
        }}
      </Form.Item>
    </>
  );
};
export const ShowSearch = (props) => {
  return (
    <>
      <Form.Item
        name="showSearch"
        label="是否显示搜索栏"
        initialValue={1}
        className="w-1/2 float-left px-6"
      >
        <Select>
          <Select.Option value={1}>是</Select.Option>
          <Select.Option value={0}>否</Select.Option>
        </Select>
      </Form.Item>
    </>
  );
};
export const TreeForm = (props) => {
  return (
    <>
      <TableOrTreeDsHelper {...props} />
      <Form.Item name="ds" className="hidden">
        <Input />
      </Form.Item>
      <Form.Item name="dsInfo" className="hidden">
        <Input />
      </Form.Item>
      <SortField />
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          return prev.fieldOptions !== next.fieldOptions;
        }}
      >
        {({ getFieldValue }) => {
          const fieldOptions = getFieldValue("fieldOptions");
          return (
            <>
              <FieldHelper
                name="returnValue"
                label="返回值"
                multiple
                fieldOptions={fieldOptions || []}
              />
              <FieldHelper
                name="tagField"
                label="底部栏标记字段"
                fieldOptions={fieldOptions || []}
              />
              <FieldHelper
                name="showColumn"
                label="显示字段"
                fieldOptions={fieldOptions || []}
              />
              <FieldHelper
                name="superiorColumn"
                label="上级字段"
                fieldOptions={fieldOptions || []}
              />
              <FieldHelper
                name="relatedSuperiorColumn"
                label="关联上级字段"
                fieldOptions={fieldOptions || []}
              />
            </>
          );
        }}
      </Form.Item>

      <ShowSearch />
    </>
  );
};
export const TreeTableForm = (props) => {
  return (
    <>
      <TreeDsHelper {...props} />
      <Form.Item name="treeDs" className="hidden">
        <Input />
      </Form.Item>
      <Form.Item name="treeDsInfo" className="hidden">
        <Input />
      </Form.Item>
      <SortField />
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          return prev.treeFieldOptions !== next.treeFieldOptions;
        }}
      >
        {({ getFieldValue }) => {
          const fieldOptions = getFieldValue("treeFieldOptions");
          return (
            <>
              <FieldHelper
                name="treeSuperiorColumn"
                label="上级字段"
                fieldOptions={fieldOptions}
              />
              <FieldHelper
                name="treeRelatedSuperiorColumn"
                label="关联上级字段"
                fieldOptions={fieldOptions}
              />
              {/* <FieldHelper
                    name="treeReturnValue"
                    label="标识字段"
                    fieldOptions={fieldOptions}
                  /> */}
              <FieldHelper
                name="treeShowColumn"
                label="显示字段"
                fieldOptions={fieldOptions}
              />
            </>
          );
        }}
      </Form.Item>

      <ShowSearch />
      <Divider />
      <TableDsHelper {...props} />
      <Form.Item name="tableDs" className="hidden">
        <Input />
      </Form.Item>
      <Form.Item name="tableDsInfo" className="hidden">
        <Input />
      </Form.Item>
      <SortField />
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          return prev.treeFieldOptions !== next.treeFieldOptions;
        }}
      >
        {({ getFieldValue }) => {
          const fieldOptions = getFieldValue("tableFieldOptions");
          return (
            <>
              <FieldHelper
                name="tableReturnValue"
                label="返回值"
                multiple
                fieldOptions={fieldOptions}
              />
              {/* <FieldHelper
                    name="tableReturnText"
                    label="返回文本"
                    multiple
                fieldOptions={fieldOptions}
                  /> */}
              <FieldHelper
                name="tableShowColumn"
                label="显示字段"
                fieldOptions={fieldOptions}
              />
            </>
          );
        }}
      </Form.Item>

      <Form.Item name="tableTreeRelatedColumn" label="与树形关联的字段">
        <Input />
      </Form.Item>
    </>
  );
};
export const ModalConfigEditor = ({
  platformCtx,
  config: data,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    console.log(data);
    form.setFieldsValue(
      data || {
        showType: 1,
        selectType: 1,
        selectCount: 10,
        fieldOptions: [],
      }
    );
    form.setFieldsValue({
      fieldOptions: getFieldOptions(data?.dsInfo),
      treeFieldOptions: getFieldOptions(data?.treeDsInfo),
      tableFieldOptions: getFieldOptions(data?.tableDsInfo),
    });
  }, []);
  const getConfigArea = (showType) => {
    return (
      {
        1: TableForm,
        2: TreeForm,
        3: TreeTableForm,
      }[showType] || null
    );
  };
  const getArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value) return [value];
    return [];
  };
  const getSingleValue = (value) => {
    if (Array.isArray(value)) {
      return value[0];
    }
    if (value) return value;
    return undefined;
  };
  /**
   * 拼接表格数据
   */
  const getTableSubmitData = (submitData) => {
    // TODO 排序字段的过滤
    const {
      ds,
      dsTitle,
      dsInfo,
      returnValue,
      // returnText,
      tagField,
      showColumn,
    } = submitData;
    return {
      ds,
      dsTitle,
      dsInfo,
      returnValue: getArray(returnValue),
      // returnText: getArray(returnText),
      showColumn: getArray(showColumn),
      tagField: getSingleValue(tagField),
    };
  };
  /**
   * 拼接树形数据
   */
  const getTreeSubmitData = (submitData) => {
    const commonTableData = getTableSubmitData(submitData);
    const {
      superiorColumn,
      relatedSuperiorColumn,
      showSearch,
      showColumn,
    } = submitData;
    return Object.assign(commonTableData, {
      showColumn: getSingleValue(showColumn),
      superiorColumn: getSingleValue(superiorColumn),
      relatedSuperiorColumn: getSingleValue(relatedSuperiorColumn),
      showSearch: showSearch - 0,
    });
  };
  const getTreeTableData = (submitData) => {
    // TODO 排序字段
    const {
      treeDs,
      treeDsTitle,
      treeDsInfo,
      treeSuperiorColumn,
      treeRelatedSuperiorColumn,
      treeReturnValue,
      treeShowColumn,
      showSearch,
      tableDs,
      tableDsInfo,
      tableDsTitle,
      tableReturnValue,
      tableReturnText,
      tableTreeRelatedColumn,
      tableShowColumn,
    } = submitData;
    return {
      treeDs,
      treeDsTitle,
      treeDsInfo,
      tableDs,
      tableDsTitle,
      tableDsInfo,
      treeSuperiorColumn: getSingleValue(treeSuperiorColumn),
      treeRelatedSuperiorColumn: getSingleValue(treeRelatedSuperiorColumn),
      treeReturnValue: getSingleValue(treeReturnValue),
      treeShowColumn: getSingleValue(treeShowColumn),
      showSearch: showSearch - 0,
      tableReturnValue: getArray(tableReturnValue),
      // tableReturnText: getArray(tableReturnText),
      tableTreeRelatedColumn,
      tableShowColumn: getArray(tableShowColumn),
    };
  };
  const handleFinish = (submitData) => {
    const { title, showType, selectType, selectCount } = submitData;
    const getDataFn = () => {
      return {
        1: getTableSubmitData,
        2: getTreeSubmitData,
        3: getTreeTableData,
      }[showType](submitData);
    };
    onSuccess(
      Object.assign(
        { title, showType, selectType, selectCount, dsType: "TABLE" },
        getDataFn()
      )
    );
  };
  /** 清空 */
  const handleReset = () => {
    form.setFieldsValue({
      showType: 1,
      selectType: 1,
      selectCount: 10,
      fieldOptions: [],
    });
  };
  return (
    <Form form={form} id="chooseData" onFinish={handleFinish}>
      <BasicForm />
      <Divider />
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => prev.showType !== next.showType}
      >
        {({ getFieldValue }) => {
          const showType = getFieldValue("showType");
          const Area = getConfigArea(showType);
          return (Area && <Area platformCtx={platformCtx} />) || null;
        }}
      </Form.Item>
      <Form.Item className="float-right w-full">
        <Space className="float-right">
          <Button htmlType="button" onClick={handleReset}>
            清空
          </Button>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
          <Button htmlType="button" onClick={onCancel}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

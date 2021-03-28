import React, { useState } from "react";
import { Table, Button, Form as AntdForm, Modal } from "antd";
import { nanoid } from "nanoid";
import { Formik, FieldArray } from "formik";
import { Form, Input, Select } from "formik-antd";
import * as Yup from "yup";
import { CloseModal, ShowModal } from "@deer-ui/core";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { ActionTemplateComponentProps } from "./interface";

type AnyType =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | undefined;

type GetMessage = (
  object: AnyType,
  path: string | string[],
  deafultValue?: AnyType
) => AnyType;

type PErorMessage = {
  errors: AnyType;
  name: string | string[];
  component: React.ComponentType;
};

type PMultiInput = {
  defaultValues: { code: string }[];
  errors: AnyType;
};

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

type OutputDataStructure = {
  id?: string;
  apiConfig: {
    name: string;
    id: string;
  };
  widgetID: string;
  fields: { code: string }[];
  // range;
};

/**
 * 错误提示组件
 * @param props
 */
const ErrorMessage = (props: PErorMessage) => {
  const { errors, name, component: Component } = props;
  const getMessage: GetMessage = (object, path, defaultValue) => {
    const data = (!Array.isArray(path)
      ? path.replace(/\[/g, ".").replace(/\]/g, "").split(".")
      : path
    ).reduce((o, k) => (o || {})[k], object);
    if (data !== undefined || defaultValue === undefined) {
      return data;
    }
    return defaultValue;
  };
  const message = getMessage(errors, name, "");
  return message ? <Component>{message}</Component> : null;
};
/**
 * API 对应请求字段列表
 * @param props
 */
const MultiInput: React.FC<PMultiInput> = (props) => {
  const { defaultValues, errors } = props;
  return (
    <FieldArray name="fields">
      {({ push, remove }) => (
        <div className="clearfix">
          {defaultValues?.map((item, i) => (
            <div key={`${item}_${i}`} className="float-left">
              <Input
                className="mb-2"
                style={{
                  width: 120,
                  marginRight: "0.5rem",
                  marginBottom: "0.5rem",
                }}
                name={`fields[${i}].code`}
                suffix={
                  defaultValues.length > 1 ? (
                    <span className="ant-btn-link" onClick={() => remove(i)}>
                      删除
                    </span>
                  ) : null
                }
              />
              <ErrorMessage
                errors={errors}
                name={`fields[${i}].code`}
                component={ErrorTip}
              />
            </div>
          ))}
          <Button
            type="link"
            onClick={() => push("")}
            style={{ marginLeft: "-0.5rem" }}
          >
            新增
          </Button>
        </div>
      )}
    </FieldArray>
  );
};
/**
 * 弹窗之（编辑/新增）查询列表项
 * @param props
 */
export const RequestList: React.FC<
  ActionTemplateComponentProps<OutputDataStructure>
> = (props) => {
  const { platformCtx, pageMetadata, initValues, onSubmit } = props;
  // 获取 apis 选择列表
  const getApiOptions = () => {
    const { apisConfig } = pageMetadata;
    const options = Object.keys(apisConfig).map((key) => ({
      value: key,
      label: apisConfig[key].name,
      key,
    }));
    return options;
  };
  /** 获取列表型组件 */
  const getListWidget = () => {
    const flatLayoutItems = platformCtx.meta.getPageContent().content as {
      widgetRef: string;
      id: string;
      body;
      propState: Record<string, unknown>;
    }[];
    const getMap = (
      list: {
        widgetRef: string;
        id: string;
        body;
        propState: Record<string, unknown>;
      }[]
    ) => {
      const map: Record<
        string,
        { widgetRef: string; id: string; propState: Record<string, unknown> }
      > = {};
      list?.forEach((item) => {
        const { id } = item;
        Object.assign(map, { [id]: item });
        Object.assign(map, getMap(item.body));
      });
      return map;
    };
    const flatLayoutItemsMap = getMap(flatLayoutItems);

    const widgetIdList = Object.values(flatLayoutItemsMap)
      ?.filter(({ widgetRef }) => ["NormalTable"].includes(widgetRef))
      .map(({ id, propState }) => ({
        key: id,
        value: id,
        label: propState?.title || "",
      }));
    return widgetIdList;
  };
  /** 获取数据检验表达式 */
  const getFormSchema = () => {
    return Yup.object().shape({
      apiConfigID: Yup.string().required("必填"),
      // widget: Yup.array().of(Yup.string().required("必填")).min(1, "必填"),
      widgetID: Yup.string().required("必填"),
      fields: Yup.array().of(
        Yup.object().shape({
          code: Yup.string(),
        })
      ),
      // range: Yup.array(),
    });
  };
  /** 下拉框的数据检索 */
  const filterOption = (value, option) => {
    if (!value) return true;
    return option?.label?.toLowerCase()?.includes(value.toLowerCase());
  };
  /** 获取表单初始值 */
  const getInitialValues = () => {
    return {
      apiConfigID: initValues?.apiConfig?.id || "",
      widgetID: initValues?.widgetID || "",
      fields: initValues?.fields || [{ code: "" }],
    };
  };
  /** 拼接 columns 元数据 */
  const apiOptions = getApiOptions();
  /** 获取 列表型 组件 */
  const listWidgetOptions = getListWidget();
  /** 获取表单初始值 */
  const initialValues = getInitialValues();
  /** 获取数据检验表达式 */
  const formSchema = getFormSchema();
  /** 提交 */
  const handleSubmit = (
    values: {
      apiConfigID: string;
      widgetID: string;
      fields: { code: string }[];
    },
    { setSubmitting }
  ) => {
    const submitValues = {
      apiConfig: pageMetadata.apisConfig[values.apiConfigID],
      widgetID: values.widgetID,
      fields: values.fields,
    };
    onSubmit?.(submitValues);
    setSubmitting(false);
  };
  return (
    <div className="request-item">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={formSchema}
      >
        {({ errors, isSubmitting, setFieldValue, values }) => {
          const hasError = Object.keys(errors).length > 0;
          return (
            <Form
              {...layout}
              name="createApp"
              className="ant-form ant-form-horizontal ant-form-default"
            >
              <AntdForm.Item label="请求 API" required>
                <Select
                  allowClear
                  showSearch
                  filterOption={filterOption}
                  style={{ width: `100wh` }}
                  name="apiConfigID"
                  onChange={(key) => {
                    setFieldValue("apiConfigID", key);
                  }}
                  options={apiOptions}
                />
                <ErrorMessage
                  name={`apiConfigID`}
                  component={ErrorTip}
                  errors={errors}
                />
              </AntdForm.Item>
              <AntdForm.Item label="列表展示型组件" required>
                <Select
                  showSearch
                  allowClear
                  filterOption={filterOption}
                  style={{ width: "100%" }}
                  name="widgetID"
                  options={listWidgetOptions}
                  onChange={(_v) => {
                    setFieldValue("widgetID", _v);
                  }}
                />
                <ErrorMessage
                  name="widgetID"
                  component={ErrorTip}
                  errors={errors}
                />
              </AntdForm.Item>
              <AntdForm.Item label="请求数据列">
                <MultiInput defaultValues={values.fields} errors={errors} />
              </AntdForm.Item>
              <AntdForm.Item {...tailLayout}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={hasError}
                >
                  确定
                </Button>
              </AntdForm.Item>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

const useList = (
  defaultList
): [
  OutputDataStructure[],
  (data: OutputDataStructure, index: number) => void,
  (index: number) => void,
  (data: OutputDataStructure) => void,
  () => void
] => {
  const [list, setList] = useState<OutputDataStructure[]>(defaultList);
  const updateItem = (data: OutputDataStructure, index: number) => {
    const listTmpl = list.slice();
    listTmpl.splice(index, 1, {
      ...data,
    });
    setList(listTmpl);
  };
  const deleteItem = (index: number) => {
    const listTmpl = list.slice();
    listTmpl.splice(index, 1);
    setList(listTmpl);
  };
  const insertItem = (data: OutputDataStructure) => {
    const listTmpl = list.slice();
    listTmpl.splice(0, 0, {
      ...data,
      id: nanoid(8),
    });
    setList(listTmpl);
  };
  const clearList = () => {
    setList([]);
  };
  return [list, updateItem, deleteItem, insertItem, clearList];
};
/**
 * 列表组件
 * @param props
 */
export const RequestListTmp: React.FC<
  ActionTemplateComponentProps<OutputDataStructure[]>
> = (props) => {
  const {
    flatLayoutItems,
    pageMetadata,
    platformCtx,
    initValues = [],
    onSubmit,
    onCancel,
  } = props;
  const [list, updateItem, deleteItem, insertItem, clearList] = useList(
    initValues
  );

  /** 获取控件标题 */
  const getWidgetTitle = (widgetID: string | string[]) => {
    if (Array.isArray(widgetID)) {
      return widgetID.map(getWidgetTitle).join(", ");
    }
    return flatLayoutItems[widgetID]?.propState?.title || "";
  };
  /** 表格列的渲染 */
  const getColumns = () => {
    return [
      {
        dataIndex: "apiConfig",
        title: "API",
        key: "apiConfig",
        width: 300,
        render: (_t, _r, _i) => _t?.name,
      },
      {
        dataIndex: "widgetID",
        title: "控件",
        key: "widgetID",
        render: (_t, _r, _i) => getWidgetTitle(_t),
      },
      {
        dataIndex: "fields",
        title: "字段",
        key: "fields",
        ellipsis: { showTitle: true },
        render: (_t) => _t.map((item) => item.code).join(", "),
      },
      // 条件暂不予支持
      // {
      //   dataIndex: 'range',
      //   title: '查询条件',
      //   key: 'range',
      // },
      {
        dataIndex: "action",
        title: "操作",
        key: "action",
        render: (_t, _r, _i) => {
          return (
            <>
              <span
                onClick={handleUpdate.bind(null, _r, _i)}
                className="mr-2 cursor-pointer text-blue-400"
              >
                编辑
              </span>
              <span
                onClick={deleteItem.bind(null, _i)}
                className="mr-2 cursor-pointer text-blue-400"
              >
                删除
              </span>
            </>
          );
        },
      },
    ];
  };
  const columns = getColumns();
  /** 弹出单项操作弹窗 */
  const operateItem = (param?: {
    title?: string;
    data?: OutputDataStructure;
  }): Promise<OutputDataStructure> => {
    const { title = "新增 列表数据查询", data } = param || {};
    return new Promise((resolve) => {
      const modalID = ShowModal({
        title,
        width: `80vw`,
        children: () => {
          return (
            <div className="p20 clearfix">
              <OperateItem
                initValues={data}
                flatLayoutItems={flatLayoutItems}
                pageMetadata={pageMetadata}
                platformCtx={platformCtx}
                onSubmit={(submitData) => {
                  resolve(submitData);
                  CloseModal(modalID);
                }}
                onCancel={() => {
                  CloseModal(modalID);
                }}
              />
            </div>
          );
        },
      });
    });
  };
  /** 新增“列表请求”项 */
  const handleCreate = () => {
    operateItem().then((data) => {
      insertItem(data);
    });
  };
  /** 修改“列表请求”项 */
  const handleUpdate = (record, index) => {
    operateItem({
      title: "编辑 列表数据查询",
      data: record,
    }).then((data) => {
      updateItem(data, index);
    });
  };
  /** 清空列表 */
  const handleClear = () => {
    Modal.confirm({
      zIndex: 10003,
      title: "是否确定清空列表",
      okText: "确定",
      cancelText: "取消",
      onOk() {
        clearList();
      },
    });
  };
  /** 点击确定 */
  const handleSubmit = () => {
    onSubmit(list);
  };
  return (
    <div className="request-list">
      <Table
        columns={columns}
        pagination={false}
        size="small"
        dataSource={list}
        rowKey="id"
        scroll={{ y: 400 }}
      />
      <div className="request-list-toolbar flex mt-2">
        <Button type="primary" onClick={handleCreate}>
          新增
        </Button>
        <span className="flex"></span>
        {list.length > 0 ? (
          <Button onClick={handleClear} className="mr-2">
            清空
          </Button>
        ) : null}
        <Button
          type="primary"
          onClick={handleSubmit}
          className="mr-2"
          disabled={list.length === 0}
        >
          确定
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </div>
  );
};

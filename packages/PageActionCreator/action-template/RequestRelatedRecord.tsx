import React from "react";
import { Button, Form as AntdForm, Table } from "antd";
import { Form, Radio, Select, Input } from "formik-antd";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { customAlphabet } from "nanoid";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { ValueHelper, ErrorMessage } from "@provider-app/page-designer-shared";
import { construct } from "@provider-app/provider-app-common/utils/tools";
import { ActionTemplateComponentProps } from "./interface";

const nanoid = customAlphabet("platformWidget", 8);

const REQUEST_WHOLE_FORM = "requestWholeForm";
const RUQUEST_FIELDS = "requestFields";
const REQUEST_OPTIONS = [
  {
    label: "整表联动",
    value: REQUEST_WHOLE_FORM,
    key: REQUEST_WHOLE_FORM,
  },
  {
    label: "选择性联动",
    value: RUQUEST_FIELDS,
    key: RUQUEST_FIELDS,
  },
];
type OutputDataStructure = {
  api: string;
  rangeList: {
    field: string;
    realVal: string;
    exp: string;
    variable: string;
  }[];
  requestType: typeof REQUEST_WHOLE_FORM | typeof RUQUEST_FIELDS;
  fieldList: {
    field: string;
    variable: string;
  }[];
};

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

const isNull = (target) => {
  return [undefined, null, ""].includes(target);
};

const { Option } = Select;

const FormSchema = Yup.object().shape({
  api: Yup.string()
    .when(["requestType"], (requestType, schema) => {
      if (requestType === REQUEST_WHOLE_FORM) {
        return Yup.string();
      }
      return schema.required("必填");
    })
    .required("必填"),
  rangeList: Yup.array()
    .of(
      Yup.object().shape(
        {
          field: Yup.string().required("必填"),
          realVal: Yup.string().when(["variable", "exp"], (variable, exp) => {
            if (isNull(variable) && isNull(exp)) {
              return Yup.string().required("必填");
            }
            return Yup.string();
          }),
          variable: Yup.string().when(["realVal", "exp"], (realVal, exp) => {
            if (isNull(realVal) && isNull(exp)) {
              return Yup.string().required("必填");
            }
            return Yup.string();
          }),
          exp: Yup.string().when(
            ["realVal", "variable"],
            (realVal, variable) => {
              if (isNull(variable) && isNull(realVal)) {
                return Yup.string().required("必填");
              }
              return Yup.string();
            }
          ),
        },
        [
          ["realVal", "variable"],
          ["realVal", "exp"],
          ["variable", "exp"],
          ["variable", "realVal"],
          ["exp", "realVal"],
          ["exp", "variable"],
        ]
      )
    )
    .min(1),
  requestType: Yup.string().required("必填"),
  fieldList: Yup.array()
    .of(
      Yup.object().shape({
        field: Yup.string().required("必填"),
        variable: Yup.string().required("必填"),
      })
    )
    .when(["requestType"], (requestType, schema) => {
      if (requestType === REQUEST_WHOLE_FORM) {
        return Yup.array();
      }
      return schema.min(1);
    }),
});

const defaultFormValues = {
  api: "",
  rangeList: [{ field: "", realVal: "", exp: "", variable: "", id: nanoid() }],
  requestType: "requestWholeForm",
  fieldList: [{ field: "", variable: "" }],
};
export const RequestRelatedRecord: React.FC<
  ActionTemplateComponentProps<OutputDataStructure>
> = (props) => {
  const {
    pageMetadata,
    platformCtx,
    initValues,
    onSubmit,
  } = props;
  const widgetVar = platformCtx.meta.getVariableData({
    flat: true,
    inType: ["widget"],
    inEditable: true,
    inFlat: true,
  });
  // const variableData = construct(platformCtx.meta.getVariableData());
  const takeDsInfo = (api) => {
    return platformCtx.meta.getPageMeta("dataSource")?.[api];
  };
  const handlePickDs = ({ values, setFieldValue }) => {
    platformCtx.selector.openDatasourceSelector({
      defaultSelected: values.api ? [takeDsInfo(values.api)] : [],
      modalType: "normal",
      position: "top",
      single: true,
      typeArea: ["TABLE"],
      onSubmit: ({ close, interDatasources }) => {
        close();
        const nextMetaID = platformCtx.meta.changeDataSource({
          type: "create/batch&rm/batch",
          rmMetaIDList: values.api,
          dataList: interDatasources,
        });
        setFieldValue("api", nextMetaID[0]);
      },
    });
  };
  const initialValues = {
    api: initValues?.api || "",
    rangeList: initValues?.rangeList || defaultFormValues.rangeList,
    fieldList: initValues?.fieldList || defaultFormValues.fieldList,
    requestType: initValues?.requestType || defaultFormValues.requestType,
  };
  return (
    <div className="submit-2-api">
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
        validationSchema={FormSchema}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }) => {
          const hasError = Object.keys(errors).length > 0;
          console.log(errors);
          return (
            <Form
              {...layout}
              name="createApp"
              className="ant-form ant-form-horizontal ant-form-default"
            >
              <AntdForm.Item label="数据联动方式" required>
                <Radio.Group name="requestType" options={REQUEST_OPTIONS} />
              </AntdForm.Item>
              {values.requestType === RUQUEST_FIELDS && (
                <AntdForm.Item label="选择数据源" required>
                  <div
                    className="px-4 py-1 border cursor-pointer"
                    onClick={handlePickDs.bind(null, { values, setFieldValue })}
                  >
                    {values.api ? takeDsInfo(values.api).name : "点击绑定"}
                  </div>
                  <ErrorMessage
                    name={`api`}
                    errors={errors}
                    component={ErrorTip}
                  />
                </AntdForm.Item>
              )}
              <div className="flex">
                <label
                  className="ant-form-item-required w-1/4 text-right pr-2"
                  title="输入参数"
                >
                  <span className="text-red-600">*</span>输入参数:
                </label>
                {/* <AntdForm.Item label="输入参数" required> */}
                <div className="w-2/3">
                  <FieldArray name="rangeList">
                    {({ remove, insert }) => (
                      <Table
                        dataSource={values.rangeList}
                        columns={[
                          {
                            dataIndex: "field",
                            key: "field",
                            width: 200,
                            title: "字段编码",
                            render: (_t, _r, _i) => (
                              <>
                                <Input name={`rangeList[${_i}].field`} />
                                <ErrorMessage
                                  name={`rangeList[${_i}].field`}
                                  errors={errors}
                                  component={ErrorTip}
                                />
                              </>
                            ),
                          },
                          {
                            dataIndex: "id",
                            key: "id",
                            title: "值",
                            width: 280,
                            render: (_t, _r, _i) => {
                              return (
                                <>
                                  <ValueHelper
                                    platformCtx={platformCtx}
                                    editedState={_r || {}}
                                    onChange={(changeArea) => {
                                      setFieldValue(`rangeList[${_i}]`, {
                                        ..._r,
                                        ...changeArea,
                                      });
                                    }}
                                    // variableData={variableData}
                                  />

                                  <ErrorMessage
                                    name={`rangeList[${_i}].realVal`}
                                    errors={errors}
                                    component={ErrorTip}
                                  />
                                  {/* <ErrorMessage
                                    name={`rangeList[${_i}].realVal`}
                                    errors={errors}
                                    component={ErrorTip}
                                  /> */}
                                </>
                              );
                            },
                          },
                          {
                            title: "操作",
                            dataIndex: "operation",
                            key: "operation",
                            width: 120,
                            render: (_t, _r, _i) => (
                              <>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    insert(_i + 1, { field: "", id: nanoid() });
                                  }}
                                >
                                  新增
                                </Button>
                                {values.rangeList.length > 1 && (
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => {
                                      remove(_i);
                                    }}
                                  >
                                    删除
                                  </Button>
                                )}
                              </>
                            ),
                          },
                        ]}
                        rowKey="id"
                        size="small"
                        pagination={false}
                        scroll={{ y: 300 }}
                      />
                    )}
                  </FieldArray>
                </div>
                {/* </AntdForm.Item> */}
              </div>
              {values.requestType === RUQUEST_FIELDS && (
                <div className="flex mt-5">
                  <label className="ant-form-item-required w-1/4 text-right pr-2">
                    <span className="text-red-600">*</span>输出参数:
                  </label>
                  {/* <AntdForm.Item label="输入参数" required> */}
                  <div className="w-2/3">
                    <FieldArray name="fieldList">
                      {({ remove, insert }) => (
                        <Table
                          dataSource={values.fieldList}
                          columns={[
                            {
                              dataIndex: "field",
                              key: "field",
                              width: 200,
                              title: "字段编码",
                              render: (_t, _r, _i) => (
                                <>
                                  <Input name={`fieldList[${_i}].field`} />
                                  <ErrorMessage
                                    name={`fieldList[${_i}].field`}
                                    errors={errors}
                                    component={ErrorTip}
                                  />
                                </>
                              ),
                            },
                            {
                              dataIndex: "id",
                              key: "id",
                              title: "值",
                              width: 280,
                              render: (_t, _r, _i) => {
                                return (
                                  <>
                                    <Select
                                      name={`fieldList[${_i}].variable`}
                                      allowClear
                                      style={{ width: "100%" }}
                                    >
                                      {widgetVar?.map((item) => {
                                        const { id, wholeTitle } = item;
                                        return (
                                          <Option key={id} value={id}>
                                            {wholeTitle}
                                          </Option>
                                        );
                                      })}
                                    </Select>
                                    <ErrorMessage
                                      name={`fieldList[${_i}].variable`}
                                      errors={errors}
                                      component={ErrorTip}
                                    />
                                  </>
                                );
                              },
                            },
                            {
                              title: "操作",
                              dataIndex: "operation",
                              key: "operation",
                              width: 120,
                              render: (_t, _r, _i) => (
                                <>
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => {
                                      insert(_i + 1, {
                                        field: "",
                                        id: nanoid(),
                                      });
                                    }}
                                  >
                                    新增
                                  </Button>
                                  {values.fieldList.length > 1 && (
                                    <Button
                                      type="link"
                                      size="small"
                                      onClick={() => {
                                        remove(_i);
                                      }}
                                    >
                                      删除
                                    </Button>
                                  )}
                                </>
                              ),
                            },
                          ]}
                          rowKey="id"
                          size="small"
                          pagination={false}
                          scroll={{ y: 300 }}
                        />
                      )}
                    </FieldArray>
                  </div>
                  {/* </AntdForm.Item> */}
                </div>
              )}
              <div className="mt-5">
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
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

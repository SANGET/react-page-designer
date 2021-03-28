import React, { useState } from "react";
import { Button, Form as AntdForm, Select as AntdSelect, Table } from "antd";
import { Form, Input, Radio, Select } from "formik-antd";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { ErrorMessage , ValueHelper } from "@provider-app/page-designer-shared";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { customAlphabet } from "nanoid";
import { ActionTemplateComponentProps } from "./interface";

const nanoid = customAlphabet("platformWidget", 8);


const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

const SUBMIT_WHOLE_FORM = "submitWholeForm";
const SUBMIT_PART_OF_FORM = "submitPartOfForm";
const SUBMIT_TYPE_OPTIONS = [
  { label: "整表提交", key: SUBMIT_WHOLE_FORM, value: SUBMIT_WHOLE_FORM },
  { label: "部分提交", key: SUBMIT_PART_OF_FORM, value: SUBMIT_PART_OF_FORM },
];

export const METHOD_OPTIONS = [
  {
    key: "insert",
    value: "insert",
    label: "新增",
  },
  {
    value: "update",
    key: "update",
    label: "修改",
  },
  // {
  //   method: "GET",
  //   alias: "查询",
  // },
  {
    key: "delete",
    value: "delete",
    label: "删除",
  }
];
const isNull = (target) => {
  return [undefined, null, ""].includes(target);
};
const FormSchema = Yup.object().shape({
  api: Yup.string().required('必填'),
  method: Yup.object().shape(
    {
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
    }, [
      ["realVal", "variable"],
      ["realVal", "exp"],
      ["variable", "exp"],
      ["variable", "realVal"],
      ["exp", "realVal"],
      ["exp", "variable"],
    ]),
  submitType: Yup.string(),
  fieldList: Yup.array().when(['submitType'], (submitType, schema)=>{
    if(SUBMIT_WHOLE_FORM === submitType) return schema;
    return schema.of(
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
        }, [
          ["realVal", "variable"],
          ["realVal", "exp"],
          ["variable", "exp"],
          ["variable", "realVal"],
          ["exp", "realVal"],
          ["exp", "variable"],
        ])
    );
  }),
  rangeList: Yup.array()
    .when(['method'], (method, schema)=>{
      if(['insert'].includes(method?.realVal)){
        return Yup.array();
      }
        return schema.of(
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
        );
      
    }),
});
/**
 * 输出的数据结构
 */
interface OutputDataStructure {
  api: string;
  submitType: typeof SUBMIT_WHOLE_FORM | typeof SUBMIT_PART_OF_FORM;
  method: {
    realVal: string;
    exp: string;
    variable: string;
  };
  fieldList: {
    field: string;
    variable: string;
  }[];  
  rangeList: {
    field: string;
    realVal: string;
    exp: string;
    variable: string;
  }[];
}

const MethodRealVal = (props) => {
  return <AntdSelect options={METHOD_OPTIONS} {...props}/>;
};

export const SubmitToApi: React.FC<
  ActionTemplateComponentProps<OutputDataStructure>
> = (props) => {
  const {
    platformCtx,
    initValues,
    onSubmit,
  } = props;
  const initialValues = {
    api: initValues?.api || '',
    submitType: initValues?.submitType || SUBMIT_WHOLE_FORM,
    method: initValues?.method || { realVal: "insert", exp: "", variable: "" },
    fieldList: initValues?.fieldList || [{ field: "", realVal: "", exp: "", variable: "", id: nanoid() }],
    rangeList: initValues?.rangeList || [{ field: "", realVal: "", exp: "", variable: "", id: nanoid() }],
  };
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
  return (
    <div className="submit-2-api">
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {
          // const submitValues = {
          //   apiConfig: Object.assign({}, values.apiConfig),
          //   submitType: values.submitType,
          //   method: values.method,
          //   fields: values.fields,
          // };
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
              {/* <AntdForm.Item label="选择 API" required>
                {Object.keys(apisConfig).length > 0 ? (
                  <Radio.Group name="apiConfig">
                    {Object.keys(apisConfig).map((metaID) => {
                      const apiItem = apisConfig[metaID];
                      // const isSelected = false;
                      const { name, desc, url } = apiItem;
                      return (
                        <Radio
                          name="apiConfig"
                          key={metaID}
                          value={apiItem}
                          // onClick={(e) => {
                          //   setFieldValue("apiConfig", apiItem);
                          // }}
                        >
                          {[name, url, desc].join(" | ")}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                ) : (
                  "请前往添加 API"
                )}

                <ErrorMessage
                  name={`apiConfig.id`}
                  errors={errors}
                  component={ErrorTip}
                />
              </AntdForm.Item> */}
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
              <div className="flex mb-2">
                <label
                  className="ant-form-item-required w-1/4 text-right pr-2"
                  title="请求方式"
                >
                  <span className="text-red-600">*</span>请求方式:
                </label>
                <div className="w-2/3">
                  <ValueHelper
                    platformCtx={platformCtx}
                    editedState={values.method}
                    realValComp={MethodRealVal}
                    onChange={(changeArea) => {
                      setFieldValue('method', changeArea);
                    }}/>
                  <ErrorMessage
                    name={`method.realVal`}
                    component={ErrorTip}
                    errors={errors}
                  />
                </div>
                
                </div>
              
              {!['insert'].includes(values?.method?.realVal) && (
                <div className="flex">
                <label
                  className="ant-form-item-required w-1/4 text-right pr-2"
                  title="输入参数"
                >
                  <span className="text-red-600">*</span>条件参数:
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
              )}
              {!['delete'].includes(values.method.realVal) && (<>
                <AntdForm.Item label="提交数据">
                  <Radio.Group name="submitType" options={SUBMIT_TYPE_OPTIONS} />
                </AntdForm.Item>
                {values.submitType === SUBMIT_PART_OF_FORM && (
                <div className="flex">
                <label
                  className="ant-form-item-required w-1/4 text-right pr-2"
                  title="输入参数"
                >
                  <span className="text-red-600">*</span>输入参数:
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
                                  <ValueHelper
                                    platformCtx={platformCtx}
                                    editedState={_r || {}}
                                    onChange={(changeArea) => {
                                      setFieldValue(`fieldList[${_i}]`, {
                                        ..._r,
                                        ...changeArea,
                                      });
                                    }}
                                    // variableData={variableData}
                                  />

                                  <ErrorMessage
                                    name={`fieldList[${_i}].realVal`}
                                    errors={errors}
                                    component={ErrorTip}
                                  />
                                  {/* <ErrorMessage
                                    name={`fieldList[${_i}].realVal`}
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
              </>)}
              <div className="mt-2">
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

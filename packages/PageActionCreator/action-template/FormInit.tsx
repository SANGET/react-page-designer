import React from "react";
import { Button, Form as AntdForm, Table } from "antd";
import { Form, Radio, Select, Input } from "formik-antd";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { customAlphabet } from "nanoid";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { ValueHelper, ErrorMessage } from "@provider-app/page-designer-shared";
import { ActionTemplateComponentProps } from "./interface";

const nanoid = customAlphabet("platformWidget", 8);

type OutputDataStructure = {
  rangeList: {
    field: string;
    realVal: string;
    exp: string;
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

const FormSchema = Yup.object().shape({
  
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
});

const defaultFormValues = {
  rangeList: [{ field: "", realVal: "", exp: "", variable: "", id: nanoid() }],
};
export const FormInit: React.FC<
  ActionTemplateComponentProps<OutputDataStructure>
> = (props) => {
  const {
    pageMetadata,
    platformCtx,
    initValues,
    onSubmit,
  } = props;
  
 
  const initialValues = {
    rangeList: initValues?.rangeList || defaultFormValues.rangeList,
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

import React, { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { Button, Form as AntdForm, Table } from "antd";
import { Form, Input } from "formik-antd";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { ValueHelper } from "@provider-app/page-designer-shared/ValueHelper";
import { yup } from "../../../AppEntry/externals-lib/core";

const nanoid = customAlphabet("platformWidget", 8);

const RangeList = ({ platformCtx, initialValues, setFieldValue, errors }) => {
  /** 当前页面变量数据 */
  // const variableData = platformCtx.meta.getVariableData();
  // const [variableData, setVariableData] = useState({});
  useEffect(() => {
    /** 获取当前页面变量 */
    // setVariableData(platformCtx.meta.getVariableData());
  }, []);

  return (
    <FieldArray name="rangeMap">
      {({ push, remove, insert }) => (
        <>
          <div className="flex">
            <h5 className="title">条件配置：</h5>
            <span className="flex"></span>
            <Button
              type="primary"
              onClick={(e) => {
                insert(0, { field: "", id: nanoid() });
              }}
            >
              {" "}
              新增{" "}
            </Button>
          </div>
          <Table
            dataSource={initialValues}
            columns={[
              {
                dataIndex: "field",
                key: "field",
                width: 200,
                title: "输入字段编码",
                render: (_t, _r, _i) => (
                  <>
                    <Input name={`rangeMap[${_i}].field`} />
                    <ErrorMessage
                      name={`rangeMap[${_i}].field`}
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
                width: 200,
                render: (_t, _r, _i) => {
                  return (
                    <>
                      <ValueHelper
                        platformCtx={platformCtx}
                        editedState={_r || {}}
                        onChange={(changeArea) => {
                          setFieldValue(`rangeMap[${_i}]`, {
                            ..._r,
                            ...changeArea,
                          });
                        }}
                        // variableData={variableData}
                      />
                      <ErrorMessage
                        name={`rangeMap[${_i}].realVal`}
                        errors={errors}
                        component={ErrorTip}
                      />
                      <ErrorMessage
                        name={`rangeMap[${_i}].exp`}
                        errors={errors}
                        component={ErrorTip}
                      />
                      <ErrorMessage
                        name={`rangeMap[${_i}].variable`}
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
                width: 150,
                render: (_t, _r, _i) => (
                  <>
                    <Button
                      type="link"
                      className="mr-1"
                      onClick={() => {
                        insert(_i, { field: "", id: nanoid() });
                      }}
                    >
                      新增
                    </Button>
                    <Button
                      type="link"
                      onClick={() => {
                        remove(_i);
                      }}
                    >
                      删除
                    </Button>
                  </>
                ),
              },
            ]}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 300 }}
          />
        </>
      )}
    </FieldArray>
  );
};

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

interface ApiCreatorProps {
  platformCtx;
  initialValues?;
  onSubmit;
}

interface ApiCreatorState {}

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 18, span: 3 },
};

const isNull = (target) => {
  return target === null || target === undefined;
};

const CreatorFormSchema = Yup.object().shape({
  rangeMap: Yup.array().of(
    Yup.object().shape(
      {
        field: Yup.string().required("必填"),
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
  ),
});

const defaultinitialValues = {
  rangeMap: [],
};

export class ApiCreator extends React.Component<
  ApiCreatorProps,
  ApiCreatorState
> {
  state = {};

  render() {
    const {
      initialValues = defaultinitialValues,
      onSubmit,
      platformCtx,
    } = this.props;
    return (
      <div className="api-creator">
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { setSubmitting }) => {
            const submitValues = {
              ...values,
            };
            onSubmit(submitValues);
            setSubmitting(false);
          }}
          validationSchema={CreatorFormSchema}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => {
            const hasError = Object.keys(errors).length > 0;
            return (
              <Form
                {...layout}
                name="createApp"
                className="ant-form ant-form-horizontal ant-form-default"
                // style={{ padding: `30px 0` }}
              >
                <div className="px-8">
                  <RangeList
                    errors={errors}
                    setFieldValue={setFieldValue}
                    platformCtx={platformCtx}
                    initialValues={values.rangeMap}
                  />
                </div>

                <AntdForm.Item {...tailLayout}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    disabled={hasError}
                  >
                    保存
                  </Button>
                </AntdForm.Item>
              </Form>
            );
          }}
        </Formik>
      </div>
    );
  }
}

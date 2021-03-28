import React, { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { Button, Form as AntdForm, Table } from "antd";
import { Form, Input } from "formik-antd";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { ValueHelper, ErrorMessage } from "@provider-app/page-designer-shared";

const nanoid = customAlphabet("platformWidget", 8);

const RangeList = ({ platformCtx, initialValues, setFieldValue, errors }) => {
  /** 当前页面变量数据 */
  // const variableData = platformCtx.meta.getVariableData();
  // const [variableData, setVariableData] = useState({});
  useEffect(() => {
    /** 获取当前页面变量 */
    // setVariableData(platformCtx.meta.getVariableData([]));
  }, []);

  return (
    <FieldArray name="rangeList">
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
              新增
            </Button>
          </div>
          <Table
            dataSource={initialValues}
            columns={[
              {
                dataIndex: "field",
                key: "field",
                width: 300,
                title: "输入字段编码",
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
                width: 400,
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
                    </>
                  );
                },
              },
              {
                title: "操作",
                dataIndex: "operation",
                key: "operation",
                width: 200,
                render: (_t, _r, _i) => (
                  <>
                    <Button
                      type="link"
                      className="mr-1"
                      onClick={() => {
                        insert(_i + 1, { field: "", id: nanoid() });
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
  wrapperCol: { offset: 5, span: 16 },
};

const isNull = (target) => {
  return [undefined, null, ""].includes(target);
};

const CreatorFormSchema = Yup.object().shape({
  // url: Yup.string().required("必填"),
  // name: Yup.string().required("必填"),
  // method: Yup.string().required("必填"),
  // desc: Yup.string(),
  rangeList: Yup.array().of(
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
        exp: Yup.string().when(["realVal", "variable"], (realVal, variable) => {
          if (isNull(variable) && isNull(realVal)) {
            return Yup.string().required("必填");
          }
          return Yup.string();
        }),
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

export class RangeListCreator extends React.Component<
  ApiCreatorProps,
  ApiCreatorState
> {
  state = {};

  getInitialValues = () => {
    const { initialValues } = this.props;
    if (!initialValues) {
      return { rangeList: [] };
    }
    return {
      rangeList: initialValues,
    };
  };

  render() {
    const { onSubmit, platformCtx } = this.props;
    return (
      <div className="api-creator">
        <Formik
          initialValues={this.getInitialValues()}
          onSubmit={(values, { setSubmitting }) => {
            const submitValues = values.rangeList || [];
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
                style={{ padding: `30px 0` }}
              >
                <div className="px-48">
                  <RangeList
                    errors={errors}
                    setFieldValue={setFieldValue}
                    platformCtx={platformCtx}
                    initialValues={values.rangeList}
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

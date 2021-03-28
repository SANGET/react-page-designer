import React, { useState } from "react";
import { Form, Input } from "formik-antd";
import { Button, Form as AntdForm } from "antd";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { ShowModal } from "@deer-ui/core";
import { ActionConfigCreator } from "./ActionConfigCreator";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

const CreatorFormSchema = Yup.object().shape({
  actionName: Yup.string().required("必填"),
  preCheck: Yup.string(),
  actionConfig: Yup.object({
    /** 动作类型 */
    type: Yup.string(),
    /** 动作的配置 */
    config: Yup.object(),
  }).required("比选"),
  triggerCondition: Yup.string(),
});

const FormItemTemplate = ({
  errors,
  touched,
  name,
  label,
  required = false,
  ...other
}) => {
  const error = errors[name] && touched[name];
  return (
    <AntdForm.Item
      {...other}
      label={label}
      validateStatus={error ? "error" : ""}
      required={required}
    >
      <Input name={name} placeholder={label} />
      <ErrorMessage name={name} component={ErrorTip} />
    </AntdForm.Item>
  );
};

const defaultFormValues = {
  actionName: "",
  preCheck: "",
  actionConfig: {
    type: "",
    config: {},
  },
  triggerCondition: "",
};

export const PageActionCreator = (props) => {
  const {
    pageMetadata,
    platformCtx,
    initialValues = defaultFormValues,
    onSubmit,
  } = props;
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, { setSubmitting }) => {
        console.log(values);
        onSubmit(values);
        setSubmitting(false);
      }}
      validationSchema={CreatorFormSchema}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        submitForm,
        setFieldValue,
      }) => {
        const hasError = Object.keys(errors).length > 0;
        return (
          <div>
            <Form
              // {...layout}
              layout="inline"
              name="createApp"
              className="ant-form ant-form-horizontal ant-form-default bg-gray-100"
              style={{ padding: `10px`, borderBottom: "1px solid #eee" }}
            >
              <FormItemTemplate
                name="actionName"
                label="动作名称"
                errors={errors}
                touched={touched}
                // required 是给 UI 显示必填的
                required
              />
              {/* <FormItemTemplate
                name="preCheck"
                label="动作前校验"
                errors={errors}
                touched={touched}
              />
              <FormItemTemplate
                name="triggerCondition"
                label="触发条件"
                errors={errors}
                touched={touched}
              /> */}
            </Form>

            <ActionConfigCreator
              {...props}
              onSubmit={(nextConfig) => {
                setFieldValue("actionConfig", nextConfig);
                if (hasError) return;
                setTimeout(() => {
                  submitForm();
                }, 50);
              }}
            />
          </div>
        );
      }}
    </Formik>
  );
};

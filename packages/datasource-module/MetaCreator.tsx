import React from "react";
import { customAlphabet } from "nanoid";
import { Button, Form as AntdForm, Tooltip, Input as AntdInput } from "antd";
import { Form, Input, Radio } from "formik-antd";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ErrorTip } from "@provider-app/shared-ui/basic";
import { QuestionCircleOutlined } from "@ant-design/icons";

const nanoid = customAlphabet("platformWidget", 8);

interface ApiCreatorProps {
  initialValues?;
  onSubmit;
  platformCtx;
}

interface ApiCreatorState {}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

const MOCK_API = "mockApi";
const EXTERNAL_API = "externalApi";
const API_TYPE_OPTIONS = [
  { label: "mock-api", value: MOCK_API, key: MOCK_API },
  { label: "外部 API", value: EXTERNAL_API, key: EXTERNAL_API, disabled: true },
];

const defaultinitialValues = {
  type: MOCK_API,
  ds: "",
  url: "",
  name: "",
  // method: "GET",
  desc: "",
};

const CreatorFormSchema = Yup.object().shape({
  type: Yup.string().required("必填"),
  ds: Yup.string().when(["type"], (type, schema) => {
    if (type === MOCK_API) return schema.required("必填");
    return Yup.string();
  }),
  url: Yup.string()
    .email()
    .when(["type"], (type, schema) => {
      if (type === EXTERNAL_API) return schema.required("必填");
      return Yup.string().email();
    }),
  name: Yup.string().required("必填"),
  // method: Yup.string().required("必填"),
  desc: Yup.string(),
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
      label={
        <>
          {label}
          {other.tip ? (
            <Tooltip title={other.tip}>
              <QuestionCircleOutlined className="mx-1" />
            </Tooltip>
          ) : null}
        </>
      }
      validateStatus={error ? "error" : ""}
      required={required}
    >
      <Input name={name} placeholder={label} />
      <ErrorMessage name={name} component={ErrorTip} />
    </AntdForm.Item>
  );
};

export class MetaCreator extends React.Component<
  ApiCreatorProps,
  ApiCreatorState
> {
  state = {};

  takeDsInfo = (api) => {
    const { platformCtx } = this.props;
    return platformCtx.meta.getPageMeta("dataSource")?.[api];
  };

  handlePickDs = ({ values, setFieldValue }) => {
    const { platformCtx } = this.props;
    platformCtx.selector.openDatasourceSelector({
      defaultSelected: values.ds ? [this.takeDsInfo(values.ds)] : [],
      modalType: "normal",
      position: "top",
      single: true,
      typeArea: ["TABLE"],
      onSubmit: ({ close, interDatasources }) => {
        close();
        const nextMetaID = platformCtx.meta.changeDataSource({
          type: "create/batch&rm/batch",
          rmMetaIDList: values.ds,
          dataList: interDatasources,
        });
        setFieldValue("ds", nextMetaID[0]);
      },
    });
  };

  render() {
    const { initialValues = defaultinitialValues, onSubmit } = this.props;
    return (
      <div className="api-creator">
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { setSubmitting }) => {
            const submitValues = {
              ...values,
            };
            if (!submitValues.id) {
              // 如果生成的 API 没有 id，则生成一个
              submitValues.id = nanoid();
            }
            onSubmit(submitValues);
            setSubmitting(false);
          }}
          validationSchema={CreatorFormSchema}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => {
            const hasError = Object.keys(errors).length > 0;
            return (
              <Form
                {...layout}
                name="createApp"
                className="ant-form ant-form-horizontal ant-form-default"
                style={{ padding: `30px 0` }}
              >
                <FormItemTemplate
                  name="name"
                  label="元数据名"
                  errors={errors}
                  touched={touched}
                  required
                />

                <FormItemTemplate
                  name="desc"
                  label="描述"
                  errors={errors}
                  touched={touched}
                />

                <AntdForm.Item {...tailLayout}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    disabled={hasError}
                  >
                    创建
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

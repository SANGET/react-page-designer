import React, { useEffect, useState } from "react";
import { Form as AntdForm, Button } from "antd";
import { Formik, ErrorMessage } from "formik";

import { Form, Input } from "formik-antd";

type FlexLayoutProps = React.HTMLAttributes<HTMLDivElement>;

export const FormContainer = React.forwardRef<any, FlexLayoutProps>(
  (props, ref) => {
    const {
      children,
      style,
      onPageLoad,
      onSubmit,
      initialValues = {},
      ...other
    } = props;
    // const [isLoad, setIsLoad] = useState(false);
    // useEffect(() => {
    //   if (!isLoad) {
    //     onPageLoad && onPageLoad();
    //     setIsLoad(true);
    //   }
    // }, []);
    // const fileds = ["mWriatgm_realVal", "iddtterf_realVal", "xingbie"];
    // console.log(children);
    return (
      <div
        ref={ref}
        style={Object.assign({}, { minHeight: 200, padding: 20 }, style)}
        {...other}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { setSubmitting }) => {
            onSubmit();
            setSubmitting(false);
          }}
        >
          {/* {children} */}
          {({ isSubmitting, setFieldValue, values, resetForm, errors }) => {
            return (
              <Form
                name="setting"
                style={{ padding: "10px" }}
                initialValues={values}
              >
                {(children || []).map((item, index) => (
                  <AntdForm.Item name={index}>{item}</AntdForm.Item>
                ))}

                <AntdForm.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    // disabled={hasError}
                    loading={isSubmitting}
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
  }
);

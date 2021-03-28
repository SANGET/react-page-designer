import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  InputNumber,
  DatePicker,
  TimePicker,
  ConfigProvider,
} from "antd";
import moment from "moment";
import "moment/locale/zh-cn";
import locale from "antd/lib/locale/zh_CN";
import zhCN from "antd/es/date-picker/locale/zh_CN";
import { GetVariableData, VariableItem } from "@provider-app/platform-access-spec";
import { VariableRecord } from "./PageVariableSelector";

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const VAR_ATTR_TYPE_MENU = [
  { label: "字符串", value: "string", key: "string" },
  { label: "数字", value: "number", key: "number" },
  { label: "日期", value: "date", key: "date" },
  { label: "日期时间", value: "dateTime", key: "dateTime" },
];

export type VarListInState = { [key: string]: VariableItem[] };
type BasicProps = {
  getVariableData: GetVariableData;
  onCancel: () => void;
  onSuccess: (param: VariableRecord) => void;
};
type InsertProps = {
  mode: "INSERT";
  data?;
};
type UpdateProps = {
  mode: "UPDATE";
  data: VariableRecord;
};
export type IProps = BasicProps & (InsertProps | UpdateProps);
export const VariableEditor = ({
  data,
  mode,
  onCancel,
  onSuccess,
  getVariableData,
}: IProps) => {
  const [form] = Form.useForm();
  const variableList = getVariableData();
  // const [variableList, setVariableList] = useState<VarListInState>({});
  useEffect(() => {
    /** 默认数据类型 */
    form.setFieldsValue({ varType: "string" });
    if (mode === "UPDATE") {
      form.setFieldsValue(data);
    }
    // getVariableData([]).then((res) => {
    //   setVariableList(res);
    // });
  }, []);

  /**
   * 提交数据
   * @param fieldsValue 表单数据
   */
  const onFinish = (fieldsValue) => {
    Object.keys(fieldsValue).forEach((key) => {
      fieldsValue[key] = fieldsValue[key] || null;
    });
    onSuccess(fieldsValue);
  };

  /**
   * 清空，修改状态下，编码保持不变
   */
  const onReset = () => {
    form.resetFields();
    if (mode === "UPDATE") {
      form.setFieldsValue({
        varType: data.varType,
        code: data.code,
      });
    }
  };
  /**
   * 对 日期时间 组件的数据进行转换
   * @param value 2020-12-13 / 19:13:22
   * @param format "YYYY-MM-DD"/"HH:mm:ss"
   */
  const getMonentValue = (value: string, format: "YYYY-MM-DD" | "HH:mm:ss") => {
    return value ? moment(value, format) : null;
  };

  /**
   * “值”的 组件渲染，每种数据类型对应渲染不同的组件
   * @param param0
   */
  const valRenderer = ({ setFieldsValue, getFieldsValue }) => {
    const { varType, realVal } = getFieldsValue(["realVal", "varType"]);
    /** 字符串 */
    if (varType === "string") return <Input />;
    /** 数字 */
    if (varType === "number") return <InputNumber />;
    /** 日期 */
    if (varType === "date") return <DatePicker locale={zhCN} />;
    /** 日期时间 */
    if (varType === "dateTime")
      return (
        <>
          <DatePicker
            locale={zhCN}
            value={getMonentValue((realVal || "").split(" ")[0], "YYYY-MM-DD")}
            onChange={(_m, dateString) => {
              const time = (realVal || "").split(" ")[1];
              setFieldsValue({ realVal: `${dateString || ""} ${time || ""}` });
            }}
          />
          <TimePicker
            value={getMonentValue((realVal || "").split(" ")[1], "HH:mm:ss")}
            onChange={(_m, timeString) => {
              const date = (realVal || "").split(" ")[0];
              setFieldsValue({ realVal: `${date || ""} ${timeString || ""}` });
            }}
          />
        </>
      );
    return null;
  };
  /**
   * 变量编码、变量描述 不能重复 TODO
   *
   */
  const isDuplicated = (value, key) => {
    if (!value || mode === "UPDATE") return false;
    const amIDuplicated = variableList
      .filter((item) => item.type)
      .some(({ [key]: loopValue }) => loopValue === value);
    return amIDuplicated;
  };

  return (
    <ConfigProvider locale={locale}>
      <Form
        {...layout}
        form={form}
        className="edit-variable"
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          label="变量名称"
          rules={[
            { required: true, message: "请填写变量名称" },
            {
              pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_()]{1,10}$/,
              message: "支持10个字符内的中文、英文、数字、下划线、英文小括号",
            },
            {
              validator: (_r, value) => {
                const amIDuplicated = isDuplicated(value, "name");
                if (amIDuplicated) {
                  return Promise.reject(new Error("变量名称重复"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="code"
          label="变量编码"
          rules={[
            { required: true, message: "请填写变量编码" },
            {
              pattern: /^[a-zA-Z0-9._]+$/,
              message: "只能填写字母、数字、下划线和 .",
            },
            {
              validator: (_r, value) => {
                const amIDuplicated = isDuplicated(value, "code");
                if (amIDuplicated) {
                  return Promise.reject(new Error("变量编码重复"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input disabled={mode !== "INSERT"} />
        </Form.Item>
        <Form.Item
          name="varType"
          label="类型"
          rules={[{ required: true, message: "请填写类型" }]}
        >
          <Select
            onChange={() => {
              form.setFieldsValue({ realVal: null });
            }}
            options={VAR_ATTR_TYPE_MENU}
          />
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldsValue, setFieldsValue }) => {
            return (
              <Form.Item name="realVal" label="变量值">
                {valRenderer({ setFieldsValue, getFieldsValue })}
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          name="alias"
          label="描述"
          rules={[
            { pattern: /^.{1,32}$/, message: "长度为 32 的任意字符" },
            {
              validator: (_r, value) => {
                const amIDuplicated = isDuplicated(value, "alias");
                if (amIDuplicated)
                  return Promise.reject(new Error("变量描述重复"));
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }} {...tailLayout}>
          <Space className="float-right">
            <Button htmlType="button" onClick={onReset}>
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
    </ConfigProvider>
  );
};

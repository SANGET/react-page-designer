import React, { useEffect, useState } from "react";
import { Form, Button, Select, Space } from "antd";
import { DisplayControlConfig } from "@provider-app/platform-access-spec";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

interface IOnSuccessParams {
  id: string;
  name: string;
}

interface IProps {
  onSuccess: (item: IOnSuccessParams | null, name: string) => void;
  onCancel: () => void;
  config: DisplayControlConfig;
  flatLayoutItems;
}

type Control = {
  label: string;
  key: string;
  value: string;
};
export const DisplayControl = ({
  onSuccess,
  onCancel,
  config,
  flatLayoutItems,
}: IProps) => {
  const [form] = Form.useForm();
  const [allControlList, setAllControlList] = useState<Control[]>([]);
  const [showContorlList, setShowContorlList] = useState<Control[]>([]);
  const [hideContorlList, setHideContorlList] = useState<Control[]>([]);

  const isDataEmpty = (data) => {
    return Array.isArray(data) ? data.length === 0 : !data;
  };
  const onFinish = (data) => {
    const { showControl, hideControl } = data;
    if (isDataEmpty(showControl) && isDataEmpty(hideControl)) {
      return onSuccess(null, "");
    }
    const showControlCn = showControl
      .map((item) => getControlLabel(item))
      .join("，");
    const hideControlCn = hideControl
      .map((item) => getControlLabel(item))
      .join("，");
    onSuccess(
      data,
      `显示：${showControlCn || "无"}，隐藏：${hideControlCn || "无"}`
    );
  };

  const getAllControlList = () => {
    const allControlListTmpl: Control[] = [];
    for (const key in flatLayoutItems) {
      allControlListTmpl.push({
        key,
        value: key,
        label: flatLayoutItems[key]?.label || "",
      });
    }
    return allControlListTmpl;
  };

  const getControlLabel = (key) => {
    return flatLayoutItems[key]?.label;
  };

  useEffect(() => {
    const allControlListTmpl = getAllControlList();
    setAllControlList(allControlListTmpl);
    setShowContorlList(allControlListTmpl);
    setHideContorlList(allControlListTmpl);
  }, []);

  useEffect(() => {
    const { showControl = [], hideControl = [] } = config || {};
    setShowContorlList(filterControlList(hideControl));
    setHideContorlList(filterControlList(showControl));
    form.setFieldsValue({ showControl, hideControl });
  }, [allControlList]);

  const filterControlList = (values) => {
    return allControlList.filter((item) => !values.includes(item.value));
  };

  const filterOption = (value, option) => {
    return option.label.toLowerCase().includes(value.toLowerCase());
  };
  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form
      {...layout}
      form={form}
      className="display-control"
      onFinish={onFinish}
    >
      <Form.Item name="showControl" label="显示控件">
        <Select
          mode="multiple"
          allowClear
          options={showContorlList}
          filterOption={filterOption}
          onChange={(values) => {
            setHideContorlList(
              allControlList.filter(
                (item) => !values.toString().includes(item.value)
              )
            );
          }}
        />
      </Form.Item>
      <Form.Item name="hideControl" label="隐藏控件">
        <Select
          mode="multiple"
          allowClear
          options={hideContorlList}
          filterOption={filterOption}
          onChange={(values) => {
            setShowContorlList(
              allControlList.filter(
                (item) => !values.toString().includes(item.value)
              )
            );
          }}
        />
      </Form.Item>
      <Form.Item {...tailLayout} style={{ marginBottom: 0 }}>
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
  );
};

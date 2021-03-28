import React, { useEffect, useState } from "react";
import { Form, Button, Select, Space } from "antd";
import { WriteTableData } from "@provider-app/platform-access-spec";

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
  config: WriteTableData["writeTableData"];
  flatLayoutItems;
}

type Control = {
  label: string;
  key: string;
  value: string;
};
export const WriteTableWidget = ({
  onSuccess,
  onCancel,
  config,
  flatLayoutItems,
}: IProps) => {
  const [form] = Form.useForm();
  const [controlList, setControlList] = useState<Control[]>([]);

  const isDataEmpty = (data) => {
    return Array.isArray(data) ? data.length === 0 : !data;
  };

  const onFinish = (data) => {
    const { control } = data;
    if (isDataEmpty(control) && isDataEmpty(control)) {
      return onSuccess(null, "");
    }
    const controlCn = getSubmitTitle(control);
    onSuccess(data, `回写：${controlCn || "无"}`);
  };

  const getAllControlList = () => {
    const controlListTmpl: Control[] = [];
    for (const key in flatLayoutItems) {
      const { propState, wGroupType } = flatLayoutItems[key] || {};
      const { title = "" } = propState || {};
      if (wGroupType !== "dataDisplay") continue;
      controlListTmpl.push({
        key,
        value: key,
        label: title,
      });
    }
    return controlListTmpl;
  };

  const getSubmitTitle = (control) => {
    return control
      .map((item) => getControlLabel(item))
      .filter((item) => item)
      .join("，");
  };

  const getControlLabel = (key) => {
    return flatLayoutItems[key]?.propState?.title || "";
  };

  useEffect(() => {
    const controlListTmpl = getAllControlList();
    setControlList(controlListTmpl);
    form.setFieldsValue(config);
  }, []);

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
      <Form.Item name="control" label="表格控件">
        <Select
          mode="multiple"
          allowClear
          options={controlList}
          filterOption={filterOption}
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

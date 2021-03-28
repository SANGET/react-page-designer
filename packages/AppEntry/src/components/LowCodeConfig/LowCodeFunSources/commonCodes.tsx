import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, message, Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string) => void;
  platformCtx?: PlatformCtx;
  businessCodeParam: { pageId?: string; widgetId?: string };
}
export const CommonCodes: React.FC<IProps> = (props) => {
  const {
    insertValue,
    platformCtx,
    businessCodeParam: { pageId },
  } = props;
  const [code, setcode] = useState<string>("");
  const pageState = platformCtx?.meta.getPageState();
  const createCode = () => {
    if (!code) {
      message.error("请先选择通用函数！");
      return;
    }
    const {
      id,
      content: { use },
    } = pageState?.commonCodes[code];
    const template = `${use}_${pageId}_common_${id}(snippetParams)`;

    insertValue(template);
  };

  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div>通用函数：</div>
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="请选择通用函数"
          onChange={(val: string) => {
            setcode(val);
          }}
        >
          {Object.keys(pageState?.commonCodes)?.map((key) => (
            <Option value={key} key={key}>
              {pageState?.commonCodes[key].name}
            </Option>
          ))}
        </Select>
      </div>

      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

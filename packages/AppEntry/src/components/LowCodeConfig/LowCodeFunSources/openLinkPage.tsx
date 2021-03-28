import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, message, Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string) => void;
  metaCtx: PlatformCtx["meta"];
  pageState?: any;
}
export const OpenLinkPage: React.FC<IProps> = (props) => {
  const { insertValue, metaCtx, pageState } = props;
  const [pageComponent, setpageComponent] = useState<string>();
  const createCode = () => {
    if (!pageComponent) {
      message.error("请先选择页面！");
      return;
    }

    const template = `snippetParams.container.setState(
{
  HYPageModal_InState:
  {
    pageComponent: "HYCGENCODE.${pageComponent}",
    pageDTO: {id: snippetParams.container.state.editId || ""},
    onOk: (data) => {
      snippetParams.container.setState(
        {
          HYPageModal_InState :
          {
            visible: false
          }
        }
      );
    },
    onCancel: (data) => {
      snippetParams.container.setState(
        {
          HYPageModal_InState :
          {
            visible: false
          }
        }
      );
    },
    visible: true,
  }
});
`;

    insertValue(template);
  };

  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div>弹窗页面：</div>
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="请选择页面"
          onChange={(val: string) => {
            setpageComponent(val);
          }}
        >
          {pageState?.pageList?.map((page) => (
            <Option value={page.value} key={page.value}>
              {page.label}
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

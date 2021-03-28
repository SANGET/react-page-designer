import { Button, message, Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string, params?: any) => void;
  pageState?: any;
  params?: any;
}
export const OpenLinkPageSimple: React.FC<IProps> = (props) => {
  const { insertValue, pageState, params } = props;
  const [pageComponent, setpageComponent] = useState<string>(
    params?.pageComponent
  );
  const createCode = () => {
    if (!pageComponent) {
      message.error("请先选择页面！");
      return;
    }

    const template = `
/**
 * 打开弹窗页面
 */
let params = snippetParams;
params.widgetInState = 'HYPageModal_InState';
params.pageComponent = "HYCGENCODE.${pageComponent}";
params.pageDTO =  {id: snippetParams.container.state.editId || ""};
params.$A_R = window.$A_R;
HYCLIB.PageModal.openPageModal(params); 
`;

    insertValue(template, { pageComponent });
  };

  return (
    <div>
      <div style={{ margin: "10px 0" }}>
        <div>弹窗页面：</div>
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="请选择页面"
          defaultValue={pageComponent}
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

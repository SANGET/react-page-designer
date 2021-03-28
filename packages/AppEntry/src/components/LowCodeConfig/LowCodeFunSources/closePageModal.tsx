import { Button } from "antd";
import React from "react";

interface IProps {
  insertValue: (lowCode: string) => void;
}
export const ClosePageModal: React.FC<IProps> = (props) => {
  const { insertValue } = props;

  const createCode = () => {
    const template = `
snippetParams.container?.props?.onCancel();
    `;
    insertValue(template);
  };

  return (
    <div>
      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

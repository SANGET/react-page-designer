import React from "react";

export const Unexpect: React.FC = ({ children = "异常组件" }) => {
  return <div>{children}</div>;
};

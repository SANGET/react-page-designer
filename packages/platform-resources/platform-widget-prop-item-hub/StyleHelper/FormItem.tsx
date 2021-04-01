import React from "react";

export const FormItem = ({ className,  title, children }) => {
  return (
    <div className={className}>
      <div>{title}</div>
      {children}
    </div>
  );
};
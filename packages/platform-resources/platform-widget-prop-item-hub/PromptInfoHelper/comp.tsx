import React from "react";
import { Input } from "antd";

const { TextArea } = Input;

export const PromptInfoComp = ({ changeEntityState, editingWidgetState }) => {
  const { placeholder } = editingWidgetState;
  return (
    <TextArea
      rows={3}
      maxLength={32}
      value={placeholder}
      onChange={(e) => {
        const { value } = e.target;
        changeEntityState({
          attr: "placeholder",
          value,
        });
      }}
      showCount
    />
  );
};

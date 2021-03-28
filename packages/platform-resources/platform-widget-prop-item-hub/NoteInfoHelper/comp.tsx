import React from "react";
import { Input } from "antd";

const { TextArea } = Input;

export const NoteInfoComp = ({ changeEntityState, editingWidgetState }) => {
  const { note } = editingWidgetState;
  return (
    <TextArea
      rows={3}
      maxLength={32}
      value={note}
      onChange={(e) => {
        changeEntityState({
          attr: "note",
          value: e.target.value,
        });
      }}
      showCount
    />
  );
};

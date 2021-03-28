import React from "react";
import { Input } from "antd";
import { PropItemRenderContext } from "@provider-app/platform-access-spec";

export const UnitEditorComp: React.FC<PropItemRenderContext> = ({
  changeEntityState,
  editingWidgetState,
}) => {
  const { addonAfter } = editingWidgetState;
  return (
    <Input
      value={addonAfter || ""}
      onChange={(e) => {
        const { value } = e.target;
        changeEntityState({
          attr: "addonAfter",
          value,
        });
      }}
    />
  );
};

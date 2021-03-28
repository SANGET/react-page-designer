import React, { useEffect, useState } from "react";
// import { Input } from "@provider-app/shared-ui";
import { PropItemRenderContext } from "@provider-app/platform-access-spec";
import { Input } from "antd";

export const TitleEditorComp: React.FC<PropItemRenderContext> = ({
  changeEntityState,
  editingWidgetState,
  platformCtx: {
    meta: { takeMeta },
  },
}) => {
  const { title, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: "schema",
    metaRefID: field,
  });
  useEffect(() => {
    const nextTitle = selectedField?.column?.name;
    if (!nextTitle || nextTitle === title) return;
    changeEntityState({
      attr: "title",
      value: nextTitle,
    });
  }, [field]);

  return (
    <div>
      <Input
        value={title || ""}
        onChange={(event) => {
          const { value } = event.target;
          changeEntityState({
            attr: "title",
            value,
          });
        }}
      />
    </div>
  );
};

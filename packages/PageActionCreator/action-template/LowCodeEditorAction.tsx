import React, { useState } from "react";
import { LowCodeEditor } from "@provider-app/page-designer-shared/LowCodeEditor";
import { ActionTemplateComponentProps } from "./interface";

const defaultFormValues = {
  code: "",
};
/**
 * 输出的数据结构
 */
interface OutputDataStructure {
  code: string;
}

export const LowCodeEditorAction: React.FC<
  ActionTemplateComponentProps<OutputDataStructure>
> = (props) => {
  const {
    pageMetadata,
    platformCtx,
    initValues = defaultFormValues,
    onSubmit,
  } = props;
  return (
    <div className="submit-2-api">
      <LowCodeEditor defaultValue={initValues} onSubmit={onSubmit} />
    </div>
  );
};

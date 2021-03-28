import React from "react";
import { Button, ShowModal } from "@deer-ui/core";
import { PageMetadataEditor } from "./PageMetadataEditor";

const editPageMetadata = (onOK, onCancel) => {
  ShowModal({
    title: "编辑页面属性",
    children: () => {
      return <PageMetadataEditor />;
    },
  });
};

export const EditButton = ({ onOK, onCancel, children, ...btnProps }) => {
  return (
    <Button {...btnProps} onClick={() => editPageMetadata(onOK, onCancel)}>
      {children}
    </Button>
  );
};

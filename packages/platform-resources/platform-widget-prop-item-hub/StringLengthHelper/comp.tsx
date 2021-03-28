import React, { useEffect } from 'react';
import { InputNumber } from 'antd';

export const StringLengthComp = ({
  changeEntityState,
  editingWidgetState,
  takeMeta
}) => {
  const { stringLength, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: 'schema',
    metaRefID: field
  });
  useEffect(() => {
    if(selectedField?.column){
      const { fieldSize } = selectedField?.column || {};

      changeEntityState({
        attr: "stringLength",
        value: fieldSize
      });
    }
  }, [selectedField]);
  return (
    <InputNumber
      value={stringLength}
      style={{ width: "100%" }}
      onChange={(value) => changeEntityState({
        attr: 'stringLength',
        value
      })}
      disabled={!!selectedField?.column}
    />
  );
};

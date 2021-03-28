import React, { useEffect } from 'react';
import { Input } from 'antd';

export const CheckErrorTooltipComp = ({
  changeEntityState,
  editingWidgetState,
  takeMeta
}) => {
  const { checkErrorTooltip, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: 'schema',
    metaRefID: field
  });
  useEffect(() => {
    // const nextCheckErrorTooltip = selectedField?.column?.name;
    // if (!nextCheckErrorTooltip || nextCheckErrorTooltip === checkErrorTooltip) return;
    // changeEntityState({
    //   attr: 'checkErrorTooltip',
    //   value: nextCheckErrorTooltip
    // });
  }, [selectedField]);
  return (
    <Input
      style={{ width:"100%" }}
      value={checkErrorTooltip || ''}
      onChange={(e) => changeEntityState({
        attr: 'checkErrorTooltip',
        value: e.target.value
      })}
    />
  );
};

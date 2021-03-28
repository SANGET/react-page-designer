import React, { useEffect } from 'react';
import { Input, Button } from 'antd';

const { Search } = Input;
export const CheckCustomRuleComp = ({
  changeEntityState,
  editingWidgetState,
  takeMeta
}) => {
  const { checkCustomRule, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: 'schema',
    metaRefID: field
  });
  useEffect(() => {
    // const nextCheckCustomRule = selectedField?.column?.name;
    // if (!nextCheckCustomRule || nextCheckCustomRule === checkCustomRule) return;
    // changeEntityState({
    //   attr: 'checkCustomRule',
    //   value: nextCheckCustomRule
    // });
  }, [selectedField]);
  return (
    <Search
      value={checkCustomRule || ''}
      enterButton="fx"
      allowClear
    />
  );
};

import { Input } from 'antd';
import React, { useEffect, useState } from 'react';

export const LowCodeComp = ({
  changeEntityState,
  editingWidgetState,
  takeMeta,
  platformCtx
}) => {
  let { lowCode, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: 'schema',
    metaRefID: field
  });
  const [defaultValue,setdefaultValue] = useState<string>();
  useEffect(() => {
    // const nextPromptInfo = selectedField?.column?.name;
    // if (!nextPromptInfo || nextPromptInfo === promptInfo) return;
    // changeEntityState({
    //   attr: 'promptInfo',
    //   value: nextPromptInfo
    // });
  }, [selectedField]);
  return (
    <Input
      value={lowCode}
      placeholder={"点击设置低代码"}
      onClick={()=>{
        const closeModal = platformCtx.selector.openLowCodeImporter({
          defaultValue: defaultValue,
          eventType: "onClick",
          onSubmit: (lowCodeKey) => {
            setdefaultValue(lowCodeKey.code);
            changeEntityState({
              attr: 'lowCode',
              value: lowCodeKey.codeId
            })
            console.log(lowCodeKey,111,editingWidgetState);
            closeModal();
          },
        });
      }}
    />
  );
};

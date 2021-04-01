import React, { useEffect } from "react";
import { Input } from "antd";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";

const WidgetCodeComp: React.FC<PropItemRenderContext> = (props) => {
  const {
    changeEntityState,
    editingWidgetState,
    widgetEntity,
    platformCtx,
  } = props;
  const { takeMeta } = platformCtx.meta;
  const { id, widgetRef } = widgetEntity;
  const { widgetCode, field } = editingWidgetState;
  const schema = takeMeta({
    metaAttr: "schema",
    metaRefID: field,
  });
  const widgetCounter = takeMeta({
    metaAttr: "widgetCounter",
  });
  /** 取自身定义的 whichAttr */
  useEffect(() => {
    let nextWidgetCode;
    /**
     * 业务需求逻辑
     * 1. 如果绑定了列名，则使用列名作为控件编码
     * 2. 如果没有绑定，控件编码为 `控件类型 + 组件数量`
     */
    if (field && schema) {
      nextWidgetCode = schema.column?.fieldCode;
    } else {
      nextWidgetCode = widgetCode || `${widgetRef}$${widgetCounter}`;
    }
    if (widgetCode !== nextWidgetCode) {
      changeEntityState({
        attr: "widgetCode",
        value: nextWidgetCode,
      });
    }
  }, [schema]);
  return (
    <div>
      <Input readOnly value={widgetCode} />
    </div>
  );
};

@PropItem({
  id: "prop_widget_coding",
  label: "编码",
  whichAttr: ["field", "widgetCode"],
  useMeta: ["schema"],
})
/**
 * 组件的编码
 */
export default class WidgetCodingHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <WidgetCodeComp {...ctx} />;
  }
}

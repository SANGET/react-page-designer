import React from "react";
import { PropItemRendererProps } from "@provider-app/page-visual-editor-engine/components/PropertiesEditor";
import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Unexpect } from "../WidgetRenderer";

interface PDPropItemRendererProps extends PropItemRendererProps {
  pageMetadata;
  widgetEntity;
  platformCtx: PlatformCtx;
}

/**
 * 属性项渲染器
 * 根据属性项的 type 选择对应的组件进行渲染
 */
export const PropItemRenderer: React.FC<PDPropItemRendererProps> = ({
  propItemMeta,
  platformCtx,
  editingWidgetState,
  pageMetadata,
  widgetEntity,
  changeEntityState,
}) => {
  const { label, tip } = propItemMeta;

  let Com;
  if (!propItemMeta.render) {
    Com = <Unexpect />;
  } else {
    const propItemRenderContext = {
      changeEntityState,
      widgetEntity,
      platformCtx,
      editingWidgetState,
      pageMetadata,
    };
    Com = propItemMeta.render(propItemRenderContext);
  }
  return (
    <div className="mb10">
      <div className="prop-label mb5">
        {label}
        {tip ? (
          <Tooltip title={tip}>
            <QuestionCircleOutlined
              color="#808080"
              className="px-1 cursor-pointer"
              style={{ verticalAlign: 2 }}
            />
          </Tooltip>
        ) : null}
      </div>
      <div className="prop-content">{Com}</div>
    </div>
  );
};

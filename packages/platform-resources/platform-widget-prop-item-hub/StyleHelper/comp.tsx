import React from "react";
import { Input } from "antd";
import { PropItemRenderContext } from "@provider-app/platform-access-spec";

const FormItem = ({ title, value, changeEntityState, changeAttr }) => {
  const realVal = value[changeAttr];
  return (
    <div className="mb-4">
      <div>{title}</div>
      <Input
        value={realVal}
        onChange={(e) => {
          const { value: _val } = e.target;
          changeEntityState({
            attr: "style",
            value: Object.assign({}, value, {
              [changeAttr]: _val,
            }),
          });
        }}
      />
    </div>
  );
};

export const Comp: React.FC<PropItemRenderContext> = ({
  changeEntityState,
  editingWidgetState,
}) => {
  const { style = {} } = editingWidgetState;
  return (
    <>
      <FormItem
        title="内边距"
        changeEntityState={changeEntityState}
        changeAttr="padding"
        value={style}
      />
      <FormItem
        title="外边距"
        changeEntityState={changeEntityState}
        changeAttr="margin"
        value={style}
      />
      <FormItem
        title="外边界"
        changeEntityState={changeEntityState}
        changeAttr="border"
        value={style}
      />
      <FormItem
        title="高度"
        changeEntityState={changeEntityState}
        changeAttr="height"
        value={style}
      />
      <FormItem
        title="宽度"
        changeEntityState={changeEntityState}
        changeAttr="widget"
        value={style}
      />
      <FormItem
        title="display"
        changeEntityState={changeEntityState}
        changeAttr="display"
        value={style}
      />
      <div className="mb-4">
        <div>样式代码</div>
        <Input.TextArea
          value={JSON.stringify(style)}
          onChange={(e) => {
            const { value } = e.target;
            let _val = style;
            try {
              _val = JSON.parse(value);
              changeEntityState({
                attr: "style",
                value: _val,
              });
            } catch (err) {
              console.error(`这个人乱输入样式代码，无法解析为 json`);
            }
          }}
        />
      </div>
    </>
  );
};

import React from "react";
import { Input } from "antd";
import { PropItemRenderContext } from "@provider-app/platform-access-spec";
import { Width } from "./Width";
import { Margin } from "./Margin";
import { MARGIN_OPTIONS, PADDING_OPTIONS, OPACITY } from "./constants";
import { Shadow } from "./Shadow";
import { Border } from "./Border";
import { FormItem } from "./FormItem";

export const Comp: React.FC<PropItemRenderContext> = ({
  changeEntityState,
  editingWidgetState,
}) => {
  const { style = {} } = editingWidgetState;
  const changeStyle = (target) => {
    changeEntityState({
      attr: "style",
      value: Object.assign({}, style, target),
    });
  };
  return (
    <>
      <FormItem title="宽度" className="mb-4">
        <Width
          value={style.width}
          onChange={(width) => changeStyle({ width })}
        />
      </FormItem>
      <FormItem title="高度" className="mb-4">
        <Width
          value={style.height}
          onChange={(height) => changeStyle({ height })}
        />
      </FormItem>
      <FormItem title="外边距" className="mb-4">
        <Margin
          value={style.margin}
          options={MARGIN_OPTIONS}
          onChange={(margin) => changeStyle({ margin })}
        />
      </FormItem>
      <FormItem title="内间距" className="mb-4">
        <Margin
          value={style.padding}
          options={PADDING_OPTIONS}
          onChange={(padding) => changeStyle({ padding })}
        />
      </FormItem>
      <FormItem title="边框" className="mb-4">
        <Border value={style} onChange={(border) => changeStyle(border)} />
      </FormItem>
      <FormItem title="阴影" className="mb-4">
        <Shadow
          value={style.boxShadow}
          onChange={(boxShadow) => changeStyle({ boxShadow })}
        />
      </FormItem>
      <FormItem title="不透明度" className="mb-4">
        <Width
          value={style.opacity}
          onChange={(opacity) => changeStyle({ opacity })}
          options={OPACITY}
          min={0}
          max={100}
          precision={1}
        />
      </FormItem>
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

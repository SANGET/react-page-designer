import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { ClickAway } from "@deer-ui/core";

const SketchPicker = React.lazy(() => import("react-color/lib/Sketch"));



/**
 * 颜色选择组件
 * @param param0
 */
export const ColorPicker: React.FC<{
  color: string;
  pick: (color: string) => void;
}> = ({ pick, color }) => {
  const [state, setState] = useState({ visible: false, color });
  /** 判断用户点击是否越界 */
  const isOutSide = (path) => {
    return !path?.some((item) => {
      return item.className?.includes("ant-tooltip");
    });
  };
  return (
    <ClickAway
      onClickAway={(e) => {
        if (!state.visible) return;
        const outSide = isOutSide(e.path);
        /** 点击外部直接收起选择器 */
        if (!outSide) return;
        setState({ visible: false, color });
      }}
    >
      <Tooltip
        color="#fff"
        placement="bottom"
        visible={state.visible}
        overlayStyle={{ color: "#000" }}
        title={
          <>
            <div className="text-black">
              <React.Suspense
                fallback={<div className="text-black">loading</div>}
              >
                <SketchPicker
                  style={{ color: "#000" }}
                  className="color-picker"
                  visible={state.visible}
                  color={state.color}
                  onChangeComplete={({ hex }) => {
                    setState({
                      ...state,
                      color: hex,
                    });
                  }}
                />
                <div className="flex mt-2">
                  <span className="flex"></span>
                  <button
                    type="button"
                    className="ant-btn mr-2 ant-btn-sm"
                    onClick={() => {
                      setState({
                        color,
                        visible: false,
                      });
                    }}
                  >
                    取 消
                  </button>
                  <button
                    type="button"
                    className="ant-btn ant-btn-primary ant-btn-sm"
                    onClick={() => {
                      setState({
                        ...state,
                        visible: false,
                      });
                      pick?.(state.color);
                    }}
                  >
                    确 定
                  </button>
                </div>
              </React.Suspense>
            </div>
          </>
        }
      >
        <div className="border border-gray-400 p-1 cursor-pointer flex" onClick={()=>{
            setState({
              color,
              visible: true,
            });
          }}>
          <span className="w-4 h-4 round mx-2 my-1" style={{ backgroundColor: color }}></span>
          <span>{color}</span>
        </div>
      </Tooltip>
    </ClickAway>
  );
};
import { LayoutRenderer } from "@provider-app/page-visual-editor-engine/utils";
import React from "react";
import classnames from "classnames";
import {
  StageContext,
  StageContextRes,
} from "@provider-app/page-visual-editor-engine/utils/stage-context";
import { FiChevronDown, FiMinus } from "react-icons/fi";

import "./style.scss";

const outlineItemRenderer = (stageCtx: StageContextRes) => (nodeItem) => {
  const { id, children, layoutNodeItem, treeNodePath } = nodeItem;
  const depth = treeNodePath.length;
  const { label } = layoutNodeItem;
  const {
    hoveringPath,
    selectedPath,
    changeSelectedPath,
    changeHoveringPath,
  } = stageCtx;
  const isHovering = hoveringPath.join("") === treeNodePath.join("");
  const isSelected = selectedPath.join("") === treeNodePath.join("");
  const treeWrapperClasses = classnames([
    "text-gray-600",
    "tree-wrapper",
    isHovering && "hovering",
    isSelected && "selected",
  ]);

  return (
    <div
      key={id}
      className={treeWrapperClasses}
      onClick={(e) => {
        e.stopPropagation();
        changeSelectedPath(treeNodePath);
      }}
      onMouseOver={(e) => {
        e.stopPropagation();
        // if (hoveringPath.join("") === treeNodePath.join("")) return;
        changeHoveringPath(treeNodePath);
      }}
    >
      {label && (
        <div
          className="py-2 label"
          style={Object.assign({
            paddingLeft: depth * 15,
          })}
        >
          {children ? (
            <FiChevronDown className="mr-2 text-gray-400" />
          ) : (
            <FiMinus className="mr-2 text-gray-300" />
          )}
          {label}
        </div>
      )}
      {children && <div className="tree-node">{children}</div>}
    </div>
  );
};

export class OutlineTree extends React.Component {
  render() {
    const { layoutNodeInfo } = this.props;
    return (
      <StageContext.Consumer>
        {(stageCtx) => {
          return (
            <div className="outline-tree">
              <LayoutRenderer
                layoutNode={layoutNodeInfo}
                componentRenderer={outlineItemRenderer(stageCtx)}
              />
            </div>
          );
        }}
      </StageContext.Consumer>
    );
  }
}

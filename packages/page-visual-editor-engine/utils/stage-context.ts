import React from "react";
import { TreeNodePath } from ".";

export interface StageContextRes {
  hoveringPath: TreeNodePath
  selectedPath: TreeNodePath
  changeHoveringPath: (treeNodePath: TreeNodePath) => void
  changeSelectedPath: (treeNodePath: TreeNodePath) => void
}

/**
 * 平台提供给的上下文
 */
export const createStageCtx = (): StageContextRes => {
  let hoveringPath: TreeNodePath = [];
  let selectedPath: TreeNodePath = [];
  return { 
    selectedPath,
    hoveringPath,
    changeHoveringPath: (nextPath) => {
      hoveringPath = nextPath;
    },
    changeSelectedPath: (nextPath) => {
      selectedPath = nextPath;
    },
  };
};

export const StageContext = React.createContext<StageContextRes>();

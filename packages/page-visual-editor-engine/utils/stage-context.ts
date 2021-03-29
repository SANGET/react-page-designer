import React from "react";
import { TreeNodePath } from ".";

export interface StageContextRes {
  hoveringPath: TreeNodePath
  selectedPath: TreeNodePath
  stageWidth: number | string
  changeHoveringPath: (treeNodePath: TreeNodePath) => void
  changeSelectedPath: (treeNodePath: TreeNodePath) => void
  changeStageWidth: (stageWidth: number | string) => void
}

export const defaultStageWidth = 960;

/**
 * 平台提供给的上下文
 */
export const createStageCtx = (): StageContextRes => {
  let hoveringPath: TreeNodePath = [];
  let selectedPath: TreeNodePath = [];
  let stageWidth = defaultStageWidth;
  return { 
    selectedPath,
    hoveringPath,
    stageWidth,
    changeHoveringPath: (nextPath) => {
      hoveringPath = nextPath;
    },
    changeSelectedPath: (nextPath) => {
      selectedPath = nextPath;
    },
    changeStageWidth: (nextVal) => {
      stageWidth = nextVal;
    },
  };
};

export const StageContext = React.createContext<StageContextRes>();

import { TreeNodePath } from "../types";

/**
 * 获取自身在父级中的 idx 信息
 */
export const getItemIdx = (treeNodePath: TreeNodePath) => {
  return [...treeNodePath].pop();
};

/**
 * 获取 item 的父 idx 信息
 */
export const getItemParentIdx = (treeNodePath: TreeNodePath) => {
  const _ = [...treeNodePath];
  _.pop();
  return _;
};

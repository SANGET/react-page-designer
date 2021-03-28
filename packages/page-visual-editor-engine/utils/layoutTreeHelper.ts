/**
 * 操作嵌套数组的工具库
 */

import produce from "immer";
import { TreeNodePath } from ".";

interface NodeItem {
  body?: NodeItem[];
}

type TreeNode = NodeItem[];

interface GetItemFromTree {
  type: "get";
  locatedIndexOfTree: TreeNodePath;
}

interface SetItemToTree {
  type: "set";
  locatedIndexOfTree: TreeNodePath;
  spliceCount?: number;
  addItem?: any;
}

type TreeNodeHelperOptions = GetItemFromTree | SetItemToTree;

/**
 * 设置嵌套数组
 * @param treeNode 嵌套数组结构
 * @param treeNodePath
 * @param param2
 */
export function treeNodeHelper(
  treeNode: TreeNode,
  options: TreeNodeHelperOptions
) {
  const result = produce(treeNode, (treeNodeDraft) => {
    if (options.type === "get") {
      const { locatedIndexOfTree } = options;
      // currTreeNode 指 body 的内容
      const getTreeItemRecursive = (currDepth, currTreeNode: TreeNode) => {
        const currIdx = locatedIndexOfTree[currDepth];

        if (currDepth === locatedIndexOfTree.length - 1) {
          return currTreeNode[currIdx];
        }

        const nextDepthIdx = currDepth + 1;
        const nextTreeNode = currTreeNode[currIdx]?.body;

        if (nextTreeNode) {
          return getTreeItemRecursive(nextDepthIdx, nextTreeNode);
        }
      };

      return getTreeItemRecursive(0, treeNodeDraft);
    }

    if (options.type === "set") {
      const { locatedIndexOfTree, addItem, spliceCount = 0 } = options;
      // currTreeNode 指 body 的内容
      const setTreeItemRecursive = (currDepth, currTreeNode: TreeNode) => {
        const currIdx = locatedIndexOfTree[currDepth];

        if (currDepth === locatedIndexOfTree.length - 1) {
          // 找到目标
          const spliceParams: [number, number] = [currIdx, spliceCount];
          if (addItem) spliceParams.push(addItem);
          return Array.prototype.splice.apply(currTreeNode, spliceParams);
        }

        const nextDepthIdx = currDepth + 1;
        // const nextTreeNode = currTreeNode[currIdx]?.body;
        if(!currTreeNode[currIdx]) {
          currTreeNode[currIdx] = {};
        }
        if(!currTreeNode[currIdx].body) {
          // currTreeNode[currIdx] = { body: [] };
          Object.assign(currTreeNode[currIdx], {
            body: []
          });
        }

        setTreeItemRecursive(nextDepthIdx, currTreeNode[currIdx].body as TreeNode);
      };

      setTreeItemRecursive(0, treeNodeDraft);

      return treeNodeDraft;
    }

    return treeNodeDraft;
  });

  return result;
}

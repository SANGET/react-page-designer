import React, { useEffect, useState } from "react";
import { DataNode } from "antd/lib/tree";
import { MENUS_TYPE } from "@provider-app/provider-app-common/constants";
import { queryMenusListService } from "@provider-app/provider-app-common/services";

interface INode {
  title: string | React.ReactElement;
  name: string;
  key: string;
  id: string;
  pid: string;
  value?: string;
}
type IUseModuleList = () => [DataNode[], (searchValue?: string) => void];

const useModuleList: IUseModuleList = () => {
  const [menuData, setModuleData] = useState<DataNode[]>([]);
  /**
   * 构造树组件所需结构
   * @param data 后端返回树结构
   */
  const constructTree = (data, searchValue?: string) => {
    const idMap = {};
    const jsonTree: INode[] = [];
    data.forEach((node: INode) => {
      node && (idMap[node.id] = node);
    });
    data.forEach((node: INode) => {
      if (node) {
        // eslint-disable-next-line no-param-reassign
        node.title = searchValue
          ? renderHighlightValue(node.name, searchValue)
          : node.name;
        // eslint-disable-next-line no-param-reassign
        node.key = node.id;
        node.value = node.id;
        const parent = idMap[node.pid];
        if (parent) {
          !parent.children && (parent.children = []);
          parent.children.push(node);
        } else {
          jsonTree.push(node);
        }
      }
    });
    return jsonTree;
  };
  /**
   * 渲染高亮（匹配搜索框）
   * @param name 菜单名
   */
  const renderHighlightValue = (
    name: string,
    searchValue: string
  ): React.ReactElement => {
    /** 如，以“爷”匹配“太爷爷1” */
    const nameSplit = name.split(searchValue);
    /** 则 nameSplit 为 ["太", "", "", "1"] */
    const nameSplitLength = nameSplit.length;
    const title =
      searchValue && nameSplitLength > 0 ? (
        <span>
          {nameSplit.map((item, index) => {
            if (item) {
              if (index === nameSplitLength - 1) {
                return <span key={index.toString()}>{item}</span>;
              }
              return (
                <span key={index.toString()}>
                  <span>{item}</span>
                  <span className="tree-search-value">{searchValue}</span>
                </span>
              );
            }
            if (index < nameSplitLength - 1) {
              return (
                <span key={searchValue} className="tree-search-value">
                  {searchValue}
                </span>
              );
            }
            return null;
          })}
        </span>
      ) : (
        <span>{name}</span>
      );
    return title;
  };
  /**
   * 获取菜单数据
   */
  const getModuleData = (searchValue?: string) => {
    queryMenusListService({
      type: MENUS_TYPE.MODULE,
      name: searchValue,
    }).then((res) => {
      const tree = constructTree(res?.result || [], searchValue);
      setModuleData(tree);
    });
  };
  useEffect(() => {
    getModuleData();
  }, []);
  return [menuData, getModuleData];
};

export default useModuleList;

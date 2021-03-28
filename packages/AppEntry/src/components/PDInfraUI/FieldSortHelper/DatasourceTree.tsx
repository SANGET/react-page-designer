import React from "react";
import { Tree, Input } from "antd";
import { FilterOutlined } from "@ant-design/icons";

type SelectedField = { fieldID: string; dsID: string };
type bindedField = { fieldID: string; dsID: string; sort: "ASC" | "DESC" };
interface Props {
  datasource: PD.TableDatasouce[];
  selectedFields: bindedField[];
  selectingFields: SelectedField[];
  onSelectFields: (fields: SelectedField[]) => void;
}
type State = {
  searchField: string;
  needFilterSys: boolean;
};
type BasicTreeData = {
  key: string;
  disabled: boolean;
  title: string;
  value: string;
  dsID: string;
};
type TreeData = BasicTreeData & {
  children: BasicTreeData[];
};
export class DatasourceTree extends React.Component<Props> {
  state: State = {
    searchField: "",
    needFilterSys: false,
  };

  constructTree = () => {
    const { datasource } = this.props;
    const treeList: TreeData[] = [];
    const decorativeChildTreeMap: { [key: string]: SelectedField } = {};
    datasource.forEach((ds) => {
      const { name, id, columns } = ds;
      const children = this.constructFields(columns);
      treeList.push({
        key: id,
        disabled: true,
        title: name,
        value: id,
        children,
        dsID: id,
      });
      Object.assign(
        decorativeChildTreeMap,
        this.constructChildrenToMap(children)
      );
    });
    return { treeList, decorativeChildTreeMap };
  };

  constructChildrenToMap = (
    children: BasicTreeData[]
  ): { [key: string]: SelectedField } => {
    const result = {};
    children.forEach((item) => {
      const { dsID, value } = item;
      result[`${value}`] = { dsID, fieldID: value };
    });
    return result;
  };

  constructFields = (columns: {
    [key: string]: PD.TableColumn;
  }): BasicTreeData[] => {
    const selectedFields = this.constructSelectedFields();
    return Object.values(columns).map((item) => ({
      value: item.id,
      key: item.id,
      title: item.name,
      disabled: `${item.dsID}.${item.id}` in selectedFields,
      species: item.species,
      dsID: item.dsID,
    }));
  };

  constructSelectedFields = () => {
    const { selectedFields } = this.props;
    const result = {};
    selectedFields?.forEach(({ dsID, fieldID, sort }) => {
      result[`${dsID}.${fieldID}`] = sort;
    });
    return result;
  };

  filterTree = (tree) => {
    const { needFilterSys, searchField } = this.state;
    return tree.map((ds) => {
      return {
        ...ds,
        children: ds.children.filter(
          (column) =>
            /** 过滤系统字段 */
            (!needFilterSys || !column.species.includes("SYS")) &&
            /** 根据用户输入进行过滤 */
            (!searchField || column.title?.toString().includes(searchField))
        ),
      };
    });
  };

  handleSearch = (searchField) => {
    this.setState({
      searchField,
    });
  };

  handleClickFilter = () => {
    this.setState({
      needFilterSys: !this.state.needFilterSys,
    });
  };

  render = () => {
    const { decorativeChildTreeMap, treeList } = this.constructTree();
    const { needFilterSys } = this.state;
    const treeDataDecorated = this.filterTree(treeList);
    return (
      <>
        <div className="w-full flex datasource-tree mb-2" id="datasourceTree">
          <Input.Search onSearch={this.handleSearch} />
          <FilterOutlined
            onClick={this.handleClickFilter}
            title={`${needFilterSys ? "隐藏" : "显示"}系统字段`}
            className={`filter p-2 cursor-pointer ${
              needFilterSys ? "" : "active"
            } border border-solid rounded`}
          />
        </div>
        <Tree
          selectedKeys={this.props.selectingFields.map((item) => item.fieldID)}
          onSelect={(_keys) => {
            this.props.onSelectFields(
              _keys.map((item) => decorativeChildTreeMap[item])
            );
          }}
          height={500}
          treeData={treeDataDecorated}
          multiple
          defaultExpandAll
        />
      </>
    );
  };
}

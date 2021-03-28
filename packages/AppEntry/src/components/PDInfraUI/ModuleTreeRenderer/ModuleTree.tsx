import React, {
  forwardRef
} from 'react';
import { Tree, Input } from 'antd';
import useModuleList from './useModuleList';

const SELECT_ALL = "all";

const { Search } = Input;

interface IProps {
  onSelect?: (selectedKeys: React.ReactText) => void;
}

const ModuleTree = forwardRef((props: IProps, ref: React.Ref<{reload: () => void}>) => {
  const { onSelect } = props;
  const [menusData, getModuleData] = useModuleList();
  return (
    <div>
      <Search
        allowClear
        style={{ marginBottom: 8 }}
        onSearch={(value) => {
          getModuleData(value);
        }}
      />
      <Tree
        treeData={menusData}
        onSelect={(selectedKeys, {
          selected
        }) => {
          console.log(selectedKeys);
          onSelect && onSelect(selected ? selectedKeys[0] : '');
        }}
      />
    </div>
  );
});
export default React.memo(ModuleTree);

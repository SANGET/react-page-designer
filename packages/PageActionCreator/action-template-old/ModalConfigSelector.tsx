import React, { useState, useEffect } from "react";
import {
  Tree,
  Table,
  Input,
  message as AntMessage,
  Button,
  ConfigProvider,
} from "antd";
import zhCN from "antd/es/locale/zh_CN";

const ShowTypeMenu = {
  1: "表格",
  2: "树形",
  3: "左树右表",
  4: "自定义",
};
const SelectTypeMenu = {
  1: "单选",
  2: "多选",
};

const TypeTree = ({ render }) => {
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const getSelectType = (showType) => {
    return [
      {
        title: "单选",
        value: `${showType}_selectType_1`,
        key: `${showType}_selectType_1`,
      },
      {
        title: "多选",
        value: `${showType}_selectType_2`,
        key: `${showType}_selectType_2`,
      },
    ];
  };
  const data = [
    {
      title: "表格",
      value: "showType_1",
      key: "showType_1",
      children: getSelectType("showType_1"),
    },
    {
      title: "树形",
      value: "showType_2",
      key: "showType_2",
      children: getSelectType("showType_2"),
    },
    {
      title: "左树右表",
      value: "showType_3",
      key: "showType_3",
      children: getSelectType("showType_3"),
    },
  ];
  const getRenderKeys = () => {
    return checkedKeys
      .filter((item) => {
        return /^showType_\d_selectType_\d$/.test(item.toString());
      })
      .map((item) => {
        const [showType, selectType] = item
          .toString()
          .replace(/showType_|selectType/g, "")
          .split("_");
        return { showType, selectType };
      });
  };
  return (
    <div className="clearfix">
      <Tree
        checkedKeys={checkedKeys}
        treeData={data}
        checkable={true}
        defaultExpandAll
        className="border border-gray-300 border-solid w-1/4 float-left"
        style={{ padding: "1rem" }}
        onCheck={(checkedKeysTmpl) => {
          if (Array.isArray(checkedKeysTmpl)) {
            setCheckedKeys(checkedKeysTmpl);
          } else {
            setCheckedKeys(checkedKeysTmpl.checked);
          }
        }}
      />
      {typeof render === "function" && render(getRenderKeys())}
    </div>
  );
};
type ModalRecord = {
  title: string;
  code: string;
  showType: string;
  selectType: string;
  id: string;
};
type TableConfig = {
  list: ModalRecord[];
  paging: { offset: number; size: number };
  total: number;
  title?: string;
};
type Param = {
  offset?: number;
  size?: number;
  title?: string;
};
const useList = (
  defaultParam = { offset: 0, size: 10 }
): [TableConfig, (param: Param) => void] => {
  const [dataList, setList] = useState<TableConfig>({
    list: [],
    paging: { offset: 0, size: 10 },
    total: 0,
    title: "",
    // types: [], TODO: 待确定
  });
  const getList = (param?: Param) => {
    const {
      size = dataList.paging.size,
      offset = dataList.paging.offset,
      title = dataList.title,
    } = param || {};
    $R_P
      .get({
        url: "/page/v1/popupwindows/enable",
        params: { size, offset, title, totalSize: true },
      })
      .then((res) => {
        if (res.code !== "00000") {
          AntMessage.error("弹窗模板列表数据请求错误，请联系技术人员");
        }
        setList({
          list: res.result.data,
          total: res.result.total,
          title,
          paging: { offset, size },
        });
      });
  };
  useEffect(() => {
    getList();
  }, []);
  return [dataList, getList];
};
const ModalList = ({ types, selectedModal, onSelect }) => {
  const [{ list, total }, setDataList] = useList();
  // useEffect(() => {
  //   setDataList({ types });
  // }, [types]);
  return (
    <div className="float-right w-3/4 pl-2 box-border">
      <Input.Search
        onSearch={(titleSearch) => {
          setDataList({ title: titleSearch });
        }}
      />
      <ConfigProvider locale={zhCN}>
        <Table
          scroll={{ y: 390 }}
          size="small"
          rowSelection={{
            columnWidth: 39,
            type: "radio",
            selectedRowKeys: [selectedModal],
            onSelect: (_r, selected, selectedRows) => {
              if (typeof onSelect !== "function") return;
              if (selected) {
                onSelect(selected ? _r.id : "");
              }
            },
          }}
          columns={[
            {
              title: "序号",
              width: 45,
              dataIndex: "order",
              align: "center",
              key: "order",
              render: (_t, _r, _i) => _i + 1,
            },
            {
              title: "弹窗标题",
              width: 150,
              dataIndex: "title",
              key: "title",
              ellipsis: { showTitle: true },
            },
            {
              title: "弹窗编码",
              width: 150,
              dataIndex: "code",
              key: "code",
              ellipsis: { showTitle: true },
            },
            {
              title: "展示类型",
              width: 65,
              dataIndex: "showType",
              key: "showType",
              render: (_t) => ShowTypeMenu[_t],
            },
            {
              title: "单选/多选",
              width: 75,
              dataIndex: "selectType",
              key: "selectType",
              render: (_t) => SelectTypeMenu[_t],
            },
          ]}
          dataSource={list}
          rowKey="id"
          onChange={({ current, pageSize }) => {
            setDataList({
              size: pageSize,
              offset: ((current || 1) - 1) * (pageSize || 10),
            });
          }}
          pagination={{
            pageSizeOptions: ["10", "20", "30", "40", "50", "100"],
            total,
            showQuickJumper: true,
            showSizeChanger: true,
          }}
        />
      </ConfigProvider>
    </div>
  );
};
export const ModalConfigSelector = ({ selectedModal, onSuccess, onCancel }) => {
  const [selectedKey, setSelectedKey] = useState(selectedModal);
  const handleClear = () => {
    setSelectedKey("");
  };
  const handleSuccess = () => {
    if (!selectedKey) {
      AntMessage.error("请选择一个弹窗模板");
      return;
    }
    getModalDetail();
  };
  const getModalDetail = () => {
    $R_P.get({ url: `/page/v1/popupwindows/${selectedKey}` }).then((res) => {
      if (res.code !== "00000") {
        return AntMessage.error("弹窗详情获取失败，请联系技术人员");
      }
      const { id, title, showType, selectType, selectCount } = res.result;
      const rest = {
        1: getTablePopDetail,
        2: getTreePopDetail,
        3: getTreeTablePopDetail,
      }[showType]?.(res.result);
      onSuccess(
        { ...rest, id, title, showType, selectType, selectCount },
        `弹窗：${title}`
      );
    });
  };
  /** 为弹窗的数据进行 表唯一标识 装饰 */
  const decorateColumnWithDs = (column, ds) => {
    if (Array.isArray(column)) {
      return column.map((item) => `${ds}.${item}`);
    }
    return `${ds}.${column}`;
  };
  const getTablePopDetail = (data) => {
    const {
      datasource,
      datasourceType,
      returnValue,
      returnText,
      sortColumnInfo,
      showColumn,
    } = data.tablePopupWindowDetail || {};
    return {
      ds: datasource,
      dsType: datasourceType,
      returnValue: decorateColumnWithDs(returnValue.split(","), datasource),
      returnText: decorateColumnWithDs(returnText.split(","), datasource),
      sortColumnInfo,
      showColumn: decorateColumnWithDs(showColumn.split(","), datasource),
    };
  };
  const getTreePopDetail = (data) => {
    const {
      datasource,
      datasourceType,
      returnValue,
      returnText,
      sortColumnInfo,
      showColumn,
      superiorColumn,
      relatedSuperiorColumn,
      showSearch,
    } = data.treePopupWindowDetail || {};
    return {
      ds: datasource,
      dsType: datasourceType,
      returnValue: decorateColumnWithDs(returnValue.split(","), datasource),
      returnText: decorateColumnWithDs(returnText.split(","), datasource),
      sortColumnInfo,
      showColumn: decorateColumnWithDs(showColumn.split(",")[0], datasource),
      superiorColumn: decorateColumnWithDs(
        superiorColumn.split(",")[0],
        datasource
      ),
      relatedSuperiorColumn: decorateColumnWithDs(
        relatedSuperiorColumn.split(",")[0],
        datasource
      ),
      showSearch: showSearch - 0,
    };
  };
  const getTreeTablePopDetail = (data) => {
    const {
      treeDatasource,
      treeDatasourceType,
      treeSortColumnInfo,
      treeShowColumn,
      treeSuperiorColumn,
      treeRelatedSuperiorColumn,
      showSearch,
      tableDatasource,
      tableDatasourceType,
      tableReturnValue,
      tableReturnText,
      tableSortColumnInfo,
      tableShowColumn,
      tableTreeRelatedColumn,
    } = data.treeTablePopupWindowDetail || {};
    return {
      treeDs: treeDatasource,
      treeDsType: treeDatasourceType,
      treeSortColumnInfo,
      treeShowColumn: decorateColumnWithDs(
        treeShowColumn.split(",")[0],
        treeDatasource
      ),
      treeSuperiorColumn: decorateColumnWithDs(
        treeSuperiorColumn.split(",")[0],
        treeDatasource
      ),
      treeRelatedSuperiorColumn: decorateColumnWithDs(
        treeRelatedSuperiorColumn.split(",")[0],
        treeDatasource
      ),
      showSearch: showSearch - 0,
      tableDs: tableDatasource,
      tableDsType: tableDatasourceType,
      tableReturnValue: decorateColumnWithDs(
        tableReturnValue.split(","),
        tableDatasource
      ),
      tableReturnText: decorateColumnWithDs(
        tableReturnText.split(","),
        tableDatasource
      ),
      tableSortColumnInfo,
      tableShowColumn: decorateColumnWithDs(
        tableShowColumn.split(","),
        tableDatasource
      ),
      tableTreeRelatedColumn,
    };
  };
  return (
    <>
      <TypeTree
        render={(types) => {
          return (
            <ModalList
              types={types}
              selectedModal={selectedKey}
              onSelect={(selectedKeyTmpl) => {
                setSelectedKey(selectedKeyTmpl);
              }}
            />
          );
        }}
      />
      <div className="flex">
        <span className="flex"></span>
        <Button className="mr-2" onClick={handleClear}>
          清空
        </Button>
        <Button className="mr-2" type="primary" onClick={handleSuccess}>
          确定
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </>
  );
};

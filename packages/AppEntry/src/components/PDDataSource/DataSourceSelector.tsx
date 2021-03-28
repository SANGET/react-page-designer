import React, { useState } from "react";
import { Tabs, Button, ConfigProvider } from "antd";
import { PlatformDatasource } from "@provider-app/platform-access-spec";
// import { wrapInterDatasource } from '../../services/datasource';
import zhCN from "antd/es/locale/zh_CN";
import { TableSelector } from "./TableSelector";
import { DictSelector } from "./DictSelector";
import { wrapInterDatasource } from "./utils";

const { TabPane } = Tabs;

interface SubmitItem {
  id: string;
  type: string;
}

interface DataSourceBinderProps {
  onSubmit: (
    submitItems: SubmitItem[],
    interDatasources: PlatformDatasource
  ) => void;
  bindedDataSources: { id: string; type: string; name: string }[];
  /** 是否单选 */
  single?: boolean;
  typeArea: ("TABLE" | "DICT")[];
  typeSingle?: boolean;
}
const tabPaneTitle = {
  TABLE: "数据表",
  DICT: "字典",
};
const tabPaneRenderer = (type, props) => {
  switch (type) {
    case "TABLE":
      return <TableSelector {...props} />;
    case "DICT":
      return <DictSelector {...props} />;
    default:
      return null;
  }
};
export const DataSourceSelector: React.FC<DataSourceBinderProps> = (props) => {
  const {
    bindedDataSources = [],
    single = false,
    typeSingle = false,
    typeArea,
    onSubmit,
  } = props;
  const [selectedInfo, setSelectedInfo] = useState(bindedDataSources);

  const handleSubmit = (type, data) => {
    data = data.map((item) => ({ ...item, type }));
    const filterByType = () => {
      return selectedInfo.filter((item) => item.type !== type);
    };
    if (!typeSingle) {
      setSelectedInfo([...filterByType(), ...data]);
      return;
    }
    setSelectedInfo(data);
  };
  return (
    <ConfigProvider locale={zhCN}>
      <div className="data-source-binder p20">
        {typeArea.length > 1 ? (
          <Tabs tabPosition="left">
            {typeArea.map((key) => (
              <TabPane tab={tabPaneTitle[key]} key={key}>
                {tabPaneRenderer(key, {
                  single,
                  defaultSelectedInfo: selectedInfo.filter(
                    (item) => item.type === key
                  ),
                  onSubmit: (dictData) => {
                    handleSubmit(key, dictData);
                  },
                })}
              </TabPane>
            ))}
          </Tabs>
        ) : (
          tabPaneRenderer(typeArea[0], {
            single,
            defaultSelectedInfo: selectedInfo.filter(
              (item) => item.type === typeArea[0]
            ),
            onSubmit: (dictData) => {
              handleSubmit(typeArea[0], dictData);
            },
          })
        )}
        <div className="flex mt-2">
          <span className="flex"></span>
          <Button
            onClick={(e) => {
              // const submitData = getItem(list, selectedRowKeys);
              wrapInterDatasource(selectedInfo).then(
                ({ remoteData, decorativeData }) => {
                  onSubmit(remoteData, decorativeData);
                }
              );
            }}
            type="primary"
          >
            确定
          </Button>
        </div>
      </div>
    </ConfigProvider>
  );
};

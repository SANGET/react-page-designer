import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Select } from "antd";
import React, { useEffect, useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string, params?: any) => void;
  metaCtx: PlatformCtx["meta"];
  pageState?: any;
  params?: any;
}
export const OpenSelectModalSimple: React.FC<IProps> = (props) => {
  const { insertValue, metaCtx, pageState, params } = props;

  // const [modalList, setmodalList] = useState<any[]>([]);
  // const [selectedModal, setselectedModal] = useState<string>();
  const [widget, setwidget] = useState<string>(params?.widget || "");

  const getAllModal = () => {
    // $R_P.get({
    //   url: `/page/v1/popupwindows?size=10000`,
    // }).then((res)=>{
    //   setmodalList(res.result?.data)
    // })
  };

  const createCode = () => {
    // $A_R.get('${window.$AppConfig.apiUrl}/paas/${$R_P.urlManager.currLessee}/${$R_P.urlManager.currApp}/page/v1/popupwindows/${selectedModal}').then((res)=>{})

    const template = `
/**
 * 弹窗选择
 */
HYCLIB.DataManager.openSelectModal({
    ...snippetParams,
    widget: '${widget}',
    $A_R: window.$A_R
}); `;

    insertValue(template, { widget });
  };

  useEffect(() => {
    // 初始化默认值
    getAllModal();
  }, []);

  const pageStateObj = pageState?.pageState || {};
  const widgetsObj = {};
  Object.keys(pageStateObj)?.forEach((key) => {
    if (
      key.indexOf("InState") !== -1 &&
      pageStateObj[key]?._info?.title &&
      pageStateObj[key]?._info?.widgetRef !== "FormButton"
    ) {
      widgetsObj[key] = pageStateObj[key];
    }
  });

  return (
    <div>
      {/* <div style={{ margin: "10px 0" }}>
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="选择弹窗"
          onChange={(val: string) => {
            setselectedModal(val);
          }}
        >
          {modalList?.map((modal) => (
            <Option value={modal.id} key={modal.id}>
              {modal.title}
            </Option>
          ))}
        </Select>
      </div> */}
      <div style={{ margin: "10px 0" }}>
        <div>弹窗回填控件：</div>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="选择控件"
          defaultValue={widget}
          onChange={(val: string) => {
            setwidget(val);
          }}
        >
          {Object.keys(widgetsObj)?.map((widgetId) => (
            <Option value={widgetId} key={widgetId}>
              {widgetsObj[widgetId]?._info?.title}
            </Option>
          ))}
        </Select>
      </div>
      <Button type="primary" onClick={createCode}>
        生成代码
      </Button>
    </div>
  );
};

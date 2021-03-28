import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Select } from "antd";
import React, { useEffect, useState } from "react";

const { Option } = Select;
interface IProps {
  insertValue: (lowCode: string) => void;
  metaCtx: PlatformCtx["meta"];
  pageState?: any;
  businessCodeParam: { pageId?: string; widgetId?: string };
}
export const OpenSelectModal: React.FC<IProps> = (props) => {
  const {
    insertValue,
    metaCtx,
    pageState,
    businessCodeParam: { pageId, widgetId },
  } = props;

  const [modalList, setmodalList] = useState<any[]>([]);
  const [selectedModal, setselectedModal] = useState<string>();
  const [widget, setwidget] = useState<string>("");

  const getAllModal = () => {
    $R_P
      .get({
        url: `/page/v1/popupwindows?size=10000`,
      })
      .then((res) => {
        setmodalList(res.result?.data);
      });
  };

  const createCode = () => {
    let detail: any = {};
    $R_P.get({ url: `/page/v1/popupwindows/${selectedModal}` }).then((data) => {
      console.log("弹窗详情", data);
      detail = data.result;
      const showColumns: { dataIndex: string; title: string }[] = [
        {
          dataIndex: detail.tablePopupWindowDetail?.returnValueInfo?.code,
          title: detail.tablePopupWindowDetail?.returnValueInfo?.name,
        },
      ];
      detail.tablePopupWindowDetail?.showColumnInfos?.forEach((column) => {
        showColumns.push({
          dataIndex: column.code,
          title: column.name,
        });
      });
      const template = `
let fields = [{field:"id"}];
if('${
        detail.tablePopupWindowDetail?.showColumnInfos[0]?.code ||
        detail.tablePopupWindowDetail?.returnValueInfo?.code
      }' !== "id"){
  fields.push({field:'${
    detail.tablePopupWindowDetail?.showColumnInfos[0]?.code ||
    detail.tablePopupWindowDetail?.returnValueInfo?.code
  }'})
}
$A_R.post(HYCCONFIG.SAAS.IP+'/hy/saas/${$R_P.urlManager.currLessee}/${
        $R_P.urlManager.currApp
      }/business/__${pageId}__${widgetId}',
  { "businesscode": "__${pageId}__${widgetId}",
    "steps": [
      {
        "function": {
          "code": "TABLE_SELECT",
          "params": {
            "table": "${
              detail.tablePopupWindowDetail?.dataSourceInfo?.dataSourceCode
            }",
            "fields":fields,
          }
        }
      }
    ]
  }
).then((res) =>{
  console.log("表格数据", res);
  snippetParams.container.setState(
    {
      HYModal_InState:{
        modal: {
          onOk: (data) => {
            snippetParams.container.setState(
              {
                ['${widget}']:{
                  ...snippetParams.container.state['${widget}'],
                  realVal: data[0].${
                    detail.tablePopupWindowDetail?.returnValueInfo?.code
                  }
                },
                HYModal_InState:
                {
                  ...snippetParams.container.state.HYModal_InState,
                  modal: {
                    visible: false
                  }
                }
              }
            );
          },
          onCancel: (data) => {
            snippetParams.container.setState(
              {
                HYModal_InState:
                {
                  ...snippetParams.container.state.HYModal_InState,
                  modal: {
                    visible: false
                  }
                }
              }
            );
          },
          visible: true,
          title: '${detail.title}',
        },
        source:{
          type: "table",
          dataSource: res?.result?.data,
          columns: ${JSON.stringify(showColumns)},
          tagColumn: '${detail.tablePopupWindowDetail?.returnValueInfo?.code}',
          rowSelection: {
            type: '${detail.selectType === 1 ? "checkbox" : "radio"}',
            count: 10,
          },
          selectedRows:[],
          pagination: {
            total: 10,
          },
          onRequest: (pagination) => {
            console.log(pagination);
          },
        }
      }
      
    }
  );
});

    `;

      insertValue(template);
    });
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
      <div style={{ margin: "10px 0" }}>
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
      </div>
      <div style={{ margin: "10px 0" }}>
        <div>参数回填控件：</div>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="选择控件"
          onChange={(val: string) => {
            setwidget(val);
          }}
        >
          {Object.keys(widgetsObj)?.map((id) => (
            <Option value={id} key={id}>
              {widgetsObj[id]?._info?.title}
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

import React from "react";
import { PopModelSelector } from "@provider-app/shared-ui";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { FieldSelector, SelectedField } from "./comp";

const takeBindColumnInfo = (selectedField: SelectedField) => {
  const { column, tableInfo } = selectedField;
  return `${tableInfo?.name}_${column?.name}`;
};

/** 属性项编辑的组件属性 */

const metaAttr = "schema";

/**
 * 绑定数据列
 */
@PropItem({
  id: "prop_field",
  label: "列",
  whichAttr: "field",
  useMeta: metaAttr,
})
export default class FieldHelperSpec {
  /**
   * 检查该 column 是否已经被其他控件绑定
   */
  checkColumnIsBeUsed = (
    _selectedField: SelectedField,
    schema
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const isBeUsed = Object.keys(schema).some((sID) => {
        const fieldCode = _selectedField.column?.fieldCode;
        return !fieldCode || sID.indexOf(fieldCode) !== -1;
      });
      if (isBeUsed) {
        reject();
        return;
      }
      resolve();
    });
  };

  render({
    editingWidgetState,
    changeEntityState,
    platformCtx,
  }: PropItemRenderContext) {
    const { changePageMeta, takeMeta } = platformCtx.meta;
    const currMetaRefID = editingWidgetState.field;
    const selectedField = takeMeta({
      metaAttr: "schema",
      metaRefID: currMetaRefID,
    }) as SelectedField;

    const schema = takeMeta({
      metaAttr: "schema",
    }) as {
      [sID: string]: SelectedField;
    };

    const datasource = takeMeta({
      metaAttr: "dataSource",
    });

    const interDatasources = Object.values(datasource);
    const getDsId = (param) => {
      return param?.tableInfo?.id;
    };
    const getColumnId = (param) => {
      return param?.column?.id;
    };
    const checkDiff = (prev, next) => {
      const prevDsColumn = getDsId(prev) + getColumnId(prev);
      const nextDsColumn = getDsId(next) + getColumnId(next);
      return prevDsColumn !== nextDsColumn;
    };

    return (
      <PopModelSelector
        modelSetting={{
          title: "绑定列",
          width: 900,
          children: ({ close }) => {
            return (
              <div>
                <FieldSelector
                  interDatasources={interDatasources}
                  defaultSelected={selectedField}
                  onSubmit={(_selectedField) => {
                    const prevMetaRefID = currMetaRefID;
                    const isDifferent = checkDiff(
                      selectedField,
                      _selectedField
                    );
                    if (!isDifferent) {
                      close();
                      return;
                    }
                    this.checkColumnIsBeUsed(_selectedField, schema)
                      .then(() => {
                        const nextMetaRefID = changePageMeta({
                          type: "create&rm",
                          data: _selectedField,
                          metaAttr: "schema",
                          // metaID: currMetaRefID,
                          // 将上一个 meta 删除
                          rmMetaID: prevMetaRefID,
                        });
                        changeEntityState({
                          attr: "field",
                          value: nextMetaRefID,
                        });

                        close();
                      })
                      .catch(() => {
                        platformCtx.ui.showMsg({
                          msg: "已被其他控件绑定",
                          type: "error",
                        });
                      });
                  }}
                />
              </div>
            );
          },
        }}
      >
        {currMetaRefID && selectedField
          ? takeBindColumnInfo(selectedField)
          : "点击绑定字段"}
      </PopModelSelector>
    );
  }
}

import React, { useState, useEffect } from "react";
import { message as AntMessage, TreeSelect } from "antd";
import { DropdownWrapper, Input } from "@provider-app/shared-ui";
import pick from "lodash/pick";
import {
  PropItemRenderContext,
  PlatformDatasource,
} from "@provider-app/platform-access-spec";

const takeTableInfo = (_tableInfo) => {
  return _tableInfo.name;
};
const realValDefault = "realValDefault";

interface OptionsSelectorProps extends PropItemRenderContext {
  whichAttr: string;
}
type DictChild = { name: string; code: string };

export const OptionsSelector: React.FC<OptionsSelectorProps> = (props) => {
  const {
    changeEntityState,
    whichAttr,
    editingWidgetState,
    platformCtx,
  } = props;

  const { changeDataSource, takeMeta } = platformCtx.meta;
  // 选项数据源的引用
  const DSOptionsRef = editingWidgetState[whichAttr] as string | undefined;
  const datasourceMeta =
    (DSOptionsRef &&
      (takeMeta({
        metaAttr: "dataSource",
        metaRefID: DSOptionsRef,
      }) as PlatformDatasource)) ||
    null;

  const dsBinder = (
    <div
      className="__label bg_default t_white cursor-pointer w-full mb10"
      onClick={(e) => {
        platformCtx.selector.openDatasourceSelector({
          defaultSelected: datasourceMeta ? [datasourceMeta] : [],
          modalType: "normal",
          position: "top",
          single: true,
          typeSingle: true,
          typeArea: ["TABLE", "DICT"],
          onSubmit: ({ close, interDatasources }) => {
            // 由于是单选的，所以只需要取 0
            const bindedDS = interDatasources[0];
            const nextMetaID = changeDataSource({
              type: "create&rm",
              rmMetaID: DSOptionsRef,
              data: bindedDS,
            });
            const changeList = [
              {
                attr: whichAttr,
                value: nextMetaID,
              },
            ];
            /** 需要相应清空 值字段，显示字段 */
            const newDsID = bindedDS.id;
            const oldDsID = editingWidgetState[whichAttr];
            if (newDsID !== oldDsID) {
              changeList.push(
                {
                  attr: "realValField",
                  value: bindedDS.type === "DICT" ? "code" : "",
                },
                {
                  attr: "showValField",
                  value: bindedDS.type === "DICT" ? "name" : "",
                },
                { attr: realValDefault, value: "" },
                { attr: "sortInfo", value: null }
              );
            }
            changeEntityState(changeList);
            close();
          },
        });
      }}
    >
      {datasourceMeta ? takeTableInfo(datasourceMeta) : "点击绑定"}
    </div>
  );

  /**
   * 获取排序字段的展示信息
   * @param dsInMeta
   * @param sortInfo
   */
  const takeSortInfo = (dsInMeta: [], sortInfo) => {
    const constructDs = () => {
      const result = {};
      dsInMeta?.forEach((ds) => {
        const { name: dsTitle, columns } = ds;
        Object.values(columns || {}).forEach((column) => {
          const { name: columnTitle, id: fieldID, dsID } = column;
          result[`${dsID}.${fieldID}`] = `${dsTitle}.${columnTitle}`;
        });
      });
      return result;
    };
    const titleMap = constructDs();
    return (
      sortInfo
        ?.map((item) => {
          const { dsID, fieldID, sort } = item;
          const title = titleMap[`${dsID}.${fieldID}`];
          const titleSort = { DESC: "降序", ASC: "升序" }[sort];
          return `${title}: ${titleSort}; `;
        })
        .join("") || ""
    );
  };
  /**
   * 排序字段的渲染器
   */
  const renderSortList = () => {
    const { sortInfo } = editingWidgetState;
    if (!datasourceMeta || datasourceMeta.type === "DICT") return null;
    return (
      <div className="mb10">
        <div className="prop-label mb5">排序字段</div>
        <div className="prop-content">
          <span
            className="__label bg_default t_white cursor-pointer w-full"
            onClick={() => {
              platformCtx.selector.openFieldSortHelper({
                defaultValue: sortInfo || [],
                datasource: [datasourceMeta],
                onSubmit: (sortInfoTmpl) => {
                  if (
                    !Array.isArray(sortInfoTmpl) ||
                    sortInfoTmpl.length === 0
                  ) {
                    sortInfoTmpl = null;
                  }
                  changeEntityState({
                    attr: "sortInfo",
                    value: sortInfoTmpl,
                  });
                },
              });
            }}
          >
            {sortInfo?.length > 0
              ? takeSortInfo([datasourceMeta], sortInfo)
              : "点击配置排序字段"}
          </span>
        </div>
      </div>
    );
  };
  const takeDictField = (dsMeta, fieldCode) => {
    if (!dsMeta) return "";
    const value = editingWidgetState[fieldCode];
    if (!value) return "点击进行字段配置";
    return dsMeta.columns[value]?.name || "";
  };
  /**
   * 值/显示 字段的渲染器
   */
  const renderField = ({ fieldCode, fieldTitle, defaultFieldInDict }) => {
    if (!datasourceMeta) return null;
    return (
      <div className="mb10">
        <div className="prop-label mb5">{fieldTitle}</div>
        <div className="prop-content">
          {datasourceMeta.type === "DICT" ? (
            <span className="__label bg_default t_white w-full">
              {defaultFieldInDict}
            </span>
          ) : (
            <DropdownWrapper
              className=" w-full"
              outside
              overlay={(helper) => {
                return (
                  <div className="column-selector-container">
                    {Object.values(datasourceMeta.columns || {}).map((col) => {
                      const { name, id } = col;
                      const isSelected = editingWidgetState[fieldCode] === id;
                      return (
                        <div
                          onClick={() => {
                            changeEntityState({
                              attr: fieldCode,
                              value: id,
                            });
                            helper.hide();
                          }}
                          className={`p1-1 list-item ${
                            isSelected ? "disabled" : ""
                          }`}
                          key={id}
                        >
                          {`${name}`}
                        </div>
                      );
                    }) || null}
                  </div>
                );
              }}
            >
              <span className="__label bg_default t_white cursor-pointer w-full">
                {takeDictField(datasourceMeta, fieldCode)}
              </span>
            </DropdownWrapper>
          )}
        </div>
      </div>
    );
  };
  const useChildList = (ds): [DictChild[]] => {
    const [childList, setChildList] = useState<{
      list: DictChild[];
      dictId: string;
      childId: string;
    }>({
      list: [],
      dictId: "",
      childId: "",
    });
    const constructList = (list) => {
      const id2DataMap = {};
      const result = [];
      list.forEach((item) => {
        const { id, code, name } = item;
        item.title = name;
        item.value = code;
        id2DataMap[id] = item;
      });
      list.forEach((item) => {
        const { pid, id, code, name } = item;
        if (pid) {
          const parent = id2DataMap[pid];
          parent.children = parent.children || [];
          parent.children.push(id2DataMap[id]);
        } else {
          result.push(id2DataMap[id]);
        }
      });
      return result;
    };
    const getListFailed = () => {
      AntMessage.error("获取字典详情信息失败，请联系技术人员");
      setChildList({
        list: [],
        dictId: childList.dictId,
        childId: childList.childId,
      });
    };
    const getChildList = (dictionaryId?: string, pid?: string) => {
      if (
        (dictionaryId === childList.dictId &&
          pid === childList.childId &&
          childList.list.length > 0) ||
        !dictionaryId
      )
        return;
      $R_P
        .get({ url: `/data/v1/dictionary_value/getData/${dictionaryId}` })
        .then((res) => {
          if (res?.code !== "00000") {
            getListFailed();
            return;
          }
          setChildList({
            list: constructList(res.result),
            dictId: dictionaryId,
            childId: "",
          });
        });
    };
    useEffect(() => {
      const [dictionaryId, pid] = (ds || "").split(".");
      getChildList(dictionaryId, pid);
    }, [ds]);
    return [childList.list];
  };
  const DictChildSelector = ({ ds }) => {
    const [childList] = useChildList(ds);
    return (
      <TreeSelect
        onChange={(value) => {
          changeEntityState({
            attr: realValDefault,
            value,
          });
        }}
        value={editingWidgetState[realValDefault]}
        treeData={childList}
        className="w-full"
        treeDefaultExpandAll
      />
      // <DropdownWrapper
      //   className=" w-full"
      //   outside
      //   overlay={(helper) => {
      //     return (
      //       <div className="column-selector-container">
      //         {childList?.map(({ name, code }) => {
      //           const isSelected = editingWidgetState[realValDefault] === code;
      //           return (
      //             <div
      //               onClick={() => {
      //                 if (isSelected) return;
      //                 changeEntityState({
      //                   attr: realValDefault,
      //                   value: code
      //                 });
      //                 helper.hide();
      //               }}
      //               className={`p1-1 list-item ${isSelected ? "disabled" : ""}`}
      //               key={code}>
      //               {`${name}`}
      //             </div>
      //           );
      //         }) || null}
      //       </div>
      //     );
      //   }}>
      //   <span className="__label bg_default t_white cursor-pointer w-full">
      //     {(editingWidgetState[realValDefault] &&
      //       childList?.find((item) => item.code === editingWidgetState[realValDefault])?.name) ||
      //       ""}
      //   </span>
      // </DropdownWrapper>
    );
  };
  /**
   * 默认值 的渲染器
   */
  const renderDefaultValue = () => {
    if (!datasourceMeta) return null;
    return (
      <div className="mb10">
        <div className="prop-label mb5">默认值</div>
        <div className="prop-content">
          {datasourceMeta.type === "DICT" ? (
            <DictChildSelector ds={datasourceMeta.id} />
          ) : (
            <Input
              className="w-full"
              value={editingWidgetState.realValDefault}
              onChange={(value) => {
                changeEntityState({
                  attr: "realValDefault",
                  value,
                });
              }}
            />
          )}
        </div>
      </div>
    );
  };
  return (
    <>
      <div>{dsBinder}</div>
      {renderField({
        fieldCode: "showValField",
        fieldTitle: "显示字段",
        defaultFieldInDict: "字典项名称",
      })}
      {renderField({
        fieldCode: "realValField",
        fieldTitle: "值字段",
        defaultFieldInDict: "字典项编码",
      })}
      {renderDefaultValue()}
      {renderSortList()}
    </>
  );
};

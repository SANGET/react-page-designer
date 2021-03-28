import React, { useState } from "react";
import classnames from "classnames";
import { Button } from "@provider-app/shared-ui";
import { PlatformColumn, PlatformDatasource } from "@provider-app/platform-access-spec";

/**
 * 已选中的字段
 */
export interface SelectedField {
  column?: PlatformColumn;
  tableInfo?: {
    id: string;
    name: string;
    type: string;
  };
}

/**
 * 字段选择器的 props
 */
interface FieldSelectorProps {
  defaultSelected?: SelectedField;
  interDatasources: PlatformDatasource;
  onSubmit: (col: SelectedField) => void;
}

/**
 * 字段选择器
 * @param param0
 */
export const FieldSelector: React.FC<FieldSelectorProps> = ({
  defaultSelected = {
    column: undefined,
    tableInfo: undefined,
  },
  interDatasources,
  onSubmit,
}) => {
  const [selectColInfo, setSelectCol] = useState<SelectedField>(
    defaultSelected
  );
  return (
    <div className="field-selector p-5">
      <div className="flex flex-wrap card-container">
        {interDatasources
          ?.filter((item) => item.createdBy.includes("page"))
          .map((datasourceItem) => {
            const { id, name, type, columns } = datasourceItem;

            return (
              <div className="group p-2 card-item" key={id}>
                <div className="title font-bold text-md">{name}</div>
                <div className="list p-2">
                  {(Object.values(columns) || [])?.map((col) => {
                    const { id: colID, name: colName } = col;
                    const isSelected = selectColInfo?.column?.id === colID;
                    const colItemClassname = classnames([
                      "col-item",
                      "cursor-pointer",
                      isSelected ? "text-red-600" : "text-gray-600",
                    ]);
                    return (
                      <div
                        onClick={(e) => {
                          setSelectCol({
                            column: col,
                            tableInfo: {
                              id,
                              name,
                              type,
                            },
                          });
                        }}
                        className={colItemClassname}
                        key={colID}
                      >
                        {colName}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
      {interDatasources.length === 0 && (
        <div onClick={(e) => {}}>还没有绑定数据源，请先绑定</div>
      )}
      <div className="flex">
        <span className="flex"></span>
        <Button
          disabled={!selectColInfo.column}
          onClick={(e) => {
            if (!selectColInfo.column) return;
            onSubmit?.(selectColInfo);
          }}
        >
          确定
        </Button>
      </div>
    </div>
  );
};

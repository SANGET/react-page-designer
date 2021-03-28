import React, { useState } from "react";
import { RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { DatasourceTree } from "./DatasourceTree";
import { SortFieldsList } from "./SortFieldsList";

type bindingField = { fieldID: string; dsID: string };
type bindedField = { fieldID: string; dsID: string; sort: "ASC" | "DESC" };
type Props = {
  onSubmit: (fields: bindedField[]) => void;
  bindedFields: bindedField[];
  bindedDs: PD.TableDatasouce[];
  onCancel: () => void;
};
export const FieldSortHelper: React.FC<Props> = ({
  onSubmit,
  bindedFields,
  bindedDs,
  onCancel,
}: Props) => {
  const [selectedFields, setSelectedFields] = useState<bindedField[]>(
    bindedFields
  );
  const [selectingFields, setSelectingFields] = useState<bindingField[]>([]);
  const handleTransfer = () => {
    if (selectingFields.length === 0) return;
    setSelectingFields([]);
    const selectingWithSort: bindedField[] = selectingFields.map((item) => ({
      ...item,
      sort: "DESC",
    }));
    setSelectedFields([...selectedFields, ...selectingWithSort]);
  };
  const decoateFieldsWithTitle = (fields) => {
    const constructDs = () => {
      const result = {};
      bindedDs?.forEach((ds) => {
        const { name: dsTitle, columns } = ds;
        Object.values(columns || {}).forEach((column) => {
          const { name: columnTitle, id: fieldID, dsID } = column;
          result[`${dsID}.${fieldID}`] = `${dsTitle}.${columnTitle}`;
        });
      });
      return result;
    };
    const titleMap = constructDs();
    return fields.map((item) => ({
      ...item,
      title: titleMap[`${item.dsID}.${item.fieldID}`],
    }));
  };
  const handleReset = () => {
    setSelectingFields([]);
    setSelectedFields([]);
  };
  const handleSubmit = () => {
    onSubmit(selectedFields);
  };
  return (
    <>
      <div className="flex field-sort-helper" id="fieldSortHelper">
        <div className="flex-1 border border-solid border-gray-400 p-2 h-full">
          <DatasourceTree
            selectingFields={selectingFields}
            selectedFields={selectedFields}
            onSelectFields={(fields) => {
              setSelectingFields(fields);
            }}
            datasource={bindedDs}
          />
        </div>
        <div
          className={`rounded border-solid border-gray-500 border w-8 h-8 cursor-pointer ml-5 mr-5 ${
            selectingFields.length > 0 ? "" : "disabled"
          }`}
          style={{ marginTop: 200 }}
          onClick={handleTransfer}
        >
          <RightOutlined className="ml-2" />
        </div>
        <div className="flex-1 border border-solid border-gray-400 p-2 h-full overflow-scroll">
          <SortFieldsList
            fields={decoateFieldsWithTitle(selectedFields)}
            onSortFields={(fields) => {
              setSelectedFields(fields);
            }}
          />
        </div>
      </div>
      <span className="flex mt-2">
        <span className="flex"></span>
        <Button onClick={handleReset} className="mr-2">
          清空
        </Button>
        <Button type="primary" onClick={handleSubmit} className="mr-2">
          确定
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </span>
    </>
  );
};

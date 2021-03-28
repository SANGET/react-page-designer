import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import Sortable from "sortablejs";
import { CloseCircleOutlined } from "@ant-design/icons";

type bindedField = {
  fieldID: string;
  dsID: string;
  sort: "ASC" | "DESC";
  title: string;
};
type Props = {
  fields: bindedField[];
  onSortFields: (fields: bindedField[]) => void;
};
export const SortFieldsList = ({ fields, onSortFields }: Props) => {
  const [sortContainer, setSortContainer] = useState<Sortable>();
  const handleChangeFieldSort = (sort, idx) => {
    const nextFields = [...fields];
    const item = nextFields.splice(idx, 1)[0];
    nextFields.splice(idx, 0, {
      ...item,
      sort,
    });
    onSortFields(nextFields);
  };

  const setupSortableItems = () => {
    const sortableListContainer = document.querySelector(
      "#sort-field-list"
    ) as HTMLElement;
    if (sortableListContainer) {
      return Sortable.create(sortableListContainer, {
        animation: 150,
        ghostClass: "blue-background-class",
        onSort(evt) {
          const { oldIndex = -1, newIndex = -1 } = evt;
          const nextFields = [...fields];
          const sortItem = nextFields.splice(oldIndex, 1);
          nextFields.splice(newIndex, 0, sortItem[0]);
          onSortFields(nextFields);
        },
      });
    }
    return undefined;
  };
  useEffect(() => {
    if (sortContainer) {
      sortContainer.destroy();
    }
    setSortContainer(setupSortableItems());
  }, [fields]);
  const handleRemoveField = (index) => {
    const nextFields = [...fields];
    nextFields.splice(index, 1);
    onSortFields(nextFields);
  };
  return (
    <div id="sort-field-list">
      {fields.map((item, idx) => {
        if (!item) return null;
        return (
          <span
            className="flex w-full bg_default mb-1 rounded cursor-move p-2"
            key={`${item.dsID}.${item.fieldID}`}
          >
            <span className="flex">{item.title}</span>
            <Switch
              checkedChildren="升序"
              unCheckedChildren="降序"
              checked={item.sort === "ASC"}
              onChange={(checked) =>
                handleChangeFieldSort(checked ? "ASC" : "DESC", idx)
              }
            />
            <CloseCircleOutlined
              className="ml-1 mr-1 pt-1"
              onClick={() => {
                handleRemoveField(idx);
              }}
            />
          </span>
        );
      })}
    </div>
  );
  // }
};

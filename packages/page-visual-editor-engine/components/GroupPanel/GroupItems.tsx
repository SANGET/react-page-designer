import React from "react";
import { GroupPanelItem } from ".";

export type ItemRendererType = (
  item: GroupPanelItem,
  groupType: string
) => JSX.Element | null;

export interface GroupItemsRenderProps {
  itemsGroups?;
  groupType: string;
  itemClasses: string;
  itemRenderer: ItemRendererType;
}

export const GroupItemsRender: React.FC<GroupItemsRenderProps> = ({
  itemClasses,
  itemsGroups,
  groupType,
  itemRenderer,
}) => {
  return (
    <>
      {Array.isArray(itemsGroups) &&
        itemsGroups.map((ig, idx) => {
          const { title: igTitle, items } = ig;
          let hasChild = false;
          const childItems =
            items &&
            items.map((item, _idx) => {
              const itemKey = `${idx}_${_idx}`;
              const renderRes = itemRenderer(item, groupType);
              if (renderRes) hasChild = true;
              return renderRes ? (
                <div className={`${itemClasses || ""} item mb-4`} key={itemKey}>
                  {renderRes}
                </div>
              ) : null;
            });
          return (
            <div key={`${groupType}_${idx}`} className="items-group">
              {hasChild ? (
                <>
                  <div className="group-title">{igTitle}</div>
                  <div className="items-content">{childItems}</div>
                </>
              ) : null}
            </div>
          );
        })}
    </>
  );
};

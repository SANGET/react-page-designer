/**
 * @author zxj
 *
 * 这里是画布与组件渲染的稳定抽象
 */

import React from "react";
import classnames from "classnames";
import { FiTrash2 } from "react-icons/fi";
import {
  DragItemComp,
  DragableItemWrapperFac,
} from "@provider-app/page-visual-editor-engine/spec";
import { TEMP_ENTITY_ID } from "@provider-app/platform-access-spec";
import { TempEntityTip } from "./TempEntityTip";
import { getWidgetComp, WidgetRenderer } from "../WidgetRenderer";
// import { PDCustomEditorLoader } from "../PDCustomEditorLoader";
// import { getWidgetMetadataSync } from "../../services";
import { PDDragableItemTypes } from "../../const";

const devEnv = process.env.NODE_ENV === "development";
const WidgetActionArea = ({
  id,
  treeNodePath,
  entity,
  className,
  extra,
  _noLayoutWrapper,
  ...other
}) => {
  // const devInfo = devEnv
  //   ? `{id: ${id}, treeNodePath: ${JSON.stringify(treeNodePath)}}`
  //   : "";
  const classes = classnames(["dragable-item-mask"], className);
  return (
    <div className={classes} {...other}>
      <div className="widget-label-info">{entity.label}</div>
      <div className="indicator"></div>
      <div className="tip-info">
        <div className="flex items-center pointer-events-none">
          {/* <div className="info tip-info-bg">
            {entity.label} {devInfo}
          </div> */}
          {extra && (
            <div className="tip-info-bg pointer-events-auto">{extra}</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 可拖动的组件实例的包装器
 */
export const PDdragableItemOfStageWrapper: DragableItemWrapperFac = ({
  onItemDrag,
  onItemDrop,
  onItemMove,
  onItemClick,
  onItemEnter,
  onDelete,
  getLayoutNode,
  getEntityProps,
  stageCtx,
  // getHoveringEntity, setHoveringEntity
}) => (propsForChild) => {
  const { id, idx, treeNodePath: _treeNodePath, children } = propsForChild;
  /** treeNodePath 由于变量被后来的覆盖了，需要采用不可变数据 */
  const treeNodePath = [..._treeNodePath];

  const { hoveringPath, selectedPath, changeHoveringPath } = stageCtx;
  // console.log(hoveringPath);

  const ctx = { idx, id, treeNodePath };
  const entityState = getEntityProps(ctx) || {};
  const currEntity = getLayoutNode(ctx);

  const isHovering = hoveringPath.join("") === treeNodePath.join("");
  const isSelected = selectedPath.join("") === treeNodePath.join("");

  if (!currEntity) return null;

  const classes = classnames(["dragable-item"]);

  // const updateCtx = {
  //   treeNodePath,
  //   entity: currEntity,
  // };
  const {
    _state,
    label,
    dragable,
    isContainer,
    deletable = true,
    acceptChildStrategy,
    widgetRef,
  } = currEntity;

  const isTempEntity = _state === TEMP_ENTITY_ID;
  if (isTempEntity) {
    return <TempEntityTip key={id} />;
  }

  // 通过远端获取组件
  const actionCtx = { entity: currEntity, idx, treeNodePath };
  let isLayout = false;
  let ComponentForDragItem;
  if (widgetRef === "FlexLayoutContainer") {
    isLayout = true;
    ComponentForDragItem = getWidgetComp("FlexLayoutContainer");
  }
  if (widgetRef === "FlexLayout") {
    ComponentForDragItem = getWidgetComp("FlexLayout");
    isLayout = true;
  }
  const widgetActionAreaClasses = classnames([
    isSelected && "selected",
    isHovering && "hovering",
  ]);
  // const isContainer = !!acceptChildStrategy;
  const dragItemType = acceptChildStrategy
    ? PDDragableItemTypes.containerWidget
    : PDDragableItemTypes.stageRealWidget;
  return (
    <DragItemComp
      key={id}
      wrapper={(child, wrapperCtx) => {
        const { classNames, ref } = wrapperCtx;
        // return ComponentForDragItem;
        return isLayout ? (
          <ComponentForDragItem
            ref={ref}
            className={classNames}
            {...entityState}
          >
            {child}
          </ComponentForDragItem>
        ) : (
          <div className={`__default_wrapper ${classNames}`} ref={ref}>
            {child}
          </div>
        );
      }}
      entityState={entityState}
      className={classes}
      treeNodePath={treeNodePath}
      sortable={true}
      dragable={isLayout ? false : dragable}
      onItemDrag={onItemDrag}
      // onItemHover={onItemHover}
      onItemDrop={onItemDrop}
      onItemMove={onItemMove}
      onItemEnter={onItemEnter}
      dragableWidgetType={currEntity}
      type={dragItemType}
      isContainer={isContainer}
      // canItemDrop={(dropType) => {
      //   return (
      //     dragItemType === PDDragableItemTypes.staticWidget &&
      //     dropType !== PDDragableItemTypes.staticWidget
      //   );
      // }}
      accept={[
        PDDragableItemTypes.containerWidget,
        PDDragableItemTypes.stageRealWidget,
        PDDragableItemTypes.staticWidget,
      ]}
    >
      {/* <WidgetRenderer entity={currEntity} entityState={entityState || {}}>
      {children}
    </WidgetRenderer> */}
      {/* <DrapItemWrapper
      id={id}
      treeNodePath={treeNodePath}
      currEntity={currEntity}
      onDelete={() => onDelete(actionCtx)}
      onClick={(e) => {
        e.stopPropagation();
        onItemClick(actionCtx);
      }}
    >
    </DrapItemWrapper> */}
      {/* <WidgetRenderer entity={currEntity} entityState={entityState || {}}>
        {children}
      </WidgetRenderer> */}
      <WidgetActionArea
        _noLayoutWrapper
        extra={
          deletable && (
            <div className="widget-action-area">
              <FiTrash2
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(actionCtx);
                }}
              />
            </div>
          )
        }
        className={widgetActionAreaClasses}
        onClick={(e) => {
          e.stopPropagation();
          onItemClick(actionCtx);
        }}
        onMouseEnter={(e) => {
          // onItemHover(treeNodePath);
          changeHoveringPath(treeNodePath);
        }}
        id={id}
        treeNodePath={treeNodePath}
        entity={currEntity}
      />

      {/* <WidgetRenderer entity={currEntity} entityState={entityState || {}}>
      {children}
    </WidgetRenderer> */}
      {isLayout ? (
        children
      ) : (
        <WidgetRenderer entity={currEntity} entityState={entityState || {}}>
          {children}
        </WidgetRenderer>
      )}
    </DragItemComp>
  );
};

const widgetPanelShape = {
  title: '控件类型',
  type: 'dragableItems',
  itemsGroups: [
    {
      title: '通用',
      type: 'general',
      items: []
    },
    {
      title: '表单控件',
      type: 'formController',
      items: []
    },
    {
      title: '表格控件',
      type: 'dataDisplay',
      items: []
    },
    {
      title: '布局控件',
      type: 'layout',
      items: []
    },
    {
      title: '未分组',
      type: '__ungroup__',
      items: []
    },
  ]
};

export const groupWidget = (widgetCollection) => {
  for (const widgetType in widgetCollection) {
    if (Object.prototype.hasOwnProperty.call(widgetCollection, widgetType)) {
      const widgetMeta = widgetCollection[widgetType];
      const { wGroupType } = widgetMeta;
      const shapeItem = widgetPanelShape.itemsGroups.find((item) => item.type === wGroupType);
      if(shapeItem) {
        shapeItem.items.push(widgetType);
      } else {
        widgetPanelShape.itemsGroups[widgetPanelShape.itemsGroups.length - 1].items.push(widgetType);
      }
    }
  }
  return widgetPanelShape;
};

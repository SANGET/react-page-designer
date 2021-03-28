
export const propItemGroupingShape: PropItemGrouping[] = [
  {
    title: '属性',
    type: 'property',
    itemsGroups: [
      {
        title: '基本属性',
        type: 'base',
        items: []
      },
      {
        title: '状态属性',
        type: 'state',
        items: []
      },
      {
        title: '数字属性',
        type: 'numb',
        items: []
      },
      {
        title: '控件校验',
        type: 'forum',
        items: []
      },
    ]
  },
  {
    title: '样式',
    type: 'stylesheet',
    itemsGroups: [
      {
        title: '样式属性',
        type: 'style_base',
        items: []
      },
    ]
  },
  {
    title: '数据',
    type: 'data',
    itemsGroups: [
    ]
  },
  // {
  //   title: '页面属性',
  //   itemsGroups: [
  //     {
  //       title: '基础控件',
  //       items: [
  //       ]
  //     },
  //   ]
  // },
];

export const groupPropItem = (propItemCollection) => {
  for (const propItemType in propItemCollection) {
    if (Object.prototype.hasOwnProperty.call(propItemCollection, propItemType)) {
      const widgetMeta = propItemCollection[propItemType];
      const { wGroupType } = widgetMeta;
      const shapeItem = propItemGroupingShape[0].itemsGroups.find((item) => item.type === wGroupType);
      if(shapeItem) {
        shapeItem.items.push(propItemType);
      } else {
        propItemGroupingShape[0].itemsGroups[propItemGroupingShape[0].itemsGroups.length - 1].items.push(propItemType);
      }
    }
  }
  return propItemGroupingShape;
};

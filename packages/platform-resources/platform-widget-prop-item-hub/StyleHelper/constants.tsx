export const WIDTH = {
  'px': 'px',
  '%': '%'
};

export const BLUR = {
  'px': 'px',
  '%': '%',
  'em': 'em'
};

export const OPACITY = {
  '%': '%',
};

export const BORDER_WIDTH = BLUR;
export const BORDER_STYLE = [
  { label: '点线', value: 'dotted', key: 'dotted' },
  { label: '虚线', value: 'dashed', key: 'dashed' },
  { label: '实线', value: 'solid', key: 'solid' },
];
export const MARGIN = {
  '24px': '超大 (24px)',
  '20px': '大 (20px)',
  '16px': '中 (16px)',
  '12px': '小 (12px)',
  '8px': '超小 (8px)',
  '0px': '无 (0px)'
};
export const UNIT = {
  'px': 'px',
  '%': '%',
  'em': 'em',
  'rem': 'rem'
};
export const CUSTOMED = 'customed';

export const MARGIN_OPTIONS = [
  { title: "上边距" },
  { title: "右边距" },
  { title: "下边距" },
  { title: "左边距" }
];

export const PADDING_OPTIONS = [
  { title: "上间距" },
  { title: "右间距" },
  { title: "下间距" },
  { title: "左间距" }
];
// h-shadow v-shadow blur spread color inset
export const SHADOW = {
  '4px 4px 15px 0px #1F3858': '大',
  '2px 2px 10px 0px #1F3858': '中',
  '1px 1px 4px 0px #1F3858': '小',
  '0px 0px 0px 0px #1F3858': '无',
};
export const NO_SHADOW = '0px 0px 0px 0px #1F3858';
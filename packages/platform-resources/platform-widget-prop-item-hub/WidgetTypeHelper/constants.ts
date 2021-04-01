import { IOptions }from"./interface";

export const WIDGET_TYPE_MENU: IOptions[] = [
  {
    label: "文本框",
    key: "FormInput",
    value: "FormInput"
  },
  {
    label: "多行文本框",
    key: "Textarea",
    value: "Textarea"
  },
  {
    label: "下拉框",
    key: "DropdownSelector",
    value: "DropdownSelector"
  },
  {
    label: "评分",
    key: "Rate",
    value: "Rate"
  },
  {
    label: "单选框",
    key: "001",
    value: "Radio"
  },
  {
    label: "多选框",
    key: "002",
    value: "Checkbox"
  },
  {
    label: "时间框",
    key: "003",
    value: "FormTimePicker"
  },
  {
    label: "数字框",
    key: "FormInputNumber",
    value: "FormInputNumber"
  },
  {
    label: "密码框",
    key: "004",
    value: ""
  },
  {
    label: "IP地址框",
    key: "005",
    value: ""
  },
];

export const FIELD_TYPE_MENU: IOptions[] = [
  {
    label: "字符串",
    key: "STRING",
    value: "STRING"
  }, {
    label: "数字",
    key: "INT",
    value: "INT"
  }, {
    label: "时间",
    key: "TIME",
    value: "TIME"
  }, {
    label: "日期",
    key: "DATE",
    value: "DATE"
  }, {
    label: "日期时间",
    key: "DATE_TIME",
    value: "DATE_TIME"
  }, {
    label: "超大文本",
    key: "TEXT",
    value: "TEXT"
  }, {
    label: "长整型",
    key: "LONG",
    value: "LONG"
  }
];

// export const WIDGET_FIELD_RELY: { [key: string]: IOptions[] } = {
//   STRING:[
//     {
//       label: "字符串",
//       key: "STRING",
//       value: "STRING"
//     },
//     {
//       label: "多行文本框",
//       key: "Textarea",
//       value: "Textarea"
//     },
//     {
//       label: "时间框",
//       key: "003",
//       value: ""
//     },
//     {
//       label: "数字框",
//       key: "FormInputNumber",
//       value: "FormInputNumber"
//     }
//   ],
//   DATE:[],
//   DATE_TIME:[],
//   INT:[],
// };

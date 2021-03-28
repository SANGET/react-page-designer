import { IOptions }from"./interface";
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

export const DATA_TYPE_MENU = {
  STRING: [
    {
      label: "",
      key: "NORMAL",
      value: "NORMAL",
    }, {
      label: "主键",
      key: "PK",
      value: "PK"
    }, {
      label: "引用",
      key: "QUOTE",
      value: "QUOTE"
    }, {
      label: "字典",
      key: "DICT",
      value: "DICT"
    }, {
      label: "外键",
      key: "FK",
      value: "FK"
    }, {
      label: "图片",
      key: "IMG",
      value: "IMG"
    }, {
      label: "视频",
      key: "VIDEO",
      value: "VIDEO"
    }, {
      label: "音频",
      key: "AUDIO",
      value: "AUDIO"
    }, {
      label: "文件",
      key: "FILE",
      value: "FILE"
    }
  ],
  INT: [
    {
      label: "",
      key: "NORMAL",
      value: "NORMAL",
    }, {
      label: "主键",
      key: "PK",
      value: "PK"
    }, {
      label: "引用",
      key: "QUOTE",
      value: "QUOTE"
    }, {
      label: "外键",
      key: "FK",
      value: "FK"
    }
  ],
  DATE: [
    {
      label: "",
      key: "NORMAL",
      value: "NORMAL",
    }, {
      label: "主键",
      key: "PK",
      value: "PK"
    }, {
      label: "引用",
      key: "QUOTE",
      value: "QUOTE"
    }, {
      label: "外键",
      key: "FK",
      value: "FK"
    }
  ],
  DATE_TIME: [
    {
      label: "",
      key: "NORMAL",
      value: "NORMAL",
    }, {
      label: "主键",
      key: "PK",
      value: "PK"
    }, {
      label: "引用",
      key: "QUOTE",
      value: "QUOTE"
    }, {
      label: "外键",
      key: "FK",
      value: "FK"
    }
  ],
  TIME: [
    {
      label: "",
      key: "NORMAL",
      value: "NORMAL",
    }, {
      label: "主键",
      key: "PK",
      value: "PK"
    }, {
      label: "引用",
      key: "QUOTE",
      value: "QUOTE"
    }, {
      label: "外键",
      key: "FK",
      value: "FK"
    }
  ],
  TEXT: [
    {
      label: "",
      key: "NORMAL",
      value: "NORMAL"
    }
  ]
};

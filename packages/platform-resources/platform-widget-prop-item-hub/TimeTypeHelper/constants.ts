import { IOptions }from"./interface";

const STRING = "string";
const STAMP = "stamp";
export const SHOW_TYPE_OPTIONS: IOptions[] = [
  { label: "时间戳", key: STAMP, value: STAMP },
  { label: "字符串", key: STRING, value: STRING },
];


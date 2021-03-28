import { IOptions }from"./interface";

const YEAR = "year";
const MONTH = "month";
const DATE = "date";
const WEEK = "week";
const TIME = "time";
const FULLTIME = "fullTime";
export const TIME_MODE_OPTIONS: IOptions[] = [
  { label: "年", key: YEAR, value: YEAR },
  { label: "月", key: MONTH, value: MONTH },
  { label: "年-月-日", key: DATE, value: DATE },
  { label: "周", key: WEEK, value: WEEK },
  { label: "时-分-秒", key: TIME, value: TIME },
  { label: "年-月-日 时-分-秒", key: FULLTIME, value: FULLTIME },
];


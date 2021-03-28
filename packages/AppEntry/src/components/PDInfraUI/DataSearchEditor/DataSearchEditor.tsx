import React from "react";
import { Table, Input, Button, TreeSelect, Select } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import { ValueHelper } from "@provider-app/page-designer-shared/ValueHelper";
import { checkExp } from "./util";

type Props = {
  platformCtx;
  fields;
  variableData;
  defaultValue;
  updateCurrentConfig;
  errorMsg;
};
type queryItem = {
  id: string;
  field?: string;
  condition?: string;
  realVal?: string;
  exp?: string;
  var?: string;
};
type State = {
  queryList: queryItem[];
  queryExp: string;
  decorativeExp: string;
};
const conditionMenu = [
  { label: "等于", key: "equ", value: "equ" },
  { label: "不等于", key: "notEqu", value: "notEqu" },
  { label: "大于", key: "greater", value: "greater" },
  { label: "小于", key: "less", value: "less" },
  { label: "大于等于", key: "greaterEqu", value: "greaterEqu" },
  { label: "小于等于", key: "lessEqu", value: "lessEqu" },
  // { label: "在...之间", key: "between", value: "between" },
  // { label: "不在...之间", key: "notBetween", value: "notBetween" },
  { label: "包含", key: "like", value: "like" },
  { label: "不包含", key: "notLike", value: "notLike" },
  // { label: "在...范围", key: "in", value: "in" },
  // { label: "不在...范围", key: "notIn", value: "notIn" },
  { label: "为空", key: "empty", value: "empty" },
  { label: "不为空", key: "notEmpty", value: "notEmpty" },
  { label: "开头是", key: "startWith", value: "startWith" },
  { label: "开头不是", key: "startNotWith", value: "startNotWith" },
];
export class DataSearchEditor extends React.Component<Props, State> {
  state: State = {
    queryList: [],
    queryExp: "",
    decorativeExp: "",
  };

  componentDidMount() {
    const { queryList, queryExp } = this.props.defaultValue || {};
    this.setState({
      queryList: this.initQueryList(queryList),
      queryExp: queryExp || "",
      decorativeExp: this.getDecorativeExp(queryExp),
    });
  }

  /** 初始化检索范围列表 */
  initQueryList = (queryList) => {
    queryList = queryList || [];
    if (queryList.length === 0) {
      /** 默认生成一行检索数据供用户填充，但是其实没有通知上级，所以不会记入真实数据 */
      return [{ id: `${nanoid(8)}` }];
    }
    return queryList;
  };

  /** 提供对表达式进行数字项的操作 */
  operateExp = (exp, fn) => {
    exp = exp || "";
    if (typeof fn !== "function") return exp;
    let expList: (string | number)[] = [];
    const getType = (element) => {
      if (!element) return "undefined";
      return /^\d$/.test(element) ? "number" : "string";
    };
    const getLastType = () => {
      return getType(expList[expList.length - 1]);
    };
    /** 将 exp 【[1]|[2]|[3]】 转成 ['[', 1, ']|[', 2, ']|[', 3, ']'] */
    exp.split("").forEach((item) => {
      const typeLastElement = getLastType();
      const typeCurrent = getType(item);
      if (typeLastElement === typeCurrent) {
        const last = expList[expList.length - 1];
        if (typeCurrent === "number") {
          expList[expList.length - 1] = last + item - 0;
        } else {
          expList[expList.length - 1] = last + item;
        }
      } else if (typeCurrent === "number") {
        expList.push(item - 0);
      } else {
        expList.push(item);
      }
    });
    /** 将 ['[', 1, ']|[', 2, ']|[', 3, ']'] 中的数据项，进行重新计算操作 */
    expList = expList.map((item) => {
      const type = typeof item;
      if (type !== "number") return item;
      return fn(item);
    });
    return expList.join("");
  };

  /**
   * 新增数据导致对表达式进行改动，
   * 类似于，[1]|[3]&[2]，所有对应项均有数据的情况下，现在在 序号1 的记录操作新增一行，则表达式应该更改为 [1]|[4]&[3]
   * 类似于，[1]|[3]&[2]，序号1 后的项无数据的情况下，现在在 序号1 的记录操作新增一行，则表达式应该更改为 [1]|[3]&[2]
   * 类似于，[1]|[3]&[2]，序号2 后的项无数据的情况下，现在在 序号1 的记录操作新增一行，则表达式应该更改为 [1]|[4]&[2]
   */
  getRealExpForDataPlus = (index, exp) => {
    const { queryList } = this.state;
    const realExp = this.operateExp(exp, (item) => {
      const moreThanIndex = item >= index;
      const notEmpty = this.isQueryListNotEmpty(
        queryList.slice(index + 1, item - 0 + 1)
      );
      return moreThanIndex && notEmpty ? item - 0 + 1 : item;
    });
    return realExp;
  };

  /**
   * 获取隐性表达式（真实能映射数据的，即逐项 -1，因为索引从 0 开始）
   * @param exp
   */
  getRealExp = (exp) => {
    const realExp = this.operateExp(exp, (item) => {
      return item - 1;
    });
    return realExp;
  };

  /** 获得显性表达式，即展示给配置人员使用的表达式 */
  getDecorativeExp = (exp) => {
    const realExp = this.operateExp(exp, (item) => {
      return item - 0 + 1;
    });
    return realExp;
  };

  /** 用户更改表达式 */
  handleChangeExp = (decorativeExp) => {
    this.setState(
      {
        queryList: this.state.queryList,
        /** 需要置换得出隐性表达式 */
        queryExp: this.getRealExp(decorativeExp),
        decorativeExp,
      },
      this.tellParent
    );
  };

  /**
   * 根据表达式，检查查询范围列表项是否符合配置
   * @param exp
   * @param fn
   */
  checkExpForList = (exp, fn) => {
    if (typeof fn !== "function") return false;
    let result = true;
    exp
      .replace(/[^\d]/g, "_")
      .split("_")
      .forEach((item) => {
        if (!result || !item) return;
        result = fn(item);
      });
    return result;
  };

  /** 判断某段检索范围列表项是否有配置 */
  isQueryListNotEmpty = (list) => {
    return list.some(
      (item) =>
        item &&
        (item.field ||
          item.condition ||
          item.realVal ||
          item.variable ||
          item.exp)
    );
  };

  /** 判断配置项是否都有符合配置 */
  isQueryItemFull = (item) => {
    return (
      item &&
      item.field &&
      item.condition &&
      (item.realVal || item.variable || item.exp)
    );
  };

  /** 对表达式，和 列表项（被表达式使用到的）的检查 */
  check = () => {
    const { queryExp, queryList } = this.state;
    const firstResult = checkExp(queryExp);
    if (!firstResult) {
      return "表达式拼写有误，将无法提交";
    }
    const secondResult = this.checkExpForList(queryExp, (item) => {
      return !!queryList[item];
    });
    if (!secondResult) {
      return "表达式引用错误，请检查";
    }
    const thirdResult = this.checkExpForList(queryExp, (item) => {
      return this.isQueryItemFull(queryList[item]);
    });
    if (!thirdResult) {
      return "表达式中的对应项，没有填写完整，请检查";
    }
    return "";
  };

  /** 用户新增数据 */
  handlePlus = (_i) => {
    const { queryList, queryExp } = this.state;
    const nextQueryList = queryList.slice();
    nextQueryList.splice(_i + 1, 0, { id: nanoid(8) });

    this.setState(
      {
        queryList: nextQueryList,
        /** 可能会对隐性表达式进行改动 */
        queryExp: this.getRealExpForDataPlus(_i, queryExp),
      },
      () => {
        /** 根据隐性表达式得出显性表达式 */
        this.setState({
          decorativeExp: this.getDecorativeExp(this.state.queryExp),
        });
        this.tellParent();
      }
    );
  };

  /** 用户删除数据 */
  handleMinus = (_i) => {
    const { queryList } = this.state;
    const nextQueryList = queryList.slice();
    nextQueryList.splice(_i, 1);

    this.setState(
      {
        queryList: nextQueryList,
      },
      this.tellParent
    );
  };

  /** 告知上级最新数据变化 */
  tellParent = () => {
    const { queryList, queryExp } = this.state;
    this.props.updateCurrentConfig({
      queryList,
      queryExp,
      errorMsg: this.check(),
    });
  };

  /** 用户更改列表项数据 */
  handleChange = (_i, changeArea) => {
    this.setState((prevState) => {
      const { queryList } = prevState;
      const nextQueryList = queryList.slice();
      nextQueryList[_i] = {
        ...nextQueryList[_i],
        ...changeArea,
      };
      return { queryList: nextQueryList };
    }, this.tellParent);
  };

  /** 清空列表项和表达式 */
  handleClear = () => {
    this.setState(
      {
        queryList: [{ id: nanoid(8) }],
        queryExp: "",
        decorativeExp: "",
      },
      this.tellParent
    );
  };

  render() {
    const { queryList, decorativeExp } = this.state;
    return (
      <>
        <Table
          size="small"
          pagination={false}
          columns={[
            {
              dataIndex: "order",
              key: "order",
              width: 40,
              title: "序号",
              render: (_t, _r, _i) => _i + 1,
            },
            {
              dataIndex: "field",
              key: "field",
              width: 200,
              title: "表字段",
              render: (_t, _r, _i) => (
                <>
                  <TreeSelect
                    allowClear
                    showSearch
                    className="w-full"
                    treeData={this.props.fields}
                    filterTreeNode={(valueFilter, node) => {
                      return (
                        (node?.title || "").toString().includes(valueFilter) ||
                        false
                      );
                    }}
                    onChange={(value) => {
                      this.handleChange(_i, { field: value });
                    }}
                    value={_t}
                  />
                </>
              ),
            },
            {
              dataIndex: "condition",
              key: "condition",
              width: 100,
              title: "条件",
              render: (_t, _r, _i) => (
                <>
                  <Select
                    className="w-full"
                    allowClear
                    showSearch
                    filterOption={(value, option) => {
                      return (
                        (option?.label || "").toString().includes(value) ||
                        false
                      );
                    }}
                    options={conditionMenu}
                    value={_t}
                    onChange={(value) => {
                      this.handleChange(_i, { condition: value });
                    }}
                  />
                </>
              ),
            },
            {
              dataIndex: "value",
              key: "value",
              width: 200,
              title: "值",
              render: (_t, _r, _i) => (
                <>
                  <ValueHelper
                    onChange={(value) => {
                      this.handleChange(_i, value);
                    }}
                    editedState={_r}
                    variableData={this.props.variableData}
                    platformCtx={this.props.platformCtx}
                  />
                </>
              ),
            },
            {
              dataIndex: "action",
              key: "action",
              width: 50,
              title: "操作",
              render: (_t, _r, _i) => (
                <>
                  <PlusOutlined
                    onClick={() => this.handlePlus(_i)}
                    className="mr-2"
                  />
                  {queryList.length > 1 ? (
                    <MinusOutlined onClick={() => this.handleMinus(_i)} />
                  ) : null}
                </>
              ),
            },
          ]}
          dataSource={queryList}
          rowKey="id"
        />
        <div className="flex my-2">
          <Input
            className="flex"
            placeholder="条件公式，例子：[1] & [2] & ( [3] | [4] )"
            value={decorativeExp}
            onChange={(e) => this.handleChangeExp(e.target.value)}
          />
          <Button type="primary" className="ml-2" onClick={this.handleClear}>
            清空
          </Button>
        </div>
      </>
    );
  }
}

/**
 * 检查表达式
 * @param exp 
 */
export const checkExp = (exp: string) => {
  /** 没有表达式则无需检查 */
  if(!exp) return true;
  /** 去掉所有空格 */
  exp = exp.replace(/\s/g, '');
  /** 获得第一个最小子括号 */
  const [left, right] = getFirstBrackets(exp);
  /** 括号应该成对存在 */
  if([left, right].filter(item=>item === -1).length === 1 ) return false;
  /** 如果没有括号，证明是纯表达式，走纯表达式的计算 */
  if(left === -1){
    const simpleExpResult = checkSimpleExp(exp);
    return simpleExpResult;
  }
  /** 计算括号内的表达式是否成立 */
  const firstExp = exp.substring(left + 1, right);
  const firstExpResult = checkSimpleExp(firstExp);
  /** 如果括号内的表达式成立，则继续计算外部表达式结果 */
  if(firstExpResult){
    /** 加 [1] 是为了不影响后续的结果，([1]|[2])&([3]|[4])=>[1]&([3]|[4]) */
    return checkExp(`${exp.substring(0, left)}[1]${exp.substring(right+1)}`);
  }
  return false;
};
/**
 * 计算表达式内的第一个括号
 * @param exp 
 */
const getFirstBrackets = (exp) => {
  const fistRighBrackets = exp.indexOf(')');
  let lastLeftBrackets = -1;
  if(fistRighBrackets !== -1){
    /** 应该从第一个右括号左边的最后一个左括号算起 */
    lastLeftBrackets = exp.lastIndexOf('(', fistRighBrackets);
  }else {
    lastLeftBrackets = exp.lastIndexOf('(');
  }
  return [lastLeftBrackets, fistRighBrackets];
};
/**
 * 检查普通表达式（即没有括号的表达式）的结果
 * @param exp 
 */
const checkSimpleExp = (exp) => {
  const fieldT = '\\[[1-9]?\\d+\\]';
  const relationT = '(\\||&)';
  return new RegExp(`^${fieldT}(${relationT}${fieldT})*$`).test(exp);
};
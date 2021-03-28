import at from "lodash/at";
import { LocatedIndexOfTree } from ".";

/**
 * 获取嵌套数据中的某个项的方法
 * @example
 *
 * nestingData = [{
 *  body: nestingData
 * }]
 *
 * @param nestingData 嵌套数据
 * @param nestingInfo 嵌套信息 [0, 1, 2]
 * @param nestingKey 嵌套节点的 key
 */
export const getItemFromNestingItems = <T>(
  nestingData: T[],
  nestingInfo: number[],
  nestingKey: string
): T => {
  if (!nestingInfo) {
    console.error(`需要传入 nestingInfo，否则不要调用此方法，请检查调用链路`);
  }

  const setArrByRecursive = (currDiveIdx, _nestingArr) => {
    const currNestIdx = nestingInfo[currDiveIdx];
    if ((currDiveIdx === (nestingInfo.length - 1))) {
      /**
       * 找到最后一个嵌套位置，并且将需要添加进去的元素添加进去
       */
      const targetItem = _nestingArr[currNestIdx];
      if (!targetItem) {
        return console.log(`${JSON.stringify(nestingData)}, 没有节点 ${nestingInfo}`);
      }
      return targetItem;
    } 
    const nextDiveIdx = currDiveIdx + 1;
    const nextArr = _nestingArr[currNestIdx][nestingKey];
    return setArrByRecursive(nextDiveIdx, nextArr);
    
  };
  const target = setArrByRecursive(0, nestingData);
  return target;
};
// export const getItemFromNestingItems = <T>(
//   nestingData: T[],
//   nestingInfo: number[],
//   nestingKey: string
// ): T => {
//   if (!nestingInfo) {
//     console.error(`需要传入 nestingInfo，否则不要调用此方法，请检查调用链路`);
//   }
//   const _nestingInfo = [...nestingInfo];
//   const targetItemIdx = _nestingInfo.pop() as number;

//   const containerIdx = _nestingInfo;

//   if(containerIdx.length === 0) {
//     return nestingData[targetItemIdx];
//   }
//   const sourceItemNestIdxStr = `[${containerIdx.join('][')}]`;
//   const targetItem = at(nestingData, [sourceItemNestIdxStr])[0];
//   if(targetItem[nestingKey]) {
//     const resData = targetItem[nestingKey][targetItemIdx];
//     return resData;
//   } 
//   console.error(`没找到嵌套的容器元素`, targetItem);
// };

export const getItemFromNestingItemsByBody = <T>(
  nestingData: T[],
  nestingInfo: LocatedIndexOfTree,
): T => {
  return getItemFromNestingItems(nestingData, nestingInfo, 'body');
};

import { LocatedIndexOfTree } from ".";
import { getItemFromNestingItemsByBody } from "./getItemFromNestingItem";

const log = (obj) => {
  obj ? console.log(JSON.parse(JSON.stringify(obj))) : console.log(obj);
};

export interface SetItem2NestingArrOptions {
  addItem?;
  spliceCount: number;
}

/**
 * 设置嵌套数组
 * @param nestingItemsArr 嵌套数组结构
 * @param nestingInfo
 * @param param2
 */
export function setItem2NestingArr(
  nestingItemsArr: any[],
  toNestingInfo: LocatedIndexOfTree,
  { addItem, spliceCount = 0 }: SetItem2NestingArrOptions
) {
  const _toNestingInfo = [...toNestingInfo];
  const parentNestingIdx = [..._toNestingInfo];
  const targetAddPosition = parentNestingIdx.pop() as number;
  if (parentNestingIdx.length === 0) {
    const spliceParams = [targetAddPosition, spliceCount] as [number, number];
    if (addItem) {
      spliceParams.push(addItem);
    }
    Array.prototype.splice.apply(nestingItemsArr, spliceParams);
  } else {
    const setArrByRecursive = (currDiveIdx, _nestingArr) => {
      const currNestIdx = toNestingInfo[currDiveIdx];
      if ((currDiveIdx === (toNestingInfo.length - 2))) {
        /**
         * 找到最后一个嵌套位置，并且将需要添加进去的元素添加进去
         */
        if (!_nestingArr || !_nestingArr[currNestIdx]) {
          return console.log(`没有节点 ${toNestingInfo}`);
        }
        if(!_nestingArr[currNestIdx].body) {
          _nestingArr[currNestIdx].body = [];
        }
        const _spliceParams = [targetAddPosition, spliceCount] as [number, number];
        if (addItem) {
          _spliceParams.push(addItem);
        }
        Array.prototype.splice.apply(_nestingArr[currNestIdx].body, _spliceParams);
      } else {
        const nextDiveIdx = currDiveIdx + 1;
        const nextArr = _nestingArr[currNestIdx]?.body;
        setArrByRecursive(nextDiveIdx, nextArr);
      }
    };
    setArrByRecursive(0, nestingItemsArr);
    // log(nestingItemsArr);
  }

  return nestingItemsArr;
}

export interface SortingActionSwap {
  type: "swap";
  sourceItemNestIdx: LocatedIndexOfTree;
  swapItemNestIdx: LocatedIndexOfTree;
}

export interface SortingActionPull {
  type: "pull";
  sourceItemNestIdx: LocatedIndexOfTree;
  toNestIdx: LocatedIndexOfTree;
}

export interface SortingActionPut {
  /** 将元素推入到 */
  type: "put";
  /** 推入的容器 item 的 idx */
  putItemNestIdx: LocatedIndexOfTree;
  /** 源 item 的 idx */
  sourceItemNestIdx: LocatedIndexOfTree;
  /** 将要推入到 putItemNestIdx 的第几个 */
  putIdx: number;
}

export const moveItemInNestArray = (nestArray, sourceIdx, targetIdx, addItem) => {
  setItem2NestingArr(nestArray, sourceIdx, {
    spliceCount: 1,
  });
  setItem2NestingArr(nestArray, targetIdx, {
    addItem,
    spliceCount: 0,
  });
  // return swapItemInNestArray(
  //   draft,
  //   this.sourceDragItemIdx,
  //   this.draggingItemIdx
  // );
};

/**
 * 嵌套数组中的元素交换
 */
export const swapItemInNestArray = (nestArray, sourceIdx, targetIdx) => {
  // const sourceItemNestIdxStr = `[${sourceIdx.join("][")}]`;
  // const swapItemNestIdxStr = `[${targetIdx.join("][")}]`;
  // const swapSrcTempItem = at(nestArray, [sourceItemNestIdxStr]);
  // const swapTarTempItem = at(nestArray, [swapItemNestIdxStr]);
  const swapTarTempItem = getItemFromNestingItemsByBody(nestArray, targetIdx);
  const swapSrcTempItem = getItemFromNestingItemsByBody(nestArray, sourceIdx);

  setItem2NestingArr(nestArray, targetIdx, {
    addItem: swapSrcTempItem,
    spliceCount: 1,
  });

  setItem2NestingArr(nestArray, sourceIdx, {
    addItem: swapTarTempItem,
    spliceCount: 1,
  });

  return nestArray;
};

/**
 * 将元素推入嵌套数组中
 */
export const putItemInNestArray = (nestArray, sourceIdx, parentIdx, putIdx) => {
  // const sourceItemNestIdxStr = `[${sourceIdx.join("][")}]`;
  const swapSrcTempItem = getItemFromNestingItemsByBody(nestArray, sourceIdx);
  // at(nestArray, [sourceItemNestIdxStr]);

  setItem2NestingArr(nestArray, sourceIdx, {
    spliceCount: 1,
  });

  const srcPlaceIdx = [...parentIdx, putIdx];

  setItem2NestingArr(nestArray, srcPlaceIdx, {
    addItem: swapSrcTempItem,
    spliceCount: 0,
  });

  return srcPlaceIdx;
};

/**
 * 将元素推拉出嵌套数组
 */
export const pullItemInNestArray = (nestArray, sourceIdx, toIdx) => {
  // const sourceItemNestIdxStr = `[${sourceIdx.join("][")}]`;
  // const swapSrcTempItem = at(nestArray, [sourceItemNestIdxStr]);
  const swapSrcTempItem = getItemFromNestingItemsByBody(nestArray, sourceIdx);

  setItem2NestingArr(nestArray, sourceIdx, {
    spliceCount: 1,
  });

  setItem2NestingArr(nestArray, toIdx, {
    addItem: swapSrcTempItem,
    spliceCount: 0,
  });
};

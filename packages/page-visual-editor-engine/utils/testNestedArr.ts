import produce from 'immer';
import { treeNodeHelper } from './layoutTreeHelper';

const mockData = [
  {
    id: "0",
  },
  {
    id: "1",
  },
  {
    body: [
      {
        id: "2,0",
      },
      {
        id: "2,1",
      },
      {
        id: "2,2",
      },
    ],
    id: "2",
  },
];

/** 测试 */
function testSort() {
  // const res1 = treeNodeHelper(mockData, {
  //   type: 'get',
  //   locatedIndexOfTree: [0]
  //   // spliceCount: 1
  // });
  // console.log(res1);
  // const res2 = treeNodeHelper(mockData, {
  //   type: 'get',
  //   locatedIndexOfTree: [2,1]
  //   // spliceCount: 1
  // });
  // console.log(res2);
  // const res3 = treeNodeHelper(mockData, {
  //   type: 'set',
  //   locatedIndexOfTree: [2,1, 2],
  //   addItem: { id: '2,1,2' }
  //   // spliceCount: 1
  // });
  // console.log(res3);
  const res4 = treeNodeHelper(mockData, {
    type: 'set',
    spliceCount: 1,
    locatedIndexOfTree: [2,1],
    // addItem: { id: '2,1,2' }
    // spliceCount: 1
  });
  console.log(res4);
}
function testPut2Container() {}

testSort();
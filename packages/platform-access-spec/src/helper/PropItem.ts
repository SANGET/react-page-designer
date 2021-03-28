// import deepmerge from 'deepmerge';
import { PropItemGroupingTypes } from '../grouping-register';
import { mergeDeep } from '../deepmerge';
import { PropItemMeta } from '..';

/**
 * 定义属性项的 decorator
 * @param propItemMeta 
 */
export const PropItem = (propItemMeta: PropItemMeta<PropItemGroupingTypes>): ClassDecorator => {
  const resData = { ...propItemMeta };
  // return target => {};
  return (SrouceClass: any): any => {
    // Reflect.defineMetadata('propItem', 'asdasd', SrouceClass);
    // Reflect.defineMetadata();
    // return SrouceClass;
    return mergeDeep<PropItemMeta>(resData, new SrouceClass(propItemMeta));
    // return Object.assign(resData, new SrouceClass());
  };
};

// type Constructor<T = any> = new (...args: any[]) => T;

// const Injectable = (): ClassDecorator => target => target;

// class OtherService {
//   a = 1;
// }

// @Injectable()
// class TestService {
//   constructor(public readonly otherService: OtherService) {}

//   testMethod() {
//     console.log(this.otherService.a);
//   }
// }

// const Factory = <T>(target: Constructor<T>): T => {
//   // 获取所有注入的服务
//   const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
//   console.log(providers);
//   const args = providers.map((provider: Constructor) => new provider());
//   return new target(...args);
// };

// Factory(TestService).testMethod(); // 1

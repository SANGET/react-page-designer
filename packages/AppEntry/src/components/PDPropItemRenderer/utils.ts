export type Constructor<T = any> = new (...args: any[]) => T;

export const Factory = <T>(target: Constructor<T>): T => {
  // 获取所有注入的服务
  const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
  console.log(providers);
  // const args = providers.map((provider: Constructor) => new provider());
  // return new target(...args);

};
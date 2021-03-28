import React from "react";

type AnyType =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | undefined;

type GetMessage = (
  object: AnyType,
  path: string | string[],
  deafultValue?: AnyType
) => AnyType;

type PErorMessage = {
  errors: AnyType;
  name: string | string[];
  component: string | React.ComponentType;
};

export const ErrorMessage = (props: PErorMessage) => {
  const { errors, name, component: Component } = props;
  const getMessage: GetMessage = (object, path, defaultValue) => {
    const data = (!Array.isArray(path)
      ? path.replace(/\[/g, ".").replace(/\]/g, "").split(".")
      : path
    ).reduce((o, k) => (o || {})[k], object);
    if (data !== undefined || defaultValue === undefined) {
      return data;
    }
    return defaultValue;
  };
  const message = getMessage(errors, name, "");
  return message ? <Component>{message}</Component> : null;
};

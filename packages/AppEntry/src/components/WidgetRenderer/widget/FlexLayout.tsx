import React from "react";
import classnames from "classnames";
import { Row, Col } from "antd";

interface FlexLayoutProps {
  width: React.CSSProperties["width"];
  span;
  className;
}

export const FlexLayout = React.forwardRef<any, FlexLayoutProps>(
  (props, ref) => {
    const { className, children, span, style } = props;
    let childArr = Array.isArray(children) ? children : [children];
    childArr = childArr.filter((i) => {
      return (
        !!i &&
        !i.props?._noLayoutWrapper &&
        Array.isArray(i) &&
        i.flat().length !== 0
      );
    });

    const hasChild = childArr.length > 0;
    const childClasses = classnames(["pb-4", className]);

    return (
      <Col
        ref={ref}
        span={span}
        className={childClasses}
        style={Object.assign({}, style, {
          minHeight: 60,
        })}
      >
        {children}
        {!hasChild && (
          <div className="bg_default h-full text-center leading-10 text-gray-500 border-gray-400 border">
            从左侧拖入组件
          </div>
        )}
      </Col>
    );
  }
);

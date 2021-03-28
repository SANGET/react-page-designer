import React from "react";
import classnames from "classnames";
import { Row, Col } from "antd";

interface FlexLayoutProps {
  width: React.CSSProperties["width"];
  span;
  className;
}

export const FlexLayoutContainer = React.forwardRef<any, FlexLayoutProps>(
  (props, ref) => {
    const { className, children, style } = props;

    const classes = classnames(["flex-layout-container", className]);
    return (
      <Row
        ref={ref}
        className={classes}
        style={Object.assign({}, style, {
          minHeight: 60,
        })}
      >
        {children}
      </Row>
    );
  }
);

import React from "react";
import classnames from "classnames";
import { Row, Col } from "antd";

interface FlexLayoutProps {
  width: React.CSSProperties["width"];
  span;
  className;
  horizontalGutter; verticalGutter
}

export const FlexLayoutContainer = React.forwardRef<any, FlexLayoutProps>(
  (props, ref) => {
    const { className, children, style, horizontalGutter, verticalGutter } = props;

    const classes = classnames(["flex-layout-container", className]);
    return (
      <Row
        gutter={[horizontalGutter || 0, verticalGutter || 0]}
        ref={ref}
        className={classes}
        style={Object.assign({}, style, {
          minHeight: 60,
          marginLeft: `${0 - horizontalGutter / 2}px`,
          marginRight: `${0 - horizontalGutter / 2}px`,
        })}
      >
        {children}
      </Row>
    );
  }
);

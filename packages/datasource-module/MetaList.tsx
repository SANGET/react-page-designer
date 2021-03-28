import React from "react";
import { Datasource } from "./interface";
import { getDSMetadata } from "./services";

interface MetaCreatorProps {}

interface MetaCreatorState {
  dsMeta: Datasource[];
}

export class MetaList extends React.Component<
  MetaCreatorProps,
  MetaCreatorState
> {
  state = {
    dsMeta: [] as Datasource[],
  };

  componentDidMount() {
    getDSMetadata().then((res) => {
      this.setState({
        dsMeta: res,
      });
    });
  }

  render() {
    const { dsMeta } = this.state;
    return (
      <div className="meta-creator">
        <div className="meta-list">
          {dsMeta.map((metaItem) => {
            const {
              name,
              reqSchema,
              resourcePath,
              resourceType,
              desc,
              type,
              resSchema,
            } = metaItem;
            return <div className="meta-item">{name}</div>;
          })}
        </div>
      </div>
    );
  }
}

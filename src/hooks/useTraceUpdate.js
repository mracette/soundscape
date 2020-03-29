/* eslint-disable react-hooks/rules-of-hooks */

import React from "react";

export const useTraceUpdate = (enabled, componentName, props) => {
  if (enabled) {
    const prev = React.useRef(props);
    React.useEffect(() => {
      const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
        if (prev.current[k] !== v) {
          ps[k] = [prev.current[k], v];
        }
        return ps;
      }, {});
      if (Object.keys(changedProps).length > 0) {
        console.log(componentName, " updated: ", changedProps);
      }
      prev.current = props;
    });
  }
};

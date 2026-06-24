/* eslint-disable react-hooks/rules-of-hooks */

import { useRef, useEffect } from "react";

export const useTraceUpdate = (
  enabled: boolean,
  componentName: string,
  props: Record<string, unknown>
) => {
  if (enabled) {
    const prev = useRef(props);
    useEffect(() => {
      const changedProps = Object.entries(props).reduce<
        Record<string, [unknown, unknown]>
      >((ps, [k, v]) => {
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

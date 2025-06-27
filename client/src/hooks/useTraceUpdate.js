import { useEffect, useRef } from "react";
import { devLog } from "../utils/Helpers";

function useTraceUpdate(props, log = true) {
  const prev = useRef(props);
  const changedProps = {};
  const propsDidChange = useRef({});
  useEffect(() => {
    for (const [k, v] of Object.entries(props)) {
      if (k == "component") continue; // Skip component name
      if (prev.current[k] !== v) {
        changedProps[k] = [prev.current[k], v];
        propsDidChange.current[`${k}Changed`] = true;
      } else {
        propsDidChange.current[`${k}Changed`] = false;
      }
    }
    if (Object.keys(changedProps).length > 0) {
      log &&
        devLog([
          `useTraceUpdate: Changed props in ${props.component || "component"}:`,
          changedProps,
        ]);
    } else {
      log &&
        devLog(
          `useTraceUpdate: No props changed in ${
            props.component || "component"
          }`
        );
    }
    prev.current = props;
  });
  return propsDidChange.current;
}

export { useTraceUpdate };

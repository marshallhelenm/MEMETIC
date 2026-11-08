import React, { createContext, ReactNode } from "react";
import useLayoutBreakpoint, { LayoutBreakpointState } from "../hooks/useLayoutBreakpoint";

export type LayoutContextValue = LayoutBreakpointState;

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

/**
 * Measures the viewport once for the whole app. useLayoutBreakpoint attaches
 * resize and DOM observers, so components read the result from here instead
 * of calling the hook themselves.
 */
function LayoutProvider({ children }: { children: ReactNode }) {
  const layout = useLayoutBreakpoint();
  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>;
}

export { LayoutContext, LayoutProvider };

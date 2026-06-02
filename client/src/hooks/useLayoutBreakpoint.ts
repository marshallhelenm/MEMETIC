import { useEffect, useMemo, useState } from "react";

export type LayoutTier = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface LayoutConfig {
  maxViewport: number;
  tier: LayoutTier;
  columnCount: number;
  dialogWidth: string;
}

export interface LayoutBreakpointState {
  viewportWidth: number;
  tier: LayoutTier;
  mobile: boolean;
  columnCount: number;
  columnWidth: number;
  boardWidth: number;
  dialogWidth: string;
}

const DEFAULT_VIEWPORT_WIDTH = 1280;
const MAIN_CONTENT_ID = "app-main";
const SIDEBAR_RESERVED_WIDTH = 65;
const BOARD_MAX_WIDTH = 1280;
const BOARD_COLUMN_GAP = 12;
const BOARD_HORIZONTAL_PADDING = 16;
const MIN_BOARD_WIDTH = 100;
const MIN_CARD_WIDTH = 80;

const LAYOUT_CONFIGS: LayoutConfig[] = [
  { maxViewport: 639, tier: "xs", columnCount: 1, dialogWidth: "230px" },
  { maxViewport: 767, tier: "sm", columnCount: 2, dialogWidth: "300px" },
  { maxViewport: 1023, tier: "md", columnCount: 3, dialogWidth: "400px" },
  { maxViewport: 1279, tier: "lg", columnCount: 4, dialogWidth: "500px" },
  { maxViewport: 1535, tier: "xl", columnCount: 5, dialogWidth: "700px" },
  {
    maxViewport: Number.POSITIVE_INFINITY,
    tier: "2xl",
    columnCount: 6,
    dialogWidth: "800px",
  },
];

const getLayoutConfig = (viewportWidth: number): LayoutConfig => {
  return (
    LAYOUT_CONFIGS.find((config) => viewportWidth <= config.maxViewport) ??
    LAYOUT_CONFIGS[LAYOUT_CONFIGS.length - 1]
  );
};

const getInitialViewportWidth = (): number => {
  if (typeof window === "undefined") return DEFAULT_VIEWPORT_WIDTH;
  return window.innerWidth;
};

const getMainContentWidth = (): number => {
  if (typeof window === "undefined") return DEFAULT_VIEWPORT_WIDTH;

  // Reserve space for the collapsed sidebar rail.
  return Math.max(MIN_BOARD_WIDTH, window.innerWidth - SIDEBAR_RESERVED_WIDTH);
};

function useLayoutBreakpoint(): LayoutBreakpointState {
  const [viewportWidth, setViewportWidth] = useState<number>(getInitialViewportWidth);
  const [contentWidth, setContentWidth] = useState<number>(getMainContentWidth);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const measureLayout = () => {
      setViewportWidth(getInitialViewportWidth());
      setContentWidth(getMainContentWidth());
    };

    const scheduleMeasure = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = null;
        measureLayout();
      });
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);

    let observer: ResizeObserver | null = null;
    let observedMain: Element | null = null;

    const attachMainObserver = () => {
      const nextMain =
        document.getElementById(MAIN_CONTENT_ID) ?? document.querySelector("main");
      if (nextMain === observedMain) return;

      observer?.disconnect();
      observedMain = nextMain;
      if (observedMain) {
        observer = new ResizeObserver(scheduleMeasure);
        observer.observe(observedMain);
      }
      scheduleMeasure();
    };

    attachMainObserver();

    const mutationObserver = new MutationObserver(attachMainObserver);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      observer?.disconnect();
      mutationObserver.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return useMemo(() => {
    const layout = getLayoutConfig(viewportWidth);
    const availableBoardWidth = Math.max(
      MIN_BOARD_WIDTH,
      Math.min(BOARD_MAX_WIDTH, contentWidth * 0.95)
    ); // Ensure board doesn't exceed max width or available content width, but has a minimum width for very small viewports.

    const boardInnerWidth = Math.max(
      MIN_BOARD_WIDTH - BOARD_HORIZONTAL_PADDING,
      availableBoardWidth - BOARD_HORIZONTAL_PADDING
    ); // Account for horizontal padding in board width calculations, ensuring a minimum inner width for card sizing.

    const totalGapWidth = BOARD_COLUMN_GAP * Math.max(0, layout.columnCount - 1); // Total width taken up by gaps between columns, ensuring no negative gap width when columnCount is 1.

    const columnWidth = Math.max(
      MIN_CARD_WIDTH,
      Math.floor((boardInnerWidth - totalGapWidth) / layout.columnCount)
    ); // Calculate column width by dividing available inner board width (after subtracting gaps) by column count, ensuring a minimum card width for usability on small screens.

    const boardWidth = Math.max(
      MIN_BOARD_WIDTH,
      columnWidth * layout.columnCount + totalGapWidth + BOARD_HORIZONTAL_PADDING
    ); // Calculate total board width by adding column widths, gaps, and horizontal padding, ensuring a minimum board width.


    return {
      viewportWidth,
      tier: layout.tier,
      mobile: layout.columnCount <= 2,
      columnCount: layout.columnCount,
      columnWidth,
      boardWidth,
      dialogWidth: layout.dialogWidth,
    };
  }, [contentWidth, viewportWidth]);
}

export default useLayoutBreakpoint;

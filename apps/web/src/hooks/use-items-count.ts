import { type RefObject, useLayoutEffect, useState } from "react";

interface UseItemsCountOptions {
  rowHeight: number;
  gap: number;
  minItems?: number;
  maxItems?: number;
}

function getColumnCount(width: number) {
  let count = 0;

  if (width >= 1536) {
    count = 4;
  } else if (width >= 1024) {
    count = 3;
  } else if (width >= 768) {
    count = 2;
  } else {
    count = 1;
  }

  return count;
}

export function useItemsCount(
  containerRef: RefObject<HTMLElement | null>,
  options: UseItemsCountOptions,
) {
  const { rowHeight, gap, minItems = 1, maxItems = 100 } = options;
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const top = container.getBoundingClientRect().top;
      const height = Math.max(1, window.innerHeight - top - 24);
      const rows = Math.max(1, Math.floor(height / (rowHeight + gap)));
      const columns = getColumnCount(window.innerWidth);

      const count = Math.min(maxItems, Math.max(minItems, rows * columns));
      setCount((prev) => (prev === count ? prev : count));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [containerRef, gap, maxItems, minItems, rowHeight]);

  return count;
}

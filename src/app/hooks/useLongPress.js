import { useRef, useState } from "react";

export default function useLongPress(onLongPress, delay = 500) {
  const timer = useRef(null);
  const [isPressing, setIsPressing] = useState(false);

  const start = () => {
    setIsPressing(true);
    timer.current = setTimeout(onLongPress, delay);
  };

  const cancel = () => {
    clearTimeout(timer.current);
    setIsPressing(false);
  };

  const preventMenu = (e) => {
    e.preventDefault();
  };


  return {
    isPressing,
    bind: {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
      onContextMenu: preventMenu
    }
  };
}
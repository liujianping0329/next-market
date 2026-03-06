import { useRef } from "react";

export default function useLongPress(onLongPress, delay = 350) {
  const timer = useRef(null);

  const start = () => {
    timer.current = setTimeout(onLongPress, delay);
  };

  const cancel = () => {
    clearTimeout(timer.current);
  };

  const preventMenu = (e) => {
    e.preventDefault();
  };


  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onContextMenu: preventMenu
  };
}
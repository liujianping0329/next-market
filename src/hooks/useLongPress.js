import {
    useCallback,
    useEffect,
    useRef,
} from "react";

const useLongPress = ({
    delay = 500,
    getPayload,
    onLongPress,
}) => {
    const timerRef = useRef(null);
    const getPayloadRef = useRef(getPayload);
    const onLongPressRef = useRef(onLongPress);

    useEffect(() => {
        getPayloadRef.current = getPayload;
        onLongPressRef.current = onLongPress;
    }, [getPayload, onLongPress]);

    const clearPress = useCallback(() => {
        clearTimeout(timerRef.current);
    }, []);

    const startPress = useCallback((e) => {
        clearPress();

        const payload = getPayloadRef.current?.(e);
        timerRef.current = setTimeout(() => {
            onLongPressRef.current?.(payload);
        }, delay);
    }, [clearPress, delay]);

    const preventContextMenu = useCallback((e) => {
        e.preventDefault();
    }, []);

    useEffect(() => clearPress, [clearPress]);

    return {
        onPointerDown: startPress,
        onPointerUp: clearPress,
        onPointerLeave: clearPress,
        onPointerCancel: clearPress,
        onContextMenu: preventContextMenu,
    };
};

export default useLongPress;

import { useRef } from 'react';

export default (timeout: number) => {
    const timerRef = useRef<NodeJS.Timeout>();

    const controller = new AbortController();

    const schedule = () => {
        timerRef.current = setTimeout(() => controller.abort(), timeout);
    };

    const clear = () => clearTimeout(timerRef.current);

    return {
        controller,
        schedule,
        timerRef,
        clear,
    };
};

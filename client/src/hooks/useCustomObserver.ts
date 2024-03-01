import {useEffect, useRef} from 'react';
import type { RefObject } from 'react';

const UseCustomObserver = (elementRef: RefObject<HTMLDivElement>, callback: () => void) => {
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        let timeout
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timeout = setTimeout(() => callback(), 300)
                    // callback()
                }
            });
        }, { threshold: 1});

        if (elementRef.current) {
            observer.current.observe(elementRef.current);
        }

        return () => {
            if (observer.current) {
                clearTimeout(timeout)
                observer.current.disconnect();
            }
        };
    }, [elementRef, callback]);
}

export default UseCustomObserver;
import {useEffect, useLayoutEffect, useRef} from 'react';
import type { RefObject } from 'react';

const UseCustomObserver = (elementRef: RefObject<HTMLDivElement>, callback: () => void) => {
    const observer = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timeout = setTimeout(() => {
                        callback()
                    }, 200)
                    // callback()
                }
            });
        }, { threshold: 1})

        if (elementRef.current) {
            observer.current.observe(elementRef.current)
        }

        return () => {
            if (observer.current) {
                clearTimeout(timeout)
                observer.current.disconnect()
            }
        };
    }, [elementRef, callback])
}

export default UseCustomObserver;


export const useCustomObservers = (elementRefs: HTMLDivElement[], callback: () => void) => {
    const observers = useRef<IntersectionObserver[]>([])

    useEffect(() => {
        // let timeouts: ReturnType<typeof setTimeout>[] = []

        elementRefs.forEach((elementRef, index) => {
            let observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // timeouts[index] = setTimeout(() => {
                        //     callback()
                        // }, 200)
                        callback()
                    }
                });
            }, { threshold: 1})

            if (elementRef) {
                observer.observe(elementRef)
            }

            observers.current.push(observer)
        })

        return () => {
            observers.current.forEach((obs, index) => {
                // clearTimeout(timeouts[index])
                obs.disconnect()
            })
        };
    }, [elementRefs.length, callback])
}
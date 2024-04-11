export const throttle = (callback: (...args: any[]) => void, delay: number) => {
    let lastCall = 0

    return function(...args: any[]) {
        const now = new Date().getTime()

        if (now - lastCall < delay) {
            return
        }

        lastCall = now
        callback(...args)
    }
}

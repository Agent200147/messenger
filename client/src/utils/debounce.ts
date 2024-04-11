export const debounce = (callback: (...args: any[]) => void, delay: number) => {
    let timeout: ReturnType<typeof setTimeout> | null

    return function(...args: any[]) {
        const later = () => {
            timeout = null
            callback(...args)
        }

        clearTimeout(timeout as NodeJS.Timeout)
        timeout = setTimeout(later, delay)
    }
}
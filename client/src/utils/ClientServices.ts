type variableType = string | {} | Array<any> | null | undefined
export const isEmpty = (variable: variableType): boolean => {
    if (typeof variable === 'string') return !variable
    if (Array.isArray(variable)) return !variable.length
    if (typeof variable === 'object' && variable !== null) return !Object.keys(variable).length
    return !variable
}

export const readChatMessages = async (chatId: number, recipientId: number) => {
    try {
        const response = await fetch(`${process.env.API_URL}/chats/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chatId, recipientId }),
            credentials: 'include',
        })
        return response.ok

    } catch (error) {
        return false
    }
}


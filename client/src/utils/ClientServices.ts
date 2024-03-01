// export const getChatMessages = async (chatId) => {
//     const response = await fetch(`${process.env.API_URL}/api/messages/${chatId}`, {
//         method: 'GET',
//         headers: {
//             Accept: 'application/json',
//         },
//         credentials: 'include',
//     })
//     return await response.json()
// }
//
// export const getUserById = async (userId) => {
//     const response = await fetch(`${process.env.API_URL}/api/user/find/${userId}`, {
//         method: 'GET',
//         headers: {
//             Accept: 'application/json',
//         },
//         credentials: 'include',
//     })
//     return await response.json()
// }
type variableType = string | {} | Array<any> | null | undefined
export const isEmpty = (variable: variableType): boolean => {
    if (typeof variable === 'string') return !variable
    if (Array.isArray(variable)) return !variable.length
    if (typeof variable === 'object' && variable !== null) return !Object.keys(variable).length
    return !variable
}
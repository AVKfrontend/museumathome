export async function getApiResponse(url) {
    try {
        const res = await fetch(url)
        const resObj = await res.json()
        return resObj
    } catch (err) {
        return err
    }
}
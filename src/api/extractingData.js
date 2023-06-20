import { getApiResponse } from './api.js'
export async function setListOfIds(categoryId, categoryUrl, getListOfIds) {
  if (!categoryId) return
  const resp = await getApiResponse(categoryUrl(categoryId))
  const list = await getListOfIds(resp)
  return list
}
export async function* getSamplesInfo(arrIds, sampleUrl, getSample) {
  for (let i = 0; i < arrIds.length; i++) {
    if (!arrIds[i]) continue
    const resp = await getApiResponse(sampleUrl(arrIds[i]))
    const normalisedResp = getSample(resp)
    yield { "ind": i, 'vol': normalisedResp }
  }
}

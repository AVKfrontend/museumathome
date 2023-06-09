import { getApiResponse } from './api.js'
export async function setListOfIds(categoryId, categoryUrl, getListOfIds) {
  if (!categoryId) return
  const resp = await getApiResponse(categoryUrl(categoryId))
  const list = await getListOfIds(resp)
  return list
}
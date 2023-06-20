import { euromuseums } from './europeana.js'
export const museums = {
  "99": {
    id: "99",
    m_name: 'The Metropolitan Museum of Art, New York, USA',
    urls: {
      background: "./img/met-museum-of-art.webp",
      categories: "https://collectionapi.metmuseum.org/public/collection/v1/departments",
      // search: "https://collectionapi.metmuseum.org/public/collection/v1/search",
      sample(numId) { return `https://collectionapi.metmuseum.org/public/collection/v1/objects/${numId}` },
      categoriesIDs(numID) {
        const url = new URL('https://collectionapi.metmuseum.org/public/collection/v1/objects')
        url.searchParams.set('departmentIds', numID)
        return url
      }
    },
    getCategories(catObj) {
      return catObj.departments.map(el => ({ "name": el.displayName, "id": el.departmentId }))
    },
    getListOfIds(respObj) {
      return respObj.objectIDs
    },
    getSample(respObj) {
      return { 'id': respObj.objectID, 'title': respObj.title, 'autor': respObj.artistDisplayName, 'img': respObj.primaryImage, 'key': respObj.objectID }
    }
  },
  "2": {
    id: "2",
    m_name: "Art Institute of Chicago, Chicago, USA",
    urls: {
      background: "./img/art-institute-chicago-exterior.jpg",
      categories: "https://api.artic.edu/api/v1/publications?fields=id,title",
      // search: "https://api.artic.edu/api/v1/artworks/search",
      sample(numId) { return `https://api.artic.edu/api/v1/artworks/${numId}?fields=id,title,image_id,artist_display` },
      categoriesIDs(numID) {
        const url = new URL('https://api.artic.edu/api/v1/publications')
        url.searchParams.set('ids', numID)
        return url
      }
    },
    getCategories(catObj) {
      return catObj.data.map(el => ({ "name": el.title, "id": el.id }))
    },
    async getListOfIds(respObj) {
      const samplesIds = []
      const sectionList = respObj.data[0].section_ids
      async function* Converting(arrIds) {
        for (let i = 0; i < arrIds.length; i++) {
          const res = await fetch(`https://api.artic.edu/api/v1/sections/${arrIds[i]}`)
          const resObj = await res.json()
          yield resObj.data.artwork_id
        }
      }
      for await (const samId of Converting(sectionList)) {
        if (!samId || samplesIds.includes(samId)) continue
        samplesIds.push(samId)
      }
      return samplesIds
    },
    getSample(respObj) {
      const img = respObj.data.image_id ? `https://www.artic.edu/iiif/2/${respObj.data.image_id}/full/843,/0/default.jpg` : ''
      return { 'id': respObj.data.id, 'title': respObj.data.title, 'autor': respObj.data.artist_display, 'img': img, 'key': respObj.data.id }
    }
  },
  "3": {
    id: "3",
    m_name: "Europeana - European museums",
    urls: {
      background: './img/europeana__1_.webp',
      categories: 'static',
      sample(strId) { return `https://api.europeana.eu/record/${strId}.json?wskey=owhansore` },
      categoriesIDs(strId) { return `https://api.europeana.eu/record/v2/search.json?query=${strId}&wskey=owhansore&rows=200&start=1&media=true&reusability=open&profile=minimal` }
    },
    getCategories() { return euromuseums },
    getListOfIds(respObj) {
      const itemsObjs = respObj.items
      return itemsObjs.map(el => el.id)
    },
    getSample(respObj) {
      const title_0 = respObj.object.proxies?.[1].dcTitle?.en?.[0] ?? respObj.object.proxies?.[1].dcTitle?.def?.[0]
      const title = title_0 ?? Object.values(respObj.object.proxies?.[1].dcTitle)[0][0] ?? 'No title'
      const autor_0 = respObj.object.agents?.[0].foafName?.en?.[0] ?? respObj.object.agents?.[0].foafName?.def?.[0]
      const autor = autor_0 ?? respObj.object.agents?.[0].prefLabel?.en?.[0] ?? respObj.object.agents?.[0].prefLabel?.def?.[0] ?? ''
      const img = respObj.object.aggregations?.[0].edmIsShownBy ?? ''
      return { 'id': respObj.object.about, 'title': title, 'autor': autor, 'img': img, 'key': respObj.object.about }
    }
  }
}
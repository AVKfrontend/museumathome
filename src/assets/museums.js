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
      return { 'id': respObj.objectID, 'title': respObj.title, 'autor': respObj.artistDisplayName, 'img': respObj.primaryImage }
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
      return { 'id': respObj.data.id, 'title': respObj.data.title, 'autor': respObj.data.artist_display, 'img': img }
    }
  }
}
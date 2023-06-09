<template>
  <section class="samples">
    <Preloader v-if="!currentPage.length" />
    <ul v-else class="samples__list">
      <li v-for="sample in currentPage" class="samples__item">
        <h3 class="title samples__item-title">{{ sample.title }}</h3>
        <picture class="samples__picture">
          <img v-if="sample.pic" :src="sample.pic" @load="initEndOfLoad()" v-on:click="zoomImg" alt="">
          <Preloader v-else />
        </picture>
        <p class="samples__item-autor">{{ sample.autor }}</p>
      </li>
    </ul>
    <div class="pagination">
      <div>
        <button v-if="page > 1" @click="page--">Previous</button>
        <span>Page </span>
        <input v-model="page" type="text" size="5">
        <span> of {{ maxPage }}</span>
        <button v-if="page < maxPage" @click="page++">Next</button>
      </div>
      <label for="per-page">On page:
        <input v-model="samplesPerPage" id="per-page" type="number">
      </label>
    </div>
  </section>
</template>

<script>

import { getApiResponse } from '../api/api.js'
import Preloader from './Preloader.vue'
export default {
  loadEnd: null,
  zoomEnd: null,
  components: {
    Preloader
  },
  props: {
    samplesIdsList: {
      type: Array,
      default: []
    },
    sampleUrl: {
      type: Function
    },
    getSample: {
      type: Function
    }
  },
  emits: {},
  data() {
    return {
      samples: [],
      samplesPerPage: 6,
      page: 1,
      cashedPages: new Set()
    }
  },
  computed: {
    currentPageList() {
      const end = this.page * this.samplesPerPage
      return this.samplesIdsList.slice(end - this.samplesPerPage, end)
    },
    maxPage() {
      return Math.ceil(this.samplesIdsList.length / this.samplesPerPage)
    },
    currentPage() {
      const end = this.page * this.samplesPerPage
      return this.samples.slice(end - this.samplesPerPage, end)
    }
  },
  methods: {
    async setSamplesInfo() {
      for await (const sampObj of this.getSamplesInfo(this.currentPageList)) {
        this.samples.push(sampObj)
      }
      this.setPictures()
    },
    async *getSamplesInfo(arrIds) {
      for (let i = 0; i < arrIds.length; i++) {
        if (this.samples.find(el => el.id === arrIds[i])) continue
        const resp = await getApiResponse(this.sampleUrl(arrIds[i]))
        const normalisedResp = this.getSample(resp)
        yield normalisedResp
      }
    },
    async setPictures() {
      for (let i = 0; i < this.currentPage.length; i++) {
        if (this.currentPage[i].pic) continue
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.currentPage[i].pic = this.currentPage[i].img ? this.currentPage[i].img : '/src/assets/image-available-icon.webp'
        await new Promise(resolve => this.$options.loadEnd = resolve)
      }
      this.$options.loadEnd = null
      this.cashedPages.add(this.page)
    },
    initEndOfLoad() {
      if (this.$options.loadEnd instanceof Function) this.$options.loadEnd()
    },
    resizeCash(samplPerP, oldSamplPerP) {
      const currentSempleInd = (this.page - 1) * oldSamplPerP
      let maxCashedPage = 0
      while (this.cashedPages.has(maxCashedPage + 1)) {
        maxCashedPage++
      }
      const cashedSamplesNumber = maxCashedPage * oldSamplPerP
      const newCashedPagesNumber = Math.floor(cashedSamplesNumber / samplPerP)
      this.cashedPages.clear()
      for (let i = 1; i <= newCashedPagesNumber; i++) {
        this.cashedPages.add(i)
      }
      this.page = Math.floor(currentSempleInd / samplPerP) + 1
    },
    async zoomImg(even) {
      even.target.requestFullscreen()
    }
  },
  created() {
  },
  watch: {
    page(v) {
      if (this.cashedPages.has(v)) return
      this.setSamplesInfo()
    },
    samplesPerPage(V, oldV) {
      this.resizeCash(V, oldV)
    },
    samplesIdsList() {
      this.samples = []
      this.page = 1
      this.cashedPages.clear()
      this.setSamplesInfo()
    }
  }
}
</script>
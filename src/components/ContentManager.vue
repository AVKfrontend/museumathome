<template>
  <section class="samples">
    <div v-if="!currentPage.length" class="preloader-wrupper">
      <Preloader />
      <span class="preloader-wrupper__message">Please wait. Data is loading.</span>
    </div>
    <ul v-else class="samples__list">
      <TransitionGroup appear type="transition" name="scale">
        <li v-for="sample in currentPage" :key="sample.key" class="samples__item">
          <h3 class="title samples__item-title">{{ sample.title }}</h3>
          <picture class="samples__picture">
            <template v-if="!!sample.pic">
              <object v-if="picTypeIsPdf(sample.pic)" :data="sample.pic" @load="initEndOfLoad()" @error="initImgErr"
                width="100%" heigth="100%" v-on:click="zoomImg"></object>
              <img v-else :src="sample.pic" @load="initEndOfLoad()" @error="initImgErr" v-on:click="zoomImg"
                alt="Failed to load image">
            </template>
            <Preloader v-else />
          </picture>
          <p class="samples__item-autor">{{ sample.autor }}</p>
        </li>
      </TransitionGroup>
    </ul>
    <fieldset class="pagination" :disabled="blockInput">
      <div>
        <button v-if="page > 1" @click="page--">Previous</button>
        <span>Page </span>
        <input v-model.lazy.trim="page" type="text" size="6" @keydown.enter="bluring">
        <span> of {{ maxPage }}</span>
        <button v-if="page < maxPage" @click="page++">Next</button>
      </div>
      <label for="per-page">On page:
        <input v-model.trim="samplesPerPage" id="per-page" type="number">
      </label>
    </fieldset>
  </section>
</template>

<script>

import { getSamplesInfo } from '../api/extractingData.js'
import Preloader from './Preloader.vue'
export default {
  loadEnd: null,
  delay: 7000,
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
    },
    blockInput: {
      type: Boolean
    }
  },
  emits: {
    'unBlockUi': null
  },
  data() {
    return {
      samples: [],
      samplesPerPage: 6,
      page: 1,
      cashedPages: new Set()
    }
  },
  computed: {
    firstIndexOnNextPage() {
      return this.page * this.samplesPerPage
    },
    firstIndexOnPage() {
      return this.firstIndexOnNextPage - this.samplesPerPage
    },
    currentPageList() {
      return this.samplesIdsList.slice(this.firstIndexOnPage, this.firstIndexOnNextPage)
    },
    maxPage() {
      return Math.ceil(this.samplesIdsList.length / this.samplesPerPage)
    },
    currentPage() {
      return this.samples.slice(this.firstIndexOnPage, this.firstIndexOnNextPage)
    }
  },
  methods: {
    async setSamplesInfo() {
      const listForLoading = this.currentPageList.map(vol => (!this.samples.find(el => el.id === vol)) ? vol : null)
      for await (const respObj of getSamplesInfo(listForLoading, this.sampleUrl, this.getSample)) {
        this.samples[this.firstIndexOnPage + respObj.ind] = respObj.vol
      }
      this.setPictures()
    },
    async setPictures() {
      for (let i = 0; i < this.currentPage.length; i++) {
        if (!!this.currentPage[i].pic) continue
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.currentPage[i].pic = (!!this.currentPage[i].img) ? this.currentPage[i].img : '../../public/img/image-available-icon.webp'
        await new Promise(resolve => {
          this.$options.loadEnd = resolve
          setTimeout(resolve, this.$options.delay)
        })
      }
      this.$options.loadEnd = null
      this.cashedPages.add(this.page)
      this.$emit('unBlockUi')
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
    },
    bluring(event) {
      event.target.blur()
    },
    initImgErr(err) {
      console.log(err)
    },
    picTypeIsPdf(picUrl) {
      return picUrl.endsWith('pdf')
    }
  },
  created() {
  },
  watch: {
    page(v) {
      if (v > this.maxPage) {
        this.page = this.maxPage
        return
      }
      if (this.cashedPages.has(v)) return
      this.setSamplesInfo()
    },
    samplesPerPage(V, oldV) {
      this.resizeCash(V, oldV)
      this.setSamplesInfo()
    },
    samplesIdsList() {
      this.samples = this.samplesIdsList.map(el => ({ key: el }))
      this.page = 1
      this.cashedPages.clear()
      this.setSamplesInfo()
    },
  }
}
</script>
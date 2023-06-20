<template>
  <div class="app-box" :style="pic">
    <div class="content-wrupper">
      <header>
        <div class="container">
          <div class="wrapper">
            <div class="box">
              <img alt="MatH logo" class="logo" src="./assets/logo_m.svg" width="125" />
            </div>
            <div class="box">
              <p class="select-label">Choose a museum</p>
              <MuseumChoice :selected-museum="selectedMuseum" @museum-change="MuseumChange" />
            </div>
            <div class="box">
              <Transition type="transition" name="opacity">
                <div v-if="selectedMuseumObject?.urls?.categories">
                  <p class="select-label">Choose a category</p>
                  <DisplaySetting :category-id="selectedCategoryId" :start-category="$options.startCategory"
                    :categories-url="selectedMuseumObject.urls.categories"
                    :get-categories="selectedMuseumObject.getCategories" @category-change="CategoryChange" />
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div v-if="selectedMuseum > '0'" class="container">
          <hr class="line" />
          <h1 class="title main-title">{{ selectedMuseumObject.m_name }}</h1>
          <h2 class="title category-title">{{ selectedCategoryObject.name }}</h2>
          <h3 v-if="selectedCategoryObject.about" class="title category-title">{{ selectedCategoryObject.about }}</h3>
          <template v-if="selectedCategoryObject.name">
            <hr class="line" />
            <Transition appear type="transition" name="scale">
              <ContentManager :samples-ids-list="samplesIdsList" :sample-url="selectedMuseumObject.urls.sample"
                :get-sample="selectedMuseumObject.getSample" />
            </Transition>
          </template>
        </div>
      </main>
    </div>
    <footer id="footer" class="footer">
      <div class="container">
        <hr class="line" />
        <div class="footer-wrupper">
          <p class="autor"> Author:
            <a href="https://github.com/AVKfrontend">AVKfrontend</a>
          </p>
          <p class="instrument">Developed through <a href="https://ua.vuejs.org/">Vue.js 3</a></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import MuseumChoice from './components/MuseumChoice.vue'
import CategoryChoice from './components/CategoryChoice.vue'
import ContentManager from './components/ContentManager.vue'
import { setListOfIds } from './api/extractingData.js'
export default {
  components: {
    MuseumChoice,
    DisplaySetting: CategoryChoice,
    ContentManager
  },
  startCategory: '0',
  data() {
    return {
      selectedMuseumObject: {},
      selectedCategoryObject: {},
      samplesIdsList: []
    }
  },
  computed: {
    selectedMuseum() {
      return (this.selectedMuseumObject?.id || '0')
    },
    selectedCategoryId() {
      return (this.selectedCategoryObject?.id || '0')
    },
    pic() {
      return this.selectedMuseumObject?.urls?.background ? `background: url(${this.selectedMuseumObject.urls.background}) no-repeat center /cover` : ''
    },
    pageParam() {
      return { 'mus': this.selectedMuseum, 'cat': (this.selectedCategoryId || 0) }
    }
  },
  methods: {
    MuseumChange(newObj) {
      if (this.selectedMuseumObject === newObj) return
      this.selectedMuseumObject = newObj
      this.selectedCategoryObject = {}
    },
    CategoryChange(newObj) {
      this.selectedCategoryObject = newObj
    },
    async setSamplesIdsList() {
      this.samplesIdsList = await setListOfIds(
        this.selectedCategoryId,
        this.selectedMuseumObject.urls.categoriesIDs,
        this.selectedMuseumObject.getListOfIds
      )
    }
  },
  watch: {
    selectedCategoryId(v) {
      v != 0 ? this.setSamplesIdsList() : this.samplesIdsList = []
    },
    pageParam(v) {
      const url = new URL(document.URL)
      for (let p of Object.entries(v)) {
        url.searchParams.set(p[0], p[1])
      }
      window.history.pushState(null, '', url)
    }
  },
  created() {
    const url = new URL(document.URL)
    for (let p of url.searchParams) {
      if (p[0] === 'mus') this.selectedMuseumObject.id = p[1]
      if (p[0] === 'cat') this.$options.startCategory = p[1]
    }
  }
}
</script>

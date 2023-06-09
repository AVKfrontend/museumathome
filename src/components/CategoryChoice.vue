<template>
  <select v-model="category" @change="selectCategoryHendler" name="category" id="category">
    <option selected value="0">no-choiced</option>
    <option v-for="category in categories" :key="category.id" :value="category.id">
      {{ nameNormalise(category.name) }}
    </option>
  </select>
</template>

<script>
import { getApiResponse } from '../api/api'
export default {
  props: {
    categoriesUrl: {
      type: String
    },
    getCategories: {
      type: Function
    },
    startCategory: {
      type: String
    },
  },
  data() {
    return {
      categories: [],
      category: ''
    }
  },
  computed: {
  },
  methods: {
    async getCategoriesForDisplay(url) {
      const resp = await getApiResponse(url)
      this.categories = this.getCategories(resp)
    },
    nameNormalise(string) {
      return string.length < 45 ? string : string.slice(0, 43) + '...'
    },
    changeCategoryRequest() {
      const catObj = this.category == 0 ? {} : this.categories.find(el => el.id == this.category)
      this.$emit('category-change', catObj)
    },
    selectCategoryHendler(even) {
      this.category = even.target.value
    },
    async initPageParams() {
      await this.getCategoriesForDisplay(this.categoriesUrl)
      this.category = this.startCategory
    },
    async changePageParams() {
      await this.getCategoriesForDisplay(this.categoriesUrl)
      this.category = '0'
    }
  },
  watch: {
    categoriesUrl() {
      this.changePageParams()
    },
    category() {
      this.changeCategoryRequest()
    }
  },
  created() {
  },
  mounted() {
    this.initPageParams()
  }
}
</script>

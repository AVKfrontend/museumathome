<template>
  <select v-model="museumForSelect" @change="selectHendler" name="museum" id="museum" autofocus>
    <option selected value="0">no-choiced</option>
    <option v-for="museum in museumsList" :key="museum.id" :value="museum.id">{{ museum.m_name }}</option>
  </select>
</template>

<script>
import { museums } from '../assets/museums.js'
export default {
  props: {
    selectedMuseum: {
      type: String,
      required: true,
      default: '0'
    },
  },
  emits: {
    'museum-change': null
  },
  data() {
    return {
      museumForSelect: this.selectedMuseum
    }
  },
  computed: {
    museumsList() {
      return Object.values(museums) || []
    }
  },
  methods: {
    changeMuseumRequest() {
      this.$emit('museum-change', museums[this.museumForSelect])
    },
    selectHendler(ev) {
      this.museumForSelect = ev.target.value
      this.changeMuseumRequest()
    },
    initMuseumParam() {
      this.changeMuseumRequest()
    }
  },
  watch: {
  },
  created() {
    this.initMuseumParam()
  },
  mounted() {
  }
}

</script>
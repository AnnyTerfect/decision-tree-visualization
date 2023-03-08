<script setup>
import { ref, watch } from 'vue'
import { DecisionTree } from './utils/cart'
import MyCanvas from './components/MyCanvas.vue';
import MyNavDrawer from './components/MyNavDrawer.vue';

const drawer = ref(true)
const newLabel = ref(1)
const points = ref([])
const tree = ref({})

watch(() => points.value, () => {
  tree.value = learnTree()
}, { deep: true })

function generate(args) {
  let { num, featureRandom, labelRandom, noise } = args
  points.value = []
  for (let i = 0; i < num; i++) {
    let x, y, label
    if (featureRandom === 'uniform') {
      x = Math.random()
      y = Math.random()
    }

    if (labelRandom === 'uniform') {
      label = Math.random() > 0.5 ? 1 : 0
    }
    else if (labelRandom === 'linear') {
      label = y > Math.pow(x, 1) ? 1 : 0
    }
    else if (labelRandom === 'quadratic') {
      label = y - 1 / 4 > Math.pow(x, 2) ? 1 : 0
    }
    else if (labelRandom === 'cubic') {
      label = y > Math.pow(x, 3) ? 1 : 0
    }

    // add noise
    label =  Math.random() < noise ? 1 - label : label

    points.value.push({ cx: x, cy: y, label, moving: false })
  }
}

function learnTree() {
  let newTree = new DecisionTree()
  let X = points.value.map((point) => [point.cx, point.cy])
  let Y = points.value.map((point) => point.label)
  newTree.fit(X, Y)
  return newTree
}

function addPoint(point) {
  points.value.push(point)
}

function movePoint(args) {
  const { index, x, y } = args
  points.value[index].cx = x
  points.value[index].cy = y
}
</script>

<template>
  <v-app>
    <v-app-bar
      app
      dark
      clipped-left
      color="primary"
    >
      <v-toolbar-title>
        <v-btn
          icon
          dark
          @click.stop="drawer = !drawer"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-icon>mdi-tree</v-icon>
        <span class="ml-2">Tree</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>

    <my-nav-drawer
      :drawer="drawer"
      v-model:newLabel="newLabel"
      @generate="generate"
      @clean="points = []"
    />

    <v-main class="fixed left-0 right-0 top-0 bottom-0">
      <my-canvas
        :points="points"
        :r="10"
        :newLabel="newLabel"
        :tree="tree"
        @addPoint="addPoint"
        @movePoint="movePoint"
      />
    </v-main>
  </v-app>
</template>
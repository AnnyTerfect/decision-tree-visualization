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

    <v-layout>
      <v-navigation-drawer
        app
        fixed
        clipped
        class="w-400"
        width="400"
        v-model="drawer"
      >
        <v-card class="h-full pa-0">
          <v-card-title class="text-h5">
            Manual
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row class="text-lg text-black">
                <v-col cols="4">New Label</v-col>
                <v-col cols="8">
                  <v-btn
                    :color="label ? 'primary' : 'transparent'"
                    @click="label = 1"
                  >
                    Red
                  </v-btn>
                  <v-btn
                    class="mx-4"  
                    :color="!label ? 'primary' : 'transparent'"
                      @click="label = 0"
                  >
                    Blue
                  </v-btn>
                  <v-icon :color="label === 1 ? 'red' : 'blue'">mdi-circle</v-icon>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-title class="text-h5">
            Random
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row class="text-lg text-black">
                <v-col cols="4">Number</v-col>
                <v-col cols="8">
                  <v-slider
                    v-model="num"
                    :max="1000"
                    :min="0"
                    :step="1"
                    :ticks="true"
                    thumb-label="always"
                    thumb-color="primary"
                    track-color="primary"
                    tick-color="primary"
                  />
                </v-col>
              </v-row>

              <v-row class="text-lg text-black">
                <v-col cols="4">Feature</v-col>
                <v-col cols="8" class="text-center">
                  <v-btn
                    :color="featureRandom === 'uniform' ? 'primary' : 'transparent'"
                    class="mr-2"
                    @click="featureRandom = 'uniform'"
                  >
                    Uniform
                  </v-btn>
                </v-col>
              </v-row>

              <v-row class="text-lg text-black align-start">
                <v-col cols="4">Label</v-col>
                <v-col cols="8" class="text-center">
                  <v-container class="pa-0">
                    <v-row>
                      <v-col cols="6">
                        <v-btn
                          :color="labelRandom === 'uniform' ? 'primary' : 'transparent'"
                          class="mr-2"
                          @click="labelRandom = 'uniform'"
                        >
                          Uniform
                        </v-btn>
                      </v-col>
                      <v-col cols="6">
                        <v-btn
                          :color="labelRandom === 'linear' ? 'primary' : 'transparent'"
                          class="mr-2"
                          @click="labelRandom = 'linear'"
                        >
                          Linear
                        </v-btn>
                      </v-col>
                      <v-col cols="6">
                        <v-btn
                          :color="labelRandom === 'quadratic' ? 'primary' : 'transparent'"
                          class="mr-2"
                          @click="labelRandom = 'quadratic'"
                        >
                          Quadratic
                        </v-btn>
                      </v-col>
                      <v-col cols="6">
                        <v-btn
                          :color="labelRandom === 'cubic' ? 'primary' : 'transparent'"
                          class="mr-2"
                          @click="labelRandom = 'cubic'"
                        >
                          Cubic
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-col>
              </v-row>

              <v-row class="mt-8 text-lg text-black">
                <v-col cols="4">Noise</v-col>
                <v-col cols="8">
                  <v-slider
                    v-model="noise"
                    :max="1"
                    :min="0"
                    :step="0.01"
                    :ticks="true"
                    thumb-label="always"
                    thumb-color="primary"
                    track-color="primary"
                    tick-color="primary"
                  />
                </v-col>
              </v-row>

              <v-row class="text-center">
                <v-col cols="12">
                  <v-btn
                    class="mx-5"
                    color="transparent"
                    @click="generate"
                  >
                    Generate
                  </v-btn>
                  <v-btn @click="points = []">
                    <v-icon>mdi-delete</v-icon>Clean
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-title class="text-h5">
            Tree
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row class="text-lg text-black">
                <v-col cols="5">Num Leaves</v-col>
                <v-col cols="7">
                  {{ tree === null ? 0 : tree.getNumLeaves() }}
                </v-col>
              </v-row>
              <v-row class="text-lg text-black">
                <v-col cols="5">Depth</v-col>
                <v-col cols="7">
                  {{ tree === null ? 0 : tree.getDepth() }}
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-navigation-drawer>
      <v-main>
        <my-canvas
          :label="label"
          :width="width"
          :height="height"
          :points.sync="points"
          :r="r"
          :lines.sync="lines"
          :rects.sync="rects"
          :tree.sync="tree"
          :featureRandom="featureRandom"
          :labelRandom="labelRandom"
          :noise="noise"
          @updateTree="updateTree"
        />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script>
import { DecisionTree, traverse } from './utils/cart'
import myCanvas from './components/myCanvas';

export default {
  name: 'App',

  components: {
    myCanvas,
  },

  data: () => ({
    drawer: true,
    num: 500,
    featureRandom: 'uniform',
    labelRandom: 'linear',
    noise: 0.05,
    label: 1,
    width: 800,
    height: 500,
    points: [],
    r: 10,
    lines: [],
    rects: [],
    tree: null,
  }),

  watch: {
    points () {
      this.updateTree()
    },
    labelRandom () {
      this.generate()
      this.updateTree()
    },
  },

  methods: {
    generate () {
      let _this = this
      let points = []
      for (let i = 0; i < this.num; i++) {
        if (this.featureRandom === 'uniform' && this.labelRandom === 'uniform') {
          let x = Math.random() * this.width
          let y = Math.random() * this.height
          let label = Math.random() > 0.5 ? 1 : 0
          points.push({ cx: x, cy: y, label: label, moving: false })
        } else if (this.featureRandom === 'uniform' && this.labelRandom === 'linear') {
          let x = Math.random() * this.width
          let y = Math.random() * this.height
          let label = (1 - x / this.width) > Math.pow((y / this.height), 1) ? 1 : 0
          points.push({ cx: x, cy: y, label: label, moving: false })
        } else if (this.featureRandom === 'uniform' && this.labelRandom === 'quadratic') {
          let x = Math.random() * this.width
          let y = Math.random() * this.height
          let label = (1 - x / this.width) > Math.pow((y / this.height), 2) ? 1 : 0
          points.push({ cx: x, cy: y, label: label, moving: false })
        }
        else if (this.featureRandom === 'uniform' && this.labelRandom === 'cubic') {
          let x = Math.random() * this.width
          let y = Math.random() * this.height
          let label = (1 - x / this.width) > Math.pow((y / this.height), 3) ? 1 : 0
          points.push({ cx: x, cy: y, label: label, moving: false })
        }
      }
      points = points.map((point) => {
        if (Math.random() < _this.noise) {
          point.label = point.label === 1 ? 0 : 1
        }
        return point
      })
      this.points = points
    },
    updateTree () {
      // Re-learn the tree
      let tree = new DecisionTree()
      let X = this.points.map((point) => [point.cx, point.cy])
      let y = this.points.map((point) => point.label)
      tree.fit(X, y)
      this.tree = tree

      let lines = []
      let rects = []
      traverse(this.tree.tree, 0, 0, this.width, this.height, lines, rects)
      this.lines = lines
      this.rects = rects
    },
  },

  mounted () {
    this.generate()
    this.updateTree()
  },
};
</script>

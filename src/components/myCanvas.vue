<template>
  <v-container class="w-1/1 max-w-300">
    <v-card>
      <svg
        id="app"
        class="w-1/1"
        @mouseup="handleMouseUp"
        @mousemove="handleMouseMove"
        @mousedown="handleMouseDown"
        :viewBox="`0 0 ${width} ${height}`"
        ref="svg"
      >
        <rect
          v-for="(rect, index) in rects"
          :x="rect.x"
          :y="rect.y"
          :width="rect.width"
          :height="rect.height"
          class="opacity-40"
          :class="rect.label === 1 ? 'fill-red-200' : 'fill-blue-200'"
          :key="index"
        />
        <circle
          v-for="(point, index) in points"
          class="hover:stroke-black hover:stroke-3"
          :class="point.label === 1 ? 'fill-red-300': 'fill-blue-300'"
          :cx="point.cx"
          :cy="point.cy"
          :r="r"
          :key="index"
        />
        <line
          v-for="(line, index) in lines"
          class="stroke-black stroke-1 hover:stroke-3"
          :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
          :key="index"
        />
      </svg>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'App',
  props: ['label', 'width', 'height', 'points', 'r', 'lines', 'rects', 'tree', 'num', 'noise', 'featureRandom', 'labelRandom'],
  computed: {
    movingPoints () {
      console.log(this.points)
      return this.points.filter((point) => point.moving)
    }
  },
  methods: {
    distance (x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    },
    convertX (ori_x) {
      return ori_x / this.$refs.svg.clientWidth * this.width
    },
    convertY (ori_y) {
      return ori_y / this.$refs.svg.clientHeight * this.height
    },
    handleMouseUp (event) {
      if (this.movingPoints && this.movingPoints.length === 0) {
        let point = {
          cx: this.convertX(event.offsetX),
          cy: this.convertY(event.offsetY),
          label: this.label,
          moving: false,
        }
        let points = this.points
        points.push(point)
      }
      this.points.forEach((point) => point.moving = false)
    },
    handleMouseDown (event) {
      let _this = this
      let neighbours = this.points.filter((point) => {
        let x1 = point.cx
        let y1 = point.cy
        let x2 = _this.convertX(event.offsetX)
        let y2 = _this.convertY(event.offsetY)
        return this.distance(x1, y1, x2, y2) < this.r
      })
      if (neighbours.length > 0) {
        neighbours[0].moving = true
      }
    },
    handleMouseMove (event) {
      let _this = this
      if (event.buttons === 1) {
        if (this.movingPoints.length > 0) {
          this.movingPoints.forEach((point) => {
            point.cx = _this.convertX(event.offsetX)
            point.cy = _this.convertY(event.offsetY)
          })
          _this.$emit('updateTree')
        }
      }
    },
  },
  mounted () {
    this.generate()
    this.$emit('updateTree')
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>

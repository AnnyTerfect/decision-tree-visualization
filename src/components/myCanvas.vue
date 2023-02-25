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
          v-for="rect in rects"
          :x="rect.x"
          :y="rect.y"
          :width="rect.width"
          :height="rect.height"
          class="opacity-40"
          :class="rect.label === 1 ? 'fill-red-200' : 'fill-blue-200'"
          :key="String([rect.x, rect.y])"
        />
        <circle
          v-for="point in points"
          class="hover:stroke-black hover:stroke-3"
          :class="point.label === 1 ? 'fill-red-300': 'fill-blue-300'"
          :cx="point.cx"
          :cy="point.cy"
          :r="r"
          :key="String([point.cx, point.cy])"
        />
        <line
          v-for="line in lines"
          class="stroke-black stroke-1 hover:stroke-3"
          :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
          :key="String([line.x1, line.y1, line.x2, line.y2])"
        />
        <path
          :d="curve"
          class="stroke-black stroke-3 hover:stroke-5 opacity-50"
          fill="none"
        />
      </svg>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'App',
  props: {
    label: Number,
    width: Number,
    height: Number,
    points: {
      type: Array,
      default: () => [],
    },
    r: Number,
    lines: {
      type: Array,
      default: () => [],
    },
    rects: {
      type: Array,
      default: () => [],
    },
    tree: {
      type: Object,
      default: () => null,
    },
    num: Number,
    noise: Number,
    featureRandom: String,
    labelRandom: String,
    curveN: {
      type: Number,
      default: () => 100,
    },
  },
  computed: {
    movingPoints () {
      return this.points.filter((point) => point.moving)
    },
    curve () {
      // Get curve function
      let curveFun = null
      switch(this.labelRandom) {
        case 'linear':
          curveFun =  (x) => x
          break
        case 'quadratic':
          curveFun =  (x) => Math.pow(x, 2)
          break
        case 'cubic':
          curveFun =  (x) => Math.pow(x, 3)
          break
      }

      if (curveFun === null) return null;

      // Get curve points
      let curvePoints = []
      for (let i = 0; i <= this.curveN; i++) {
        let x = i / this.curveN * this.width
        let y = (1 - curveFun(x / this.width)) * this.height
        curvePoints.push({x, y})
      }

      console.log(this.curveN)

      if (curvePoints.length === 0) return null          
      let d = `M ${curvePoints[0].x} ${curvePoints[0].y}`
      for (let i = 1; i < curvePoints.length; i++) {
        d += ` L ${curvePoints[i].x} ${curvePoints[i].y}`
      }
      return d
    },
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
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>

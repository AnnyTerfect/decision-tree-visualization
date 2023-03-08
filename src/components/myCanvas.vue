<script setup>
import { ref, defineProps, computed, watch, defineEmits } from 'vue'
import { traverse } from '../utils/cart.js'

const emit = defineEmits()

const svg = ref(null)
const lines = ref([]), rects = ref([])

const props = defineProps({
  points: {
    type: Array,
    required: true,
  },
  r: {
    type: Number,
    required: true,
  },
  curveN: {
    type: Number,
    default: 100,
  },
  tree: {
    type: Object,
    required: true,
  },
  newLabel: {
    type: Number,
    required: true
  }
})

const movingPoints = computed(() => {
  return props.points.filter((point) => point.moving)
})

const curve = computed(() => {
  // Get curve function
  let curveFun = null
  switch(props.labelRandom) {
    case 'linear':
      curveFun =  (x) => x
      break
    case 'quadratic':
      curveFun =  (x) => Math.pow(x, 2) + 1 / 4
      break
    case 'cubic':
      curveFun =  (x) => Math.pow(x, 3)
      break
  }
  
  if (curveFun === null) return null;

  // Get curve points
  let curvePoints = []
  for (let i = 0; i <= props.curveN; i++) {
    let x = i / props.curveN * props.width
    let y = (1 - curveFun(x / props.width)) * props.height
    curvePoints.push({x, y})
  }

  if (curvePoints.length === 0) return null

  let d = `M ${curvePoints[0].x} ${curvePoints[0].y}`
  for (let i = 1; i < curvePoints.length; i++) {
    d += ` L ${curvePoints[i].x} ${curvePoints[i].y}`
  }
  return d
})

watch(() => props.tree, () => {
  let _lines = [], _rects = []
  traverse(props.tree.tree, 0, 0, svg.value.clientWidth, svg.value.clientHeight, _lines, _rects, 1)
  lines.value = _lines
  rects.value = _rects
})

function distance (x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x1 - x2) * svg.value.clientWidth, 2) + Math.pow((y1 - y2) * svg.value.clientHeight, 2))
}

function handleMouseUp (event) {
  if (movingPoints.value.length === 0) {
    let point = {
      cx: event.offsetX / svg.value.clientWidth,
      cy: event.offsetY / svg.value.clientHeight,
      label: props.newLabel,
      moving: false,
    }
    emit('addPoint', point)
  }
  props.points.forEach((point) => point.moving = false)
}

function handleMouseDown (event) {
  let neighbours = props.points.filter((point) => {
    let x1 = point.cx
    let y1 = point.cy
    let x2 = event.offsetX / svg.value.clientWidth
    let y2 = event.offsetY / svg.value.clientHeight
    return distance(x1, y1, x2, y2) <= props.r
  })
  if (neighbours.length > 0) {
    neighbours[0].moving = true
  }
}

function handleMouseMove (event) {
  if (event.buttons === 1) {
    if (movingPoints.value.length > 0) {
      props.points.forEach((point, index) => {
        if (point.moving) {
          emit('movePoint', {
            index,
            x: event.offsetX / svg.value.clientWidth,
            y: event.offsetY / svg.value.clientHeight,
          })
        }
      })
    }
  }
}
</script>

<template>
  <v-container class="h-1/1">
    <v-card class="h-1/1">
      <svg
        class="w-1/1 h-1/1"
        @mouseup="handleMouseUp"
        @mousemove="handleMouseMove"
        @mousedown="handleMouseDown"
        ref="svg"
        :viewBox="svg ? `0 0 ${svg.clientWidth} ${svg.clientHeight}` : null"
      >
        <rect
          v-for="rect in rects"
          :x="rect.x * svg.clientWidth"
          :y="rect.y * svg.clientHeight"
          :width="rect.width * svg.clientWidth"
          :height="rect.height * svg.clientHeight"
          class="opacity-40"
          :class="rect.label === 1 ? 'fill-red-200' : 'fill-blue-200'"
          :key="String([rect.x, rect.y])"
        />
        <circle
          v-for="point in points"
          class="hover:stroke-black hover:stroke-3"
          :class="point.label === 1 ? 'fill-red-300': 'fill-blue-300'"
          :cx="point.cx * svg.clientWidth"
          :cy="point.cy * svg.clientHeight"
          :r="r"
          :key="String([point.cx, point.cy])"
        />
        <line
          v-for="line in lines"
          class="stroke-black opacity-60"
          :class="[`hover:stroke-${tree.getDepth() - line.depth + 2}`]"
          :x1="line.x1 * svg.clientWidth" :y1="line.y1 * svg.clientHeight" :x2="line.x2 * svg.clientWidth" :y2="line.y2 * svg.clientHeight"
          :stroke-width="tree.getDepth() - line.depth + 1"
          :key="String([line.x1, line.y1, line.x2, line.y2])"
        />
        <path
          :d="curve"
          class="stroke-black stroke-3 hover:stroke-5 opacity-50"
          fill="none"
        />
        <text
          v-for="line in lines"
          :x="line.x1 * svg.clientWidth + 5"
          :y="line.y1 * svg.clientHeight + 5"
          :key="String([line.x, line.y])"
          style="dominant-baseline: hanging"
        >
          {{ line.depth }}
        </text>
      </svg>
    </v-card>
  </v-container>
</template>
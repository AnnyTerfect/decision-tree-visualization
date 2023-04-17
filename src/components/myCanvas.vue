<script setup>
import { ref, defineProps, computed, watch, defineEmits, onMounted, nextTick } from 'vue'
import { traverse } from '../utils/cart.js'

const emit = defineEmits()

const container = ref(null)
const width = ref(0)
const height = ref(0)
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

watch(() => [props.tree, width.value, height.value], () => {
  let _lines = [], _rects = []
  traverse(props.tree.tree, 0, 0, width.value, height.value, _lines, _rects, 1)
  lines.value = _lines
  rects.value = _rects

  // BFS
  let queue = [{...props.tree.tree, depth: 0}]
  let depth = 0
  let impurityPerDepth = []
  let impurity = 0
  while (queue.length > 0) {
    let node = queue.shift()

    // Next level
    if (node.depth !== depth) {
      depth = node.depth
      impurityPerDepth.push(impurity)
      impurity = 0
    }

    impurity += node.X.length / props.tree.tree.X.length * node.impurity

    if (node.left) {
      queue.push({...node.left, depth: depth + 1})
    }
    if (node.right) {
      queue.push({...node.right, depth: depth + 1})
    }
  }

  console.log(impurityPerDepth)

  // Ratio for impurity gain
  for (let i = 0; i < impurityPerDepth.length - 1; i++) {
    console.log((impurityPerDepth[i] - impurityPerDepth[i + 1]) / impurityPerDepth[i])
  }
})

function resize() {
  console.log(width.value)
  console.log(height.value)
  width.value = container.value.clientWidth
  height.value = container.value.clientHeight
}

function distance (x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x1 - x2) * width.value, 2) + Math.pow((y1 - y2) * height.value, 2))
}

function handleMouseUp (event) {
  if (movingPoints.value.length === 0) {
    let point = {
      cx: event.offsetX / width.value,
      cy: event.offsetY / height.value,
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
    let x2 = event.offsetX / width.value
    let y2 = event.offsetY / height.value
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
            x: event.offsetX / width.value,
            y: event.offsetY / height.value,
          })
        }
      })
    }
  }
}

onMounted(() => {
  nextTick(() => {
    resize()
    
    const observer = new ResizeObserver(() => {
      resize()
    })
    observer.observe(container.value)
  })
})
</script>

<template>
  <div class="p-3 h-1/1">
    <v-card class="w-1/1 h-1/1">
      <div ref="container" class="w-1/1 h-1/1">
        <svg
          class="w-full h-1/1"
          @mouseup="handleMouseUp"
          @mousemove="handleMouseMove"
          @mousedown="handleMouseDown"
          :viewBox="container ? `0 0 ${width} ${height}` : null"
        >
          <rect
            v-for="rect in rects"
            :x="rect.x * width"
            :y="rect.y * height"
            :width="rect.width * width"
            :height="rect.height * height"
            class="opacity-40"
            :class="rect.label === 1 ? 'fill-red-200' : 'fill-blue-200'"
            :key="String([rect.x, rect.y])"
          />
          <circle
            v-for="point in points"
            class="hover:stroke-black hover:stroke-3"
            :class="point.label === 1 ? 'fill-red-300': 'fill-blue-300'"
            :cx="point.cx * width"
            :cy="point.cy * height"
            :r="r"
            :key="String([point.cx, point.cy])"
          />
          <line
            v-for="line in lines"
            class="stroke-black opacity-60"
            :class="[`hover:stroke-5`]"
            :x1="line.x1 * width" :y1="line.y1 * height" :x2="line.x2 * width" :y2="line.y2 * height"
            :stroke-width="2"
            :key="String([line.x1, line.y1, line.x2, line.y2])"
          />
          <path
            :d="curve"
            class="stroke-black stroke-3 hover:stroke-5 opacity-50"
            fill="none"
          />
          <text
            v-for="line in lines"
            :x="line.x1 * width + 5"
            :y="line.y1 * height + 5"
            :key="String([line.x, line.y])"
            style="dominant-baseline: hanging"
          >
            {{ line.depth }}
          </text>
        </svg>
      </div>
    </v-card>
  </div>
</template>
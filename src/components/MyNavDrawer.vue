<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'

const props = defineProps({
    drawer: {
        type: Boolean,
        required: true,
    },
    newLabel: {
        type: Number,
        required: true,
    },
})

const num = ref(500)
const featureRandom = ref('uniform')
const labelRandom = ref('quadratic')
const noise = ref(0)

const emit = defineEmits()
function emitGenerate() {
    emit('generate', {
        num: num.value,
        featureRandom: featureRandom.value,
        labelRandom: labelRandom.value,
        noise: noise.value,
    })
}

onMounted(emitGenerate)
</script>

<template>
    <v-navigation-drawer
        app
        fixed
        clipped
        class="w-400"
        width="400"
        v-model="props.drawer"
    >
        <v-card class="pa-0 h-full">
            <v-card-title class="text-h5">
                Manual
            </v-card-title>
            <v-card-text>
                <v-container>
                <v-row class="text-lg text-black">
                    <v-col cols="4">New Label</v-col>
                    <v-col cols="8">
                    <v-btn
                        :color="props.newLabel ? 'primary' : 'transparent'"
                        @click="$emit('update:newLabel', 1)"
                    >
                        Red
                    </v-btn>
                    <v-btn
                        class="mx-4"  
                        :color="!newLabel ? 'primary' : 'transparent'"
                        @click="$emit('update:newLabel', 0)"
                    >
                        Blue
                    </v-btn>
                    <v-icon :color="newLabel === 1 ? 'red' : 'blue'">mdi-circle</v-icon>
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
                        thumb-label="always"
                        thumb-color="primary"
                        track-color="primary"
                        tick-color="primary"
                        @change="$emit('update:num', num)"
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
                    <v-col cols="3">Label</v-col>
                    <v-col cols="9" class="text-center">
                    <v-container class="pa-0">
                        <v-row>
                            <v-col cols="6">
                                <v-btn
                                    :color="labelRandom === 'uniform' ? 'primary' : 'transparent'"
                                    class="mr-1"
                                    @click="labelRandom = 'uniform'"
                                >
                                Uniform
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    :color="labelRandom === 'linear' ? 'primary' : 'transparent'"
                                    @click="labelRandom = 'linear'"
                                >
                                Linear
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    :color="labelRandom === 'quadratic' ? 'primary' : 'transparent'"
                                    class="mr-1"
                                    @click="labelRandom = 'quadratic'"
                                >
                                Quadratic
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn
                                    :color="labelRandom === 'cubic' ? 'primary' : 'transparent'"
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
                        thumb-label="always"
                        thumb-color="primary"
                        track-color="primary"
                        tick-color="primary"
                        @change="$emit('update:noise', noise)"
                    />
                    </v-col>
                </v-row>

                <v-row class="text-center">
                    <v-col cols="12">
                    <v-btn
                        class="mx-5"
                        color="transparent"
                        @click="emitGenerate"
                    >
                        Generate
                    </v-btn>
                    <v-btn @click="emit('clean')">
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
                    {{ null === null ? 0 : 0 }}
                    </v-col>
                </v-row>
                <v-row class="text-lg text-black">
                    <v-col cols="5">Depth</v-col>
                    <v-col cols="7">
                    {{ null === null ? 0 : 0 }}
                    </v-col>
                </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-navigation-drawer>
</template>
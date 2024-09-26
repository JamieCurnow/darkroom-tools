<template>
  <ClientOnly>
    <div class="hidden">
      <video ref="video" autoplay></video>
      <canvas ref="canvas"></canvas>
    </div>

    <!-- top bar -->
    <div class="z-50 fixed top-0 left-0 w-screen flex justify-between py-4 px-4">
      <button class="bg-gray-700 text-gray-500 px-4 rounded-md">Set offset</button>
      <button @click="showMenu = !showMenu">
        <UIcon name="i-mdi-settings" class="text-gray-700 size-8"></UIcon>
      </button>
    </div>

    <div class="h-screen flex w-screen bg-black text-white justify-center items-center">
      <div class="flex flex-col gap-2 w-screen text-center">
        <h1 class="text-[4rem] text-gray-500">{{ displayText }}</h1>
        <div class="text-[2rem] text-gray-700">{{ seconds }} seconds</div>
      </div>
    </div>

    <!-- menu -->
    <div
      v-if="showMenu"
      class="fixed top-0 left-0 z-10 h-screen flex w-screen bg-black text-white justify-center px-6 pt-20"
    >
      <div class="flex flex-col gap-4 w-screen text-center">
        <h1 class="text-[2rem]">Settings</h1>

        <div class="flex flex-col gap-2">
          <p>offset {{ offset }}</p>
          <div class="flex gap-2 items-center justify-center">
            <UInput v-model="offset" type="number" class="max-w-max"></UInput>
            <UButton @click="setOffset">Set offset</UButton>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p>Base seconds</p>
          <p class="text-xs text-gray-300">amount of seconds that are good when light meter is at 0</p>
          <div class="flex gap-2 items-center justify-center">
            <UInput v-model="baseSeconds" type="number" class="max-w-max"></UInput>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center">
          <p>round {{ rounding }}</p>
          <URange v-model="rounding" class="max-w-[400px]" :min="0" :max="20" :step="1"></URange>
        </div>
        <div class="flex flex-col items-center justify-center">
          <p>tofixed {{ tofixed }}</p>
          <URange v-model="tofixed" class="max-w-[400px]" :min="0" :max="20" :step="1"></URange>
        </div>
        <div class="flex flex-col items-center justify-center">
          <p>precision {{ imageScale }}</p>
          <URange v-model="imageScale" class="max-w-[400px]" :min="0" :max="100" :step="1"></URange>
        </div>
        <div class="flex flex-col items-center justify-center">
          <p>seconds multiplier {{ secondsMultiplier }}</p>
          <URange v-model="secondsMultiplier" class="max-w-[400px]" :min="-50" :max="50" :step="0.1"></URange>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const brightness = ref<number>(0)
const brightnessBuffer = ref<number[]>([])
const bufferSize = 10 // Number of frames to average

const offset = useLocalStorage('offset', 0)
const rounding = useLocalStorage('rounding', 8)
const tofixed = useLocalStorage('tofixed', 8)
const imageScale = useLocalStorage('imageScale', 9)
const secondsMultiplier = useLocalStorage('secondsMultiplier', 0.1)
const baseSeconds = useLocalStorage('baseSeconds', 10)
const showMenu = ref(false)

const median = (arr: number[]) => {
  const sorted = arr.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const roundToDecimalPlaces = (num: number, decimalPlaces: number) => {
  const factor = Math.pow(10, decimalPlaces)
  return Math.round(num * factor) / factor
}

const setOffset = () => {
  offset.value = brightness.value
}

const displayText = computed(() => {
  // display the brightness minus the offset, rounded to 'rounding' decimal places
  return roundToDecimalPlaces(brightness.value - offset.value, rounding.value).toFixed(tofixed.value)
})

const seconds = computed(() => {
  const b = roundToDecimalPlaces(brightness.value - offset.value, rounding.value)
  const s = roundToDecimalPlaces(b * secondsMultiplier.value, 2)

  // if the number is negative, make it positive
  // if the number is positive, make it negative
  const sflip = s < 0 ? Math.abs(s) : -Math.abs(s)
  // return the number plus the base seconds
  return (sflip + baseSeconds.value).toFixed(2)
})

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (video.value) {
      video.value.srcObject = stream
    }
  } catch (error) {
    console.error('Error accessing the camera:', error)
  }
}

const analyzeBrightness = () => {
  if (video.value && canvas.value) {
    const context = canvas.value.getContext('2d')
    if (context) {
      // Set canvas dimensions to match video
      const scale = imageScale.value / 100 // Scale factor
      canvas.value.width = video.value.videoWidth * scale
      canvas.value.height = video.value.videoHeight * scale

      // Draw the current video frame onto the canvas
      context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)

      // Get image data from the canvas
      const imageData = context.getImageData(0, 0, canvas.value.width, canvas.value.height)
      const data = imageData.data

      // Convert to black and white and calculate brightness
      let totalBrightness = 0
      const threshold = 128 // Threshold value for black and white conversion
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // Convert to grayscale using the luminance formula
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b
        // Convert to black or white based on the threshold
        const bw = luminance > threshold ? 255 : 0
        // Set the black or white value back to the image data
        data[i] = data[i + 1] = data[i + 2] = bw
        totalBrightness += bw
      }
      const currentBrightness = totalBrightness / (imageData.width * imageData.height)

      // Update the canvas with the black and white image
      context.putImageData(imageData, 0, 0)

      // Add the current brightness to the buffer
      brightnessBuffer.value.push(currentBrightness)
      if (brightnessBuffer.value.length > bufferSize) {
        brightnessBuffer.value.shift() // Remove the oldest value if buffer is full
      }

      // Calculate the moving average
      const averageBrightness =
        brightnessBuffer.value.reduce((sum, val) => sum + val, 0) / brightnessBuffer.value.length
      brightness.value = averageBrightness

      // brightness.value = median(brightnessBuffer.value)
    }
  }
}

let interval: NodeJS.Timeout | null = null

onMounted(() => {
  startCamera()
  if (interval) clearInterval(interval)
  interval = setInterval(analyzeBrightness, 100)
})
</script>

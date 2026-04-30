<script setup lang="ts">
const props = defineProps<{
  provider: string
  size?: number
}>()

const size = props.size ?? 20
</script>

<template>
  <!-- OpenAI - Blossom/hexagonal flower -->
  <svg v-if="provider === 'openai'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L28 9.5V24.5L16 32L4 24.5V9.5L16 2Z" fill="#10A37F" opacity="0.15"/>
    <path d="M16 6L24.5 11V21L16 26L7.5 21V11L16 6Z" fill="#10A37F" opacity="0.3"/>
    <path d="M16 10L20.5 12.7V18.3L16 21L11.5 18.3V12.7L16 10Z" fill="#10A37F"/>
    <circle cx="16" cy="16" r="2" fill="#fff"/>
  </svg>

  <!-- Anthropic - Stylized spark -->
  <svg v-else-if="provider === 'anthropic'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#1A1A1A"/>
    <path d="M12 8L18 8L22 24L18 24L16 16L14 24L10 24L12 8Z" fill="#F1F0E8"/>
    <circle cx="16" cy="10" r="2" fill="#F1F0E8"/>
  </svg>

  <!-- Gemini - Diamond/constellation -->
  <svg v-else-if="provider === 'gemini'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="24" height="24" rx="6" fill="url(#g_grad)"/>
    <defs>
      <linearGradient id="g_grad" x1="4" y1="4" x2="28" y2="28">
        <stop offset="0%" stop-color="#4285F4"/>
        <stop offset="33%" stop-color="#EA4335"/>
        <stop offset="66%" stop-color="#FBBC05"/>
        <stop offset="100%" stop-color="#34A853"/>
      </linearGradient>
    </defs>
    <path d="M16 8L18 13H23L19 16.5L20.5 22L16 18.5L11.5 22L13 16.5L9 13H14L16 8Z" fill="white" opacity="0.9"/>
  </svg>

  <!-- DeepSeek - Blue whale/abstract D -->
  <svg v-else-if="provider === 'deepseek'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="28" height="28" rx="8" fill="#4D6BFE"/>
    <path d="M10 8H18C21 8 23 10 23 13V13C23 16 21 18 18 18H14V24H10V8Z" fill="white" opacity="0.9"/>
    <circle cx="16" cy="13" r="2.5" fill="#4D6BFE"/>
  </svg>

  <!-- Qwen - Purple circle -->
  <svg v-else-if="provider === 'qwen'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#615ced"/>
    <path d="M10 12C10 10 11.5 8.5 14 8.5H18C20.5 8.5 22 10 22 12V14H18V12.5C18 11.5 17 11 16 11C15 11 14 11.5 14 12.5V19.5C14 20.5 15 21 16 21C17 21 18 20.5 18 19.5V18H22V20C22 22 20.5 23.5 18 23.5H14C11.5 23.5 10 22 10 20V12Z" fill="white" opacity="0.9"/>
  </svg>

  <!-- Custom - Gear -->
  <svg v-else :width="size" :height="size" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <circle cx="16" cy="16" r="5" fill="currentColor" opacity="0.5"/>
    <path d="M16 4V8M16 24V28M4 16H8M24 16H28M7 7L10 10M22 22L25 25M7 25L10 22M22 10L25 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
  </svg>
</template>

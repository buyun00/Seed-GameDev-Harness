<script setup lang="ts">
import MainSiderNav from './MainSiderNav.vue'
import { useProposalStore } from '@/stores/proposal'
import ProposalReviewModal from '@/components/proposal/ProposalReviewModal.vue'

const proposalStore = useProposalStore()
</script>

<template>
  <div class="app-layout">
    <MainSiderNav />
    <main class="app-layout__main">
      <router-view />
    </main>
    <ProposalReviewModal
      v-if="proposalStore.reviewVisible"
      :proposal="proposalStore.currentProposal!"
      @close="proposalStore.hideReview()"
      @apply="proposalStore.apply()"
      @reject="proposalStore.reject()"
    />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.app-layout__main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-content);
  position: relative;
}
.app-layout__main::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(0, 245, 212, 0.02) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(124, 58, 237, 0.02) 0%, transparent 50%);
}
</style>

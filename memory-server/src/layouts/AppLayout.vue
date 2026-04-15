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
  background: #f7f8fa;
}
</style>

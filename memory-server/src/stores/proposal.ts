import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as proposalApi from '@/api/proposal'
import type { Proposal } from '@/types/proposal'

export const useProposalStore = defineStore('proposal', () => {
  const currentProposal = ref<Proposal | null>(null)
  const reviewVisible = ref(false)
  const applying = ref(false)

  function showReview(proposal: Proposal) {
    currentProposal.value = proposal
    reviewVisible.value = true
  }

  function hideReview() {
    reviewVisible.value = false
    currentProposal.value = null
  }

  async function apply(): Promise<boolean> {
    if (!currentProposal.value) return false
    applying.value = true
    try {
      await proposalApi.applyProposal(currentProposal.value.id)
      hideReview()
      return true
    } catch {
      return false
    } finally {
      applying.value = false
    }
  }

  async function reject(): Promise<boolean> {
    if (!currentProposal.value) return false
    try {
      await proposalApi.rejectProposal(currentProposal.value.id)
      hideReview()
      return true
    } catch {
      return false
    }
  }

  return { currentProposal, reviewVisible, applying, showReview, hideReview, apply, reject }
})

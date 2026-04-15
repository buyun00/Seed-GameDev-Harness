import { useProposalStore } from '@/stores/proposal'
import type { Proposal } from '@/types/proposal'

export function useProposal() {
  const store = useProposalStore()

  function review(proposal: Proposal) {
    store.showReview(proposal)
  }

  return { review }
}

import conversationRepository from '~/repositories/conversations.repository'

class ConversationService {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    return await conversationRepository.getConversations(sender_id, receiver_id, limit, page)
  }
}
const conversationService = new ConversationService()
export default conversationService

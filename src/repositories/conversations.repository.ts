import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'

class ConversationRepository {
  async find(filter: any) {
    return databaseService.conversations.find(filter)
  }

  async countDocuments(filter: any) {
    return await databaseService.conversations.countDocuments(filter)
  }

  async getConversations(sender_id: string, receiver_id: string, limit: number, page: number) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }

    const conversations = await databaseService.conversations
      .find(match)
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    const total = await databaseService.conversations.countDocuments(match)

    return {
      conversations,
      total
    }
  }
}

const conversationRepository = new ConversationRepository()
export default conversationRepository 
import { ObjectId } from 'mongodb'
import Like from '~/models/schemas/Like.schema'
import databaseService from '~/services/database.services'

class LikeRepository {
  async findOneAndUpdate(filter: any, update: any, options?: any) {
    return await databaseService.likes.findOneAndUpdate(filter, update, options)
  }

  async findOneAndDelete(filter: any) {
    return await databaseService.likes.findOneAndDelete(filter)
  }

  async likeTweet(user_id: string, tweet_id: string) {
    return await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
  }

  async unlikeTweet(user_id: string, tweet_id: string) {
    return await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
  }
}

const likeRepository = new LikeRepository()
export default likeRepository 
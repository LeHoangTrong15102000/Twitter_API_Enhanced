import { ObjectId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from '~/services/database.services'

class BookmarkRepository {
  async findOneAndUpdate(filter: any, update: any, options?: any) {
    return await databaseService.bookmarks.findOneAndUpdate(filter, update, options)
  }

  async findOneAndDelete(filter: any) {
    return await databaseService.bookmarks.findOneAndDelete(filter)
  }

  async bookmarkTweet(user_id: string, tweet_id: string) {
    return await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
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

  async unbookmarkTweet(user_id: string, tweet_id: string) {
    return await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
  }
}

const bookmarkRepository = new BookmarkRepository()
export default bookmarkRepository 
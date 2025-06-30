import Hashtag from '~/models/schemas/Hashtag.schema'
import databaseService from '~/services/database.services'

class HashtagRepository {
  async findOneAndUpdate(filter: any, update: any, options?: any) {
    return await databaseService.hashtags.findOneAndUpdate(filter, update, options)
  }

  async createHashtag(name: string) {
    return await databaseService.hashtags.findOneAndUpdate(
      { name },
      {
        $setOnInsert: new Hashtag({ name })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
  }
}

const hashtagRepository = new HashtagRepository()
export default hashtagRepository 
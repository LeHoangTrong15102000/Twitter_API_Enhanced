import { ObjectId } from 'mongodb'
import Follower from '~/models/schemas/Follower.schema'
import databaseService from '~/services/database.services'

class FollowerRepository {
  async findOne(filter: any) {
    return await databaseService.followers.findOne(filter)
  }

  async insertOne(follower: Follower) {
    return await databaseService.followers.insertOne(follower)
  }

  async deleteOne(filter: any) {
    return await databaseService.followers.deleteOne(filter)
  }

  async findFollowedUsers(user_id: string, projection?: any) {
    return await databaseService.followers
      .find(
        { user_id: new ObjectId(user_id) },
        { projection: projection || { followed_user_id: 1, _id: 0 } }
      )
      .toArray()
  }

  async checkFollowing(user_id: string, followed_user_id: string) {
    return await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
  }

  async follow(user_id: string, followed_user_id: string) {
    return await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
  }

  async unfollow(user_id: string, followed_user_id: string) {
    return await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
  }
}

const followerRepository = new FollowerRepository()
export default followerRepository 
import { MongoClient, Db, Collection } from 'mongodb'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversations.schema'
import { envConfig } from '~/constants/config'

// MongoDB connection URI - supports both Atlas and local/Docker MongoDB
const uri = envConfig.dbHost
  ? `mongodb://${envConfig.dbUsername}:${envConfig.dbPassword}@${envConfig.dbHost}:${envConfig.dbPort}/${envConfig.dbName}?authSource=admin`
  : `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@cluster0.jzb6290.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  async indexUsers() {
    try {
      const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
      if (!exists) {
        this.users.createIndex({ email: 1, password: 1 })
        this.users.createIndex({ email: 1 }, { unique: true })
        this.users.createIndex({ username: 1 }, { unique: true })
      }
    } catch (error) {
      console.log('Error creating users indexes:', error)
    }
  }
  async indexRefreshTokens() {
    try {
      const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])
      if (!exists) {
        this.refreshTokens.createIndex({ token: 1 })
        this.refreshTokens.createIndex(
          { exp: 1 },
          {
            expireAfterSeconds: 0
          }
        )
      }
    } catch (error) {
      console.log('Error creating refresh tokens indexes:', error)
    }
  }
  async indexVideoStatus() {
    try {
      const exists = await this.videoStatus.indexExists(['name_1'])
      if (!exists) {
        this.videoStatus.createIndex({ name: 1 })
      }
    } catch (error) {
      console.log('Error creating video status indexes:', error)
    }
  }
  async indexFollowers() {
    try {
      const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
      if (!exists) {
        this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
      }
    } catch (error) {
      console.log('Error creating followers indexes:', error)
    }
  }
  async indexTweets() {
    try {
      const exists = await this.tweets.indexExists(['content_text'])
      if (!exists) {
        this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
      }
    } catch (error) {
      console.log('Error creating tweets indexes:', error)
    }
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection)
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUsersCollection)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection)
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(envConfig.dbVideoStatusCollection)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagsCollection)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection)
  }
  get likes(): Collection<Like> {
    return this.db.collection(envConfig.dbLikesCollection)
  }
  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationCollection)
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService

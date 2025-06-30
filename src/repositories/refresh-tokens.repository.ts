import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import databaseService from '~/services/database.services'

class RefreshTokenRepository {
  async insertOne(refreshToken: RefreshToken) {
    return await databaseService.refreshTokens.insertOne(refreshToken)
  }

  async deleteOne(filter: any) {
    return await databaseService.refreshTokens.deleteOne(filter)
  }

  async deleteByToken(token: string) {
    return await databaseService.refreshTokens.deleteOne({ token })
  }

  async deleteByUserId(user_id: string) {
    return await databaseService.refreshTokens.deleteMany({ 
      user_id: new ObjectId(user_id) 
    })
  }
}

const refreshTokenRepository = new RefreshTokenRepository()
export default refreshTokenRepository 
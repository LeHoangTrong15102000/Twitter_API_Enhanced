import { ObjectId, UpdateFilter } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'

class UserRepository {
  async findByEmail(email: string) {
    return await databaseService.users.findOne({ email })
  }

  async findById(user_id: string) {
    return await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  }

  async findByUsername(username: string) {
    return await databaseService.users.findOne({ username })
  }

  async insertOne(user: User) {
    return await databaseService.users.insertOne(user)
  }

  async findOneAndUpdate(
    filter: any,
    update: UpdateFilter<User> | Partial<User>,
    options?: any
  ) {
    return await databaseService.users.findOneAndUpdate(filter, update, options)
  }

  async updateOne(
    filter: any,
    update: UpdateFilter<User> | Partial<User>
  ) {
    return await databaseService.users.updateOne(filter, update)
  }

  async findWithProjection(user_id: string, projection: any) {
    return await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection }
    )
  }

  async findByUsernameWithProjection(username: string, projection: any) {
    return await databaseService.users.findOne(
      { username },
      { projection }
    )
  }

  async updateProfile(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    return await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }

  async updatePassword(user_id: string, hashedPassword: string) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashedPassword
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async updateEmailVerifyToken(user_id: string, email_verify_token: string) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async updateForgotPasswordToken(user_id: string, forgot_password_token: string) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            forgot_password_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  async verifyEmail(user_id: string) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            email_verify_token: '',
            verify: 1, // UserVerifyStatus.Verified
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  async resetPassword(user_id: string, hashedPassword: string) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: '',
          password: hashedPassword
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
}

const userRepository = new UserRepository()
export default userRepository 
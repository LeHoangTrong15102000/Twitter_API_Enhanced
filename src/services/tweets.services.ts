import { ObjectId } from 'mongodb'
import { TweetType } from '~/constants/enums'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import tweetRepository from '~/repositories/tweets.repository'
import hashtagRepository from '~/repositories/hashtags.repository'
import followerRepository from '~/repositories/followers.repository'

class TweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return hashtagRepository.createHashtag(hashtag)
      })
    )
    return hashtagDocuments.map((result: any) => result._id)
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    const result = await tweetRepository.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const tweet = await tweetRepository.findById(result.insertedId.toString())
    return tweet
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const result = await tweetRepository.increaseView(tweet_id, user_id)
    return result
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await tweetRepository.getTweetChildren(tweet_id, tweet_type, limit, page)
    
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    
    const [, total] = await Promise.all([
      tweetRepository.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      tweetRepository.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    tweets.forEach((tweet: any) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })
    
    return {
      tweets,
      total
    }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_id_obj = new ObjectId(user_id)
    const followed_user_ids = await followerRepository.findFollowedUsers(user_id)
    const ids = followed_user_ids.map((item: any) => item.followed_user_id)
    // Mong muốn newfeeds sẽ lấy luôn cả tweet của mình
    ids.push(user_id_obj)
    
    const [tweets, total] = await Promise.all([
      tweetRepository.getNewFeeds(ids, limit, page, user_id_obj),
      tweetRepository.countNewFeeds(ids, user_id_obj)
    ])
    
    const tweet_ids = tweets.map((tweet: any) => tweet._id as ObjectId)
    const date = new Date()
    
    await tweetRepository.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    tweets.forEach((tweet: any) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })
    
    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService 
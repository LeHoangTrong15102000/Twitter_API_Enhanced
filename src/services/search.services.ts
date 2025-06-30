import { ObjectId } from 'mongodb'
import { MediaType, MediaTypeQuery, PeopleFollow } from '~/constants/enums'
import tweetRepository from '~/repositories/tweets.repository'
import followerRepository from '~/repositories/followers.repository'

class SearchService {
  async search({
    limit,
    page,
    content,
    user_id,
    media_type,
    people_follow
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type?: MediaTypeQuery
    people_follow?: PeopleFollow
  }) {
    const $match: any = {
      $text: {
        $search: content
      }
    }
    
    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
      }
      if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = {
          $in: [MediaType.Video, MediaType.HLS]
        }
      }
    }
    
    if (people_follow && people_follow === PeopleFollow.Following) {
      const user_id_obj = new ObjectId(user_id)
      const followed_user_ids = await followerRepository.findFollowedUsers(user_id)
      const ids = followed_user_ids.map((item: any) => item.followed_user_id)
      // Mong muốn newfeeds sẽ lấy luôn cả tweet của mình
      ids.push(user_id_obj)
      $match['user_id'] = {
        $in: ids
      }
    }
    
    const [tweets, total] = await Promise.all([
      tweetRepository.search($match, limit, page, user_id),
      tweetRepository.countSearch($match, user_id)
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

const searchService = new SearchService()
export default searchService 
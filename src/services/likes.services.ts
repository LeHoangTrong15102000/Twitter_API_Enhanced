import likeRepository from '~/repositories/likes.repository'

class LikeService {
  async likeTweet(user_id: string, tweet_id: string) {
    const result = await likeRepository.likeTweet(user_id, tweet_id)
    return result as any
  }
  
  async unlikeTweet(user_id: string, tweet_id: string) {
    const result = await likeRepository.unlikeTweet(user_id, tweet_id)
    return result
  }
}

const likeService = new LikeService()
export default likeService

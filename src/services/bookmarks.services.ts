import bookmarkRepository from '~/repositories/bookmarks.repository'

class BookmarkService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await bookmarkRepository.bookmarkTweet(user_id, tweet_id)
    return result as any
  }
  
  async unbookmarkTweet(user_id: string, tweet_id: string) {
    const result = await bookmarkRepository.unbookmarkTweet(user_id, tweet_id)
    return result
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService

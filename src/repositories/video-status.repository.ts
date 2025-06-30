import VideoStatus from '~/models/schemas/VideoStatus.schema'
import databaseService from '~/services/database.services'

class VideoStatusRepository {
  async insertOne(videoStatus: VideoStatus) {
    return await databaseService.videoStatus.insertOne(videoStatus)
  }

  async findOne(filter: any) {
    return await databaseService.videoStatus.findOne(filter)
  }

  async updateOne(filter: any, update: any) {
    return await databaseService.videoStatus.updateOne(filter, update)
  }

  async findByName(name: string) {
    return await databaseService.videoStatus.findOne({ name })
  }

  async updateStatus(name: string, status: number) {
    return await databaseService.videoStatus.updateOne(
      { name },
      {
        $set: { status },
        $currentDate: { updated_at: true }
      }
    )
  }

  async updateStatusWithError(name: string, status: number) {
    return await databaseService.videoStatus.updateOne(
      { name },
      {
        $set: { status },
        $currentDate: { updated_at: true }
      }
    ).catch((err) => {
      console.error('Update video status error', err)
    })
  }
}

const videoStatusRepository = new VideoStatusRepository()
export default videoStatusRepository 
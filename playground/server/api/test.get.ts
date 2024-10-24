import { File } from '../models'

export default defineMyEventHandler(async () => {
  const data = await File.findAll()
  return data
})

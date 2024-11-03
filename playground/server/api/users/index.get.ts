import { User } from '~/server/models'

export default defineMyEventHandler(async () => {
  return await User.findAll()
})

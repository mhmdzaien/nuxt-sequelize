import { User } from '~/server/models'

export default defineMyEventHandler(async (event) => {
  return await User.findOne({ where: { id: event.context.params?.id } })
})

import type { QueryTypes } from 'sequelize'

export default defineMyEventHandler(async () => {
  return runQuery<QueryTypes.SELECT>(builder => builder.from('file'))
})

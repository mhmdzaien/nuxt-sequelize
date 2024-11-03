import { Op, type QueryTypes } from 'sequelize'

export default defineMyEventHandler(async () => {
  return runQuery<QueryTypes.SELECT>(builder =>
    builder
      .sequelizeWhere({ name: { [Op.like]: '%Me%' } })
      .select(['name', 'id'])
      .from('users'),
  )
})

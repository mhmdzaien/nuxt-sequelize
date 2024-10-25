import { Op, type QueryTypes } from 'sequelize'

export default defineMyEventHandler(async () => {
  return runQuery<QueryTypes.SELECT>(builder => builder.sequelizeWhere({ nama: { [Op.like]: 'SPI' } }).from('file'))
})

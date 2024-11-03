import type { Sequelize } from 'sequelize'
import { User } from './User'
import { Unit } from './Unit'

export { User, Unit }

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize)
  Unit.initModel(sequelize)
  return {
    User,
    Unit,
  }
}

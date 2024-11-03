import type {
  CreationOptional,
  InferCreationAttributes,
  InferAttributes,
  Sequelize,
} from 'sequelize'
import {
  DataTypes,
  Model,
} from 'sequelize'

export class Unit extends Model<
  InferAttributes<Unit>,
  InferCreationAttributes<Unit>
> {
  declare id: CreationOptional<number>
  declare unit: string | null
  declare kategori: 'Unit' | 'Poli' | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof Unit {
    Unit.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      unit: {
        type: DataTypes.STRING,
      },
      kategori: {
        type: DataTypes.ENUM('Unit', 'Poli'),
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    }, {
      sequelize,
    })

    return Unit
  }
}

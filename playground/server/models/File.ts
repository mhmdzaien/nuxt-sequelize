import type {
  Association,
  CreationOptional,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  InferCreationAttributes,
  InferAttributes,
  NonAttribute,
  Sequelize } from 'sequelize'
import {
  DataTypes,
  Model,
} from 'sequelize'
import type { BuktiKriteria } from './BuktiKriteria'

type FileAssociations = 'buktiKriterias'

export class File extends Model<
  InferAttributes<File, { omit: FileAssociations }>,
  InferCreationAttributes<File, { omit: FileAssociations }>
> {
  declare id: CreationOptional<string>
  declare nama: string | null
  declare path: string | null
  declare link: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // File hasMany BuktiKriteria (as BuktiKriteria)
  declare buktiKriterias?: NonAttribute<BuktiKriteria[]>
  declare getBuktiKriterias: HasManyGetAssociationsMixin<BuktiKriteria>
  declare setBuktiKriterias: HasManySetAssociationsMixin<BuktiKriteria, string>
  declare addBuktiKriteria: HasManyAddAssociationMixin<BuktiKriteria, string>
  declare addBuktiKriterias: HasManyAddAssociationsMixin<BuktiKriteria, string>
  declare createBuktiKriteria: HasManyCreateAssociationMixin<
    BuktiKriteria,
    'fileId'
  >

  declare removeBuktiKriteria: HasManyRemoveAssociationMixin<
    BuktiKriteria,
    string
  >

  declare removeBuktiKriterias: HasManyRemoveAssociationsMixin<
    BuktiKriteria,
    string
  >

  declare hasBuktiKriteria: HasManyHasAssociationMixin<BuktiKriteria, string>
  declare hasBuktiKriterias: HasManyHasAssociationsMixin<BuktiKriteria, string>
  declare countBuktiKriterias: HasManyCountAssociationsMixin

  declare static associations: {
    buktiKriterias: Association<File, BuktiKriteria>
  }

  static initModel(sequelize: Sequelize): typeof File {
    File.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        nama: {
          type: DataTypes.STRING,
        },
        path: {
          type: DataTypes.STRING,
        },
        link: {
          type: DataTypes.VIRTUAL,
          get() {
            return this.path ? `/file_asset/${this.id}.pdf` : null
          },
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        tableName: 'file',
      },
    )

    return File
  }
}

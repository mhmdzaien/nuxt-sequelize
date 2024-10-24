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

type KriteriaAssociations = 'buktiKriterias'

export class Kriteria extends Model<
  InferAttributes<Kriteria, { omit: KriteriaAssociations }>,
  InferCreationAttributes<Kriteria, { omit: KriteriaAssociations }>
> {
  declare id: CreationOptional<string>
  declare kode: string | null
  declare penilaian: string | null
  declare penjelasan: string | null
  declare keterangan: string | null
  declare level: number | null
  declare parentId: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Kriteria hasMany BuktiKriteria (as BuktiKriteria)
  declare buktiKriterias?: NonAttribute<BuktiKriteria[]>
  declare getBuktiKriterias: HasManyGetAssociationsMixin<BuktiKriteria>
  declare setBuktiKriterias: HasManySetAssociationsMixin<BuktiKriteria, string>
  declare addBuktiKriteria: HasManyAddAssociationMixin<BuktiKriteria, string>
  declare addBuktiKriterias: HasManyAddAssociationsMixin<BuktiKriteria, string>
  declare createBuktiKriteria: HasManyCreateAssociationMixin<
    BuktiKriteria,
    'kriteriaId'
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
    buktiKriterias: Association<Kriteria, BuktiKriteria>
  }

  static initModel(sequelize: Sequelize): typeof Kriteria {
    Kriteria.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        kode: {
          type: DataTypes.STRING,
        },
        penilaian: {
          type: DataTypes.TEXT,
        },
        penjelasan: {
          type: DataTypes.TEXT,
        },
        keterangan: {
          type: DataTypes.TEXT,
        },
        level: {
          type: DataTypes.SMALLINT,
        },
        parentId: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
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
        tableName: 'kriteria',
      },
    )

    return Kriteria
  }
}

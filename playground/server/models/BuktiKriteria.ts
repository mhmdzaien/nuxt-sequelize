import type {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  CreationOptional,
  InferCreationAttributes,
  InferAttributes,
  NonAttribute,
  Sequelize } from 'sequelize'
import {
  DataTypes,
  Model,
} from 'sequelize'
import type { File } from './File'
import type { Kriteria } from './Kriteria'

type BuktiKriteriaAssociations = 'kriteria' | 'file'

export class BuktiKriteria extends Model<
  InferAttributes<BuktiKriteria, { omit: BuktiKriteriaAssociations }>,
  InferCreationAttributes<BuktiKriteria, { omit: BuktiKriteriaAssociations }>
> {
  declare id: CreationOptional<string>
  declare kriteriaId: string | null
  declare fileId: string | null
  declare periode: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // BuktiKriteria belongsTo Kriteria (as Kriteria)
  declare kriteria?: NonAttribute<Kriteria>
  declare getKriteria: BelongsToGetAssociationMixin<Kriteria>
  declare setKriteria: BelongsToSetAssociationMixin<Kriteria, string>
  declare createKriteria: BelongsToCreateAssociationMixin<Kriteria>

  // BuktiKriteria belongsTo File (as File)
  declare file?: NonAttribute<File>
  declare getFile: BelongsToGetAssociationMixin<File>
  declare setFile: BelongsToSetAssociationMixin<File, string>
  declare createFile: BelongsToCreateAssociationMixin<File>

  declare static associations: {
    kriteria: Association<BuktiKriteria, Kriteria>
    file: Association<BuktiKriteria, File>
  }

  static initModel(sequelize: Sequelize): typeof BuktiKriteria {
    BuktiKriteria.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        kriteriaId: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        fileId: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        periode: {
          type: DataTypes.STRING,
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
        tableName: 'bukti_kriteria',
      },
    )

    return BuktiKriteria
  }
}

import type { Sequelize } from 'sequelize'
import { Kriteria } from './Kriteria'
import { BuktiKriteria } from './BuktiKriteria'
import { File } from './File'

export { Kriteria, BuktiKriteria, File }

export function initModels(sequelize: Sequelize) {
  Kriteria.initModel(sequelize)
  BuktiKriteria.initModel(sequelize)
  File.initModel(sequelize)

  Kriteria.hasMany(BuktiKriteria, {
    as: 'buktiKriterias',
    foreignKey: 'kriteriaId',
  })
  BuktiKriteria.belongsTo(Kriteria, {
    as: 'kriteria',
    foreignKey: 'kriteriaId',
  })
  BuktiKriteria.belongsTo(File, {
    as: 'file',
    foreignKey: 'fileId',
  })
  File.hasMany(BuktiKriteria, {
    as: 'buktiKriterias',
    foreignKey: 'fileId',
  })

  return {
    Kriteria,
    BuktiKriteria,
    File,
  }
}

import { z } from 'zod'
import { Unit as UnitModel } from '../models'

export class Unit {
  validationSchema = z.object({
    unit: z.string({ required_error: 'Unit wajib diisi' }).max(255),
    kategori: z.enum(['Unit', 'Poli'], {
      required_error: 'Kategori wajib dipilih',
    }),
  })

  @get('/api/unit/:id')
  async findById(event: MyH3Event<Request>) {
    return await UnitModel.findOne({ where: { id: event.context.params?.id } })
  }

  @get('/api/unit')
  async findAll() {
    return await UnitModel.findAll()
  }

  @post('/api/unit')
  async postData(event: MyH3Event<Request>) {
    console.log(this)
    const data = await useValidatedBody(event, this.validationSchema)
    return (await UnitModel.create(data)).toJSON()
  }
}

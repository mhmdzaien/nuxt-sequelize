export class Kriteria {
  @get('/api/kriteria/:id')
  findById(event: MyH3Event<Request>) {
    return event.context.params
  }

  @get('/api/kriteria')
  findAll() {
    return { kriteria: true }
  }

  @post('/api/kriteria')
  postData() {
    return {
      status: 'success',
    }
  }
}

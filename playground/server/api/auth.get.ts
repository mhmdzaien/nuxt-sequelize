export default defineMyEventHandler((event) => {
  const token = encodeAccessToken({ id: '001', nama: 'Zaien' }, true, event)
  return token
})

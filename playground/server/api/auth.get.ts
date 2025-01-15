export default defineMyEventHandler(async (event) => {
  const user = { id: '001', nama: 'Zaien' }
  useStorage('node-cache').setItem('request', Date.now())
  console.log(await useStorage('node-cache').getKeys())
  const accessToken = encodeAccessToken(
    user as UserPayload,
    true,
    event,
  )
  const refreshToken = encodeRefreshToken(user.id)
  return { accessToken, refreshToken }
})

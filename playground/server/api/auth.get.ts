export default defineMyEventHandler((event) => {
  const user = { id: '001', nama: 'Zaien' }
  const accessToken = encodeAccessToken(
    user as UserPayload,
    true,
    event,
  )
  const refreshToken = encodeRefreshToken(user.id)
  return { accessToken, refreshToken }
})

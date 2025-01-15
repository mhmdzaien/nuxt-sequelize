export default defineMyEventHandler((event) => {
  revokeToken(getCookie(event, 'accessToken')!, 'access')
  return 'revoked'
}, '*')

export default defineMyEventHandler(async (event) => {
  const t = await useTranslation(event)
  return { token: event.context.decodedToken, s: t }
})

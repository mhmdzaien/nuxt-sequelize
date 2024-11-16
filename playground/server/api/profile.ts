export default defineMyEventHandler(async (event) => {
  const t = await useTranslation(event)
  return event.context.decodedToken
})

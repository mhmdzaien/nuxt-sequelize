export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event)

  const interval = setInterval(async () => {
    await eventStream.push(JSON.stringify({ status: true, process: 'Running' }))
  }, 1000)
  eventStream.onClosed(async () => {
    console.log('Closed')
    clearInterval(interval)
    await eventStream.close()
  })
  return eventStream.send()
})

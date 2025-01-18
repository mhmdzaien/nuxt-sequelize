export default defineMyEventHandler(async () => {
  await useStorage('sqlite-cache').setItem('tes2', 'value', { ttlSecond: 60 * 2 })
  console.log('getKeys : ', await useStorage('sqlite-cache').getKeys())
  console.log('has : ', await useStorage('sqlite-cache').hasItem('tes'))
  console.log('get : ', await useStorage('sqlite-cache').getItem('tes'))
  return []
})

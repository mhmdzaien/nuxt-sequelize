import { existsSync, writeFileSync, unlinkSync } from 'node:fs'

const runBackground = async () => {
  if (!existsSync('./.sinkron.lock')) {
    writeFileSync('./.sinkron.lock', '')
    try {
      console.log('test')
    }
    catch (err) {
      console.log(err)
    }
    finally {
      unlinkSync('./sinkron/.lock')
    }
  }
  setTimeout(() => {
    console.log('Finished Process')
  }, 10000)
}

export default defineMyEventHandler(() => {
  runBackground()
  return ['success']
})

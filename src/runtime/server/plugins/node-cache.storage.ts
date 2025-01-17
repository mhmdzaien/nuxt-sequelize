import NodeCache from 'node-cache'
import { defineDriver, type Unwatch } from 'unstorage'
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { useStorage } from '#imports'

const nodeCacheDriver = defineDriver<NodeCache.Options | undefined, never>((options: NodeCache.Options | undefined) => {
  const myCache = new NodeCache(options)
  return {
    name: 'node-cache-driver',
    options,
    async hasItem(key, _opts) {
      return myCache.has(key)
    },
    async getItem(key, _opts) {
      return myCache.get(key)
    },
    async setItem(key, value, opts?: { ttl?: number | string | undefined }) {
      myCache.set(key, value, opts?.ttl ?? 0)
    },
    async removeItem(key, _opts) {
      myCache.del(key)
    },
    async getKeys() {
      return myCache.keys()
    },
    async clear() {
      return myCache.flushAll()
    },
    async dispose() {
      return myCache.close()
    },
    async watch(callback) {
      return myCache.addListener('set', callback) as unknown as Unwatch
    },
  }
})

export default defineNitroPlugin(() => {
  const storage = useStorage()
  storage.mount('node-cache', nodeCacheDriver({}))
})

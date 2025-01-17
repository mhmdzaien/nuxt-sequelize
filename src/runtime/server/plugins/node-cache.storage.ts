import fs from 'node:fs'
import type { CacheSerializer } from 'persistent-node-cache'
import PersistentNodeCache from 'persistent-node-cache'
import { defineDriver, type Unwatch } from 'unstorage'
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { useStorage } from '#imports'

type PersistentNodeCacheOptions = {
  cacheName: string
  period?: number
  dir?: string
  opts?: unknown
  serializer?: CacheSerializer
}

const nodeCacheDriver = defineDriver<PersistentNodeCacheOptions | undefined, never>((options: PersistentNodeCacheOptions | undefined) => {
  const dir = options?.dir ?? './.cache'
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir)
  const myCache = new PersistentNodeCache.PersistentNodeCache(options?.cacheName ?? 'default', options?.period, dir, options?.opts, options?.serializer)
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

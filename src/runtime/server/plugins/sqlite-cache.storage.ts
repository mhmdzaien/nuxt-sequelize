import fs from 'node:fs'
import { defineDriver, type Unwatch } from 'unstorage'
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { SqliteCache, type SqliteCacheConfiguration } from '../../libs/sqlite-cache'
import { useStorage } from '#imports'

const sqliteCacheDriver = defineDriver<SqliteCacheConfiguration & { dir: string } | undefined, never>((options: SqliteCacheConfiguration & { dir: string } | undefined) => {
  const dir = options?.dir ?? './.cache'
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir)
  const myCache = new SqliteCache({
    database: options!.database!, // or path to your database on disk
    defaultTtlMs: 1000 * 60 * 60, // optional TTL in milliseconds
    maxItems: 1000, // optional LRU
    compress: false, // use gzip for values > 1024 bytes, can be smaller, but slower
  })
  return {
    name: 'sqlite',
    options,
    async hasItem(key, _opts) {
      return myCache.has(key)
    },
    async getItem(key, _opts) {
      return myCache.get(key)
    },
    async setItem(key, value, opts?: { ttlSecond?: number | undefined }) {
      return myCache.set(key, value, { ttlMs: (opts?.ttlSecond ? opts.ttlSecond * 1000 : undefined) })
    },
    async removeItem(key, _opts) {
      return myCache.delete(key)
    },
    async getKeys() {
      return myCache.keys()
    },
    async clear() {
      return myCache.clear()
    },
    async dispose() {
      return myCache.close()
    },
    async watch(callback) {
      return myCache.watch(callback) as unknown as Unwatch
    },
  }
})

export default defineNitroPlugin(() => {
  const storage = useStorage()
  storage.mount('sqlite-cache', sqliteCacheDriver({ database: './.cache/cache.sqlite', dir: './.cache' }))
})

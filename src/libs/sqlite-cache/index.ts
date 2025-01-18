import zlib from 'node:zlib'
import { promisify } from 'node:util'
import Database from 'better-sqlite3'
import cbor from 'cbor'
import debounce from 'debounce'
import z from 'zod'

const COMPRESSION_MIN_LENGTH = 1024

export interface SqliteCacheConfiguration {
  /**
   * Database file path or `:memory:` for in-memory database.
   */
  readonly database: string

  /**
   * Default maximum time-to-live in milliseconds. Cache entries will be evicted after this time.
   * Can be overridden by `ttlMs` option in `set` method.
   * @default undefined - no ttl
   */
  readonly defaultTtlMs?: number

  /**
   * Maximum number of items in the cache. Cache entries with oldest access time will be evicted after this number is reached.
   * @default undefined - no limit
   */
  readonly maxItems?: number

  /**
   * Should we compress items on `set` with gzip. Old items will remain untouched so this flag can be switched at any time.
   * @default false
   */
  readonly compress?: boolean
}

const configurationSchema = z.object({
  database: z.string(),
  defaultTtlMs: z.number().positive().optional(),
  maxItems: z.number().positive().optional(),
  compress: z.boolean().optional().default(false),
})

async function initSqliteCache(configuration: SqliteCacheConfiguration) {
  const db = new Database(configuration.database, {})

  db.transaction(() => {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value BLOB,
        expires INT,
        lastAccess INT,
        compressed BOOLEAN
      )`,
    ).run()

    db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS key ON cache (key)`).run()
    db.prepare(`CREATE INDEX IF NOT EXISTS expires ON cache (expires)`).run()
    db.prepare(
      `CREATE INDEX IF NOT EXISTS lastAccess ON cache (lastAccess)`,
    ).run()
  })()

  return {
    db,
    hasStatement: db.prepare(
      `SELECT count(key) as count FROM cache WHERE key = @key AND (expires > @now OR expires IS NULL)`,
    ),
    keysStatement: db.prepare(
      `SELECT key FROM cache WHERE expires > @now OR expires IS NULL`,
    ),
    getStatement: db.prepare(
      `UPDATE OR IGNORE cache
      SET lastAccess = @now
      WHERE key = @key AND (expires > @now OR expires IS NULL)
      RETURNING value, compressed`,
    ),
    setStatement: db.prepare(
      `INSERT OR REPLACE INTO cache
      (key, value, expires, lastAccess, compressed) VALUES (@key, @value, @expires, @now, @compressed)`,
    ),
    deleteStatement: db.prepare(`DELETE FROM cache WHERE key = @key`),
    clearStatement: db.prepare(`DELETE FROM cache`),
    cleanupExpiredStatement: db.prepare(`
      DELETE FROM cache WHERE expires < @now
    `),
    cleanupLruStatement: db.prepare(`
      WITH lru AS (SELECT key FROM cache ORDER BY lastAccess DESC LIMIT -1 OFFSET @maxItems)
      DELETE FROM cache WHERE key IN lru
    `),
  }
}

function now() {
  return Date.now()
}

const compress = promisify(zlib.gzip)
const decompress = promisify(zlib.gunzip)

export class SqliteCache<TData = unknown> {
  private readonly db: ReturnType<typeof initSqliteCache>
  private readonly checkInterval: NodeJS.Timeout
  private isClosed: boolean = false

  constructor(private readonly configuration: SqliteCacheConfiguration) {
    const config = configurationSchema.parse(configuration)
    this.db = initSqliteCache(config)
    this.checkInterval = setInterval(this.checkForExpiredItems, 1000)
  }

  public async has(key: string): Promise<boolean> {
    if (this.isClosed) {
      throw new Error('Cache is closed')
    }

    const res = (await this.db).hasStatement.get({
      key,
      now: now(),
    }) as { count: number }

    if (!res) {
      return false
    }

    return res.count > 0
  }

  public async keys(): Promise<Array<string>> {
    if (this.isClosed) {
      throw new Error('Cache is closed')
    }

    const res = (await this.db).keysStatement.all({ now: now() }) as Array<{ key: string }>
    if (!res) {
      return []
    }
    return res.map(item => item.key)
  }

  /**
   * Get cache item by it's key.
   */
  public async get<T = TData>(key: string): Promise<T | undefined> {
    if (this.isClosed) {
      throw new Error('Cache is closed')
    }

    const res = (await this.db).getStatement.get({
      key,
      now: now(),
    }) as { compressed: unknown, value: unknown }

    if (!res) {
      return undefined
    }

    let value: Buffer = res.value as Buffer

    if (res.compressed) {
      value = await decompress(value)
    }

    return cbor.decode(value)
  }

  /**
   * Updates cache item by key or creates new one if it doesn't exist.
   */
  public async set<T = TData>(
    key: string,
    value: T,
    opts: { ttlMs?: number, compress?: boolean } = {},
  ) {
    if (this.isClosed) {
      throw new Error('Cache is closed')
    }

    const ttl = opts.ttlMs ?? opts.ttlMs
    const expires = ttl !== undefined ? new Date(Date.now() + ttl) : undefined

    let compression = opts.compress ?? this.configuration.compress ?? false

    let valueBuffer = cbor.encode(value)

    if (compression && valueBuffer.length >= COMPRESSION_MIN_LENGTH) {
      const compressed = await compress(valueBuffer)
      if (compressed.length >= valueBuffer.length) {
        compression = false
      }
      else {
        valueBuffer = compressed
      }
    }
    else {
      compression = false
    }

    (await this.db).setStatement.run({
      key,
      value: valueBuffer,
      expires: expires?.getTime(),
      compressed: compression ? 1 : 0,
      now: now(),
    })

    setImmediate(this.checkForExpiredItems.bind(this))
  }

  /**
   * Remove specific item from the cache.
   */
  public async delete(key: string) {
    if (this.isClosed) {
      throw new Error('Cache is closed')
    }

    (await this.db).deleteStatement.run({ key, now: now() })
  }

  /**
   * Remove all items from the cache.
   */
  public async clear() {
    if (this.isClosed) {
      throw new Error('Cache is closed')
    }

    (await this.db).clearStatement.run({})
  }

  /**
   * Close database and cleanup resources.
   */
  public async close() {
    clearInterval(this.checkInterval);
    (await this.db).db.close()
    this.isClosed = true
  }

  public watch(callback: unknown) {
    if (callback) {
      const call = callback as () => void
      call()
    }
  }

  private checkForExpiredItems = debounce(
    async () => {
      if (this.isClosed) {
        return
      }

      try {
        const db = await this.db
        db.cleanupExpiredStatement.run({ now: now() })

        if (this.configuration.maxItems) {
          db.cleanupLruStatement.run({
            maxItems: this.configuration.maxItems,
          })
        }
      }
      catch (ex) {
        console.error(
          'Error in cache-sqlite-lru-ttl when checking for expired items',
          ex,
        )
      }
    },
    100,
    { immediate: true },
  )
}

export default SqliteCache
// Base source: https://github.com/jkelin/cache-sqlite-lru-ttl/tree/master

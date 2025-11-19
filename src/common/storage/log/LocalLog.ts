/**
 * LocalLog - typed wrapper around IndexedDB for logging in the app
 * Usage:
 *   import localLog from 'src/common/storage/log/LocalLog';
 *   await localLog.add({ url: '/api', params: {a:1}, date: new Date() });
 */

export interface LogRecord {
  id?: number;
  url?: string;
  params?: any;
  funReturn?: any;
  fun?: string;
  level?: 'info' | 'warn' | 'error' | 'debug' | 'log';
  order?: number;
  date?: string | Date;
  [key: string]: any;
}

export class LocalLogClass {
  private dbName = 'logs';
  private dbVersion = 1;
  private db?: IDBDatabase;
  private fields = ['url', 'params', 'funReturn', 'fun', 'order', 'date'];

  /**
   * Open/create the database. Safe to call multiple times.
   */
  createDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (ev) => {
        console.error('打开数据库失败', ev);
        reject(ev);
      };

      request.onsuccess = () => {
        this.db = request.result;
        // Optional: handle connection close
        this.db.onversionchange = () => {
          this.db?.close();
          this.db = undefined;
        };
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create object store if not exists
        if (!db.objectStoreNames.contains(this.dbName)) {
          const objectStore = db.createObjectStore(this.dbName, {
            keyPath: 'id',
            autoIncrement: true,
          });
          objectStore.createIndex('id', 'id', { unique: true });
          for (const f of this.fields) {
            objectStore.createIndex(f, f, { unique: false });
          }
        }
      };
    });
  }

  /**
   * Add a new log record. Returns the generated id.
   */
  async add(record: LogRecord): Promise<number> {
    const db = await this.createDB();
    const sanitize = (value: any, seen = new WeakSet()): any => {
      // primitives
      if (value === null || value === undefined) return value;
      const t = typeof value;
      if (t === "string" || t === "number" || t === "boolean") return value;
      if (t === "bigint") return value.toString();
      if (t === "symbol") return value.toString();
      if (t === "function") return "[Function]";
      // Dates
      if (value instanceof Date) return value.toISOString();
      // Avoid cloning DOM nodes, Yjs docs, EditorViews, etc.
      // Detect common non-plain objects by presence of constructor not Object/Array
      if (typeof value === "object") {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
        if (Array.isArray(value)) {
          return value.map((v) => sanitize(v, seen));
        }
        // For plain objects, copy enumerable properties
        const out: any = {};
        try {
          for (const key of Object.keys(value)) {
            try {
              out[key] = sanitize((value as any)[key], seen);
            } catch (e) {
              out[key] = "[Unserializable]";
            }
          }
        } catch (e) {
          // fallback to string
          return Object.prototype.toString.call(value);
        }
        return out;
      }
      return String(value);
    };

    const sanitizeRecord = (r: LogRecord): LogRecord => {
      const copy: LogRecord = { ...r };
      try {
        copy.params = sanitize(r.params);
      } catch (e) {
        copy.params = { _error: "params sanitize failed" };
      }
      // ensure date is serializable
      if (copy.date instanceof Date) copy.date = copy.date.toISOString();
      return copy;
    };

    const safeRecord = sanitizeRecord(record);

    return new Promise<number>((resolve, reject) => {
      try {
        const tx = db.transaction(this.dbName, "readwrite");
        const store = tx.objectStore(this.dbName);
        const req = store.add(safeRecord);
        req.onsuccess = () => {
          resolve((req.result as number) || 0);
        };
        req.onerror = async (ev: any) => {
          console.error("添加日志失败", ev);
          // fallback: try to store a minimal record
          try {
            const minimal: LogRecord = {
              level: (safeRecord as any).level,
              fun: safeRecord.fun,
              url: safeRecord.url,
              params: { message: String((safeRecord as any).params) },
              date: new Date().toISOString(),
            };
            const tx2 = db.transaction(this.dbName, "readwrite");
            const store2 = tx2.objectStore(this.dbName);
            const req2 = store2.add(minimal);
            req2.onsuccess = () => resolve((req2.result as number) || 0);
            req2.onerror = (e2: any) => reject(e2);
          } catch (e2) {
            reject(e2);
          }
        };
      } catch (err) {
        // If add throws synchronously (DataCloneError), try a minimal write
        try {
          const minimal: LogRecord = {
            level: (safeRecord as any).level,
            fun: safeRecord.fun,
            url: safeRecord.url,
            params: { message: String((safeRecord as any).params) },
            date: new Date().toISOString(),
          };
          const tx2 = db.transaction(this.dbName, "readwrite");
          const store2 = tx2.objectStore(this.dbName);
          const req2 = store2.add(minimal);
          req2.onsuccess = () => resolve((req2.result as number) || 0);
          req2.onerror = (e2: any) => reject(e2);
        } catch (e3) {
          reject(e3);
        }
      }
    });
  }

  /**
   * Get all log records.
   */
  async check(): Promise<LogRecord[]> {
    const db = await this.createDB();
    return new Promise<LogRecord[]>((resolve, reject) => {
      try {
        const tx = db.transaction(this.dbName, 'readonly');
        const store = tx.objectStore(this.dbName);
        // Use getAll where available for simplicity
        const req = store.getAll();
        req.onsuccess = () => {
          resolve((req.result as LogRecord[]) || []);
        };
        req.onerror = (ev) => reject(ev);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Clear all records in the log store.
   */
  async clear(): Promise<void> {
    const db = await this.createDB();
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(this.dbName, 'readwrite');
        const store = tx.objectStore(this.dbName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = (ev) => reject(ev);
      } catch (err) {
        reject(err);
      }
    });
  }
}

// default singleton for convenient import/use throughout project
const localLog = new LocalLogClass();
export default localLog;
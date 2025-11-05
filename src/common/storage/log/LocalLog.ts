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
        console.log('打开数据库成功');
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
    return new Promise<number>((resolve, reject) => {
      try {
        const tx = db.transaction(this.dbName, 'readwrite');
        const store = tx.objectStore(this.dbName);
        const req = store.add(record);
        req.onsuccess = (ev) => {
          resolve((req.result as number) || 0);
        };
        req.onerror = (ev) => {
          console.error('添加日志失败', ev);
          reject(ev);
        };
      } catch (err) {
        reject(err);
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
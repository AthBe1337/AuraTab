// utils/db.ts

const DB_NAME = 'WallpaperDB';
const STORE_NAME = 'backgrounds';
const DB_VERSION = 1;

export interface BackgroundRecord {
  id: string;
  file: Blob; // 直接存储二进制文件对象
  createdAt: number;
}

// 打开/初始化数据库
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // 创建仓库，使用 id 作为主键
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const bgDB = {
  // 添加图片
  add: async (file: File): Promise<BackgroundRecord> => {
    const db = await openDB();
    const id = crypto.randomUUID(); // 生成唯一ID
    const record: BackgroundRecord = {
      id,
      file,
      createdAt: Date.now(),
    };
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(record);
      
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  },

  // 获取所有图片历史
  getAll: async (): Promise<BackgroundRecord[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      // 获取所有记录
      const request = store.getAll();
      
      request.onsuccess = () => {
        // 按时间倒序排列（最新的在前面）
        const results = request.result as BackgroundRecord[];
        resolve(results.sort((a, b) => b.createdAt - a.createdAt));
      };
      request.onerror = () => reject(request.error);
    });
  },

  // 删除图片
  delete: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getById: async (id: string): Promise<BackgroundRecord | undefined> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
  });
}
};
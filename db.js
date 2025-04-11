// IndexedDB setup
const DB_NAME = 'StudentMarksDB';
const DB_VERSION = 1;
const STORE_NAME = 'students';

let db;

// Open or create IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject('Database error');
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'Email' });
      }
    };
  });
}

// Store student data
function storeStudentData(studentData) {
  return new Promise((resolve, reject) => {
    openDB().then(db => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(studentData);
      
      request.onerror = (event) => {
        console.error('Error storing data:', event.target.error);
        reject('Error storing data');
      };
      
      request.onsuccess = () => {
        resolve();
      };
    }).catch(reject);
  });
}

// Get student data from cache
function getStudentDataFromCache(email) {
  return new Promise((resolve, reject) => {
    openDB().then(db => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(email);
      
      request.onerror = (event) => {
        console.error('Error retrieving data:', event.target.error);
        reject('Error retrieving data');
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    }).catch(reject);
  });
}

// Check if local data exists for student
function checkLocalData(email) {
  return new Promise((resolve) => {
    getStudentDataFromCache(email).then(data => {
      resolve(!!data);
    }).catch(() => {
      resolve(false);
    });
  });
}

// Clear all cached data (for debugging)
function clearCache() {
  return new Promise((resolve, reject) => {
    openDB().then(db => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.clear();
      
      request.onerror = (event) => {
        console.error('Error clearing cache:', event.target.error);
        reject('Error clearing cache');
      };
      
      request.onsuccess = () => {
        resolve();
      };
    }).catch(reject);
  });
}

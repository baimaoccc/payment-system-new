/**
 * Simple IndexedDB wrapper for key-value storage.
 * Using a single object store 'KeyValueStore' in database 'AppDB'.
 */

const DB_NAME = "AppDB";
const STORE_NAME = "KeyValueStore";
const DB_VERSION = 1;

function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};

		request.onsuccess = (event) => {
			resolve(event.target.result);
		};

		request.onerror = (event) => {
			reject("IndexedDB open failed: " + event.target.error);
		};
	});
}

export const db = {
	async get(key) {
		try {
			const database = await openDB();
			return new Promise((resolve, reject) => {
				const transaction = database.transaction([STORE_NAME], "readonly");
				const store = transaction.objectStore(STORE_NAME);
				const request = store.get(key);

				request.onsuccess = () => {
					resolve(request.result);
				};

				request.onerror = () => {
					reject("IndexedDB get failed");
				};
			});
		} catch (e) {
			console.error(e);
			return null;
		}
	},

	async set(key, value) {
		try {
			const database = await openDB();
			return new Promise((resolve, reject) => {
				const transaction = database.transaction([STORE_NAME], "readwrite");
				const store = transaction.objectStore(STORE_NAME);
				const request = store.put(value, key);

				request.onsuccess = () => {
					resolve();
				};

				request.onerror = () => {
					reject("IndexedDB set failed");
				};
			});
		} catch (e) {
			console.error(e);
		}
	},

	async del(key) {
		try {
			const database = await openDB();
			return new Promise((resolve, reject) => {
				const transaction = database.transaction([STORE_NAME], "readwrite");
				const store = transaction.objectStore(STORE_NAME);
				const request = store.delete(key);

				request.onsuccess = () => {
					resolve();
				};

				request.onerror = () => {
					reject("IndexedDB delete failed");
				};
			});
		} catch (e) {
			console.error(e);
		}
	},
};

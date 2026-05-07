const LOCAL_IMAGE_DB_NAME = "ticketrush.local-images";
const LOCAL_IMAGE_DB_VERSION = 1;
const LOCAL_IMAGE_STORE_NAME = "images";

type StoredLocalImage = {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  updatedAt: string;
};

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openLocalImageDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = window.indexedDB.open(LOCAL_IMAGE_DB_NAME, LOCAL_IMAGE_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(LOCAL_IMAGE_STORE_NAME)) {
        database.createObjectStore(LOCAL_IMAGE_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open IndexedDB."));
  });
}

async function runImageStoreTransaction<T>(
  mode: IDBTransactionMode,
  execute: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openLocalImageDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_IMAGE_STORE_NAME, mode);
    const request = execute(transaction.objectStore(LOCAL_IMAGE_STORE_NAME));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    };
  });
}

export async function saveLocalImage(id: string, file: File) {
  const image: StoredLocalImage = {
    id,
    blob: file,
    name: file.name,
    type: file.type,
    updatedAt: new Date().toISOString(),
  };

  await runImageStoreTransaction("readwrite", (store) => store.put(image));
  return id;
}

export async function readLocalImageBlob(id: string) {
  const image = await runImageStoreTransaction<StoredLocalImage | undefined>(
    "readonly",
    (store) => store.get(id),
  );

  return image?.blob ?? null;
}

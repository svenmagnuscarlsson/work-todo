const DB_NAME = 'SecurityTodoDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

const db = {
    dbPromise: null,

    async open() {
        if (this.dbPromise) return this.dbPromise;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                    store.createIndex('deadline', 'deadline', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.dbPromise = event.target.result;
                resolve(this.dbPromise);
            };

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    async getAllTasks() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async addTask(task) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Add timestamps
            task.createdAt = new Date();
            task.updatedAt = new Date();
            
            const request = store.add(task);

            request.onsuccess = () => resolve(request.result); // Returns the new ID
            request.onerror = () => reject(request.error);
        });
    },

    async updateTask(task) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            task.updatedAt = new Date();
            const request = store.put(task);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async deleteTask(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(Number(id)); // Ensure ID is a number

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    
    async seedData() {
        const tasks = await this.getAllTasks();
        if (tasks.length === 0) {
            console.log("Seeding initial data...");
            const sampleTasks = [
                {
                    title: "Kamerainstallation Lager 3",
                    description: "Hikvision DS-2CD2143G2-I, PoE-dragning behövs. Kontrollera switch-portar i rack 4.",
                    category: "camera",
                    progress: 69,
                    status: "in-progress",
                    deadline: "2025-12-14",
                    priority: "high",
                    estimatedTime: 480
                },
                {
                    title: "Brandlarm årlig service",
                    description: "Kontrollera detektorer, batteribyte centralapparat. Kund: Fastighets AB.",
                    category: "fire",
                    progress: 25,
                    status: "in-progress",
                    deadline: "2025-12-16",
                    priority: "medium",
                    estimatedTime: 240
                },
                {
                    title: "Passagesystem uppdatering",
                    description: "Firmware-uppdatering AXIS A1001, nya passerkort till receptionen.",
                    category: "access",
                    progress: 100,
                    status: "completed",
                    deadline: "2025-12-10",
                    priority: "low",
                    estimatedTime: 120
                },
                {
                    title: "Låsbyte Entré B",
                    description: "Byte av låskista och cylinder. Assa Abloy.",
                    category: "lock",
                    progress: 0,
                    status: "unresolved",
                    deadline: "2025-12-20",
                    priority: "medium",
                    estimatedTime: 60
                }
            ];
            
            for (const task of sampleTasks) {
                await this.addTask(task);
            }
            return true; // Seeded
        }
        return false; // Already exists
    }
};

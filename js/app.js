document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI
    UI.init();

    // Check for seed data
    await db.seedData();

    // Load Tasks
    loadAndRender();

    // Handle Task Filter Change
    document.addEventListener('filter-changed', () => {
        loadAndRender(false); // don't refetch, just re-render is usually what UI does, but here UI.renderTasks takes tasks.
        // Actually UI.js handles its own filter state, but we need to pass the full list again or filtered list.
        // Let's refetch from DB to be safe or store in memory.
        // For simplicity, let's just re-fetch all (low overhead for indexedDB local) and let UI filter.
        loadAndRender();
    });

    // Handle Form Submit
    UI.selectors.taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value;
        const deadline = document.getElementById('task-deadline').value;

        // Validation
        if (!title.trim()) {
            alert('Vänligen fyll i en titel för uppgiften.');
            document.getElementById('task-title').focus();
            return;
        }

        if (!deadline) {
            alert('Vänligen välj en deadline för uppgiften.');
            document.getElementById('task-deadline').focus();
            return;
        }

        const task = {
            title: title,
            description: document.getElementById('task-desc').value,
            category: document.getElementById('task-category').value,
            deadline: deadline,
            estimatedTime: Number(document.getElementById('task-time').value),
            progress: Number(document.getElementById('task-progress').value),
            status: 'in-progress' // default, but logic below refines it
        };

        // Refine status
        if (task.progress === 100) task.status = 'completed';
        else if (task.progress === 0) task.status = 'unresolved';

        // Check overdue
        if (task.status !== 'completed') {
            const daysLeft = UI.calculateDaysLeft(task.deadline);
            if (daysLeft < 0) task.status = 'overdue';
        }

        if (id) {
            task.id = Number(id);
            // Preserve createdAt if strictly necessary, but db.updateTask updates updatedAt
            // We need to fetch original to preserve createdAt? 
            // IndexedDB put overwrites. db.js could handle partial updates or we fetch first.
            // Simplified: We assume overwrite is fine for this todo app or minimal loss.
            // Better: merge.
            const existing = (await db.getAllTasks()).find(t => t.id === Number(id));
            if (existing) {
                task.createdAt = existing.createdAt;
                task.priority = existing.priority; // preserve priority if not in form
            }
            await db.updateTask(task);
        } else {
            task.priority = 'medium'; // default
            await db.addTask(task);
        }

        UI.closeModal();
        loadAndRender();
    });

    // Handle Delete
    document.addEventListener('task-delete', async (e) => {
        await db.deleteTask(e.detail);
        loadAndRender();
    });

    // Handle Update (Status change etc)
    document.addEventListener('task-update', async (e) => {
        await db.updateTask(e.detail);
        loadAndRender();
    });

    async function loadAndRender(refreshStats = true) {
        try {
            const tasks = await db.getAllTasks();

            // Sort by priority/deadline?
            // Simple sort: deadline ascending
            tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

            if (refreshStats) {
                UI.renderStats(tasks);
                UI.renderFilters(tasks);
            }
            UI.renderTasks(tasks);
        } catch (error) {
            console.error("Failed to load tasks", error);
            UI.showError("Kunde inte ladda uppgifter från databasen. Kontrollera att din webbläsare tillåter lokal lagring.");
        }
    }
});

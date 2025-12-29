document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI
    UI.init();

    // Check for seed data
    await db.seedData();

    // Load Tasks
    loadAndRender();

    // Handle Task Filter Change
    document.addEventListener('filter-changed', () => {
        loadAndRender();
    });

    // Handle Status Filter (from stats cards)
    document.addEventListener('filter-status', (e) => {
        loadAndRender(false, e.detail);
    });

    // Handle Form Submit
    UI.selectors.taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value;
        const deadline = document.getElementById('task-deadline').value;

        // Validation
        UI.clearErrors();
        let hasError = false;

        if (!title.trim()) {
            UI.showInputError('title', true);
            hasError = true;
        }

        if (!deadline) {
            UI.showInputError('deadline', true);
            hasError = true;
        }

        if (hasError) {
            // Focus first error
            if (!title.trim()) document.getElementById('task-title').focus();
            else if (!deadline) document.getElementById('task-deadline').focus();
            return;
        }

        UI.setLoading(true);

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

        try {
            // Artificial delay to show loader
            await new Promise(resolve => setTimeout(resolve, 600));

            if (id) {
                task.id = Number(id);
                const existing = (await db.getAllTasks()).find(t => t.id === Number(id));
                if (existing) {
                    task.createdAt = existing.createdAt;
                    task.priority = existing.priority;
                }
                await db.updateTask(task);
                UI.showToast('Uppgiften har uppdaterats');
            } else {
                task.priority = 'medium';
                await db.addTask(task);
                UI.showToast('Ny uppgift skapad');
            }

            UI.closeModal();
            loadAndRender();
        } catch (error) {
            console.error("Save failed", error);
            UI.showToast('Kunde inte spara uppgiften', 'error');
        } finally {
            UI.setLoading(false);
        }
    });

    // Handle Delete
    document.addEventListener('task-delete', async (e) => {
        try {
            await db.deleteTask(e.detail);
            UI.showToast('Uppgiften har tagits bort');
            loadAndRender();
        } catch (error) {
            UI.showToast('Kunde inte ta bort uppgiften', 'error');
        }
    });

    // Handle Update (Status change etc)
    document.addEventListener('task-update', async (e) => {
        try {
            await db.updateTask(e.detail);
            UI.showToast('Status uppdaterad');
            loadAndRender();
        } catch (error) {
            UI.showToast('Kunde inte uppdatera status', 'error');
        }
    });

    async function loadAndRender(refreshStats = true, statusFilter = 'all') {
        try {
            let tasks = await db.getAllTasks();

            // Apply status filter if requested
            if (statusFilter !== 'all') {
                if (statusFilter === 'active') {
                    tasks = tasks.filter(t => t.status !== 'completed');
                } else if (statusFilter === 'completed') {
                    tasks = tasks.filter(t => t.status === 'completed');
                }
            }

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

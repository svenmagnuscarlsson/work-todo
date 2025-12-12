const UI = {
    selectors: {
        taskList: document.getElementById('task-list'),
        statProjects: document.getElementById('stat-projects'),
        statActive: document.getElementById('stat-active'),
        statTotal: document.getElementById('stat-total'),
        desktopFilters: document.getElementById('category-filters-desktop'),
        mobileFilter: document.getElementById('mobile-filter'),
        countAll: document.getElementById('count-all'),
        modal: document.getElementById('task-modal'),
        modalContent: document.getElementById('task-modal-content'),
        modalTitle: document.getElementById('modal-title'),
        btnAddTask: document.getElementById('btn-add-task'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        btnCancelModal: document.getElementById('btn-cancel-modal'),
        taskForm: document.getElementById('task-form'),
        progressInput: document.getElementById('task-progress'),
        progressVal: document.getElementById('progress-val')
    },

    icons: {
        camera: 'video',
        fire: 'flame',
        intrusion: 'shield-alert',
        access: 'scan',
        lock: 'lock',
        default: 'clipboard'
    },

    categoryLabels: {
        camera: 'Kamera / CCTV',
        fire: 'Brand',
        intrusion: 'Inbrott / Larm',
        access: 'Passage / Dörr',
        lock: 'Lås / Mekaniskt'
    },

    currentFilter: 'all',

    init() {
        this.setupEventListeners();
        this.renderFilters();
    },

    setupEventListeners() {
        // Modal Logic
        this.selectors.btnAddTask.addEventListener('click', () => this.openModal());
        this.selectors.btnCloseModal.addEventListener('click', () => this.closeModal());
        this.selectors.btnCancelModal.addEventListener('click', () => this.closeModal());

        // Close modal on outside click
        this.selectors.modal.addEventListener('click', (e) => {
            if (e.target === this.selectors.modal) this.closeModal();
        });

        // Progress slider update
        this.selectors.progressInput.addEventListener('input', (e) => {
            this.selectors.progressVal.textContent = e.target.value;
        });

        // Filter Logic (Desktop)
        this.selectors.desktopFilters.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const filter = btn.dataset.filter;
            this.setFilter(filter);
        });

        // Filter Logic (Mobile)
        this.selectors.mobileFilter.addEventListener('change', (e) => {
            this.setFilter(e.target.value);
        });
    },

    setFilter(filter) {
        this.currentFilter = filter;

        // Update Desktop UI
        const buttons = this.selectors.desktopFilters.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('bg-primary/10', 'text-primary');
                btn.classList.remove('text-text-secondary', 'hover:bg-gray-50');
            } else {
                btn.classList.remove('bg-primary/10', 'text-primary');
                btn.classList.add('text-text-secondary', 'hover:bg-gray-50');
            }
        });

        // Update Mobile UI
        this.selectors.mobileFilter.value = filter;

        // Re-render tasks
        document.dispatchEvent(new CustomEvent('filter-changed', { detail: filter }));
    },

    renderStats(tasks) {
        const total = tasks.length;
        const active = tasks.filter(t => t.status === 'in-progress' || t.status === 'unresolved').length;
        // Assume 'Projects' are unique locations or categories for now, or just placeholders. 
        // Let's count unique categories as "active types of projects"
        const projects = new Set(tasks.map(t => t.category)).size;

        this.selectors.statTotal.textContent = total;
        this.selectors.statActive.textContent = active;
        this.selectors.statProjects.textContent = projects;
    },

    renderFilters(tasks = []) {
        // Only update counts
        const allCount = tasks.length;
        this.selectors.countAll.textContent = allCount;

        // We could dynamically render categories here if needed, but they are static for now besides counts
        // To be implemented fully if dynamic categories are a requirement
    },

    renderTasks(tasks) {
        const filteredTasks = this.currentFilter === 'all'
            ? tasks
            : tasks.filter(t => t.category === this.currentFilter);

        this.selectors.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.selectors.taskList.innerHTML = `
                <div class="text-center py-12 bg-white rounded-xl shadow-sm">
                    <div class="bg-gray-100 p-4 rounded-full inline-block mb-4">
                        <i data-lucide="clipboard-x" class="h-8 w-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-text">Inga uppgifter hittades</h3>
                    <p class="text-text-secondary">Justera filtret eller skapa en ny uppgift.</p>
                </div>
            `;
        }

        filteredTasks.forEach(task => {
            const card = this.createTaskCard(task);
            this.selectors.taskList.appendChild(card);
        });

        lucide.createIcons();
    },

    createTaskCard(task) {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-xl shadow-sm p-4 sm:p-6 border-l-4 transition-transform hover:scale-[1.01] animate-fade-in relative';

        // Status Border Color
        const statusColors = {
            'unresolved': 'border-red-500',
            'in-progress': 'border-yellow-500',
            'completed': 'border-green-500',
            'overdue': 'border-purple-500'
        };
        div.classList.add(statusColors[task.status] || 'border-gray-300');

        // Progress Color
        let progressColor = '#3498db';
        if (task.progress === 100) progressColor = '#27ae60';
        else if (task.progress < 20) progressColor = '#e74c3c';

        const daysLeft = this.calculateDaysLeft(task.deadline);
        const daysLeftClass = daysLeft < 0 ? 'text-danger font-bold' : (daysLeft <= 2 ? 'text-accent font-bold' : 'text-text-secondary');
        const daysLeftText = daysLeft < 0 ? 'Försenad!' : (daysLeft === 0 ? 'Idag!' : `${daysLeft} dagar kvar`);

        div.innerHTML = `
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <!-- Progress -->
                <div class="progress-ring shrink-0" style="--progress: ${task.progress}%; --progress-color: ${progressColor}">
                    <span class="progress-ring-text">${task.progress}%</span>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="category-badge category-${task.category} flex items-center gap-1">
                            <i data-lucide="${this.icons[task.category] || this.icons.default}" class="h-3 w-3"></i>
                            ${this.categoryLabels[task.category]}
                        </span>
                        <span class="text-xs text-text-secondary flex items-center gap-1">
                            <i data-lucide="calendar" class="h-3 w-3"></i> ${task.deadline}
                        </span>
                    </div>
                    <h3 class="text-lg font-bold text-text truncate pr-8">${task.title}</h3>
                    <p class="text-text-secondary text-sm line-clamp-2">${task.description}</p>
                    
                    <div class="flex items-center gap-4 mt-3 text-sm">
                        <span class="${daysLeftClass} flex items-center gap-1">
                            <i data-lucide="clock" class="h-3 w-3"></i> ${daysLeftText}
                        </span>
                        <span class="text-text-secondary flex items-center gap-1">
                            <i data-lucide="hourglass" class="h-3 w-3"></i> ${task.estimatedTime} min
                        </span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                    <button class="p-2 text-text-secondary hover:text-primary transition-colors btn-edit" data-id="${task.id}">
                        <i data-lucide="edit-2" class="h-5 w-5"></i>
                    </button>
                    ${task.status !== 'completed' ? `
                    <button class="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors btn-complete" data-id="${task.id}">
                        Klarmarkera
                    </button>` : `
                    <button class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default">
                        <i data-lucide="check" class="h-4 w-4 inline mr-1"></i> Klar
                    </button>
                    `}
                    <button class="p-2 text-text-secondary hover:text-danger transition-colors btn-delete" data-id="${task.id}">
                        <i data-lucide="trash-2" class="h-5 w-5"></i>
                    </button>
                </div>
            </div>
        `;

        // Bind button events inside this card
        div.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Är du säker på att du vill ta bort uppgiften?')) {
                document.dispatchEvent(new CustomEvent('task-delete', { detail: task.id }));
            }
        });

        div.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(task);
        });

        const completeBtn = div.querySelector('.btn-complete');
        if (completeBtn) {
            completeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Optimistically update
                task.progress = 100;
                task.status = 'completed';
                document.dispatchEvent(new CustomEvent('task-update', { detail: task }));
            });
        }

        return div;
    },

    calculateDaysLeft(deadline) {
        const d = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = d - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    openModal(task = null) {
        this.selectors.modal.classList.remove('hidden');
        // Trigger reflow
        void this.selectors.modal.offsetWidth;
        this.selectors.modal.classList.remove('opacity-0');

        if (task) {
            this.selectors.modalTitle.textContent = 'Redigera Uppgift';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.description;
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-deadline').value = task.deadline;
            document.getElementById('task-time').value = task.estimatedTime;
            document.getElementById('task-progress').value = task.progress;
            this.selectors.progressVal.textContent = task.progress;
        } else {
            this.selectors.modalTitle.textContent = 'Ny Uppgift';
            this.selectors.taskForm.reset();
            document.getElementById('task-id').value = '';
            document.getElementById('task-progress').value = 0;
            this.selectors.progressVal.textContent = '0';
        }
    },

    closeModal() {
        this.selectors.modal.classList.add('opacity-0');
        setTimeout(() => {
            this.selectors.modal.classList.add('hidden');
        }, 200);
    }
};

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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    init() {
        if (!this.validateSelectors()) {
            console.error('UI initialization aborted due to missing DOM elements.');
            return;
        }
        this.setupEventListeners();
        this.renderFilters();
    },

    validateSelectors() {
        const required = ['taskList', 'btnAddTask', 'taskForm', 'modal'];
        let allFound = true;
        for (const key of required) {
            if (!this.selectors[key]) {
                console.warn(`Required selector missing: ${key}`);
                allFound = false;
            }
        }
        return allFound;
    },

    setupEventListeners() {
        // Modal Logic
        if (this.selectors.btnAddTask) {
            this.selectors.btnAddTask.addEventListener('click', () => this.openModal());
        }
        if (this.selectors.btnCloseModal) {
            this.selectors.btnCloseModal.addEventListener('click', () => this.closeModal());
        }
        if (this.selectors.btnCancelModal) {
            this.selectors.btnCancelModal.addEventListener('click', () => this.closeModal());
        }

        // Close modal on outside click
        if (this.selectors.modal) {
            this.selectors.modal.addEventListener('click', (e) => {
                if (e.target === this.selectors.modal) this.closeModal();
            });
        }

        // Progress slider update
        if (this.selectors.progressInput && this.selectors.progressVal) {
            this.selectors.progressInput.addEventListener('input', (e) => {
                this.selectors.progressVal.textContent = e.target.value;
            });
        }

        // Filter Logic (Desktop)
        if (this.selectors.desktopFilters) {
            this.selectors.desktopFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const filter = btn.dataset.filter;
                this.setFilter(filter);
            });
        }

        // Filter Logic (Mobile)
        if (this.selectors.mobileFilter) {
            this.selectors.mobileFilter.addEventListener('change', (e) => {
                this.setFilter(e.target.value);
            });
        }
    },

    setFilter(filter) {
        this.currentFilter = filter;

        // Update Desktop UI
        const buttons = this.selectors.desktopFilters.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('bg-primary', 'text-white', 'shadow-md', 'shadow-primary/25');
                btn.classList.remove('text-text-secondary', 'hover:bg-slate-50', 'bg-transparent');
            } else {
                btn.classList.remove('bg-primary', 'text-white', 'shadow-md', 'shadow-primary/25');
                btn.classList.add('text-text-secondary', 'hover:bg-slate-50', 'bg-transparent');
            }
        });

        // Update Mobile UI
        if (this.selectors.mobileFilter) {
            this.selectors.mobileFilter.value = filter;
        }

        // Re-render tasks
        document.dispatchEvent(new CustomEvent('filter-changed', { detail: filter }));
    },

    renderStats(tasks) {
        const total = tasks.length;
        const active = tasks.filter(t => t.status === 'in-progress' || t.status === 'unresolved').length;
        // Assume 'Projects' are unique locations or categories for now, or just placeholders. 
        // Let's count unique categories as "active types of projects"
        const projects = new Set(tasks.map(t => t.category)).size;

        if (this.selectors.statTotal) this.selectors.statTotal.textContent = total;
        if (this.selectors.statActive) this.selectors.statActive.textContent = active;
        if (this.selectors.statProjects) this.selectors.statProjects.textContent = projects;
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
                <div class="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100">
                    <div class="bg-slate-50 p-6 rounded-full inline-block mb-6 relative">
                        <i data-lucide="clipboard-x" class="h-12 w-12 text-slate-300"></i>
                        <div class="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full border-2 border-white">
                            <i data-lucide="search" class="h-4 w-4 text-white"></i>
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-text tracking-tight mb-2">Inga uppgifter hittades</h3>
                    <p class="text-text-secondary max-w-xs mx-auto">Vi kunde inte hitta några uppgifter som matchar ditt valda filter.</p>
                    <button class="mt-6 text-primary font-medium hover:text-primary-dark transition-colors" onclick="document.querySelector('[data-filter=all]').click()">
                        Rensa filter
                    </button>
                </div>
            `;
        }

        filteredTasks.forEach(task => {
            const card = this.createTaskCard(task);
            this.selectors.taskList.appendChild(card);
        });

        lucide.createIcons();
    },

    showError(message) {
        if (!this.selectors.taskList) return;

        this.selectors.taskList.innerHTML = `
            <div class="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-red-100 animate-fade-in">
                <div class="bg-red-50 p-6 rounded-full inline-block mb-6 relative">
                    <i data-lucide="alert-circle" class="h-12 w-12 text-red-500"></i>
                </div>
                <h3 class="text-xl font-bold text-text tracking-tight mb-2">Ett fel uppstod</h3>
                <p class="text-text-secondary max-w-xs mx-auto mb-6">${this.escapeHtml(message)}</p>
                <button class="px-6 py-2 bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark transition-all" onclick="location.reload()">
                    Ladda om sidan
                </button>
            </div>
        `;
        lucide.createIcons();
    },

    createTaskCard(task) {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group animate-fade-in relative overflow-hidden';

        // Status Colors (for dots/badges instead of border)
        const statusColors = {
            'unresolved': 'bg-red-500',
            'in-progress': 'bg-amber-500',
            'completed': 'bg-emerald-500',
            'overdue': 'bg-purple-500'
        };
        const statusDot = statusColors[task.status] || 'bg-slate-300';

        // Progress Color
        let progressColor = '#2563eb'; // primary
        if (task.progress === 100) progressColor = '#10b981'; // success
        else if (task.progress < 20) progressColor = '#ef4444'; // danger

        const daysLeft = this.calculateDaysLeft(task.deadline);
        const daysLeftClass = daysLeft < 0 ? 'text-danger font-bold' : (daysLeft <= 2 ? 'text-accent font-bold' : 'text-text-secondary');
        const daysLeftText = daysLeft < 0 ? 'Försenad!' : (daysLeft === 0 ? 'Idag!' : `${daysLeft} dagar kvar`);

        div.innerHTML = `
            <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-center relative z-10">
                <!-- Progress -->
                <div class="progress-ring shrink-0 scale-110" style="--progress: ${task.progress}%; --progress-color: ${progressColor}">
                    <span class="progress-ring-text text-text font-bold">${task.progress}%</span>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="category-badge category-${task.category} flex items-center gap-1.5 py-1 px-2.5 rounded-lg shadow-sm">
                            <i data-lucide="${this.icons[task.category] || this.icons.default}" class="h-3.5 w-3.5"></i>
                            ${this.categoryLabels[task.category]}
                        </span>
                        <div class="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                            <div class="w-1.5 h-1.5 rounded-full ${statusDot}"></div>
                            <span class="capitalize">${task.status === 'in-progress' ? 'Pågående' : (task.status === 'unresolved' ? 'Ej påbörjad' : task.status)}</span>
                        </div>
                    </div>
                    
                    <h3 class="text-xl font-bold text-text truncate pr-8 tracking-tight mb-1 group-hover:text-primary transition-colors">${this.escapeHtml(task.title)}</h3>
                    <p class="text-text-secondary text-sm line-clamp-2 leading-relaxed mb-4">${this.escapeHtml(task.description)}</p>
                    
                    <div class="flex items-center gap-6 text-sm border-t border-slate-50 pt-3 mt-1">
                        <span class="text-text-secondary flex items-center gap-2">
                            <i data-lucide="calendar" class="h-4 w-4 text-slate-400"></i> ${task.deadline}
                        </span>
                        <span class="${daysLeftClass} flex items-center gap-2">
                            <i data-lucide="clock" class="h-4 w-4 ${daysLeft < 0 ? 'text-danger' : 'text-slate-400'}"></i> ${daysLeftText}
                        </span>
                        <span class="text-text-secondary flex items-center gap-2">
                            <i data-lucide="hourglass" class="h-4 w-4 text-slate-400"></i> ${task.estimatedTime} min
                        </span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto mt-2 sm:mt-0 justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <button class="p-2.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-xl transition-all btn-edit hover:scale-105 active:scale-95" data-id="${task.id}" title="Redigera">
                        <i data-lucide="edit-2" class="h-5 w-5"></i>
                    </button>
                    ${task.status !== 'completed' ? `
                    <button class="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 btn-complete hover:scale-105 active:scale-95 flex items-center gap-2" data-id="${task.id}">
                        <i data-lucide="check" class="h-4 w-4"></i> Klart
                    </button>` : `
                    <button class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold cursor-default flex items-center gap-2">
                        <i data-lucide="check-circle" class="h-4 w-4"></i> Färdig
                    </button>
                    `}
                    <button class="p-2.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-xl transition-all btn-delete hover:scale-105 active:scale-95" data-id="${task.id}" title="Ta bort">
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

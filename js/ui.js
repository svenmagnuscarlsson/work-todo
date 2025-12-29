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
        progressVal: document.getElementById('progress-val'),
        errorTitle: document.getElementById('error-title'),
        errorDeadline: document.getElementById('error-deadline'),
        toastContainer: document.getElementById('toast-container'),
        btnSaveTask: document.getElementById('btn-save-task'),
        btnSaveText: document.getElementById('btn-save-text'),
        btnSaveLoader: document.getElementById('btn-save-loader')
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
        camera: 'Kamera',
        fire: 'Brand',
        intrusion: 'Inbrott',
        access: 'Passage',
        lock: 'Lås'
    },

    currentFilter: 'all',

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
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

            // Close modal on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.selectors.modal.classList.contains('hidden')) {
                    this.closeModal();
                }
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

        // Stats Card Filtering
        if (this.selectors.statProjects) {
            const projectCard = this.selectors.statProjects.parentElement;
            projectCard.addEventListener('click', () => this.setFilter('all'));
            projectCard.style.cursor = 'pointer';
        }
        if (this.selectors.statActive) {
            const activeCard = this.selectors.statActive.parentElement;
            activeCard.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('filter-status', { detail: 'active' }));
            });
            activeCard.style.cursor = 'pointer';
        }
        if (this.selectors.statTotal) {
            const totalCard = this.selectors.statTotal.parentElement;
            totalCard.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('filter-status', { detail: 'completed' }));
            });
            totalCard.style.cursor = 'pointer';
        }
    },

    setFilter(filter) {
        this.currentFilter = filter;

        // Update Desktop UI
        const buttons = this.selectors.desktopFilters.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('bg-teal-50', 'text-teal-700', 'font-bold');
                btn.classList.remove('text-slate-500', 'hover:bg-slate-50');
            } else {
                btn.classList.remove('bg-teal-50', 'text-teal-700', 'font-bold');
                btn.classList.add('text-slate-500', 'hover:bg-slate-50');
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
        const active = tasks.filter(t => t.status === 'in-progress' || t.status === 'unresolved' || t.status === 'overdue').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const projects = new Set(tasks.map(t => t.category)).size;

        if (this.selectors.statTotal) this.selectors.statTotal.textContent = completed; // Slutförda should show completed count
        if (this.selectors.statActive) this.selectors.statActive.textContent = active;
        if (this.selectors.statProjects) this.selectors.statProjects.textContent = projects;
    },

    renderFilters(tasks = []) {
        if (!this.selectors.desktopFilters) return;

        const categories = [
            { id: 'all', label: 'Alla' },
            ...Object.entries(this.categoryLabels).map(([id, label]) => ({ id, label }))
        ];

        this.selectors.desktopFilters.innerHTML = categories.map(cat => {
            const isActive = this.currentFilter === cat.id;
            const activeClasses = 'bg-teal-600 text-white shadow-md shadow-teal-500/20';
            const inactiveClasses = 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100';

            return `
                <button 
                    data-filter="${cat.id}"
                    class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap flex-shrink-0 ${isActive ? activeClasses : inactiveClasses}"
                    aria-label="Filtrera efter ${cat.label}">
                    ${cat.label}
                </button>
            `;
        }).join('');
    },

    renderTasks(tasks) {
        const filteredTasks = this.currentFilter === 'all'
            ? tasks
            : tasks.filter(t => t.category === this.currentFilter);

        this.selectors.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.selectors.taskList.innerHTML = `
                <div class="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                    <div class="bg-slate-50 p-5 rounded-full inline-block mb-4">
                        <i data-lucide="search-x" class="h-10 w-10 text-slate-300"></i>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800 tracking-tight mb-1">Hittade inga uppgifter</h3>
                    <p class="text-slate-400 text-sm max-w-xs mx-auto mb-6">Testa att byta kategori eller lägg till en ny uppgift.</p>
                </div>
            `;
        }

        filteredTasks.forEach(task => {
            const card = this.createTaskCard(task);
            this.selectors.taskList.appendChild(card);
        });

        lucide.createIcons();
    },

    showToast(message, type = 'success') {
        if (!this.selectors.toastContainer) return;

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-teal-600' : 'bg-rose-500';
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';

        toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in transition-all duration-300`;
        toast.innerHTML = `
            <i data-lucide="${icon}" class="h-4 w-4"></i>
            <span class="font-bold text-sm leading-none">${message}</span>
        `;

        this.selectors.toastContainer.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 310);
        }, 3000);
    },

    setLoading(isLoading) {
        if (!this.selectors.btnSaveTask) return;

        if (isLoading) {
            this.selectors.btnSaveTask.disabled = true;
            this.selectors.btnSaveTask.classList.add('opacity-80', 'cursor-not-allowed');
            this.selectors.btnSaveLoader.classList.remove('hidden');
            this.selectors.btnSaveText.textContent = 'Sparar...';
        } else {
            this.selectors.btnSaveTask.disabled = false;
            this.selectors.btnSaveTask.classList.remove('opacity-80', 'cursor-not-allowed');
            this.selectors.btnSaveLoader.classList.add('hidden');
            this.selectors.btnSaveText.textContent = 'Spara Uppgift';
        }
    },

    showError(message) {
        if (!this.selectors.taskList) return;

        this.selectors.taskList.innerHTML = `
            <div class="text-center py-20 bg-white rounded-2xl border border-rose-100 animate-fade-in">
                <div class="bg-rose-50 p-5 rounded-full inline-block mb-4">
                    <i data-lucide="alert-triangle" class="h-10 w-10 text-rose-400"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800 tracking-tight mb-1">Hoppsan, något gick fel</h3>
                <p class="text-slate-400 text-sm max-w-xs mx-auto mb-6">${this.escapeHtml(message)}</p>
                <button class="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-teal-700 transition-all" onclick="location.reload()">
                    Försök igen
                </button>
            </div>
        `;
        lucide.createIcons();
    },

    createTaskCard(task) {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 p-4 sm:p-6 mb-4 animate-fade-in relative transition-all active:scale-[0.98]';

        // Colors based on image
        const categoryColors = {
            'camera': 'bg-blue-100 text-blue-700',
            'fire': 'bg-rose-100 text-rose-700',
            'intrusion': 'bg-amber-100 text-amber-700',
            'access': 'bg-blue-50 text-blue-600', // Image shows light blue for "PASSAGE / DÖRR"
            'lock': 'bg-slate-100 text-slate-600'
        };
        const categoryPill = categoryColors[task.category] || 'bg-slate-50 text-slate-500';

        const isCompleted = task.status === 'completed';
        const statusColor = isCompleted ? 'text-emerald-500' : (task.status === 'in-progress' ? 'text-amber-500' : 'text-slate-400');
        const statusText = isCompleted ? 'Completed' : (task.status === 'in-progress' ? 'In Progress' : 'Pending');

        const daysLeft = this.calculateDaysLeft(task.deadline);
        // Date formatting to match "08/10/2024" style or similar
        const dateObj = new Date(task.deadline);
        const formattedDate = dateObj.toLocaleDateString('sv-SE'); // YYYY-MM-DD usually, or use custom

        div.innerHTML = `
            <div class="flex gap-3 sm:gap-5">
                <!-- Left: Progress Ring (Teal) -->
                <div class="shrink-0 pt-1">
                    <div class="relative w-12 h-12">
                        <svg class="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="21" fill="transparent" stroke="#E2E8F0" stroke-width="2.5"></circle>
                            <circle cx="24" cy="24" r="21" fill="transparent" stroke="#0D9488" stroke-width="2.5" 
                                stroke-dasharray="${2 * Math.PI * 21}" 
                                stroke-dashoffset="${2 * Math.PI * 21 * (1 - task.progress / 100)}" 
                                stroke-linecap="round"></circle>
                        </svg>
                    </div>
                </div>

                <!-- Right: Content -->
                <div class="flex-1 min-w-0">
                    <!-- Top Row: Category + Status -->
                    <div class="flex items-center justify-between mb-3">
                        <span class="${categoryPill} px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest">${this.categoryLabels[task.category] || 'Allmänt'}</span>
                        <div class="flex items-center gap-1.5">
                            <div class="w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}"></div>
                            <span class="text-xs font-medium text-slate-900">${statusText}</span>
                        </div>
                    </div>

                    <!-- Title & Description -->
                    <h3 class="text-lg font-bold text-slate-900 mb-2 leading-tight">${this.escapeHtml(task.title)}</h3>
                    <p class="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">${this.escapeHtml(task.description)}</p>

                    <!-- Footer Info (Date/Time) -->
                    <div class="flex items-center gap-6 text-sm font-medium text-slate-500 mb-6">
                        <div class="flex items-center gap-2">
                            <i data-lucide="calendar" class="h-4 w-4"></i> ${formattedDate}
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="clock" class="h-4 w-4"></i> 10:00 - 12:30
                        </div>
                    </div>

                    <!-- Action Buttons (Bottom Row - Styled like floating bubbles) -->
                    <div class="flex items-center justify-center gap-3 sm:gap-4 pt-2">
                        <!-- Edit (White Circle) -->
                        <button class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 hover:scale-110 transition-transform btn-edit" 
                            data-id="${task.id}" aria-label="Redigera uppgift">
                            <i data-lucide="pencil" class="h-4 w-4 sm:h-5 sm:w-5"></i>
                        </button>

                        <!-- Complete (Big Green) -->
                        ${!isCompleted ? `
                        <button class="h-12 w-16 sm:h-14 sm:w-20 rounded-[1.5rem] sm:rounded-[2rem] bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white hover:scale-105 transition-transform btn-complete" 
                            data-id="${task.id}" aria-label="Markera som slutförd">
                            <i data-lucide="check" class="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]"></i>
                        </button>
                        ` : `
                        <button class="h-12 w-16 sm:h-14 sm:w-20 rounded-[1.5rem] sm:rounded-[2rem] bg-emerald-100 flex items-center justify-center text-emerald-500 cursor-default" aria-label="Slutförd">
                             <i data-lucide="check" class="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]"></i>
                        </button>
                        `}

                        <!-- Delete (White Circle) -->
                        <button class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 hover:scale-110 transition-transform btn-delete" 
                            data-id="${task.id}" aria-label="Ta bort uppgift">
                            <i data-lucide="trash-2" class="h-4 w-4 sm:h-5 sm:w-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Card click for detail view (optional, sticking to modal for now)
        // div.addEventListener('click', (e) => { // prevent opening modal on button clicks });

        div.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(task);
        });

        div.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Vill du verkligen ta bort "${task.title}"?`)) {
                document.dispatchEvent(new CustomEvent('task-delete', { detail: task.id }));
            }
        });

        const completeBtn = div.querySelector('.btn-complete');
        if (completeBtn && !isCompleted) {
            completeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                task.progress = 100;
                task.status = 'completed'; // Update generic status
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
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            this.clearErrors();
        }, 300);
    },

    showInputError(fieldId, show = true) {
        const input = document.getElementById(`task-${fieldId}`);
        const error = document.getElementById(`error-${fieldId}`);

        if (!input || !error) return;

        if (show) {
            input.classList.add('border-rose-500', 'ring-4', 'ring-rose-500/10');
            input.classList.remove('border-slate-100', 'focus:border-teal-500', 'focus:ring-teal-500/5');
            error.classList.remove('hidden');
        } else {
            input.classList.remove('border-rose-500', 'ring-4', 'ring-rose-500/10');
            input.classList.add('border-slate-100', 'focus:border-teal-500', 'focus:ring-teal-500/5');
            error.classList.add('hidden');
        }
    },

    clearErrors() {
        ['title', 'deadline'].forEach(field => this.showInputError(field, false));
    }
};

class ProjectDashboard {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('projects')) || [];
        this.currentEditingProject = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.renderProjects();
    }

    initializeElements() {
        // Buttons
        this.addProjectBtn = document.getElementById('addProjectBtn');
        this.closeAddModal = document.getElementById('closeAddModal');
        this.cancelAdd = document.getElementById('cancelAdd');
        this.closeDetailModal = document.getElementById('closeDetailModal');
        this.editProjectBtn = document.getElementById('editProjectBtn');
        this.closeEditModal = document.getElementById('closeEditModal');
        this.cancelEdit = document.getElementById('cancelEdit');
        this.launchProjectBtn = document.getElementById('launchProjectBtn');
        this.refreshDetailScreenshot = document.getElementById('refreshDetailScreenshot');

        // Modals
        this.addProjectModal = document.getElementById('addProjectModal');
        this.projectDetailModal = document.getElementById('projectDetailModal');
        this.editProjectModal = document.getElementById('editProjectModal');

        // Forms
        this.addProjectForm = document.getElementById('addProjectForm');
        this.editProjectForm = document.getElementById('editProjectForm');

        // Grid
        this.projectsGrid = document.getElementById('projectsGrid');

        // Detail elements
        this.detailProjectName = document.getElementById('detailProjectName');
        this.detailProjectImage = document.getElementById('detailProjectImage');
        this.detailProjectDescription = document.getElementById('detailProjectDescription');
        this.detailProjectTools = document.getElementById('detailProjectTools');
    }

    attachEventListeners() {
        // Add project flow
        this.addProjectBtn.addEventListener('click', () => this.openAddModal());
        this.closeAddModal.addEventListener('click', () => this.closeModal(this.addProjectModal));
        this.cancelAdd.addEventListener('click', () => this.closeModal(this.addProjectModal));
        this.addProjectForm.addEventListener('submit', (e) => this.handleAddProject(e));

        // Detail modal
        this.closeDetailModal.addEventListener('click', () => this.closeModal(this.projectDetailModal));
        this.editProjectBtn.addEventListener('click', () => this.openEditModal());
        this.launchProjectBtn.addEventListener('click', () => this.launchProject());

        // Edit modal
        this.closeEditModal.addEventListener('click', () => this.closeModal(this.editProjectModal));
        this.cancelEdit.addEventListener('click', () => this.closeModal(this.editProjectModal));
        this.editProjectForm.addEventListener('submit', (e) => this.handleEditProject(e));

        // Screenshot refresh
        this.refreshDetailScreenshot.addEventListener('click', () => this.refreshDetailModalScreenshot());

        // Close modals on overlay click
        [this.addProjectModal, this.projectDetailModal, this.editProjectModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openAddModal() {
        this.addProjectForm.reset();
        this.openModal(this.addProjectModal);
    }

    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeAllModals() {
        [this.addProjectModal, this.projectDetailModal, this.editProjectModal].forEach(modal => {
            this.closeModal(modal);
        });
    }

    async handleAddProject(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitAddProject');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Adding...';
        
        try {
            const formData = new FormData(this.addProjectForm);
            const projectData = {
                id: Date.now().toString(),
                name: formData.get('name').trim(),
                description: formData.get('description').trim(),
                url: formData.get('url').trim(),
                tools: formData.get('tools') ? formData.get('tools').split(',').map(tool => tool.trim()).filter(tool => tool) : [],
                createdAt: new Date().toISOString()
            };

            // Generate screenshot
            await this.generateScreenshot(projectData);

            this.projects.push(projectData);
            this.saveProjects();
            this.renderProjects();
            this.closeModal(this.addProjectModal);

            // Show success feedback
            this.showToast('Project added successfully!', 'success');
        } catch (error) {
            console.error('Error adding project:', error);
            this.showToast('Error adding project. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async generateScreenshot(project) {
        try {
            // Free screenshot services that don't require API keys
            const screenshotServices = [
                // Primary: Screenshotapi.net (free tier, no key required)
                `https://screenshotapi.net/api/v1/screenshot?url=${encodeURIComponent(project.url)}&width=1200&height=800&output=image&file_type=png&wait_for_event=load`,
                
                // Backup: Image.thum.io (free service)
                `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(project.url)}`,
                
                // Alternative: Mini.s-shot.ru (free service)
                `https://mini.s-shot.ru/1024x768/png/?${encodeURIComponent(project.url)}`,
                
                // Fallback: Enhanced placeholder with project info
                this.createEnhancedPlaceholder(project)
            ];

            // Try to get a real screenshot
            for (let i = 0; i < screenshotServices.length - 1; i++) {
                try {
                    const response = await fetch(screenshotServices[i], {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'no-cache'
                    });
                    
                    if (response.ok && response.status === 200) {
                        // Check if the response is actually an image
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.startsWith('image/')) {
                            project.screenshot = screenshotServices[i];
                            console.log(`Screenshot captured using service ${i + 1}: ${this.getServiceName(i)}`);
                            return;
                        }
                    }
                } catch (serviceError) {
                    console.warn(`Screenshot service ${i + 1} failed:`, serviceError);
                    continue;
                }
            }
            
            // Use fallback placeholder
            project.screenshot = screenshotServices[screenshotServices.length - 1];
            console.log('Using enhanced placeholder screenshot');
            
        } catch (error) {
            console.error('Error generating screenshot:', error);
            project.screenshot = this.createEnhancedPlaceholder(project);
        }
    }

    getServiceName(index) {
        const serviceNames = [
            'screenshotapi.net',
            'image.thum.io', 
            'mini.s-shot.ru'
        ];
        return serviceNames[index] || 'unknown';
    }

    createEnhancedPlaceholder(project) {
        // Create a more informative placeholder URL
        const domain = this.extractDomain(project.url);
        const encodedName = encodeURIComponent(project.name.replace(/\s+/g, '+'));
        const encodedDomain = encodeURIComponent(domain);
        
        // Use a color based on the domain hash for visual variety
        const domainColor = this.getDomainColor(domain);
        
        return `https://via.placeholder.com/800x600/${domainColor}/ffffff?text=${encodedName}%0A${encodedDomain}`;
    }

    getDomainColor(domain) {
        // Generate a consistent color based on domain name
        let hash = 0;
        for (let i = 0; i < domain.length; i++) {
            hash = domain.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Convert to a pleasant color palette
        const colors = [
            '667eea', '764ba2', '89f7fe', 'f093fb', 
            'ffecd2', 'fcb69f', 'a8edea', 'd299c2',
            'fad0c4', 'ffd1ff', 'c2e9fb', '87ceeb'
        ];
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            return 'Invalid URL';
        }
    }

    renderProjects() {
        if (this.projects.length === 0) {
            this.projectsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No projects yet</h3>
                    <p>Click "Add Project" to get started</p>
                </div>
            `;
            return;
        }

        this.projectsGrid.innerHTML = this.projects.map((project, index) => `
            <div class="project-card" data-project-id="${project.id}" style="animation-delay: ${index * 100}ms">
                <div class="project-card-image">
                    ${project.screenshot ? 
                        `<img src="${project.screenshot}" alt="${project.name}" loading="lazy" 
                              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="project-placeholder" style="display: none;">
                            <i class="fas fa-image"></i>
                            <span>No preview</span>
                         </div>` :
                        `<div class="project-placeholder">
                            <i class="fas fa-image"></i>
                            <span>No preview</span>
                         </div>`
                    }
                    <button class="refresh-screenshot-btn" data-project-id="${project.id}" title="Refresh screenshot">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="project-card-content">
                    <h3 class="project-card-title">${this.escapeHtml(project.name)}</h3>
                    <p class="project-card-description">${this.escapeHtml(project.description)}</p>
                </div>
            </div>
        `).join('');

        // Attach click listeners to cards
        this.projectsGrid.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open detail if clicking refresh button
                if (e.target.closest('.refresh-screenshot-btn')) {
                    return;
                }
                const projectId = card.dataset.projectId;
                this.openProjectDetail(projectId);
            });
        });

        // Attach refresh screenshot listeners
        this.projectsGrid.querySelectorAll('.refresh-screenshot-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const projectId = btn.dataset.projectId;
                await this.refreshScreenshot(projectId, btn);
            });
        });
    }

    openProjectDetail(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        this.currentEditingProject = project;

        // Populate detail modal
        this.detailProjectName.textContent = project.name;
        this.detailProjectImage.src = project.screenshot || `https://via.placeholder.com/800x400/f8f9fa/1a1a1a?text=${encodeURIComponent(project.name)}`;
        this.detailProjectImage.alt = project.name;
        this.detailProjectImage.onerror = () => {
            this.detailProjectImage.src = `https://via.placeholder.com/800x400/f8f9fa/1a1a1a?text=${encodeURIComponent(project.name)}`;
        };
        this.detailProjectDescription.textContent = project.description;

        // Render tools
        this.detailProjectTools.innerHTML = project.tools.length > 0 
            ? project.tools.map(tool => `<span class="tool-tag">${this.escapeHtml(tool)}</span>`).join('')
            : '<span class="tool-tag">No tools specified</span>';

        this.openModal(this.projectDetailModal);
    }

    openEditModal() {
        if (!this.currentEditingProject) return;

        const project = this.currentEditingProject;
        
        // Populate edit form
        document.getElementById('editProjectName').value = project.name;
        document.getElementById('editProjectDescription').value = project.description;
        document.getElementById('editProjectUrl').value = project.url;
        document.getElementById('editProjectTools').value = project.tools.join(', ');

        this.closeModal(this.projectDetailModal);
        this.openModal(this.editProjectModal);
    }

    async handleEditProject(e) {
        e.preventDefault();
        
        if (!this.currentEditingProject) return;

        const submitBtn = document.getElementById('submitEditProject');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Updating...';

        try {
            const formData = new FormData(this.editProjectForm);
            const updatedData = {
                name: formData.get('name').trim(),
                description: formData.get('description').trim(),
                url: formData.get('url').trim(),
                tools: formData.get('tools') ? formData.get('tools').split(',').map(tool => tool.trim()).filter(tool => tool) : []
            };

            // Check if URL changed
            const urlChanged = updatedData.url !== this.currentEditingProject.url;

            // Update project
            Object.assign(this.currentEditingProject, updatedData);

            // Regenerate screenshot if URL changed
            if (urlChanged) {
                submitBtn.innerHTML = '<span class="loading"></span> Capturing screenshot...';
                await this.generateScreenshot(this.currentEditingProject);
            }

            this.saveProjects();
            this.renderProjects();
            this.closeModal(this.editProjectModal);

            // Show success feedback
            const message = urlChanged ? 'Project updated with new screenshot!' : 'Project updated successfully!';
            this.showToast(message, 'success');
        } catch (error) {
            console.error('Error updating project:', error);
            this.showToast('Error updating project. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    launchProject() {
        if (!this.currentEditingProject) return;
        
        window.open(this.currentEditingProject.url, '_blank', 'noopener,noreferrer');
    }

    async refreshScreenshot(projectId, buttonElement) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const originalIcon = buttonElement.innerHTML;
        
        try {
            // Show loading state
            buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            buttonElement.disabled = true;

            // Add cache-busting parameter to force refresh
            const originalUrl = project.screenshot;
            
            // Generate new screenshot
            await this.generateScreenshot(project);

            // Check if we got a new screenshot or if it's the same placeholder
            const isRealScreenshot = project.screenshot && 
                                   !project.screenshot.includes('via.placeholder.com') &&
                                   project.screenshot !== originalUrl;

            // Update the project and save
            this.saveProjects();
            
            // Re-render to show new screenshot
            this.renderProjects();

            // Show appropriate feedback
            if (isRealScreenshot) {
                this.showToast('Screenshot captured successfully!', 'success');
            } else {
                this.showToast('Screenshot service unavailable - using placeholder', 'info');
            }
        } catch (error) {
            console.error('Error refreshing screenshot:', error);
            this.showToast('Failed to refresh screenshot', 'error');
            
            // Reset button
            buttonElement.innerHTML = originalIcon;
            buttonElement.disabled = false;
        }
    }

    async refreshDetailModalScreenshot() {
        if (!this.currentEditingProject) return;

        const originalIcon = this.refreshDetailScreenshot.innerHTML;
        
        try {
            // Show loading state
            this.refreshDetailScreenshot.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.refreshDetailScreenshot.disabled = true;

            // Generate new screenshot
            await this.generateScreenshot(this.currentEditingProject);

            // Update the image in the modal
            this.detailProjectImage.src = this.currentEditingProject.screenshot;

            // Save the updated project
            this.saveProjects();
            
            // Re-render the cards to show new screenshot
            this.renderProjects();

            // Show success feedback
            this.showToast('Screenshot refreshed!', 'success');
        } catch (error) {
            console.error('Error refreshing screenshot:', error);
            this.showToast('Failed to refresh screenshot', 'error');
        } finally {
            // Reset button
            this.refreshDetailScreenshot.innerHTML = originalIcon;
            this.refreshDetailScreenshot.disabled = false;
        }
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle', 
            'info': 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add toast styles if not already present
        if (!document.querySelector('#toast-styles')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'toast-styles';
            toastStyles.textContent = `
                .toast {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.2s ease;
                    font-size: 0.95rem;
                }
                .toast.show {
                    transform: translateX(0);
                }
                .toast-success {
                    border-left: 3px solid #28a745;
                    color: #155724;
                }
                .toast-success i {
                    color: #28a745;
                }
                .toast-error {
                    border-left: 3px solid #dc3545;
                    color: #721c24;
                }
                .toast-error i {
                    color: #dc3545;
                }
                .toast-info {
                    border-left: 3px solid #0dcaf0;
                    color: #055160;
                }
                .toast-info i {
                    color: #0dcaf0;
                }
            `;
            document.head.appendChild(toastStyles);
        }

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Public API for testing
    getProjects() {
        return this.projects;
    }

    clearAllProjects() {
        this.projects = [];
        this.saveProjects();
        this.renderProjects();
    }

    addSampleProjects() {
        const sampleProjects = [
            {
                id: 'sample-1',
                name: 'E-commerce Platform',
                description: 'A modern e-commerce platform with React and Node.js backend. Features include user authentication, product catalog, shopping cart, and payment integration.',
                url: 'https://example-ecommerce.com',
                tools: ['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT'],
                screenshot: 'https://via.placeholder.com/800x600/667eea/ffffff?text=E-commerce+Platform',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample-2',
                name: 'Task Management App',
                description: 'A collaborative task management application with real-time updates and team collaboration features.',
                url: 'https://example-tasks.com',
                tools: ['Vue.js', 'Express', 'Socket.io', 'PostgreSQL'],
                screenshot: 'https://via.placeholder.com/800x600/10b981/ffffff?text=Task+Manager',
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample-3',
                name: 'Portfolio Website',
                description: 'A responsive portfolio website showcasing creative work with smooth animations and modern design.',
                url: 'https://example-portfolio.com',
                tools: ['HTML5', 'CSS3', 'JavaScript', 'GSAP', 'Netlify'],
                screenshot: 'https://via.placeholder.com/800x600/f59e0b/ffffff?text=Portfolio+Site',
                createdAt: new Date().toISOString()
            }
        ];

        this.projects = [...this.projects, ...sampleProjects];
        this.saveProjects();
        this.renderProjects();
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ProjectDashboard();
    
    // Add sample projects if none exist (for demo purposes, but not in test environment)
    if (window.dashboard.getProjects().length === 0 && !window.location.search.includes('test')) {
        window.dashboard.addSampleProjects();
    }
});

// Add global keyboard shortcuts for testing
document.addEventListener('keydown', (e) => {
    // Press 'T' to open add project modal (for testing)
    if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        window.dashboard.addProjectBtn.click();
    }
    
    // Press 'C' to clear all projects (for testing)
    if (e.key === 'c' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        if (confirm('Clear all projects? This action cannot be undone.')) {
            window.dashboard.clearAllProjects();
        }
    }
});

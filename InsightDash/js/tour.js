class DashboardTour {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                target: '.file-upload-section',
                title: 'Upload Your Data',
                content: 'Start by uploading a CSV file with your data. You can drag and drop a file here or click to browse your files.',
                position: 'bottom'
            },
            {
                target: '#theme-switch',
                title: 'Switch Themes',
                content: 'Toggle between light and dark modes based on your preference.',
                position: 'bottom'
            },
            {
                target: '#toggle-grid',
                title: 'Layout Options',
                content: 'Switch between grid and full-width layouts to view your charts differently.',
                position: 'bottom'
            },

            {
                target: '#download-all',
                title: 'Download Charts',
                content: 'Download all charts as PNG images for use in presentations or reports.',
                position: 'bottom'
            },
            {
                target: '.chart-container',
                title: 'Interactive Charts',
                content: 'Hover over data points to see details. Use the icons to download or expand charts.',
                position: 'top'
            },
            {
                target: '.insights-panel',
                title: 'Automatic Insights',
                content: 'We automatically analyze your data and highlight key insights here.',
                position: 'left'
            },
            {
                target: '.template-selector',
                title: 'Chart Templates',
                content: 'Choose from predefined templates to quickly visualize common data patterns.',
                position: 'top'
            }
        ];
        
        this.overlay = null;
        this.tooltip = null;
    }
    
    start() {
        this.createOverlay();
        this.createTooltip();
        this.showStep(0);
        
        // Add skip and navigate buttons event listeners
        document.getElementById('tour-next').addEventListener('click', () => this.nextStep());
        document.getElementById('tour-prev').addEventListener('click', () => this.prevStep());
        document.getElementById('tour-skip').addEventListener('click', () => this.end());
    }
    
    createOverlay() {
        // Create semi-transparent overlay
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'tour-overlay';
            document.body.appendChild(this.overlay);
        }
    }
    
    createTooltip() {
        // Create tooltip element
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tour-tooltip';
            this.tooltip.innerHTML = `
                <div class="tour-tooltip-header">
                    <h3 id="tour-title"></h3>
                    <button id="tour-skip">×</button>
                </div>
                <div class="tour-tooltip-body">
                    <p id="tour-content"></p>
                </div>
                <div class="tour-tooltip-footer">
                    <div class="tour-progress"></div>
                    <div class="tour-buttons">
                        <button id="tour-prev" class="btn btn-outline">Previous</button>
                        <button id="tour-next" class="btn">Next</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.tooltip);
        }
    }
    
    showStep(idx) {
        if (idx < 0 || idx >= this.steps.length) return;
        
        this.currentStep = idx;
        const step = this.steps[idx];
        
        // Find target element
        const target = document.querySelector(step.target);
        if (!target) {
            this.nextStep();
            return;
        }
        
        // Update tooltip content
        document.getElementById('tour-title').textContent = step.title;
        document.getElementById('tour-content').textContent = step.content;
        
        // Update progress indicators
        const progress = document.querySelector('.tour-progress');
        progress.innerHTML = '';
        for (let i = 0; i < this.steps.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'tour-dot' + (i === idx ? ' active' : '');
            progress.appendChild(dot);
        }
        
        // Position tooltip near target
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (step.position) {
            case 'top':
                top = targetRect.top - tooltipRect.height - 10;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = targetRect.bottom + 10;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left - tooltipRect.width - 10;
                break;
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + 10;
                break;
            default:
                top = targetRect.bottom + 10;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        }
        
        // Make sure tooltip stays within viewport
        if (top < 0) top = 10;
        if (left < 0) left = 10;
        if (top + tooltipRect.height > window.innerHeight) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        
        // Highlight target element
        target.classList.add('tour-highlight');
        this.tooltip.style.display = 'block';
        
        // Enable/disable navigation buttons
        document.getElementById('tour-prev').disabled = idx === 0;
        
        if (idx === this.steps.length - 1) {
            document.getElementById('tour-next').textContent = 'Finish';
        } else {
            document.getElementById('tour-next').textContent = 'Next';
        }
    }
    
    nextStep() {
        // Remove highlight from current target
        const currentTarget = document.querySelector(this.steps[this.currentStep].target);
        if (currentTarget) {
            currentTarget.classList.remove('tour-highlight');
        }
        
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.end();
        }
    }
    
    prevStep() {
        // Remove highlight from current target
        const currentTarget = document.querySelector(this.steps[this.currentStep].target);
        if (currentTarget) {
            currentTarget.classList.remove('tour-highlight');
        }
        
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    end() {
        // Remove all highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
        
        // Hide tooltip and overlay
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
        
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
        // Save in localStorage that user has seen the tour
        localStorage.setItem('has_seen_tour', 'true');
    }
}

// Make available globally
window.DashboardTour = DashboardTour; 
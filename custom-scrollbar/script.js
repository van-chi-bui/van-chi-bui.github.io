// Floating Scrollbar for Page Scrolling
class FloatingScrollbar {
    constructor(scrollbarElementId, thumbElementId) {
        this.scrollbar = document.getElementById(scrollbarElementId);
        this.thumb = document.getElementById(thumbElementId);
        this.isDragging = false;
        this.dragStartY = 0;
        this.thumbStartTop = 0;
        this.hideTimeout = null;

        // Performance optimization variables
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.lastScrollTop = 0;
        this.cachedDimensions = {};
        this.animationFrame = null;

        if (this.scrollbar && this.thumb) {
            this.init();
        }
    }

    init() {
        this.cacheStaticDimensions();
        this.updateThumbSize();
        this.updateThumbPosition();
        this.bindEvents();
        this.checkVisibility();

        // Update on window resize with throttling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.cacheStaticDimensions();
                this.updateThumbSize();
                this.updateThumbPosition();
                this.checkVisibility();
            }, 100);
        });
    }

    cacheStaticDimensions() {
        // Force layout recalculation to get accurate dimensions after CSS changes
        this.scrollbar.offsetHeight;

        this.cachedDimensions = {
            scrollbarHeight: this.scrollbar.clientHeight,
            windowHeight: window.innerHeight,
            // Account for small track padding (4px top + 4px bottom = 8px total)
            trackPadding: 8,
            effectiveTrackHeight: this.scrollbar.clientHeight - 8
        };
    }

    checkVisibility() {
        const hasScrollableContent = document.body.scrollHeight > this.cachedDimensions.windowHeight;
        if (hasScrollableContent) {
            this.scrollbar.style.display = 'block';
            this.ensureMinimumHeight();

            // If persistent, show immediately
            if (this.scrollbar.classList.contains('persistent')) {
                this.scrollbar.classList.add('visible');
            }
        } else {
            this.scrollbar.style.display = 'none';
        }
    }

    // Ensure scrollbar has minimum height for very short windows
    ensureMinimumHeight() {
        const currentHeight = this.scrollbar.clientHeight;
        const windowHeight = window.innerHeight;
        const isCompact = this.scrollbar.classList.contains('size-compact');

        if (isCompact && currentHeight < 100) {
            // If height is too small (less than 100px), ensure reasonable minimum
            const minHeight = Math.max(100, Math.min(windowHeight - 40, 300));
            this.scrollbar.style.minHeight = minHeight + 'px';
        } else if (!isCompact) {
            // Remove min-height for full size
            this.scrollbar.style.minHeight = '';
        }
    }

    // Method to toggle persistent mode
    setPersistent(persistent = true) {
        if (persistent) {
            this.scrollbar.classList.add('persistent');
            this.scrollbar.classList.add('visible');
            clearTimeout(this.hideTimeout);
        } else {
            this.scrollbar.classList.remove('persistent');
            // Will auto-hide based on normal behavior
            this.showScrollbar();
        }
    }

    // Method to check if persistent mode is enabled
    isPersistent() {
        return this.scrollbar.classList.contains('persistent');
    }

    // Method to set position: 'center', 'top', 'bottom'
    setPosition(position = 'center') {
        // Remove existing position classes
        this.scrollbar.classList.remove('position-center', 'position-top', 'position-bottom');
        // Add new position class
        this.scrollbar.classList.add(`position-${position}`);

        // Recalculate dimensions after position change
        setTimeout(() => {
            this.cacheStaticDimensions();
            this.updateThumbSize();
            this.updateThumbPosition();
        }, 50);
    }

    // Method to set size: 'compact', 'full'
    setSize(size = 'compact') {
        // Remove existing size classes
        this.scrollbar.classList.remove('size-compact', 'size-full');
        // Add new size class
        this.scrollbar.classList.add(`size-${size}`);

        // Recalculate dimensions after size change
        setTimeout(() => {
            this.cacheStaticDimensions();
            this.updateThumbSize();
            this.updateThumbPosition();
        }, 50);
    }

    // Method to get current position
    getPosition() {
        if (this.scrollbar.classList.contains('position-top')) return 'top';
        if (this.scrollbar.classList.contains('position-bottom')) return 'bottom';
        return 'center';
    }

    // Method to get current size
    getSize() {
        if (this.scrollbar.classList.contains('size-full')) return 'full';
        return 'compact';
    }

    // Method to set width: 'default', 'compact', 'custom'
    setWidth(width = 'default', customValue = null) {
        // Remove existing width classes
        this.scrollbar.classList.remove('width-default', 'width-compact', 'width-custom');

        if (width === 'custom' && customValue !== null) {
            // Set custom width
            this.scrollbar.classList.add('width-custom');
            this.scrollbar.style.width = customValue + 'px';

            // Calculate proportional thumb width (60% of scrollbar width)
            const thumbWidth = Math.max(Math.round(customValue * 0.6), 12);
            const thumbHoverWidth = Math.max(Math.round(customValue * 0.7), 15);
            const thumbActiveWidth = Math.max(Math.round(customValue * 0.8), 18);

            // Update thumb styles dynamically
            this.updateThumbStyles(thumbWidth, thumbHoverWidth, thumbActiveWidth);

        } else {
            // Set predefined width class
            this.scrollbar.classList.add(`width-${width}`);
            // Reset custom styles
            this.scrollbar.style.width = '';
            this.resetThumbStyles();
        }

        // Recalculate dimensions after width change
        setTimeout(() => {
            this.cacheStaticDimensions();
            this.updateThumbSize();
            this.updateThumbPosition();
        }, 50);
    }

    // Method to get current width
    getWidth() {
        if (this.scrollbar.classList.contains('width-compact')) return 'compact';
        if (this.scrollbar.classList.contains('width-custom')) return 'custom';
        return 'default';
    }

    // Method to get custom width value (if applicable)
    getCustomWidth() {
        if (this.getWidth() === 'custom') {
            return parseInt(this.scrollbar.style.width) || 50;
        }
        return null;
    }

    // Helper method to update thumb styles for custom width
    updateThumbStyles(width, hoverWidth, activeWidth) {
        const styleId = 'custom-thumb-styles';
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
                    .floating-scrollbar.width-custom .floating-scrollbar-thumb {
                        width: ${width}px !important;
                    }
                    .floating-scrollbar.width-custom .floating-scrollbar-thumb:hover {
                        width: ${hoverWidth}px !important;
                    }
                    .floating-scrollbar.width-custom .floating-scrollbar-thumb:active {
                        width: ${activeWidth}px !important;
                    }
                `;
    }

    // Helper method to reset thumb styles
    resetThumbStyles() {
        const styleElement = document.getElementById('custom-thumb-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }

    // Method to set background opacity: 'light', 'medium', 'strong', 'custom'
    setOpacity(opacity = 'medium', customValue = null) {
        // Remove existing opacity classes
        this.scrollbar.classList.remove('opacity-light', 'opacity-medium', 'opacity-strong', 'opacity-custom');

        if (opacity === 'custom' && customValue !== null) {
            // Set custom opacity
            this.scrollbar.classList.add('opacity-custom');

            // Convert percentage to decimal (0-100 -> 0.0-1.0)
            const bgOpacity = Math.max(0, Math.min(customValue / 100, 1));
            const borderOpacity = Math.max(0, Math.min((customValue + 10) / 100, 1));
            const hoverOpacity = Math.max(0, Math.min((customValue + 5) / 100, 1));

            // Update CSS custom properties
            this.scrollbar.style.setProperty('--scrollbar-bg-opacity', bgOpacity);
            this.scrollbar.style.setProperty('--scrollbar-border-opacity', borderOpacity);
            this.scrollbar.style.setProperty('--scrollbar-hover-bg-opacity', hoverOpacity);

        } else {
            // Set predefined opacity class
            this.scrollbar.classList.add(`opacity-${opacity}`);
            // Reset custom properties
            this.scrollbar.style.removeProperty('--scrollbar-bg-opacity');
            this.scrollbar.style.removeProperty('--scrollbar-border-opacity');
            this.scrollbar.style.removeProperty('--scrollbar-hover-bg-opacity');
        }
    }

    // Method to get current opacity level
    getOpacity() {
        if (this.scrollbar.classList.contains('opacity-light')) return 'light';
        if (this.scrollbar.classList.contains('opacity-strong')) return 'strong';
        if (this.scrollbar.classList.contains('opacity-custom')) return 'custom';
        return 'medium';
    }

    // Method to get custom opacity value (if applicable)
    getCustomOpacity() {
        if (this.getOpacity() === 'custom') {
            const bgOpacity = this.scrollbar.style.getPropertyValue('--scrollbar-bg-opacity');
            return Math.round(parseFloat(bgOpacity) * 100) || 10;
        }
        return null;
    }

    updateThumbSize() {
        const contentHeight = document.body.scrollHeight;
        const visibleHeight = this.cachedDimensions.windowHeight;
        const effectiveTrackHeight = this.cachedDimensions.effectiveTrackHeight;

        if (contentHeight <= visibleHeight) {
            this.thumb.style.display = 'none';
            return;
        }

        this.thumb.style.display = 'block';
        const thumbHeight = Math.max(
            (visibleHeight / contentHeight) * effectiveTrackHeight,
            30 // Minimum thumb height
        );
        this.thumb.style.height = thumbHeight + 'px';

        // Cache thumb height to avoid repeated offsetHeight calls
        this.cachedDimensions.thumbHeight = thumbHeight;
    }

    updateThumbPosition() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.animationFrame = requestAnimationFrame(() => {
            const contentHeight = document.body.scrollHeight;
            const visibleHeight = this.cachedDimensions.windowHeight;
            const effectiveTrackHeight = this.cachedDimensions.effectiveTrackHeight;
            const thumbHeight = this.cachedDimensions.thumbHeight || this.thumb.offsetHeight;
            const trackPadding = this.cachedDimensions.trackPadding;

            if (contentHeight <= visibleHeight) return;

            const scrollTop = window.pageYOffset;
            const scrollPercentage = scrollTop / (contentHeight - visibleHeight);

            // Calculate available space for thumb movement
            const maxThumbTravel = effectiveTrackHeight - thumbHeight;
            const thumbTravel = scrollPercentage * maxThumbTravel;

            // Add small top padding offset (4px)
            const thumbTop = (trackPadding / 2) + thumbTravel;

            // Use transform instead of top for better performance
            this.thumb.style.transform = `translateX(-50%) translateY(${thumbTop}px)`;
            this.thumb.style.top = '0px';
        });
    }

    updatePageScroll(thumbTop) {
        const contentHeight = document.body.scrollHeight;
        const visibleHeight = this.cachedDimensions.windowHeight;
        const effectiveTrackHeight = this.cachedDimensions.effectiveTrackHeight;
        const thumbHeight = this.cachedDimensions.thumbHeight || this.thumb.offsetHeight;
        const trackPadding = this.cachedDimensions.trackPadding;

        // Adjust thumbTop to account for small padding
        const adjustedThumbTop = thumbTop - (trackPadding / 2);
        const maxThumbTravel = effectiveTrackHeight - thumbHeight;

        // Ensure adjusted position is within bounds
        const clampedThumbTop = Math.max(0, Math.min(adjustedThumbTop, maxThumbTravel));

        const scrollPercentage = clampedThumbTop / maxThumbTravel;
        const maxScrollTop = contentHeight - visibleHeight;
        const newScrollTop = scrollPercentage * maxScrollTop;

        // Use smooth scrolling for better UX
        window.scrollTo({
            top: newScrollTop,
            behavior: 'auto' // Use 'auto' for immediate response when dragging
        });
    }

    showScrollbar() {
        if (!this.scrollbar.classList.contains('visible')) {
            this.scrollbar.classList.add('visible');
        }
        clearTimeout(this.hideTimeout);

        // Check if scrollbar has persistent class
        const isPersistent = this.scrollbar.classList.contains('persistent');

        if (!this.isDragging && !isPersistent) {
            this.hideTimeout = setTimeout(() => {
                this.scrollbar.classList.remove('visible');
            }, 1500);
        }
    }

    // Throttled scroll handler
    handleScroll() {
        if (!this.isScrolling) {
            this.isScrolling = true;
            this.updateThumbPosition();
            this.showScrollbar();

            // Reset scrolling flag after a short delay
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 16); // ~60fps
        }
    }

    bindEvents() {
        // Optimized page scroll event with passive listener
        window.addEventListener('scroll', () => {
            if (!this.isDragging) {
                this.handleScroll();
            }
        }, {passive: true});

        // Mouse events for desktop
        this.thumb.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));

        // Touch events for mobile
        this.thumb.addEventListener('touchstart', this.startDrag.bind(this), {passive: false});
        document.addEventListener('touchmove', this.drag.bind(this), {passive: false});
        document.addEventListener('touchend', this.endDrag.bind(this));

        // Click on scrollbar track
        this.scrollbar.addEventListener('click', (e) => {
            if (e.target === this.scrollbar || e.target.classList.contains('floating-scrollbar-track')) {
                const rect = this.scrollbar.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const thumbHeight = this.cachedDimensions.thumbHeight || this.thumb.offsetHeight;
                const trackPadding = this.cachedDimensions.trackPadding;

                // Calculate new thumb position accounting for small padding
                const targetPosition = clickY - thumbHeight / 2;
                const minPosition = trackPadding / 2; // 4px from top
                const maxPosition = this.cachedDimensions.scrollbarHeight - (trackPadding / 2) - thumbHeight;

                const newThumbTop = Math.max(minPosition, Math.min(targetPosition, maxPosition));

                this.thumb.style.transform = `translateX(-50%) translateY(${newThumbTop}px)`;
                this.updatePageScroll(newThumbTop);
            }
        });

        // Show scrollbar on hover
        this.scrollbar.addEventListener('mouseenter', () => {
            this.showScrollbar();
        });

        // Prevent text selection while dragging
        this.scrollbar.addEventListener('selectstart', (e) => e.preventDefault());
    }

    startDrag(e) {
        this.isDragging = true;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.dragStartY = clientY;

        // Get current transform position
        const currentTransform = this.thumb.style.transform;
        const translateYMatch = currentTransform.match(/translateY\(([^)]+)\)/);
        this.thumbStartTop = translateYMatch ? parseFloat(translateYMatch[1]) : 0;

        document.body.style.userSelect = 'none';
        this.thumb.style.cursor = 'grabbing';
        this.showScrollbar();

        if (e.preventDefault) e.preventDefault();
    }

    drag(e) {
        if (!this.isDragging) return;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.animationFrame = requestAnimationFrame(() => {
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = clientY - this.dragStartY;
            const newThumbTop = this.thumbStartTop + deltaY;

            const thumbHeight = this.cachedDimensions.thumbHeight || this.thumb.offsetHeight;
            const trackPadding = this.cachedDimensions.trackPadding;

            // Set bounds with small padding consideration
            const minPosition = trackPadding / 2; // 4px from top
            const maxPosition = this.cachedDimensions.scrollbarHeight - (trackPadding / 2) - thumbHeight;
            const clampedThumbTop = Math.max(minPosition, Math.min(newThumbTop, maxPosition));

            this.thumb.style.transform = `translateX(-50%) translateY(${clampedThumbTop}px)`;
            this.updatePageScroll(clampedThumbTop);
        });

        if (e.preventDefault) e.preventDefault();
    }

    endDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;
        document.body.style.userSelect = '';
        this.thumb.style.cursor = 'grab';

        // Cancel any pending animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // Check if scrollbar has persistent class before auto-hiding
        const isPersistent = this.scrollbar.classList.contains('persistent');

        if (!isPersistent) {
            // Auto hide after dragging
            this.hideTimeout = setTimeout(() => {
                this.scrollbar.classList.remove('visible');
            }, 1500);
        }
    }
}

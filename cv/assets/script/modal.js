/**
 * Modal Class - Quản lý modal popup dễ dàng và tùy biến
 *
 * @example
 * const modal = new Modal('modalId', {
 *   title: 'Notice',
 *   message: 'Modal content message',
 *   buttons: [
 *     { text: 'OK', type: 'primary', handler: () => modal.close() },
 *     { text: 'Cancel', type: 'secondary', handler: () => modal.close() }
 *   ]
 * });
 * modal.show();
 */
class Modal {
    constructor(modalId, options = {}) {
        this.modalId = modalId;
        this.modal = document.getElementById(modalId);
        this.options = {
            closeOnOutsideClick: true,
            closeOnEscape: true,
            preventBodyScroll: true,
            ...options
        };

        this.isVisible = false;
        this.buttons = [];

        this.init();
    }

    /**
     * Khởi tạo modal và các event listeners
     */
    init() {
        if (!this.modal) {
            console.error(`Modal with id "${this.modalId}" not found`);
            return;
        }

        this.setupEventListeners();
    }

    /**
     * Thiết lập các event listeners
     */
    setupEventListeners() {
        // Close modal khi click outside
        if (this.options.closeOnOutsideClick) {
            document.addEventListener('click', (e) => {
                if (e.target === this.modal && this.isVisible) {
                    this.close();
                }
            });
        }

        // Close modal khi nhấn Escape
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible) {
                    this.close();
                }
            });
        }
    }

    /**
     * Hiển thị modal
     */
    show() {
        if (!this.modal) return;

        this.modal.classList.add('show');
        this.isVisible = true;

        if (this.options.preventBodyScroll) {
            document.body.style.overflow = 'hidden';
        }

        // Trigger custom event
        this.triggerEvent('show');
    }

    /**
     * Ẩn modal
     */
    close() {
        if (!this.modal) return;

        this.modal.classList.remove('show');
        this.isVisible = false;

        if (this.options.preventBodyScroll) {
            document.body.style.overflow = '';
        }

        // Trigger custom event
        this.triggerEvent('close');
    }

    /**
     * Toggle modal (show/hide)
     */
    toggle() {
        if (this.isVisible) {
            this.close();
        } else {
            this.show();
        }
    }

    /**
     * Cập nhật nội dung modal
     * @param {Object} content - Object chứa title, message, icon
     */
    updateContent(content) {
        if (!this.modal) return;

        if (content.title) {
            const titleEl = this.modal.querySelector('.modal-title');
            if (titleEl) titleEl.textContent = content.title;
        }

        if (content.message) {
            const messageEl = this.modal.querySelector('.modal-message');
            if (messageEl) messageEl.textContent = content.message;
        }

        if (content.icon) {
            const iconEl = this.modal.querySelector('.modal-icon');
            if (iconEl) iconEl.textContent = content.icon;
        }
    }

    /**
     * Thiết lập các nút button cho modal
     * @param {Array} buttons - Mảng các object button {text, type, handler}
     */
    setButtons(buttons) {
        const buttonsContainer = this.modal.querySelector('.modal-buttons');
        if (!buttonsContainer) return;

        // Clear existing buttons
        buttonsContainer.innerHTML = '';
        this.buttons = [];

        buttons.forEach((btnConfig, index) => {
            const button = document.createElement('button');
            button.className = `modal-btn modal-btn-${btnConfig.type || 'primary'}`;
            button.textContent = btnConfig.text || 'Button';

            // Add click handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof btnConfig.handler === 'function') {
                    btnConfig.handler(e, this);
                }
            });

            buttonsContainer.appendChild(button);
            this.buttons.push(button);
        });
    }

    /**
     * Thêm một button mới
     * @param {Object} buttonConfig - Config cho button {text, type, handler}
     */
    addButton(buttonConfig) {
        const buttonsContainer = this.modal.querySelector('.modal-buttons');
        if (!buttonsContainer) return;

        const button = document.createElement('button');
        button.className = `modal-btn modal-btn-${buttonConfig.type || 'primary'}`;
        button.textContent = buttonConfig.text || 'Button';

        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof buttonConfig.handler === 'function') {
                buttonConfig.handler(e, this);
            }
        });

        buttonsContainer.appendChild(button);
        this.buttons.push(button);

        return button;
    }

    /**
     * Xóa tất cả buttons
     */
    clearButtons() {
        const buttonsContainer = this.modal.querySelector('.modal-buttons');
        if (buttonsContainer) {
            buttonsContainer.innerHTML = '';
            this.buttons = [];
        }
    }

    /**
     * Trigger custom events
     * @param {string} eventName - Tên event
     */
    triggerEvent(eventName) {
        const event = new CustomEvent(`modal:${eventName}`, {
            detail: {modal: this, modalId: this.modalId}
        });
        document.dispatchEvent(event);
    }

    /**
     * Listen for custom events
     * @param {string} eventName - Tên event ('show', 'close')
     * @param {function} callback - Callback function
     */
    on(eventName, callback) {
        document.addEventListener(`modal:${eventName}`, (e) => {
            if (e.detail.modalId === this.modalId) {
                callback(e.detail.modal);
            }
        });
    }

    /**
     * Destroy modal instance
     */
    destroy() {
        if (this.modal) {
            this.modal.remove();
        }
        this.buttons = [];
        this.modal = null;
    }

    /**
     * Static method để tạo modal nhanh
     * @param {Object} config - Cấu hình modal
     */
    static create(config) {
        const modalId = config.id || `modal-${Date.now()}`;

        // Tạo HTML cho modal
        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal-content">
                    <div class="modal-icon">${config.icon || '💻'}</div>
                    <div class="modal-title">${config.title || 'Notice'}</div>
                    <div class="modal-message">${config.message || ''}</div>
                    <div class="modal-buttons"></div>
                </div>
            </div>
        `;

        // Thêm vào DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Tạo instance Modal
        const modal = new Modal(modalId, config.options);

        // Thiết lập buttons nếu có
        if (config.buttons) {
            modal.setButtons(config.buttons);
        }

        return modal;
    }
}

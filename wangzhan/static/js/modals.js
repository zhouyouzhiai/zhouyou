/**
 * 弹窗模块
 * 负责项目详情弹窗和图片查看器弹窗
 */

// 弹窗管理器
const ModalManager = {
    // 当前打开的弹窗
    currentModal: null,

    // 弹窗配置
    options: {
        closeOnEscape: true,
        closeOnOverlay: true,
        animationDuration: 300,
        focusTrap: true
    },

    // 初始化弹窗管理器
    init(options = {}) {
        this.options = { ...this.options, ...options };
        this.setupEventListeners();
    },

    // 设置事件监听器
    setupEventListeners() {
        // ESC键关闭弹窗
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.currentModal) {
                    this.closeModal();
                }
            });
        }

        // 点击遮罩层关闭弹窗
        if (this.options.closeOnOverlay) {
            document.addEventListener('click', (e) => {
                if (
                    e.target.classList.contains('modal-overlay') ||
                    e.target.classList.contains('modal-close')
                ) {
                    this.closeModal();
                }
            });
        }
    },

    // 打开弹窗
    openModal(modalElement, options = {}) {
        if (!modalElement) return;

        // 如果已有弹窗打开，先关闭
        if (this.currentModal) {
            this.closeModal(false);
        }

        // 设置当前弹窗
        this.currentModal = modalElement;

        // 合并选项
        const modalOptions = { ...this.options, ...options };

        // 显示弹窗
        modalElement.style.display = 'flex';
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 设置焦点陷阱
        if (modalOptions.focusTrap) {
            this.trapFocus(modalElement);
        }

        // 触发打开事件
        modalElement.dispatchEvent(new CustomEvent('modal:open', {
            detail: { modal: modalElement, options: modalOptions }
        }));

        // 添加动画类
        setTimeout(() => {
            modalElement.classList.add('show');
        }, 10);
    },

    // 关闭弹窗
    closeModal(animate = true) {
        if (!this.currentModal) return;

        const modal = this.currentModal;

        // 触发关闭事件
        modal.dispatchEvent(new CustomEvent('modal:close', {
            detail: { modal }
        }));

        if (animate) {
            // 添加关闭动画
            modal.classList.remove('show');

            // 动画结束后隐藏弹窗
            setTimeout(() => {
                this.hideModal(modal);
            }, this.options.animationDuration);
        } else {
            this.hideModal(modal);
        }
    },

    // 隐藏弹窗
    hideModal(modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';

        // 清除焦点陷阱
        this.removeFocusTrap(modal);

        // 重置当前弹窗
        if (this.currentModal === modal) {
            this.currentModal = null;
        }
    },

    // 焦点陷阱
    trapFocus(modal) {
        // 获取可聚焦元素
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // 设置初始焦点
        firstElement.focus();

        // 处理Tab键循环
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift+Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    },

    // 移除焦点陷阱
    removeFocusTrap(modal) {
        // 恢复焦点到触发弹窗的元素
        const triggerElement = modal.dataset.triggerElement;
        if (triggerElement && document.querySelector(triggerElement)) {
            document.querySelector(triggerElement).focus();
        }
    }
};

// 项目详情弹窗
const ProjectModal = {
    // 弹窗元素
    modal: null,

    // 项目数据
    projectData: null,

    // 初始化项目详情弹窗
    init() {
        // 查找或创建弹窗元素
        this.modal = document.getElementById('projectModal');
        if (!this.modal) {
            this.createModal();
        }

        // 设置事件监听器
        this.setupEventListeners();
    },

    // 创建弹窗元素
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'projectModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">项目详情</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="project-detail">
                        <div class="project-image">
                            <img src="" alt="项目截图" id="projectModalImage">
                        </div>
                        <div class="project-info">
                            <h3 id="projectModalTitle">项目名称</h3>
                            <p id="projectModalDescription">项目描述</p>
                            <div class="project-meta">
                                <div class="project-category">
                                    <span class="meta-label">分类:</span>
                                    <span id="projectModalCategory">-</span>
                                </div>
                                <div class="project-type">
                                    <span class="meta-label">类型:</span>
                                    <span id="projectModalType">-</span>
                                </div>
                            </div>
                            <div class="project-tech-stack">
                                <h4>技术栈</h4>
                                <div class="tech-list" id="projectModalTechStack"></div>
                            </div>
                            <div class="project-actions">
                                <a href="#" id="projectModalLink" class="btn btn-primary" target="_blank">访问项目</a>
                                <button id="projectModalClose" class="btn btn-secondary">关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity ${ModalManager.options.animationDuration}ms ease;
            }

            .modal-overlay.active {
                opacity: 1;
            }

            .modal-content {
                background-color: var(--bg-color, #fff);
                border-radius: 8px;
                max-width: 800px;
                max-height: 90vh;
                width: 90%;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                transform: translateY(20px);
                transition: transform ${ModalManager.options.animationDuration}ms ease;
            }

            .modal-overlay.show .modal-content {
                transform: translateY(0);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid var(--border-color, #eee);
            }

            .modal-title {
                margin: 0;
                color: var(--text-color, #333);
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-color, #333);
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: calc(90vh - 70px);
            }

            .project-detail {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .project-image {
                text-align: center;
            }

            .project-image img {
                max-width: 100%;
                max-height: 300px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .project-info h3 {
                margin-top: 0;
                color: var(--text-color, #333);
            }

            .project-meta {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
            }

            .meta-label {
                font-weight: bold;
                margin-right: 5px;
            }

            .project-tech-stack h4 {
                margin-bottom: 10px;
                color: var(--text-color, #333);
            }

            .tech-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .tech-tag {
                background-color: var(--primary-color, #4a6cf7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }

            .project-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }

            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            .btn-primary {
                background-color: var(--primary-color, #4a6cf7);
                color: white;
            }

            .btn-primary:hover {
                background-color: var(--primary-hover-color, #3a5ce5);
            }

            .btn-secondary {
                background-color: var(--secondary-color, #6c757d);
                color: white;
            }

            .btn-secondary:hover {
                background-color: var(--secondary-hover-color, #5a6268);
            }

            @media (min-width: 768px) {
                .project-detail {
                    flex-direction: row;
                }

                .project-image {
                    flex: 1;
                }

                .project-info {
                    flex: 1;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        this.modal = modal;
    },

    // 设置事件监听器
    setupEventListeners() {
        // 关闭按钮
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                ModalManager.closeModal();
            });
        }

        // 关闭按钮（底部）
        const closeBtnBottom = this.modal.querySelector('#projectModalClose');
        if (closeBtnBottom) {
            closeBtnBottom.addEventListener('click', () => {
                ModalManager.closeModal();
            });
        }
    },

    // 显示项目详情
    async showProject(projectId) {
        try {
            // 加载项目数据
            this.projectData = await DataLoader.loadProjectDetails(projectId);

            // 如果没有数据，显示错误
            if (!this.projectData || Object.keys(this.projectData).length === 0) {
                this.showError('项目数据不存在');
                return;
            }

            // 填充弹窗内容
            this.populateModal();

            // 打开弹窗
            ModalManager.openModal(this.modal);
        } catch (error) {
            console.error('加载项目详情失败:', error);
            this.showError('加载项目详情失败');
        }
    },

    // 填充弹窗内容
    populateModal() {
        if (!this.projectData) return;

        // 设置项目图片
        const imageElement = this.modal.querySelector('#projectModalImage');
        if (imageElement) {
            let imageUrl = this.projectData.image_url || window.AppConfig.defaultImage;
            
            // 格式化图片URL
            if (imageUrl.startsWith('img/') || imageUrl.startsWith('svg/')) {
                imageUrl = `./static/${imageUrl}`;
            }
            
            imageElement.src = imageUrl;
            imageElement.alt = this.projectData.title || '项目截图';
        }

        // 设置项目标题
        const titleElement = this.modal.querySelector('#projectModalTitle');
        if (titleElement) {
            titleElement.textContent = this.projectData.title || '暂无标题';
        }

        // 设置项目描述
        const descriptionElement = this.modal.querySelector('#projectModalDescription');
        if (descriptionElement) {
            descriptionElement.textContent = this.projectData.description || '暂无描述';
        }

        // 设置项目分类
        const categoryElement = this.modal.querySelector('#projectModalCategory');
        if (categoryElement) {
            categoryElement.textContent = this.projectData.category_name || '-';
        }

        // 设置项目类型
        const typeElement = this.modal.querySelector('#projectModalType');
        if (typeElement) {
            const type = this.projectData.type;
            typeElement.textContent = type === 'site' ? '网站' : '项目';
        }

        // 设置技术栈
        const techStackElement = this.modal.querySelector('#projectModalTechStack');
        if (techStackElement && this.projectData.tech_stack) {
            techStackElement.innerHTML = '';
            this.projectData.tech_stack.forEach(tech => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag';
                tag.textContent = tech;
                techStackElement.appendChild(tag);
            });
        }

        // 设置项目链接
        const linkElement = this.modal.querySelector('#projectModalLink');
        if (linkElement) {
            linkElement.href = this.projectData.url || '#';
            if (!this.projectData.url) {
                linkElement.style.display = 'none';
            } else {
                linkElement.style.display = 'inline-block';
            }
        }
    },

    // 显示错误信息
    showError(message) {
        const modalBody = this.modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button class="btn btn-secondary" id="projectModalErrorClose">关闭</button>
                </div>
            `;

            // 添加关闭按钮事件
            const closeBtn = modalBody.querySelector('#projectModalErrorClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    ModalManager.closeModal();
                });
            }
        }

        // 打开弹窗
        ModalManager.openModal(this.modal);
    }
};

// 图片查看器弹窗
const ImageViewer = {
    // 弹窗元素
    modal: null,

    // 当前图片索引
    currentIndex: 0,

    // 图片列表
    images: [],

    // 初始化图片查看器
    init() {
        // 查找或创建弹窗元素
        this.modal = document.getElementById('imageViewer');
        if (!this.modal) {
            this.createModal();
        }

        // 设置事件监听器
        this.setupEventListeners();
    },

    // 创建弹窗元素
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'imageViewer';
        modal.className = 'image-viewer-overlay';
        modal.innerHTML = `
            <div class="image-viewer-content">
                <div class="image-viewer-header">
                    <div class="image-viewer-title" id="imageViewerTitle">图片查看器</div>
                    <button class="image-viewer-close">&times;</button>
                </div>
                <div class="image-viewer-body">
                    <div class="image-container">
                        <img id="imageViewerImage" src="" alt="查看图片">
                        <div class="image-viewer-nav">
                            <button class="image-viewer-prev" id="imageViewerPrev">&lt;</button>
                            <button class="image-viewer-next" id="imageViewerNext">&gt;</button>
                        </div>
                    </div>
                    <div class="image-viewer-info">
                        <div class="image-counter" id="imageCounter">1 / 1</div>
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .image-viewer-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1001;
                opacity: 0;
                transition: opacity ${ModalManager.options.animationDuration}ms ease;
            }

            .image-viewer-overlay.active {
                opacity: 1;
            }

            .image-viewer-content {
                width: 90%;
                height: 90%;
                display: flex;
                flex-direction: column;
                transform: translateY(20px);
                transition: transform ${ModalManager.options.animationDuration}ms ease;
            }

            .image-viewer-overlay.show .image-viewer-content {
                transform: translateY(0);
            }

            .image-viewer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                color: white;
            }

            .image-viewer-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: white;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .image-viewer-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
            }

            .image-container {
                position: relative;
                max-width: 100%;
                max-height: 80%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .image-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 4px;
            }

            .image-viewer-nav {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 20px;
                pointer-events: none;
            }

            .image-viewer-prev,
            .image-viewer-next {
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                pointer-events: all;
                transition: background-color 0.2s;
            }

            .image-viewer-prev:hover,
            .image-viewer-next:hover {
                background-color: rgba(0, 0, 0, 0.7);
            }

            .image-viewer-info {
                margin-top: 15px;
                color: white;
                text-align: center;
            }

            .image-counter {
                font-size: 14px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        this.modal = modal;
    },

    // 设置事件监听器
    setupEventListeners() {
        // 关闭按钮
        const closeBtn = this.modal.querySelector('.image-viewer-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                ModalManager.closeModal();
            });
        }

        // 上一张按钮
        const prevBtn = this.modal.querySelector('#imageViewerPrev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.showPrevImage();
            });
        }

        // 下一张按钮
        const nextBtn = this.modal.querySelector('#imageViewerNext');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.showNextImage();
            });
        }

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (ModalManager.currentModal === this.modal) {
                if (e.key === 'ArrowLeft') {
                    this.showPrevImage();
                } else if (e.key === 'ArrowRight') {
                    this.showNextImage();
                }
            }
        });
    },

    // 显示图片
    showImage(imageSrc, title = '', images = []) {
        // 设置图片列表
        this.images = Array.isArray(images) ? images : [imageSrc];
        
        // 查找当前图片索引
        if (images.length > 0) {
            this.currentIndex = this.images.findIndex(img => img === imageSrc);
            if (this.currentIndex === -1) {
                this.currentIndex = 0;
            }
        } else {
            this.currentIndex = 0;
            this.images = [imageSrc];
        }

        // 更新图片
        this.updateImage();

        // 更新标题
        const titleElement = this.modal.querySelector('#imageViewerTitle');
        if (titleElement) {
            titleElement.textContent = title || '图片查看器';
        }

        // 更新计数器
        this.updateCounter();

        // 显示/隐藏导航按钮
        const navElement = this.modal.querySelector('.image-viewer-nav');
        if (navElement) {
            navElement.style.display = this.images.length > 1 ? 'flex' : 'none';
        }

        // 打开弹窗
        ModalManager.openModal(this.modal);
    },

    // 更新图片
    updateImage() {
        const imageElement = this.modal.querySelector('#imageViewerImage');
        if (imageElement && this.images.length > 0) {
            imageElement.src = this.images[this.currentIndex];
        }
    },

    // 更新计数器
    updateCounter() {
        const counterElement = this.modal.querySelector('#imageCounter');
        if (counterElement) {
            counterElement.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        }
    },

    // 显示上一张图片
    showPrevImage() {
        if (this.images.length <= 1) return;

        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
        this.updateCounter();
    },

    // 显示下一张图片
    showNextImage() {
        if (this.images.length <= 1) return;

        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
        this.updateCounter();
    }
};

// 兼容性函数，保持与原始代码的兼容性
function openProjectModal(projectId) {
    ProjectModal.showProject(projectId);
}

function openImageViewer(imageSrc, title, images) {
    ImageViewer.showImage(imageSrc, title, images);
}

// 初始化弹窗
document.addEventListener('DOMContentLoaded', function() {
    // 初始化弹窗管理器
    ModalManager.init();

    // 初始化项目详情弹窗
    ProjectModal.init();

    // 初始化图片查看器
    ImageViewer.init();

    // 为项目卡片添加点击事件
    document.addEventListener('click', function(e) {
        // 查找最近的项目卡片
        const projectCard = e.target.closest('.projectItem');
        if (projectCard && !e.target.closest('a')) {
            const projectId = projectCard.getAttribute('data-project-id');
            if (projectId) {
                e.preventDefault();
                openProjectModal(projectId);
            }
        }
    });

    // 为图片添加点击事件
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG' && !e.target.closest('.modal-overlay') && !e.target.closest('.image-viewer-overlay')) {
            const img = e.target;
            const imgSrc = img.src;
            const title = img.alt || '图片';
            
            // 查找同组的图片
            const images = [];
            const parent = img.closest('.project-item, .gallery, .image-container');
            
            if (parent) {
                const imgs = parent.querySelectorAll('img');
                imgs.forEach(i => {
                    if (i.src && i !== img) {
                        images.push(i.src);
                    }
                });
            }
            
            // 将当前图片添加到列表开头
            images.unshift(imgSrc);
            
            // 打开图片查看器
            openImageViewer(imgSrc, title, images);
        }
    });
});

// 导出模块
window.ModalManager = ModalManager;
window.ProjectModal = ProjectModal;
window.ImageViewer = ImageViewer;
window.openProjectModal = openProjectModal;
window.openImageViewer = openImageViewer;
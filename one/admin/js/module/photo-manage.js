// 相册管理逻辑
// 包含相册的增删改查功能

class PhotoManage {
    constructor() {
        this.photos = [];
        this.currentPhoto = null;
        this.isEditing = false;
        this.init();
    }

    // 初始化
    async init() {
        await this.loadPhotos();
        this.initEvents();
        this.renderPhotos();
    }

    // 加载相册数据
    async loadPhotos() {
        try {
            this.photos = await window.adminAPI.getPhotos();
        } catch (error) {
            window.adminCommon.showToast('加载相册失败', 'error');
        }
    }

    // 初始化事件
    initEvents() {
        // 添加相册按钮
        const addBtn = document.querySelector('#add-photo-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showPhotoModal());
        }

        // 搜索框
        const searchInput = document.querySelector('#photo-search');
        if (searchInput) {
            searchInput.addEventListener('input', window.adminCommon.debounce(() => {
                this.filterPhotos();
            }, 300));
        }

        // 分类筛选
        const categorySelect = document.querySelector('#photo-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.filterPhotos());
        }

        // 表单提交
        const form = document.querySelector('#photo-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePhoto();
            });
        }

        // 删除确认
        document.addEventListener('click', (e) => {
            if (e.target.matches('.delete-photo-btn')) {
                const id = e.target.getAttribute('data-id');
                this.confirmDeletePhoto(id);
            }
        });

        // 编辑相册
        document.addEventListener('click', (e) => {
            if (e.target.matches('.edit-photo-btn')) {
                const id = e.target.getAttribute('data-id');
                this.editPhoto(id);
            }
        });

        // 图片预览
        document.addEventListener('click', (e) => {
            if (e.target.matches('.photo-preview')) {
                const src = e.target.getAttribute('src');
                this.showImagePreview(src);
            }
        });
    }

    // 渲染相册列表
    renderPhotos(photos = this.photos) {
        const container = document.querySelector('#photos-container');
        if (!container) return;

        if (photos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <p>暂无相册</p>
                    <button class="btn btn-primary" id="add-photo-btn-empty">
                        <i class="fas fa-plus"></i> 添加相册
                    </button>
                </div>
            `;
            
            // 重新绑定添加按钮事件
            const addBtn = document.querySelector('#add-photo-btn-empty');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.showPhotoModal());
            }
            return;
        }

        let html = '<div class="photo-grid">';

        photos.forEach(photo => {
            html += `
                <div class="photo-card">
                    <div class="photo-image">
                        <img src="${photo.image_url}" alt="${photo.title}" class="photo-preview">
                        <div class="photo-overlay">
                            <button class="btn btn-sm btn-primary edit-photo-btn" data-id="${photo.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-photo-btn" data-id="${photo.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="photo-info">
                        <h3 class="photo-title">${photo.title}</h3>
                        <p class="photo-description">${photo.description || ''}</p>
                        <div class="photo-meta">
                            <span class="photo-category">${this.getCategoryName(photo.category_id)}</span>
                            <span class="photo-date">${window.adminCommon.formatDate(photo.created_at)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        container.innerHTML = html;
    }

    // 获取分类名称
    async getCategoryName(categoryId) {
        try {
            const categories = await window.adminAPI.getCategories();
            const category = categories.find(c => c.id === parseInt(categoryId));
            return category ? category.name : '未分类';
        } catch (error) {
            return '未分类';
        }
    }

    // 筛选相册
    filterPhotos() {
        const searchTerm = document.querySelector('#photo-search')?.value.toLowerCase() || '';
        const categoryId = document.querySelector('#photo-category')?.value || '';

        let filtered = this.photos;

        // 按搜索词筛选
        if (searchTerm) {
            filtered = filtered.filter(photo => 
                photo.title.toLowerCase().includes(searchTerm) ||
                (photo.description && photo.description.toLowerCase().includes(searchTerm))
            );
        }

        // 按分类筛选
        if (categoryId) {
            filtered = filtered.filter(photo => 
                photo.category_id.toString() === categoryId
            );
        }

        this.renderPhotos(filtered);
    }

    // 显示相册模态框
    async showPhotoModal(photoId = null) {
        const modal = document.querySelector('#photo-modal');
        if (!modal) return;

        // 重置表单
        const form = document.querySelector('#photo-form');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }

        // 设置标题
        const modalTitle = document.querySelector('#photo-modal-title');
        if (modalTitle) {
            modalTitle.textContent = photoId ? '编辑相册' : '添加相册';
        }

        // 加载分类选项
        await this.loadCategoryOptions();

        // 如果是编辑模式，加载相册数据
        if (photoId) {
            this.isEditing = true;
            this.currentPhoto = await window.adminAPI.getPhoto(photoId);
            this.populateForm(this.currentPhoto);
        } else {
            this.isEditing = false;
            this.currentPhoto = null;
        }

        // 显示模态框
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 加载分类选项
    async loadCategoryOptions() {
        try {
            const categories = await window.adminAPI.getCategories();
            const select = document.querySelector('#photo-category-id');
            
            if (select) {
                select.innerHTML = '';
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            // 静默处理错误，不影响用户体验
        }
    }

    // 填充表单
    populateForm(photo) {
        const form = document.querySelector('#photo-form');
        if (!form || !photo) return;

        // 填充基本字段
        const titleInput = form.querySelector('#photo-title');
        if (titleInput) titleInput.value = photo.title || '';

        const descriptionTextarea = form.querySelector('#photo-description');
        if (descriptionTextarea) descriptionTextarea.value = photo.description || '';

        const imageUrlInput = form.querySelector('#photo-image-url');
        if (imageUrlInput) imageUrlInput.value = photo.image_url || '';

        const categoryIdSelect = form.querySelector('#photo-category-id');
        if (categoryIdSelect) categoryIdSelect.value = photo.category_id || '';

        // 显示当前图片预览
        const preview = document.querySelector('#photo-image-preview');
        if (preview && photo.image_url) {
            preview.src = photo.image_url;
            preview.style.display = 'block';
        }
    }

    // 保存相册
    async savePhoto() {
        const form = document.querySelector('#photo-form');
        if (!form) return;

        // 表单验证
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // 收集表单数据
        const formData = new FormData(form);
        const photoData = {
            title: formData.get('title'),
            description: formData.get('description'),
            image_url: formData.get('image_url'),
            category_id: parseInt(formData.get('category_id')),
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        try {
            let result;
            
            if (this.isEditing && this.currentPhoto) {
                // 更新相册
                result = await window.adminAPI.updatePhoto(this.currentPhoto.id, photoData);
            } else {
                // 创建新相册
                photoData.id = this.photos.length > 0 ? Math.max(...this.photos.map(p => p.id)) + 1 : 1;
                photoData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
                result = await window.adminAPI.createPhoto(photoData);
            }

            if (result.success) {
                window.adminCommon.showToast(result.message, 'success');
                this.closeModal();
                await this.loadPhotos();
                this.renderPhotos();
            } else {
                window.adminCommon.showToast(result.message || '保存失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('保存相册失败', 'error');
        }
    }

    // 编辑相册
    async editPhoto(id) {
        await this.showPhotoModal(id);
    }

    // 确认删除相册
    confirmDeletePhoto(id) {
        window.adminCommon.confirm('确定要删除这张照片吗？', async () => {
            await this.deletePhoto(id);
        });
    }

    // 删除相册
    async deletePhoto(id) {
        try {
            const result = await window.adminAPI.deletePhoto(id);
            
            if (result.success) {
                window.adminCommon.showToast(result.message, 'success');
                await this.loadPhotos();
                this.renderPhotos();
            } else {
                window.adminCommon.showToast(result.message || '删除失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('删除相册失败', 'error');
        }
    }

    // 显示图片预览
    showImagePreview(src) {
        const previewModal = document.querySelector('#image-preview-modal');
        const previewImage = document.querySelector('#preview-image');
        
        if (previewModal && previewImage) {
            previewImage.src = src;
            previewModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // 关闭模态框
    closeModal() {
        const modal = document.querySelector('#photo-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 只在相册管理页面初始化
    if (window.location.pathname.includes('photos') || document.querySelector('#photos-container')) {
        window.photoManage = new PhotoManage();
    }
});
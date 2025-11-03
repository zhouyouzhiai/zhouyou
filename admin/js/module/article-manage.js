// 文章管理逻辑
// 包含文章的增删改查功能

class ArticleManage {
    constructor() {
        this.articles = [];
        this.currentArticle = null;
        this.isEditing = false;
        this.init();
    }

    // 初始化
    async init() {
        await this.loadArticles();
        this.initEvents();
        this.renderArticles();
    }

    // 加载文章数据
    async loadArticles() {
        try {
            this.articles = await window.adminAPI.getArticles();
        } catch (error) {
            window.adminCommon.showToast('加载文章失败', 'error');
        }
    }

    // 初始化事件
    initEvents() {
        // 添加文章按钮
        const addBtn = document.querySelector('#add-article-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showArticleModal());
        }

        // 搜索框
        const searchInput = document.querySelector('#article-search');
        if (searchInput) {
            searchInput.addEventListener('input', window.adminCommon.debounce(() => {
                this.filterArticles();
            }, 300));
        }

        // 分类筛选
        const categorySelect = document.querySelector('#article-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.filterArticles());
        }

        // 状态筛选
        const statusSelect = document.querySelector('#article-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', () => this.filterArticles());
        }

        // 表单提交
        const form = document.querySelector('#article-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveArticle();
            });
        }

        // 删除确认
        document.addEventListener('click', (e) => {
            if (e.target.matches('.delete-article-btn')) {
                const id = e.target.getAttribute('data-id');
                this.confirmDeleteArticle(id);
            }
        });

        // 编辑文章
        document.addEventListener('click', (e) => {
            if (e.target.matches('.edit-article-btn')) {
                const id = e.target.getAttribute('data-id');
                this.editArticle(id);
            }
        });
    }

    // 渲染文章列表
    renderArticles(articles = this.articles) {
        const container = document.querySelector('#articles-container');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>暂无文章</p>
                    <button class="btn btn-primary" id="add-article-btn-empty">
                        <i class="fas fa-plus"></i> 添加文章
                    </button>
                </div>
            `;
            
            // 重新绑定添加按钮事件
            const addBtn = document.querySelector('#add-article-btn-empty');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.showArticleModal());
            }
            return;
        }

        let html = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>标题</th>
                            <th>分类</th>
                            <th>作者</th>
                            <th>浏览量</th>
                            <th>状态</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        articles.forEach(article => {
            const statusClass = article.is_published ? 'status-published' : 'status-draft';
            const statusText = article.is_published ? '已发布' : '草稿';
            
            html += `
                <tr>
                    <td>${article.id}</td>
                    <td>${article.title}</td>
                    <td>${this.getCategoryName(article.category_id)}</td>
                    <td>${article.author}</td>
                    <td>${article.view_count}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${window.adminCommon.formatDate(article.created_at)}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary edit-article-btn" data-id="${article.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-article-btn" data-id="${article.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

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

    // 筛选文章
    filterArticles() {
        const searchTerm = document.querySelector('#article-search')?.value.toLowerCase() || '';
        const categoryId = document.querySelector('#article-category')?.value || '';
        const status = document.querySelector('#article-status')?.value || '';

        let filtered = this.articles;

        // 按搜索词筛选
        if (searchTerm) {
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm) ||
                article.author.toLowerCase().includes(searchTerm)
            );
        }

        // 按分类筛选
        if (categoryId) {
            filtered = filtered.filter(article => 
                article.category_id.toString() === categoryId
            );
        }

        // 按状态筛选
        if (status !== '') {
            const isPublished = status === 'published';
            filtered = filtered.filter(article => 
                article.is_published === isPublished
            );
        }

        this.renderArticles(filtered);
    }

    // 显示文章模态框
    async showArticleModal(articleId = null) {
        const modal = document.querySelector('#article-modal');
        if (!modal) return;

        // 重置表单
        const form = document.querySelector('#article-form');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }

        // 设置标题
        const modalTitle = document.querySelector('#article-modal-title');
        if (modalTitle) {
            modalTitle.textContent = articleId ? '编辑文章' : '添加文章';
        }

        // 加载分类选项
        await this.loadCategoryOptions();

        // 如果是编辑模式，加载文章数据
        if (articleId) {
            this.isEditing = true;
            this.currentArticle = await window.adminAPI.getArticle(articleId);
            this.populateForm(this.currentArticle);
        } else {
            this.isEditing = false;
            this.currentArticle = null;
        }

        // 显示模态框
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 加载分类选项
    async loadCategoryOptions() {
        try {
            const categories = await window.adminAPI.getCategories();
            const select = document.querySelector('#article-category-id');
            
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
    populateForm(article) {
        const form = document.querySelector('#article-form');
        if (!form || !article) return;

        // 填充基本字段
        const titleInput = form.querySelector('#article-title');
        if (titleInput) titleInput.value = article.title || '';

        const contentTextarea = form.querySelector('#article-content');
        if (contentTextarea) contentTextarea.value = article.content || '';

        const excerptTextarea = form.querySelector('#article-excerpt');
        if (excerptTextarea) excerptTextarea.value = article.excerpt || '';

        const coverImageInput = form.querySelector('#article-cover-image');
        if (coverImageInput) coverImageInput.value = article.cover_image || '';

        const categoryIdSelect = form.querySelector('#article-category-id');
        if (categoryIdSelect) categoryIdSelect.value = article.category_id || '';

        const tagsInput = form.querySelector('#article-tags');
        if (tagsInput) tagsInput.value = article.tags ? article.tags.join(', ') : '';

        const authorInput = form.querySelector('#article-author');
        if (authorInput) authorInput.value = article.author || '';

        const viewCountInput = form.querySelector('#article-view-count');
        if (viewCountInput) viewCountInput.value = article.view_count || 0;

        const isPublishedCheckbox = form.querySelector('#article-is-published');
        if (isPublishedCheckbox) isPublishedCheckbox.checked = article.is_published === 1;
    }

    // 保存文章
    async saveArticle() {
        const form = document.querySelector('#article-form');
        if (!form) return;

        // 表单验证
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // 收集表单数据
        const formData = new FormData(form);
        const articleData = {
            title: formData.get('title'),
            content: formData.get('content'),
            excerpt: formData.get('excerpt'),
            cover_image: formData.get('cover_image'),
            category_id: parseInt(formData.get('category_id')),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            author: formData.get('author'),
            view_count: parseInt(formData.get('view_count')) || 0,
            is_published: formData.get('is_published') ? 1 : 0,
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        try {
            let result;
            
            if (this.isEditing && this.currentArticle) {
                // 更新文章
                result = await window.adminAPI.updateArticle(this.currentArticle.id, articleData);
            } else {
                // 创建新文章
                articleData.id = this.articles.length > 0 ? Math.max(...this.articles.map(a => a.id)) + 1 : 1;
                articleData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
                result = await window.adminAPI.createArticle(articleData);
            }

            if (result.success) {
                window.adminCommon.showToast(result.message, 'success');
                this.closeModal();
                await this.loadArticles();
                this.renderArticles();
            } else {
                window.adminCommon.showToast(result.message || '保存失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('保存文章失败', 'error');
        }
    }

    // 编辑文章
    async editArticle(id) {
        await this.showArticleModal(id);
    }

    // 确认删除文章
    confirmDeleteArticle(id) {
        window.adminCommon.confirm('确定要删除这篇文章吗？', async () => {
            await this.deleteArticle(id);
        });
    }

    // 删除文章
    async deleteArticle(id) {
        try {
            const result = await window.adminAPI.deleteArticle(id);
            
            if (result.success) {
                window.adminCommon.showToast(result.message, 'success');
                await this.loadArticles();
                this.renderArticles();
            } else {
                window.adminCommon.showToast(result.message || '删除失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('删除文章失败', 'error');
        }
    }

    // 关闭模态框
    closeModal() {
        const modal = document.querySelector('#article-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 只在文章管理页面初始化
    if (window.location.pathname.includes('articles') || document.querySelector('#articles-container')) {
        window.articleManage = new ArticleManage();
    }
});
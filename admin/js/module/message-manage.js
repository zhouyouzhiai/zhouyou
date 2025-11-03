// 留言管理逻辑
// 包含留言的查看、删除功能

class MessageManage {
    constructor() {
        this.messages = [];
        this.init();
    }

    // 初始化
    async init() {
        await this.loadMessages();
        this.initEvents();
        this.renderMessages();
    }

    // 加载留言数据
    async loadMessages() {
        try {
            this.messages = await window.adminAPI.getMessages();
            this.renderMessages();
        } catch (error) {
            window.adminCommon.showToast('加载留言失败', 'error');
        }
    }

    // 初始化事件
    initEvents() {
        // 搜索框
        const searchInput = document.querySelector('#message-search');
        if (searchInput) {
            searchInput.addEventListener('input', window.adminCommon.debounce(() => {
                this.filterMessages();
            }, 300));
        }

        // 状态筛选
        const statusSelect = document.querySelector('#message-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', () => this.filterMessages());
        }

        // 删除确认
        document.addEventListener('click', (e) => {
            if (e.target.matches('.delete-message-btn')) {
                const id = e.target.getAttribute('data-id');
                this.confirmDeleteMessage(id);
            }
        });

        // 查看留言详情
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-message-btn')) {
                const id = e.target.getAttribute('data-id');
                this.viewMessage(id);
            }
        });

        // 标记已读/未读
        document.addEventListener('click', (e) => {
            if (e.target.matches('.toggle-read-btn')) {
                const id = e.target.getAttribute('data-id');
                this.toggleReadStatus(id);
            }
        });

        // 批量操作
        const selectAllCheckbox = document.querySelector('#select-all-messages');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => {
                this.toggleSelectAll();
            });
        }

        // 批量删除
        const batchDeleteBtn = document.querySelector('#batch-delete-messages');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => {
                this.batchDeleteMessages();
            });
        }

        // 批量标记已读
        const batchReadBtn = document.querySelector('#batch-mark-read');
        if (batchReadBtn) {
            batchReadBtn.addEventListener('click', () => {
                this.batchMarkAsRead();
            });
        }
    }

    // 渲染留言列表
    renderMessages(messages = this.messages) {
        const container = document.querySelector('#messages-container');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>暂无留言</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="message-controls">
                <div class="batch-actions">
                    <input type="checkbox" id="select-all-messages">
                    <label for="select-all-messages">全选</label>
                    <button class="btn btn-sm btn-secondary" id="batch-mark-read">
                        <i class="fas fa-check"></i> 标记已读
                    </button>
                    <button class="btn btn-sm btn-danger" id="batch-delete-messages">
                        <i class="fas fa-trash"></i> 批量删除
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>选择</th>
                            <th>状态</th>
                            <th>姓名</th>
                            <th>邮箱</th>
                            <th>内容</th>
                            <th>IP地址</th>
                            <th>留言时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        messages.forEach(message => {
            const statusClass = message.is_read ? 'status-read' : 'status-unread';
            const statusText = message.is_read ? '已读' : '未读';
            const contentPreview = message.content.length > 50 
                ? message.content.substring(0, 50) + '...' 
                : message.content;
            
            html += `
                <tr data-id="${message.id}">
                    <td>
                        <input type="checkbox" class="message-checkbox" data-id="${message.id}">
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td>${message.name}</td>
                    <td>${message.email}</td>
                    <td class="message-content">${contentPreview}</td>
                    <td>${message.ip_address || '-'}</td>
                    <td>${window.adminCommon.formatDate(message.created_at)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-message-btn" data-id="${message.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary toggle-read-btn" data-id="${message.id}">
                            <i class="fas fa-${message.is_read ? 'envelope' : 'envelope-open'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-message-btn" data-id="${message.id}">
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

    // 筛选留言
    filterMessages() {
        const searchTerm = document.querySelector('#message-search')?.value.toLowerCase() || '';
        const status = document.querySelector('#message-status')?.value || '';

        let filtered = this.messages;

        // 按搜索词筛选
        if (searchTerm) {
            filtered = filtered.filter(message => 
                message.name.toLowerCase().includes(searchTerm) ||
                message.email.toLowerCase().includes(searchTerm) ||
                message.content.toLowerCase().includes(searchTerm)
            );
        }

        // 按状态筛选
        if (status !== '') {
            const isRead = status === 'read';
            filtered = filtered.filter(message => 
                message.is_read === isRead
            );
        }

        this.renderMessages(filtered);
    }

    // 查看留言详情
    async viewMessage(id) {
        try {
            const message = await window.adminAPI.getMessage(id);
            
            if (message) {
                // 如果留言未读，自动标记为已读
                if (!message.is_read) {
                    await this.markAsRead(id);
                }
                
                this.showMessageDetail(message);
            } else {
                window.adminCommon.showToast('留言不存在', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('查看留言失败', 'error');
        }
    }

    // 显示留言详情
    showMessageDetail(message) {
        const modal = document.querySelector('#message-detail-modal');
        if (!modal) return;

        // 填充留言详情
        const nameElement = document.querySelector('#detail-name');
        if (nameElement) nameElement.textContent = message.name;

        const emailElement = document.querySelector('#detail-email');
        if (emailElement) emailElement.textContent = message.email;

        const contentElement = document.querySelector('#detail-content');
        if (contentElement) contentElement.textContent = message.content;

        const ipElement = document.querySelector('#detail-ip');
        if (ipElement) ipElement.textContent = message.ip_address || '-';

        const dateElement = document.querySelector('#detail-date');
        if (dateElement) dateElement.textContent = window.adminCommon.formatDate(message.created_at);

        // 显示模态框
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 切换已读/未读状态
    async toggleReadStatus(id) {
        try {
            const message = this.messages.find(m => m.id === parseInt(id));
            if (!message) return;

            const newStatus = !message.is_read;
            const result = await window.adminAPI.updateMessage(id, { is_read: newStatus ? 1 : 0 });
            
            if (result.success) {
                await this.loadMessages();
                this.renderMessages();
                window.adminCommon.showToast(result.message, 'success');
            } else {
                window.adminCommon.showToast(result.message || '操作失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('更新留言状态失败', 'error');
        }
    }

    // 标记为已读
    async markAsRead(id) {
        try {
            const result = await window.adminAPI.updateMessage(id, { is_read: 1 });
            
            if (result.success) {
                // 更新本地数据
                const message = this.messages.find(m => m.id === parseInt(id));
                if (message) {
                    message.is_read = 1;
                }
            }
        } catch (error) {
            // 静默处理错误，不影响用户体验
        }
    }

    // 确认删除留言
    confirmDeleteMessage(id) {
        window.adminCommon.confirm('确定要删除这条留言吗？', async () => {
            await this.deleteMessage(id);
        });
    }

    // 删除留言
    async deleteMessage(id) {
        try {
            const result = await window.adminAPI.deleteMessage(id);
            
            if (result.success) {
                window.adminCommon.showToast(result.message, 'success');
                await this.loadMessages();
                this.renderMessages();
            } else {
                window.adminCommon.showToast(result.message || '删除失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('删除留言失败', 'error');
        }
    }

    // 全选/取消全选
    toggleSelectAll() {
        const selectAll = document.querySelector('#select-all-messages');
        const checkboxes = document.querySelectorAll('.message-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
        });
    }

    // 获取选中的留言ID
    getSelectedMessageIds() {
        const checkboxes = document.querySelectorAll('.message-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => parseInt(checkbox.getAttribute('data-id')));
    }

    // 批量删除留言
    async batchDeleteMessages() {
        const selectedIds = this.getSelectedMessageIds();
        
        if (selectedIds.length === 0) {
            window.adminCommon.showToast('请先选择要删除的留言', 'warning');
            return;
        }

        window.adminCommon.confirm(`确定要删除选中的 ${selectedIds.length} 条留言吗？`, async () => {
            try {
                let successCount = 0;
                
                for (const id of selectedIds) {
                    const result = await window.adminAPI.deleteMessage(id);
                    if (result.success) {
                        successCount++;
                    }
                }
                
                if (successCount > 0) {
                    window.adminCommon.showToast(`成功删除 ${successCount} 条留言`, 'success');
                    await this.loadMessages();
                    this.renderMessages();
                } else {
                    window.adminCommon.showToast('删除失败', 'error');
                }
            } catch (error) {
                window.adminCommon.showToast('批量删除留言失败', 'error');
            }
        });
    }

    // 批量标记已读
    async batchMarkAsRead() {
        const selectedIds = this.getSelectedMessageIds();
        
        if (selectedIds.length === 0) {
            window.adminCommon.showToast('请先选择要标记的留言', 'warning');
            return;
        }

        try {
            let successCount = 0;
            
            for (const id of selectedIds) {
                const result = await window.adminAPI.updateMessage(id, { is_read: 1 });
                if (result.success) {
                    successCount++;
                }
            }
            
            if (successCount > 0) {
                window.adminCommon.showToast(`成功标记 ${successCount} 条留言为已读`, 'success');
                await this.loadMessages();
                this.renderMessages();
            } else {
                window.adminCommon.showToast('操作失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('批量标记已读失败', 'error');
        }
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 只在留言管理页面初始化
    if (window.location.pathname.includes('messages') || document.querySelector('#messages-container')) {
        window.messageManage = new MessageManage();
    }
});
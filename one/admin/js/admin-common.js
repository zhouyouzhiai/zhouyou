// 后台通用逻辑脚本
// 包含登录验证、导航切换等通用功能

class AdminCommon {
    constructor() {
        // 确保DOM加载完成后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeAfterDOMLoad();
            });
        } else {
            this.initializeAfterDOMLoad();
        }
    }
    
    // DOM加载完成后初始化
    initializeAfterDOMLoad() {
        // 根据页面类型决定是否初始化
        const isLoginPage = window.location.pathname.includes('login.html');
        
        // 在所有页面都初始化主题
        this.initTheme();
        
        if (!isLoginPage) {
            this.init();
        } else {
            // 在登录页面只检查登录状态
            this.checkAuth();
        }
    }

    // 静态方法：检查是否已登录
    static isLoggedIn() {
        const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (!loggedIn) {
            return false;
        }
        
        // 检查登录是否过期
        const expireTime = localStorage.getItem('adminLoginExpire');
        if (expireTime) {
            const now = Date.now();
            if (now > parseInt(expireTime)) {
                // 登录已过期，清除登录状态
                AdminCommon.logout();
                return false;
            }
        }
        
        return true;
    }

    // 静态方法：设置登录状态
    static setLoginState(user, rememberMe = false) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', user.username);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        if (!rememberMe) {
            // 如果不记住登录状态，设置会话过期时间
            const expireTime = Date.now() + 24 * 60 * 60 * 1000; // 24小时后过期
            localStorage.setItem('adminLoginExpire', expireTime.toString());
        } else {
            localStorage.removeItem('adminLoginExpire');
        }
    }

    // 静态方法：登录
    static login(username, password) {
        // 这里使用简单的用户名密码验证
        // 实际应用中应该使用更安全的验证方式
        if (username === 'admin' && password === 'admin123') {
            // 构建用户对象
            const user = {
                id: 1,
                username: username,
                name: '管理员',
                avatar: '/static/img/logo.png'
            };
            
            // 使用setLoginState方法设置登录状态
            AdminCommon.setLoginState(user, false);
            
            return { success: true, message: '登录成功', user: user };
        } else {
            return { success: false, message: '用户名或密码错误' };
        }
    }

    // 静态方法：登出
    static logout() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminLoginExpire');
        window.location.href = './login.html';
    }

    // 静态方法：获取当前登录用户
    static getCurrentUser() {
        return localStorage.getItem('adminUsername') || 'Admin';
    }

    // 初始化
    init() {
        this.checkAuth();
        // 主题已在构造函数中初始化，不再重复初始化
        this.initSidebar();
        this.initModals();
        this.initTooltips();
        this.initFormValidation();
    }

    // 检查登录状态
    checkAuth() {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html');
        
        // 如果不是登录页面且未登录，则跳转到登录页面
        if (!isLoginPage && !AdminCommon.isLoggedIn()) {
            window.location.href = './login.html';
            return;
        }
        
        // 如果是登录页面且已登录，则跳转到管理后台主页
        if (isLoginPage && AdminCommon.isLoggedIn()) {
            window.location.href = './admin.html';
            return;
        }
    }

    // 检查是否已登录
    isLoggedIn() {
        return AdminCommon.isLoggedIn();
    }

    // 设置登录状态
    setLoginState(user, rememberMe = false) {
        AdminCommon.setLoginState(user, rememberMe);
    }

    // 登录
    login(username, password) {
        return AdminCommon.login(username, password);
    }

    // 登出
    logout() {
        AdminCommon.logout();
    }

    // 获取当前登录用户
    getCurrentUser() {
        return AdminCommon.getCurrentUser();
    }

    // 初始化主题
    initTheme() {
        const savedTheme = localStorage.getItem('adminTheme') || 'light';
        this.setTheme(savedTheme);
        
        // 监听主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // 直接从localStorage获取当前主题，而不是依赖类名
                const currentTheme = localStorage.getItem('adminTheme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }
    }

    // 设置主题
    setTheme(theme) {
        // 确保主题参数有效
        theme = theme === 'dark' ? 'dark' : 'light';
        
        // 更新body类
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // 更新localStorage
        localStorage.setItem('adminTheme', theme);
        
        // 更新主题切换按钮图标
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                // 修复图标逻辑：light主题显示月亮图标，dark主题显示太阳图标
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    /**
     * 初始化侧边栏功能
     * 
     * 功能说明：
     * 1. 恢复侧边栏的折叠/展开状态
     * 2. 添加侧边栏折叠/展开切换功能
     * 3. 添加移动端侧边栏显示/隐藏功能
     * 4. 添加触摸滑动支持（移动端）
     * 5. 高亮当前页面对应的菜单项
     * 
     * 交互方式：
     * - 桌面端：点击侧边栏切换按钮折叠/展开
     * - 移动端：点击移动端菜单按钮显示/隐藏侧边栏
     * - 移动端：从左边缘向右滑动打开侧边栏，从右向左滑动关闭侧边栏
     * - 点击主内容区域关闭移动端侧边栏
     */
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const mobileToggle = document.getElementById('mobile-toggle');
        const mainContent = document.querySelector('.main-content');
        
        // 检查必要元素是否存在
        if (!sidebar || !sidebarToggle || !mainContent) {
            return;
        }
        
        // 恢复侧边栏状态
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
        }
        
        // 侧边栏折叠/展开
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // 移动端侧边栏切换
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                mainContent.classList.toggle('sidebar-open');
            });
        }
        
        // 点击主内容区域关闭移动端侧边栏
        mainContent.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
                mainContent.classList.remove('sidebar-open');
            }
        });
        
        // 窗口大小变化时重置侧边栏状态
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('show');
                mainContent.classList.remove('sidebar-open');
            }
        });
        
        // 添加触摸滑动功能
        this.addTouchSwipe(sidebar, mainContent);
        
        // 高亮当前菜单项
        const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href)) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * 添加触摸滑动功能
     * 
     * @param {HTMLElement} sidebar - 侧边栏DOM元素
     * @param {HTMLElement} mainContent - 主内容区DOM元素
     * 
     * 功能说明：
     * 为移动端添加触摸滑动支持，实现通过手势打开/关闭侧边栏
     * 
     * 滑动行为：
     * - 从左边缘向右滑动：打开侧边栏
     * - 从右向左滑动：关闭侧边栏
     * - 滑动距离阈值：50px
     */
    addTouchSwipe(sidebar, mainContent) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX, sidebar, mainContent);
        });
    }
    
    /**
     * 处理触摸滑动事件
     * 
     * @param {number} startX - 触摸开始时的X坐标
     * @param {number} endX - 触摸结束时的X坐标
     * @param {HTMLElement} sidebar - 侧边栏DOM元素
     * @param {HTMLElement} mainContent - 主内容区DOM元素
     * 
     * 功能说明：
     * 根据滑动距离和方向判断是否触发侧边栏的打开/关闭操作
     * 
     * 判断逻辑：
     * - 只在移动端（屏幕宽度≤768px）生效
     * - 从左边缘开始向右滑动超过50px：打开侧边栏
     * - 从右向左滑动超过50px：关闭侧边栏
     */
    handleSwipe(startX, endX, sidebar, mainContent) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (window.innerWidth <= 768) {
            // 从左向右滑动，打开侧边栏
            if (diff < -swipeThreshold && startX < 50) {
                sidebar.classList.add('show');
                mainContent.classList.add('sidebar-open');
            }
            // 从右向左滑动，关闭侧边栏
            else if (diff > swipeThreshold) {
                sidebar.classList.remove('show');
                mainContent.classList.remove('sidebar-open');
            }
        }
    }

    /**
     * 初始化模态框功能
     * 
     * 功能说明：
     * 1. 为所有带有data-toggle="modal"属性的元素添加点击事件，打开对应的模态框
     * 2. 为所有带有modal-close类的元素或点击模态框背景添加关闭功能
     * 3. 添加ESC键关闭当前打开的模态框功能
     * 
     * 使用方法：
     * 打开模态框：<button data-toggle="modal" data-target="#modal-id">打开</button>
     * 关闭模态框：<button class="modal-close">关闭</button> 或点击模态框背景
     * 
     * 注意事项：
     * - 模态框打开时会禁用body滚动
     * - 模态框关闭时会恢复body滚动
     */
    initModals() {
        // 打开模态框
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-toggle="modal"]')) {
                const targetId = e.target.getAttribute('data-target');
                const modal = document.querySelector(targetId);
                if (modal) {
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
        
        // 关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.matches('.modal')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    openModal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // 初始化工具提示
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const title = e.target.getAttribute('title') || e.target.getAttribute('data-title');
                if (title) {
                    this.createTooltip(e.target, title);
                }
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.removeTooltip(e.target);
            });
        });
    }

    // 创建工具提示
    createTooltip(element, text) {
        // 移除已存在的工具提示
        this.removeTooltip(element);
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // 计算位置
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        // 添加引用
        element._tooltip = tooltip;
    }

    // 移除工具提示
    removeTooltip(element) {
        if (element._tooltip) {
            element._tooltip.parentNode.removeChild(element._tooltip);
            element._tooltip = null;
        }
    }

    // 初始化表单验证
    initFormValidation() {
        const forms = document.querySelectorAll('.needs-validation');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 显示验证错误提示
                    const invalidFields = form.querySelectorAll(':invalid');
                    if (invalidFields.length > 0) {
                        // 滚动到第一个无效字段
                        invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // 为无效字段添加动画效果
                        invalidFields.forEach(field => {
                            field.classList.add('invalid-shake');
                            setTimeout(() => {
                                field.classList.remove('invalid-shake');
                            }, 1000);
                        });
                    }
                }
                
                form.classList.add('was-validated');
            });
        });
    }

    /**
     * 显示提示消息
     * 
     * @param {string} message - 要显示的消息内容
     * @param {string} type - 消息类型，可选值：'info'(默认), 'success', 'warning', 'error'
     * 
     * 功能说明：
     * 1. 创建一个临时提示消息元素，并添加到页面中
     * 2. 提示消息会在3秒后自动消失
     * 3. 如果已有提示消息存在，会先移除旧消息再显示新消息
     * 
     * 使用示例：
     * showToast('操作成功', 'success');
     * showToast('发生错误', 'error');
     * showToast('提示信息'); // 默认info类型
     * 
     * 注意事项：
     * - 消息显示位置取决于toast容器，默认添加到body
     * - 消息显示和隐藏有过渡动画效果
     */
    showToast(message, type = 'info') {
        // 移除已存在的提示
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建新提示
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 尝试找到toast容器，如果没有则添加到body
        const toastContainer = document.querySelector('#toast-container') || document.querySelector('.toast-container') || document.body;
        toastContainer.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 确认对话框
    confirm(message, callback) {
        const confirmed = window.confirm(message);
        if (confirmed && typeof callback === 'function') {
            callback();
        }
        return confirmed;
    }

    // 格式化日期
    formatDate(dateString, format = 'YYYY-MM-DD HH:mm:ss') {
        const date = new Date(dateString);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 防抖函数
     * 
     * @param {Function} func - 需要防抖处理的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 返回防抖处理后的函数
     * 
     * 功能说明：
     * 创建一个防抖函数，在指定时间内多次调用只执行最后一次调用
     * 
     * 使用场景：
     * - 搜索框输入事件
     * - 窗口大小调整事件
     * - 按钮快速点击防止重复提交
     * 
     * 示例：
     * const debouncedSearch = debounce(searchFunction, 300);
     * inputElement.addEventListener('input', debouncedSearch);
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    /**
     * 节流函数
     * 
     * @param {Function} func - 需要节流处理的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} 返回节流处理后的函数
     * 
     * 功能说明：
     * 创建一个节流函数，在指定时间内只执行一次函数调用
     * 
     * 使用场景：
     * - 滚动事件处理
     * - 鼠标移动事件
     * - 窗口大小调整事件
     * 
     * 示例：
     * const throttledScroll = throttle(scrollHandler, 100);
     * window.addEventListener('scroll', throttledScroll);
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 生成随机ID
     * 
     * @returns {string} 返回一个唯一的随机ID字符串
     * 
     * 功能说明：
     * 生成一个基于时间戳和随机数的唯一ID，可用于DOM元素ID、临时数据标识等
     * 
     * 示例：
     * const elementId = generateId();
     * document.getElementById(elementId);
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 获取URL参数
     * 
     * @param {string} name - 参数名称
     * @returns {string|null} 返回参数值，如果参数不存在则返回null
     * 
     * 功能说明：
     * 从当前URL的查询字符串中获取指定参数的值
     * 
     * 示例：
     * // URL: https://example.com?page=1&sort=name
     * const page = getUrlParam('page'); // 返回 '1'
     * const sort = getUrlParam('sort'); // 返回 'name'
     * const limit = getUrlParam('limit'); // 返回 null
     */
    getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    /**
     * 设置URL参数
     * 
     * @param {string} name - 参数名称
     * @param {string} value - 参数值
     * 
     * 功能说明：
     * 设置或更新当前URL的查询参数，不刷新页面
     * 
     * 示例：
     * setUrlParam('page', '2'); // URL变为?当前参数&page=2
     * setUrlParam('sort', 'date'); // 更新sort参数值
     */
    setUrlParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    }

    /**
     * 移除URL参数
     * 
     * @param {string} name - 要移除的参数名称
     * 
     * 功能说明：
     * 从当前URL的查询字符串中移除指定参数，不刷新页面
     * 
     * 示例：
     * // URL: https://example.com?page=1&sort=name
     * removeUrlParam('page'); // URL变为?sort=name
     */
    removeUrlParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    }

    // 显示加载指示器
    showLoading(container, message = '加载中...') {
        // 创建加载指示器
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        // 保存原始内容
        container._originalContent = container.innerHTML;
        
        // 显示加载指示器
        container.innerHTML = '';
        container.appendChild(loadingElement);
        
        // 添加显示动画
        setTimeout(() => {
            loadingElement.classList.add('show');
        }, 10);
    }

    // 隐藏加载指示器
    hideLoading(container) {
        const loadingElement = container.querySelector('.loading-overlay');
        
        if (loadingElement) {
            // 添加隐藏动画
            loadingElement.classList.remove('show');
            
            // 等待动画完成后恢复原始内容
            setTimeout(() => {
                if (container._originalContent !== undefined) {
                    container.innerHTML = container._originalContent;
                    delete container._originalContent;
                }
            }, 300);
        }
    }
}

// 创建全局实例
window.adminCommon = new AdminCommon();
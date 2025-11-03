/**
 * 基础功能模块
 * 包含网站的基础工具函数和全局设置
 */

// 控制台输出版权信息
console.log('%c欢迎来到周游的个人网站！', 'color: #fff; background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); padding: 8px 15px; border-radius: 4px; font-size: 14px;');
console.log('%c🐱 喵~', 'color: #ff6b6b; font-size: 20px;');

// 全局配置
window.AppConfig = {
    // API基础路径
    apiBase: window.location.protocol === 'file:' ? null : './api.php',
    // 资源基础路径
    assetBase: './static',
    // 默认图片
    defaultImage: './static/img/default.png',
    // 懒加载配置
    lazyLoad: {
        rootMargin: '200px',
        threshold: 0.01
    }
};

// 工具函数
const Utils = {
    /**
     * 切换CSS类
     * @param {Element} element - DOM元素
     * @param {string} className - CSS类名
     */
    toggleClass(element, className) {
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        } else {
            element.classList.add(className);
        }
    },

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 格式化图片URL
     * @param {string} url - 原始URL
     * @returns {string} 格式化后的URL
     */
    formatImageUrl(url) {
        if (!url) return AppConfig.defaultImage;
        
        // 如果是相对路径且不以./开头，添加./
        if (url.startsWith('img/') || url.startsWith('svg/')) {
            return `./static/${url}`;
        }
        
        // 如果已经是完整路径，直接返回
        if (url.startsWith('http') || url.startsWith('./')) {
            return url;
        }
        
        // 默认添加./static/前缀
        return `./static/${url}`;
    },

    /**
     * 添加波纹效果
     * @param {Event} event - 点击事件
     */
    addRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // 移除旧的波纹
        const oldRipple = button.querySelector('.ripple');
        if (oldRipple) {
            oldRipple.remove();
        }
        
        button.appendChild(ripple);
        
        // 动画结束后移除波纹
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    },

    /**
     * 显示通知消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, info)
     * @param {number} duration - 显示时长（毫秒）
     */
    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    },

    /**
     * 检测设备类型
     * @returns {string} 设备类型 (mobile, tablet, desktop)
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    },

    /**
     * 获取当前主题
     * @returns {string} 主题名称 (light, dark)
     */
    getCurrentTheme() {
        return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    },

    /**
     * 设置主题
     * @param {string} theme - 主题名称 (light, dark)
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }
};

// Cookie操作
const Cookie = {
    /**
     * 设置Cookie
     * @param {string} name - Cookie名称
     * @param {string} value - Cookie值
     * @param {number} days - 过期天数
     */
    set(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    },

    /**
     * 获取Cookie值
     * @param {string} name - Cookie名称
     * @returns {string|null} Cookie值
     */
    get(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    },

    /**
     * 删除Cookie
     * @param {string} name - Cookie名称
     */
    delete(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

// 导出工具对象
window.Utils = Utils;
window.Cookie = Cookie;

// DOM加载完成后执行的基础初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        Utils.setTheme('dark');
        document.getElementById('myonoffswitch').checked = false;
    }

    // 禁用右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // 页面加载动画
    const loading = document.getElementById('ZhouYou-loading');
    if (loading) {
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.visibility = 'hidden';
            }, 600);
        }, 800);
    }
});

// 导出基础模块
window.Base = {
    Utils,
    Cookie,
    AppConfig
};
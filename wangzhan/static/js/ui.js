/**
 * UI交互模块
 * 负责主题切换、社交链接、FPS显示等UI交互功能
 */

// UI交互管理器
const UIManager = {
    // 初始化UI交互
    init() {
        this.initThemeToggle();
        this.initSocialLinks();
        this.initFPSDisplay();
        this.initProjectItemButtons();
        this.initScrollEffects();
        this.initResponsiveHandling();
        this.initSkillGraph();
    },

    // 初始化主题切换
    initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // 设置初始状态
        const currentTheme = this.getCookie('theme') || 'light';
        this.setTheme(currentTheme);

        // 添加切换事件
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            this.setTheme(newTheme);
            this.setCookie('theme', newTheme, 365);
        });
    },
    
    // 获取Cookie
    getCookie(name) {
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
    
    // 设置Cookie
    setCookie(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    },

    // 设置主题
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            document.documentElement.setAttribute('data-theme', 'light');
        }

        // 触发主题变化事件
        document.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme }
        }));
    },

    // 初始化社交链接
    initSocialLinks() {
        const iconItems = document.querySelectorAll('.iconItem');
        iconItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const link = item.getAttribute('data-link') || item.querySelector('a')?.href;
                const isEmail = item.getAttribute('data-type') === 'email';
                
                if (isEmail) {
                    this.copyEmailToClipboard(link);
                } else if (link) {
                    window.open(link, '_blank');
                }
            });
        });
    },

    // 复制邮箱地址到剪贴板
    copyEmailToClipboard(email) {
        if (!email) return;

        // 尝试使用现代API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(() => {
                this.showNotification('邮箱地址已复制到剪贴板', 'success');
            }).catch(err => {
                console.error('复制失败:', err);
                this.fallbackCopyToClipboard(email);
            });
        } else {
            // 回退方案
            this.fallbackCopyToClipboard(email);
        }
    },

    // 回退复制方案
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('邮箱地址已复制到剪贴板', 'success');
        } catch (err) {
            console.error('复制失败:', err);
            this.showNotification('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textArea);
    },

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // 添加样式
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = 'white';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

        // 根据类型设置背景色
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#4caf50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ff9800';
                break;
            default:
                notification.style.backgroundColor = '#2196f3';
        }

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    // 初始化FPS显示
    initFPSDisplay() {
        // 创建FPS显示元素
        const fpsDisplay = document.createElement('div');
        fpsDisplay.id = 'fpsDisplay';
        fpsDisplay.style.position = 'fixed';
        fpsDisplay.style.top = '10px';
        fpsDisplay.style.left = '10px';
        fpsDisplay.style.color = 'var(--text-color, #333)';
        fpsDisplay.style.fontSize = '12px';
        fpsDisplay.style.fontFamily = 'monospace';
        fpsDisplay.style.zIndex = '9999';
        fpsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        fpsDisplay.style.padding = '5px';
        fpsDisplay.style.borderRadius = '3px';
        fpsDisplay.style.opacity = '0.7';
        fpsDisplay.style.pointerEvents = 'none';
        document.body.appendChild(fpsDisplay);

        // FPS计算变量
        let fps = 0;
        let lastTime = performance.now();
        let frames = 0;

        // 更新FPS
        function updateFPS() {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                // 更新显示
                fpsDisplay.textContent = `FPS: ${fps}`;
            }
            
            requestAnimationFrame(updateFPS);
        }

        // 开始计算FPS
        requestAnimationFrame(updateFPS);

        // 添加双击隐藏/显示功能
        fpsDisplay.addEventListener('dblclick', () => {
            if (fpsDisplay.style.opacity === '0') {
                fpsDisplay.style.opacity = '0.7';
            } else {
                fpsDisplay.style.opacity = '0';
            }
        });
    },

    // 初始化项目按钮交互
    initProjectItemButtons() {
        const projectItems = document.querySelectorAll('.projectItem');
        
        projectItems.forEach(item => {
            // 鼠标按下事件
            item.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // 左键
                    item.classList.add('active');
                }
            });

            // 鼠标释放事件
            item.addEventListener('mouseup', () => {
                item.classList.remove('active');
            });

            // 鼠标离开事件
            item.addEventListener('mouseleave', () => {
                item.classList.remove('active');
            });

            // 触摸开始事件
            item.addEventListener('touchstart', (e) => {
                item.classList.add('active');
            });

            // 触摸结束事件
            item.addEventListener('touchend', () => {
                item.classList.remove('active');
            });

            // 触摸取消事件
            item.addEventListener('touchcancel', () => {
                item.classList.remove('active');
            });
        });
    },

    // 初始化滚动效果
    initScrollEffects() {
        let lastScrollTop = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // 向下滚动超过阈值时添加类
            if (scrollTop > scrollThreshold) {
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }

            // 检测滚动方向
            if (scrollTop > lastScrollTop) {
                // 向下滚动
                document.body.classList.add('scrolling-down');
                document.body.classList.remove('scrolling-up');
            } else {
                // 向上滚动
                document.body.classList.add('scrolling-up');
                document.body.classList.remove('scrolling-down');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, 100));
    },

    // 初始化响应式处理
    initResponsiveHandling() {
        // 初始检查
        this.checkResponsive();

        // 监听窗口大小变化
        window.addEventListener('resize', Utils.debounce(() => {
            this.checkResponsive();
        }, 200));
    },

    // 检查响应式状态
    checkResponsive() {
        const width = window.innerWidth;
        
        // 移除所有响应式类
        document.body.classList.remove('mobile', 'tablet', 'desktop');
        
        // 添加相应的响应式类
        if (width < 768) {
            document.body.classList.add('mobile');
        } else if (width < 1024) {
            document.body.classList.add('tablet');
        } else {
            document.body.classList.add('desktop');
        }

        // 触发响应式变化事件
        document.dispatchEvent(new CustomEvent('responsivechange', {
            detail: { width, type: this.getDeviceType(width) }
        }));
    },

    // 获取设备类型
    getDeviceType(width) {
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    },

    // 平滑滚动到元素
    scrollToElement(element, duration = 300) {
        if (!element) return;

        const start = window.pageYOffset;
        const targetY = element.getBoundingClientRect().top + start;
        const distance = targetY - start;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, start, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        // 缓动函数
        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    },

    // 添加页面加载完成后的动画
    initPageLoadAnimation() {
        const loadingElement = document.getElementById('ZhouYou-loading');
        if (!loadingElement) return;

        // 页面加载完成后淡出加载动画
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingElement.style.opacity = '0';
                loadingElement.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loadingElement.style.display = 'none';
                }, 500);
            }, 300);
        });
    },

    // 初始化技能图谱交互效果
    initSkillGraph() {
        // 获取技能图谱元素
        const skillContainer = document.querySelector('.skill');
        const skillPc = document.getElementById('skillPc');
        const skillWap = document.getElementById('skillWap');
        
        if (!skillContainer || !skillPc || !skillWap) {
            return;
        }
        
        // 添加加载状态类
        skillContainer.classList.add('loading');
        
        // 创建观察器来检测元素是否进入视口
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 延迟加载技能图谱图片
                    this.loadSkillImages(skillContainer, skillPc, skillWap);
                    // 停止观察
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // 当元素10%进入视口时触发
        });
        
        // 开始观察技能图谱容器
        observer.observe(skillContainer);
        
        // 初始切换
        this.toggleSkillImage(skillPc, skillWap);
        
        // 窗口大小变化时切换
        window.addEventListener('resize', Utils.debounce(() => {
            this.toggleSkillImage(skillPc, skillWap);
        }, 200));
        
        // 添加点击波纹效果
        skillContainer.addEventListener('click', function(e) {
            // 添加波纹效果类
            skillContainer.classList.add('ripple');
            
            // 动画结束后移除类
            setTimeout(() => {
                skillContainer.classList.remove('ripple');
            }, 600);
        });
        
        // 添加技能图谱悬停效果
        skillContainer.addEventListener('mouseenter', function() {
            // 可以在这里添加额外的悬停效果
        });
        
        skillContainer.addEventListener('mouseleave', function() {
            // 可以在这里添加离开悬停时的效果
        });
    },

    // 加载技能图谱图片
    loadSkillImages(skillContainer, skillPc, skillWap) {
        // 获取当前应该显示的图片
        const currentImage = window.innerWidth <= 768 ? skillWap : skillPc;
        
        // 设置图片源
        if (currentImage.dataset.src) {
            currentImage.src = currentImage.dataset.src;
            
            // 图片加载完成后添加动画
            currentImage.onload = function() {
                setTimeout(() => {
                    skillContainer.classList.remove('loading');
                    currentImage.classList.add('loaded');
                }, 300);
            };
            
            // 图片加载失败处理
            currentImage.onerror = function() {
                skillContainer.classList.remove('loading');
                console.error('技能图谱图片加载失败');
            };
        }
    },

    // 响应式技能图谱显示切换
    toggleSkillImage(skillPc, skillWap) {
        const currentImage = window.innerWidth <= 768 ? skillWap : skillPc;
        const otherImage = window.innerWidth <= 768 ? skillPc : skillWap;
        
        // 隐藏另一张图片
        otherImage.style.display = 'none';
        
        // 显示当前图片
        currentImage.style.display = 'block';
        
        // 如果当前图片已加载，添加loaded类
        if (currentImage.src && currentImage.complete) {
            currentImage.classList.add('loaded');
        } else if (currentImage.dataset.src) {
            // 如果图片还未加载，重新加载
            currentImage.src = currentImage.dataset.src;
        }
    }
};

// 兼容性函数，保持与原始代码的兼容性
function toggleTheme() {
    UIManager.setTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
}

function showNotification(message, type) {
    UIManager.showNotification(message, type);
}

// 初始化UI交互
document.addEventListener('DOMContentLoaded', function() {
    // 初始化UI管理器
    UIManager.init();
    
    // 初始化页面加载动画
    UIManager.initPageLoadAnimation();
    
    console.log('UI交互初始化完成');
});

// 导出模块
window.UIManager = UIManager;
window.toggleTheme = toggleTheme;
window.showNotification = showNotification;
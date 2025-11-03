/**
 * 懒加载模块
 * 负责图片和其他资源的延迟加载
 */

// 懒加载器
const LazyLoader = {
    // 配置选项
    options: {
        root: null, // 视口作为根元素
        rootMargin: '0px', // 根元素的外边距
        threshold: 0.1, // 目标元素可见度达到10%时触发
        placeholder: null, // 不使用占位图片，改用CSS动画
        fadeInDuration: 300 // 淡入动画持续时间(ms)
    },

    // 观察器实例
    observer: null,

    // 已处理的元素集合
    processedElements: new Set(),

    /**
     * 初始化懒加载
     * @param {Object} options - 配置选项
     */
    init(options = {}) {
        // 合并配置
        this.options = { ...this.options, ...options };

        // 检查浏览器是否支持IntersectionObserver
        if (!window.IntersectionObserver) {
            console.warn('浏览器不支持IntersectionObserver，使用回退方案');
            this.initFallback();
            return;
        }

        // 创建观察器
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            root: this.options.root,
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });

        // 查找所有需要懒加载的元素
        this.findAndObserveElements();

        // 监听DOM变化，自动处理新添加的元素
        this.observeDOMChanges();

        console.log('懒加载初始化完成');
    },

    /**
     * 查找并观察所有需要懒加载的元素
     */
    findAndObserveElements() {
        // 查找带有data-src属性的img元素
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (!this.processedElements.has(img)) {
                this.observeElement(img);
            }
        });

        // 查找带有data-bg属性的元素（背景图片懒加载）
        const bgElements = document.querySelectorAll('[data-bg]');
        bgElements.forEach(el => {
            if (!this.processedElements.has(el)) {
                this.observeElement(el);
            }
        });

        // 查找带有data-lazy属性的元素（通用懒加载）
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(el => {
            if (!this.processedElements.has(el)) {
                this.observeElement(el);
            }
        });
    },

    /**
     * 观察单个元素
     * @param {Element} element - 要观察的元素
     */
    observeElement(element) {
        // 为图片添加加载状态类
        if (element.tagName === 'IMG' && !element.src) {
            element.classList.add('lazy-loading');
            
            // 创建加载动画
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'lazy-spinner';
            
            // 设置图片容器样式
            element.style.display = 'block';
            element.style.position = 'relative';
            
            // 如果图片有父元素且父元素不是body，将加载动画添加到父元素
            if (element.parentElement && element.parentElement !== document.body) {
                element.parentElement.style.position = 'relative';
                element.parentElement.appendChild(loadingSpinner);
            } else {
                // 否则创建一个包装容器
                const wrapper = document.createElement('div');
                wrapper.style.position = 'relative';
                wrapper.style.display = 'inline-block';
                element.parentNode.insertBefore(wrapper, element);
                wrapper.appendChild(element);
                wrapper.appendChild(loadingSpinner);
            }
            
            // 保存加载动画引用，以便后续移除
            element._loadingSpinner = loadingSpinner;
        }

        // 添加到观察器
        this.observer.observe(element);
        this.processedElements.add(element);
    },

    /**
     * 处理元素进入视口
     * @param {Array} entries - IntersectionObserverEntry数组
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadElement(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    },

    /**
     * 加载元素
     * @param {Element} element - 要加载的元素
     */
    loadElement(element) {
        // 图片懒加载
        if (element.tagName === 'IMG' && element.dataset.src) {
            this.loadImage(element);
        }
        // 背景图片懒加载
        else if (element.dataset.bg) {
            this.loadBackground(element);
        }
        // 通用懒加载
        else if (element.dataset.lazy) {
            this.loadGeneric(element);
        }
    },

    /**
     * 加载图片
     * @param {HTMLImageElement} img - 图片元素
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 创建新图片对象进行预加载
        const newImg = new Image();
        
        newImg.onload = () => {
            // 设置图片源
            img.src = src;
            
            // 移除加载状态类
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            
            // 移除加载动画
            if (img._loadingSpinner) {
                img._loadingSpinner.remove();
                img._loadingSpinner = null;
            }
            
            // 添加淡入效果
            img.style.opacity = '0';
            img.style.transition = `opacity ${this.options.fadeInDuration}ms ease`;
            
            // 触发重排以确保过渡效果生效
            img.offsetHeight;
            
            // 设置透明度为1以触发淡入
            img.style.opacity = '1';
            
            // 清理data-src属性
            delete img.dataset.src;
            
            // 触发自定义事件
            img.dispatchEvent(new CustomEvent('lazyLoaded', { detail: { element: img } }));
        };
        
        newImg.onerror = () => {
            console.error('图片加载失败:', src);
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
            
            // 移除加载动画
            if (img._loadingSpinner) {
                img._loadingSpinner.remove();
                img._loadingSpinner = null;
            }
            
            img.dispatchEvent(new CustomEvent('lazyError', { detail: { element: img, src } }));
        };
        
        // 开始加载图片
        newImg.src = src;
    },

    /**
     * 加载背景图片
     * @param {Element} element - 要加载背景的元素
     */
    loadBackground(element) {
        const bg = element.dataset.bg;
        if (!bg) return;

        // 创建新图片对象进行预加载
        const newImg = new Image();
        
        newImg.onload = () => {
            // 设置背景图片
            element.style.backgroundImage = `url(${bg})`;
            element.classList.add('lazy-loaded');
            
            // 清理data-bg属性
            delete element.dataset.bg;
            
            // 触发自定义事件
            element.dispatchEvent(new CustomEvent('lazyLoaded', { detail: { element } }));
        };
        
        newImg.onerror = () => {
            console.error('背景图片加载失败:', bg);
            element.classList.add('lazy-error');
            element.dispatchEvent(new CustomEvent('lazyError', { detail: { element, src: bg } }));
        };
        
        // 开始加载图片
        newImg.src = bg;
    },

    /**
     * 通用懒加载
     * @param {Element} element - 要加载的元素
     */
    loadGeneric(element) {
        const lazyData = element.dataset.lazy;
        if (!lazyData) return;

        try {
            // 尝试解析JSON数据
            const data = JSON.parse(lazyData);
            
            // 根据数据类型处理
            if (data.type === 'iframe' && data.src) {
                // iframe懒加载
                const iframe = document.createElement('iframe');
                iframe.src = data.src;
                iframe.width = data.width || '100%';
                iframe.height = data.height || '300';
                iframe.frameBorder = data.frameBorder || '0';
                
                // 清空元素并添加iframe
                element.innerHTML = '';
                element.appendChild(iframe);
            } else if (data.type === 'html' && data.content) {
                // HTML内容懒加载
                element.innerHTML = data.content;
            } else if (data.type === 'script' && data.src) {
                // 脚本懒加载
                const script = document.createElement('script');
                script.src = data.src;
                if (data.async) script.async = true;
                if (data.defer) script.defer = true;
                element.appendChild(script);
            }
            
            element.classList.add('lazy-loaded');
            
            // 清理data-lazy属性
            delete element.dataset.lazy;
            
            // 触发自定义事件
            element.dispatchEvent(new CustomEvent('lazyLoaded', { detail: { element, data } }));
        } catch (error) {
            console.error('通用懒加载失败:', error);
            element.classList.add('lazy-error');
            element.dispatchEvent(new CustomEvent('lazyError', { detail: { element, data: lazyData } }));
        }
    },

    /**
     * 监听DOM变化
     */
    observeDOMChanges() {
        // 创建MutationObserver监听DOM变化
        const mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // 检查新添加的节点
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查节点本身
                            if (
                                (node.tagName === 'IMG' && node.dataset.src) ||
                                node.dataset.bg ||
                                node.dataset.lazy
                            ) {
                                this.observeElement(node);
                            }
                            
                            // 检查子节点
                            const lazyElements = node.querySelectorAll(
                                'img[data-src], [data-bg], [data-lazy]'
                            );
                            lazyElements.forEach(el => {
                                if (!this.processedElements.has(el)) {
                                    this.observeElement(el);
                                }
                            });
                        }
                    });
                }
            });
        });

        // 开始观察整个文档
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * 回退方案（不支持IntersectionObserver时使用）
     */
    initFallback() {
        // 立即加载所有图片
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.loadImage(img);
        });

        const bgElements = document.querySelectorAll('[data-bg]');
        bgElements.forEach(el => {
            this.loadBackground(el);
        });

        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(el => {
            this.loadGeneric(el);
        });
    },

    /**
     * 更新懒加载（用于动态添加内容后）
     */
    update() {
        this.findAndObserveElements();
    },

    /**
     * 手动加载指定元素
     * @param {Element} element - 要加载的元素
     */
    loadElementManually(element) {
        if (this.observer) {
            this.observer.unobserve(element);
        }
        this.loadElement(element);
    },

    /**
     * 销毁懒加载器
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.processedElements.clear();
    }
};

// 技能图谱懒加载器
const SkillGraphLazyLoader = {
    // 配置选项
    options: {
        rootMargin: '0px',
        threshold: 0.1,
        pcImage: './static/img/skillPc.png',
        mobileImage: './static/img/skillWap.png',
        fadeInDuration: 500
    },

    // 观察器实例
    observer: null,

    // 是否已初始化
    initialized: false,

    /**
     * 初始化技能图谱懒加载
     * @param {Object} options - 配置选项
     */
    init(options = {}) {
        if (this.initialized) return;
        
        // 合并配置
        this.options = { ...this.options, ...options };

        // 查找技能图谱容器
        const skillContainer = document.getElementById('skill');
        if (!skillContainer) {
            console.warn('技能图谱容器不存在');
            return;
        }

        // 检查浏览器是否支持IntersectionObserver
        if (!window.IntersectionObserver) {
            console.warn('浏览器不支持IntersectionObserver，立即加载技能图谱');
            this.loadSkillGraph();
            return;
        }

        // 创建观察器
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadSkillGraph();
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });

        // 观察技能图谱容器
        this.observer.observe(skillContainer);
        this.initialized = true;

        console.log('技能图谱懒加载初始化完成');
    },

    /**
     * 加载技能图谱
     */
    loadSkillGraph() {
        const skillContainer = document.getElementById('skill');
        if (!skillContainer) return;

        // 根据窗口宽度选择合适的图片
        const isMobile = window.innerWidth < 768;
        const imageSrc = isMobile ? this.options.mobileImage : this.options.pcImage;

        // 创建图片元素
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = '技能图谱';
        img.style.opacity = '0';
        img.style.transition = `opacity ${this.options.fadeInDuration}ms ease`;
        
        // 添加加载状态类
        skillContainer.classList.add('loading');

        // 图片加载完成后的处理
        img.onload = () => {
            // 清空容器并添加图片
            skillContainer.innerHTML = '';
            skillContainer.appendChild(img);
            
            // 移除加载状态类
            skillContainer.classList.remove('loading');
            skillContainer.classList.add('loaded');
            
            // 触发重排以确保过渡效果生效
            img.offsetHeight;
            
            // 设置透明度为1以触发淡入
            img.style.opacity = '1';
            
            // 添加点击事件
            img.addEventListener('click', Utils.addRippleEffect);
            
            // 添加悬停效果
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.02)';
                img.style.transition = 'transform 0.3s ease';
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
            
            // 触发自定义事件
            skillContainer.dispatchEvent(new CustomEvent('skillGraphLoaded', { detail: { element: img, isMobile } }));
        };
        
        img.onerror = () => {
            console.error('技能图谱图片加载失败:', imageSrc);
            skillContainer.classList.remove('loading');
            skillContainer.classList.add('error');
            skillContainer.innerHTML = '<div class="error-message">技能图谱加载失败</div>';
            
            // 触发自定义事件
            skillContainer.dispatchEvent(new CustomEvent('skillGraphError', { detail: { src: imageSrc, isMobile } }));
        };
    },

    /**
     * 销毁技能图谱懒加载器
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.initialized = false;
    }
};

// 兼容性函数，保持与原始代码的兼容性
function lazyLoadImages() {
    LazyLoader.update();
}

// 初始化懒加载
document.addEventListener('DOMContentLoaded', function() {
    // 初始化通用懒加载
    LazyLoader.init({
        placeholder: null, // 不使用占位图片，改用CSS动画
        fadeInDuration: 300
    });

    // 初始化技能图谱懒加载
    SkillGraphLazyLoader.init({
        pcImage: './static/img/skillPc.png',
        mobileImage: './static/img/skillWap.png',
        fadeInDuration: 500
    });

    // 监听窗口大小变化，更新技能图谱
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const skillContainer = document.getElementById('skill');
            if (skillContainer && skillContainer.classList.contains('loaded')) {
                const img = skillContainer.querySelector('img');
                if (img) {
                    const isMobile = window.innerWidth < 768;
                    const newSrc = isMobile ? './static/img/skillWap.png' : './static/img/skillPc.png';
                    
                    if (img.src !== newSrc && !img.src.includes(newSrc)) {
                        img.style.opacity = '0';
                        
                        setTimeout(() => {
                            img.src = newSrc;
                            img.onload = () => {
                                img.style.opacity = '1';
                            };
                        }, 200);
                    }
                }
            }
        }, 200);
    });
});

// 导出模块
window.LazyLoader = LazyLoader;
window.SkillGraphLazyLoader = SkillGraphLazyLoader;
window.lazyLoadImages = lazyLoadImages;
/**
 * 数据加载模块
 * 负责从API或本地文件加载项目数据
 */

// 数据加载器
const DataLoader = {
    // 缓存数据
    cache: {
        projects: null,
        categories: null,
        siteInfo: null
    },

    /**
     * 获取API端点URL
     * @param {string} endpoint - API端点名称
     * @returns {string} 完整的API URL
     */
    getApiUrl(endpoint) {
        if (!window.AppConfig.apiBase) return null;
        return `${window.AppConfig.apiBase}?action=${endpoint}`;
    },

    /**
     * 发送API请求
     * @param {string} endpoint - API端点
     * @param {Object} options - 请求选项
     * @returns {Promise} 请求Promise
     */
    async fetchApi(endpoint, options = {}) {
        const url = this.getApiUrl(endpoint);
        if (!url) {
            throw new Error('API不可用');
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },

    /**
     * 加载项目数据
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Array>} 项目数据
     */
    async loadProjects(forceRefresh = false) {
        if (!forceRefresh && this.cache.projects) {
            return this.cache.projects;
        }

        try {
            // 尝试从API加载
            if (window.AppConfig.apiBase) {
                const data = await this.fetchApi('get_projects');
                this.cache.projects = data.projects || [];
                return this.cache.projects;
            } else {
                // 从本地文件加载
                return await this.loadLocalProjects();
            }
        } catch (error) {
            console.error('加载项目数据失败:', error);
            Utils.showNotification('加载项目数据失败', 'error');
            return [];
        }
    },

    /**
     * 加载分类数据
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Array>} 分类数据
     */
    async loadCategories(forceRefresh = false) {
        if (!forceRefresh && this.cache.categories) {
            return this.cache.categories;
        }

        try {
            // 尝试从API加载
            if (window.AppConfig.apiBase) {
                const data = await this.fetchApi('get_categories');
                this.cache.categories = data.categories || [];
                return this.cache.categories;
            } else {
                // 从本地文件加载
                return await this.loadLocalCategories();
            }
        } catch (error) {
            console.error('加载分类数据失败:', error);
            Utils.showNotification('加载分类数据失败', 'error');
            return [];
        }
    },

    /**
     * 加载网站信息
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Object>} 网站信息
     */
    async loadSiteInfo(forceRefresh = false) {
        if (!forceRefresh && this.cache.siteInfo) {
            return this.cache.siteInfo;
        }

        try {
            // 尝试从API加载
            if (window.AppConfig.apiBase) {
                const data = await this.fetchApi('get_site_info');
                this.cache.siteInfo = data.site_info || {};
                return this.cache.siteInfo;
            } else {
                // 返回默认网站信息
                return {
                    title: "周游的个人网站",
                    description: "全栈开发者的个人展示网站",
                    author: "ZhouYou"
                };
            }
        } catch (error) {
            console.error('加载网站信息失败:', error);
            return {
                title: "周游的个人网站",
                description: "全栈开发者的个人展示网站",
                author: "ZhouYou"
            };
        }
    },

    /**
     * 加载项目详情
     * @param {string} projectId - 项目ID
     * @returns {Promise<Object>} 项目详情
     */
    async loadProjectDetails(projectId) {
        try {
            // 尝试从API加载
            if (window.AppConfig.apiBase) {
                const data = await this.fetchApi(`get_project_details&id=${projectId}`);
                return data.project || {};
            } else {
                // 从本地数据中查找
                const projects = await this.loadLocalProjects();
                return projects.find(p => p.id === projectId) || {};
            }
        } catch (error) {
            console.error('加载项目详情失败:', error);
            Utils.showNotification('加载项目详情失败', 'error');
            return {};
        }
    },

    /**
     * 从本地文件加载项目数据
     * @returns {Promise<Array>} 项目数据
     */
    async loadLocalProjects() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', './admin/projects.json', true);
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        DataLoader.cache.projects = data || [];
                        resolve(DataLoader.cache.projects);
                    } catch (error) {
                        console.error('解析项目数据失败:', error);
                        reject(error);
                    }
                } else {
                    reject(new Error(`加载项目数据失败: ${xhr.status}`));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('网络错误'));
            };
            
            xhr.send();
        });
    },

    /**
     * 从本地文件加载分类数据
     * @returns {Promise<Array>} 分类数据
     */
    async loadLocalCategories() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', './admin/categories.json', true);
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        DataLoader.cache.categories = data || [];
                        resolve(DataLoader.cache.categories);
                    } catch (error) {
                        console.error('解析分类数据失败:', error);
                        reject(error);
                    }
                } else {
                    reject(new Error(`加载分类数据失败: ${xhr.status}`));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('网络错误'));
            };
            
            xhr.send();
        });
    },

    /**
     * 加载内嵌数据（用于直接打开HTML文件的情况）
     * @returns {Object} 内嵌数据对象
     */
    loadEmbeddedData() {
        // 内嵌项目数据
        const embeddedProjects = [
            {
                id: 1,
                title: "博客",
                description: "记录美好日常",
                url: "./blog.html",
                image_url: "./static/img/tubiao/i1.png",
                category_id: 1,
                type: "site",
                tech_stack: ["HTML5", "CSS3", "JavaScript", "Node.js", "Express", "MongoDB"],
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            },
            {
                id: 2,
                title: "云盘",
                description: "存储收集文件",
                url: "https://www.123912.com/s/kAoVVv-vDgKH",
                image_url: "./static/img/tubiao/i2.png",
                category_id: 1,
                type: "site",
                tech_stack: ["HTML5", "CSS3", "JavaScript", "Node.js", "Express", "AWS S3", "Multer"],
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            },
            {
                id: 3,
                title: "相册",
                description: "珍藏美好回忆",
                url: "./photo.html",
                image_url: "./static/img/tubiao/i3.png",
                category_id: 1,
                type: "site",
                tech_stack: ["HTML5", "CSS3", "JavaScript", "Tailwind CSS", "Responsive Design"],
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            },
            {
                id: 4,
                title: "留言板",
                description: "记录用户留言",
                url: "./lyb.html",
                image_url: "./static/img/tubiao/i4.png",
                category_id: 1,
                type: "site",
                tech_stack: ["HTML5", "CSS3", "JavaScript", "Tailwind CSS", "Responsive Design"],
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            },
            {
                id: 5,
                title: "个人",
                description: "个人项目",
                url: "https://github.com/zhouyouzhiai/My-project",
                image_url: "./static/img/tubiao/i6.png",
                category_id: 2,
                type: "project",
                tech_stack: ["HTML5", "CSS3", "JavaScript", "Node.js", "JSON", "Responsive Design"],
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            },
            {
                id: 6,
                title: "我的平台",
                description: "基于ECharts的数据可视化平台",
                url: "https://github.com/zyyo/data-visualization",
                image_url: "./static/img/tubiao/i5.png",
                category_id: 2,
                type: "project",
                tech_stack: ["Vue.js", "ECharts", "JavaScript", "HTML5", "CSS3", "Axios", "Element UI"],
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            }
        ];

        // 内嵌分类数据
        const embeddedCategories = [
            {
                id: 1,
                name: "网站",
                description: "个人网站项目",
                sort_order: 1,
                is_enabled: 1,
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            },
            {
                id: 2,
                name: "项目",
                description: "开源项目展示",
                sort_order: 2,
                is_enabled: 1,
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            },
            {
                id: 3,
                name: "工具",
                description: "实用工具集合",
                sort_order: 3,
                is_enabled: 1,
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00"
            }
        ];

        return {
            projects: embeddedProjects,
            categories: embeddedCategories
        };
    },

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache = {
            projects: null,
            categories: null,
            siteInfo: null
        };
    },

    /**
     * 初始化数据加载
     * @returns {Promise<Object>} 加载的数据
     */
    async initialize() {
        try {
            // 尝试从本地JSON文件加载数据
            const [projects, categories] = await Promise.all([
                this.loadLocalProjects(),
                this.loadLocalCategories()
            ]);

            // 如果本地数据加载失败，尝试从API加载
            if (!projects || projects.length === 0) {
                try {
                    const apiProjects = await this.fetchApi('get_projects');
                    this.cache.projects = apiProjects.projects || [];
                } catch (apiError) {
                    console.warn('API加载项目数据失败，使用内嵌数据:', apiError);
                    const embeddedData = this.loadEmbeddedData();
                    this.cache.projects = embeddedData.projects;
                }
            } else {
                this.cache.projects = projects;
            }

            if (!categories || categories.length === 0) {
                try {
                    const apiCategories = await this.fetchApi('get_categories');
                    this.cache.categories = apiCategories.categories || [];
                } catch (apiError) {
                    console.warn('API加载分类数据失败，使用内嵌数据:', apiError);
                    const embeddedData = this.loadEmbeddedData();
                    this.cache.categories = embeddedData.categories;
                }
            } else {
                this.cache.categories = categories;
            }

            return {
                projects: this.cache.projects,
                categories: this.cache.categories
            };
        } catch (error) {
            console.error('初始化数据加载失败:', error);
            
            // 如果所有加载方式都失败，使用内嵌数据
            console.log('使用内嵌数据...');
            const embeddedData = this.loadEmbeddedData();
            this.cache.projects = embeddedData.projects;
            this.cache.categories = embeddedData.categories;
            
            return embeddedData;
        }
    }
};

// 项目渲染器
const ProjectRenderer = {
    /**
     * 渲染项目列表
     * @param {Array} projects - 项目数据
     * @param {string} containerId - 容器元素ID
     * @param {Object} options - 渲染选项
     */
    renderProjects(projects, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`容器元素不存在: ${containerId}`);
            return;
        }

        // 清空容器
        container.innerHTML = '';

        if (!projects || projects.length === 0) {
            container.innerHTML = '<div class="no-data">暂无数据</div>';
            return;
        }

        // 创建项目列表
        const projectList = document.createElement('div');
        projectList.className = 'project-grid';

        // 渲染每个项目
        projects.forEach(project => {
            const projectCard = this.createProjectCard(project, options);
            projectList.appendChild(projectCard);
        });

        container.appendChild(projectList);

        // 触发懒加载
        if (window.LazyLoader && typeof window.LazyLoader.update === 'function') {
            window.LazyLoader.update();
        }
    },

    /**
     * 创建项目卡片
     * @param {Object} project - 项目数据
     * @param {Object} options - 渲染选项
     * @returns {Element} 项目卡片元素
     */
    createProjectCard(project, options = {}) {
        const card = document.createElement('a');
        card.className = `projectItem ${options.itemClass || ''}`;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.href = project.url || '#';
        card.setAttribute('data-project-id', project.id);

        // 格式化图片URL
        let imageUrl = project.image_url || window.AppConfig.defaultImage;
        
        // 如果是相对路径且不以./开头，添加./
        if (imageUrl.startsWith('img/') || imageUrl.startsWith('svg/')) {
            imageUrl = `./static/${imageUrl}`;
        }

        // 创建卡片HTML
        card.innerHTML = `
            <div class="projectItemLeft">
                <h1>${project.title || '暂无标题'}</h1>
                <p>${project.description || '暂无描述'}</p>
            </div>
            <div class="projectItemRight">
                <img data-src="${imageUrl}" alt="${project.title || '项目截图'}" loading="lazy">
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', (e) => {
            // 如果是留言板项目，允许正常跳转
            if (project.title === '留言板') {
                return; // 允许正常跳转
            }
            
            // 其他项目也允许正常跳转
            return;
        });

        // 添加波纹效果
        card.addEventListener('click', Utils.addRippleEffect);

        return card;
    },

    /**
     * 按分类筛选项目
     * @param {Array} projects - 项目数据
     * @param {string} categoryId - 分类ID
     * @returns {Array} 筛选后的项目
     */
    filterProjectsByCategory(projects, categoryId) {
        if (!categoryId) return projects;
        return projects.filter(project => project.category_id == categoryId);
    },

    /**
     * 按类型筛选项目
     * @param {Array} projects - 项目数据
     * @param {string} type - 项目类型
     * @returns {Array} 筛选后的项目
     */
    filterProjectsByType(projects, type) {
        if (!type) return projects;
        return projects.filter(project => project.type === type);
    },

    /**
     * 搜索项目
     * @param {Array} projects - 项目数据
     * @param {string} query - 搜索关键词
     * @returns {Array} 搜索结果
     */
    searchProjects(projects, query) {
        if (!query) return projects;
        
        const lowerQuery = query.toLowerCase();
        return projects.filter(project => {
            return (
                project.title.toLowerCase().includes(lowerQuery) ||
                project.description.toLowerCase().includes(lowerQuery) ||
                (project.tech_stack && project.tech_stack.some(tech => tech.toLowerCase().includes(lowerQuery)))
            );
        });
    }
};

// 初始化数据加载
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('开始加载数据...');
        
        // 初始化数据
        const data = await DataLoader.initialize();
        
        // 为每个项目添加分类名称
        if (data.projects && data.categories) {
            data.projects.forEach(project => {
                project.category_name = '';
                data.categories.forEach(category => {
                    if (category.id == project.category_id) {
                        project.category_name = category.name;
                    }
                });
            });
            
            // 渲染网站项目
            const siteProjects = ProjectRenderer.filterProjectsByType(data.projects, 'site');
            ProjectRenderer.renderProjects(siteProjects, 'siteList', { itemClass: 'a' });
            
            // 渲染其他项目
            const otherProjects = data.projects.filter(project => project.type !== 'site');
            ProjectRenderer.renderProjects(otherProjects, 'projectList', { itemClass: 'b' });
        }
        
        console.log('数据加载完成');
    } catch (error) {
        console.error('数据加载失败:', error);
        
        // 显示错误信息
        const siteList = document.getElementById('siteList');
        const projectList = document.getElementById('projectList');
        
        if (siteList) {
            siteList.innerHTML = `<div class="error">数据加载失败: ${error.message}</div>`;
        }
        
        if (projectList) {
            projectList.innerHTML = `<div class="error">数据加载失败: ${error.message}</div>`;
        }
        
        Utils.showNotification('数据加载失败，请刷新页面重试', 'error');
    }
});

// 兼容性函数，保持与原始代码的兼容性
function loadSiteProjects() {
    DataLoader.loadProjects().then(projects => {
        const siteProjects = ProjectRenderer.filterProjectsByType(projects, 'site');
        ProjectRenderer.renderProjects(siteProjects, 'siteList', { itemClass: 'a' });
    }).catch(error => {
        console.error('加载网站项目失败:', error);
        const siteList = document.getElementById('siteList');
        if (siteList) {
            siteList.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        }
    });
}

function loadProjects() {
    DataLoader.loadProjects().then(projects => {
        const otherProjects = projects.filter(project => project.type !== 'site');
        ProjectRenderer.renderProjects(otherProjects, 'projectList', { itemClass: 'b' });
    }).catch(error => {
        console.error('加载项目失败:', error);
        const projectList = document.getElementById('projectList');
        if (projectList) {
            projectList.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        }
    });
}

// 导出模块和兼容性函数
window.DataLoader = DataLoader;
window.ProjectRenderer = ProjectRenderer;
window.loadSiteProjects = loadSiteProjects;
window.loadProjects = loadProjects;
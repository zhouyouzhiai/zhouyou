// 后台API处理脚本
// 用于读取和写入admin/data/下的JSON文件

class AdminAPI {
    constructor() {
        this.baseUrl = window.location.origin;
        this.dataPath = '/admin/data/';
    }

    // 通用请求方法
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 获取所有文章
    async getArticles() {
        try {
            const response = await fetch(this.dataPath + 'articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 获取单个文章
    async getArticle(id) {
        try {
            const articles = await this.getArticles();
            return articles.find(article => article.id === parseInt(id));
        } catch (error) {
            throw error;
        }
    }

    // 创建文章
    async createArticle(articleData) {
        // 注意：在静态网站中，无法直接写入JSON文件
        // 这里仅作为示例，实际应用中需要后端支持
        return { success: true, message: '文章创建成功（模拟）' };
    }

    // 更新文章
    async updateArticle(id, articleData) {
        // 注意：在静态网站中，无法直接写入JSON文件
        // 这里仅作为示例，实际应用中需要后端支持
        return { success: true, message: '文章更新成功（模拟）' };
    }

    // 删除文章
    async deleteArticle(id) {
        // 注意：在静态网站中，无法直接写入JSON文件
        // 这里仅作为示例，实际应用中需要后端支持
        return { success: true, message: '文章删除成功（模拟）' };
    }

    // 获取所有相册
    async getPhotos() {
        try {
            const response = await fetch(this.dataPath + 'photos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 获取单个相册
    async getPhoto(id) {
        try {
            const photos = await this.getPhotos();
            return photos.find(photo => photo.id === parseInt(id));
        } catch (error) {
            throw error;
        }
    }

    // 创建相册
    async createPhoto(photoData) {
        return { success: true, message: '相册创建成功（模拟）' };
    }

    // 更新相册
    async updatePhoto(id, photoData) {
        return { success: true, message: '相册更新成功（模拟）' };
    }

    // 删除相册
    async deletePhoto(id) {
        return { success: true, message: '相册删除成功（模拟）' };
    }

    // 获取所有留言
    async getMessages() {
        try {
            const response = await fetch(this.dataPath + 'messages.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 获取单个留言
    async getMessage(id) {
        try {
            const messages = await this.getMessages();
            return messages.find(message => message.id === parseInt(id));
        } catch (error) {
            throw error;
        }
    }

    // 批准留言
    async approveMessage(id) {
        return { success: true, message: '留言批准成功（模拟）' };
    }

    // 删除留言
    async deleteMessage(id) {
        return { success: true, message: '留言删除成功（模拟）' };
    }

    // 获取个人信息
    async getProfile() {
        try {
            const response = await fetch(this.dataPath + 'profile.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 更新个人信息
    async updateProfile(profileData) {
        return { success: true, message: '个人信息更新成功（模拟）' };
    }

    // 获取所有分类
    async getCategories() {
        try {
            const response = await fetch(this.dataPath + 'categories.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 获取所有项目
    async getProjects() {
        try {
            const response = await fetch(this.dataPath + 'projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 获取所有图标
    async getIcons() {
        try {
            const response = await fetch(this.dataPath + 'icons.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // 文件上传
    async uploadFile(file, category = 'general') {
        // 注意：在静态网站中，无法直接上传文件
        // 这里仅作为示例，实际应用中需要后端支持
        
        // 模拟上传进度
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '文件上传成功（模拟）',
                    filePath: `/static/uploads/${category}/${file.name}`,
                    fileName: file.name,
                    fileSize: file.size
                });
            }, 1000);
        });
    }
}

// 创建全局API实例
window.adminAPI = new AdminAPI();
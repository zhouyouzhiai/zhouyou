const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 项目根目录，因为api-handler.js现在在static/js目录下，需要向上两级
const PROJECT_ROOT = path.join(__dirname, '..', '..');

// 服务器配置
const PORT = 8000;

// MIME类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf'
};

// 处理静态文件请求
function handleStaticFileRequest(req, res) {
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 添加请求日志
    console.log(`Request: ${req.method} ${pathname}`);
    
    // 处理根路径
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // URL解码以处理中文文件名
    pathname = decodeURIComponent(pathname);
    
    // 构建文件路径
    const filePath = path.join(PROJECT_ROOT, pathname);
    
    // 获取文件扩展名
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件不存在，返回404
            console.error(`File not found: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }
        
        // 读取文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // 读取错误，返回500
                console.error(`Error reading file: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
                return;
            }
            
            // 设置响应头并发送文件内容
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
}

// 处理API请求
function handleApiRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const action = parsedUrl.query.action || '';
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
        let response;
        
        switch (action) {
            case 'get_projects':
                // 读取项目数据
                const projectsData = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), 'utf8');
                const projects = JSON.parse(projectsData);
                
                // 读取分类数据
                const categoriesData = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/categories.json'), 'utf8');
                const categories = JSON.parse(categoriesData);
                
                // 为每个项目添加分类名称
                projects.forEach(project => {
                    project.category_name = '';
                    categories.forEach(category => {
                        if (category.id == project.category_id) {
                            project.category_name = category.name;
                        }
                    });
                });
                
                response = {
                    success: true,
                    data: projects
                };
                break;
                
            case 'get_project_details':
                // 获取特定项目详情
                const projectId = parsedUrl.query.id || '';
                if (!projectId) {
                    response = {
                        success: false,
                        message: '项目ID不能为空'
                    };
                    break;
                }
                
                // 读取项目数据
                const allProjectsData = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), 'utf8');
                const allProjects = JSON.parse(allProjectsData);
                
                // 查找指定ID的项目
                const project = allProjects.find(p => p.id == projectId);
                if (!project) {
                    response = {
                        success: false,
                        message: '未找到指定项目'
                    };
                    break;
                }
                
                // 读取分类数据
                const categoriesData4 = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/categories.json'), 'utf8');
                const categories4 = JSON.parse(categoriesData4);
                
                // 添加分类名称
                project.category_name = '';
                categories4.forEach(category => {
                    if (category.id == project.category_id) {
                        project.category_name = category.name;
                    }
                });
                
                response = {
                    success: true,
                    data: project
                };
                break;
                
            case 'get_categories':
                // 读取分类数据
                const categoriesData2 = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/categories.json'), 'utf8');
                const categories2 = JSON.parse(categoriesData2);
                
                response = {
                    success: true,
                    data: categories2
                };
                break;
                
            case 'get_icons':
                // 读取图标数据
                const iconsData = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/icons.json'), 'utf8');
                const icons = JSON.parse(iconsData);
                
                response = {
                    success: true,
                    data: icons
                };
                break;
                
            case 'get_config':
                // 读取配置数据 - 使用profile.json作为配置数据
                try {
                    const configData = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/profile.json'), 'utf8');
                    const config = JSON.parse(configData);
                    
                    response = {
                        success: true,
                        data: config
                    };
                } catch (error) {
                    response = {
                        success: false,
                        message: '配置文件不存在'
                    };
                }
                break;
                
            case 'update_config':
                // 更新配置数据 - 使用profile.json作为配置数据
                try {
                    const existingConfigData = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/profile.json'), 'utf8');
                    const existingConfig = JSON.parse(existingConfigData);
                    
                    // 合并配置
                    const updatedConfig = { ...existingConfig, ...req.body };
                    
                    // 保存配置
                    fs.writeFileSync(path.join(PROJECT_ROOT, './admin/data/profile.json'), JSON.stringify(updatedConfig, null, 2));
                    
                    response = {
                        success: true,
                        message: '配置更新成功'
                    };
                } catch (error) {
                    response = {
                        success: false,
                        message: '配置文件不存在或更新失败'
                    };
                }
                break;
                
            case 'get_users':
                // 返回默认用户数据
                response = {
                    success: true,
                    data: {
                        users: [
                            {
                                id: "1",
                                username: "admin",
                                email: "admin@example.com",
                                role: "admin",
                                avatar: "",
                                nickname: "管理员",
                                bio: "系统管理员",
                                status: "active",
                                last_login: new Date().toISOString(),
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            }
                        ]
                    }
                };
                break;
                
            case 'get_user':
                // 获取单个用户信息 - 返回默认管理员用户
                const userId = parsedUrl.query.id || '';
                if (!userId) {
                    response = {
                        success: false,
                        message: '用户ID不能为空'
                    };
                    break;
                }
                
                // 返回默认管理员用户
                const user = {
                    id: "1",
                    username: "admin",
                    email: "admin@example.com",
                    role: "admin",
                    avatar: "",
                    nickname: "管理员",
                    bio: "系统管理员",
                    status: "active",
                    last_login: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                response = {
                    success: true,
                    data: user
                };
                break;
                
            case 'update_user':
                // 更新用户信息 - 返回成功但不实际更新
                const updateUserId = parsedUrl.query.id || '';
                if (!updateUserId) {
                    response = {
                        success: false,
                        message: '用户ID不能为空'
                    };
                    break;
                }
                
                response = {
                    success: true,
                    message: '用户信息更新成功'
                };
                break;
                
            case 'add_user':
                // 添加新用户 - 返回成功但不实际添加
                response = {
                    success: true,
                    message: '用户添加成功',
                    data: { id: "2" }
                };
                break;
                
            case 'delete_user':
                // 删除用户 - 返回成功但不实际删除
                const deleteUserId = parsedUrl.query.id || '';
                if (!deleteUserId) {
                    response = {
                        success: false,
                        message: '用户ID不能为空'
                    };
                    break;
                }
                
                response = {
                    success: true,
                    message: '用户删除成功'
                };
                break;
                
            case 'update_project':
                // 更新项目
                const updateProjectId = parsedUrl.query.id || '';
                if (!updateProjectId) {
                    response = {
                        success: false,
                        message: '项目ID不能为空'
                    };
                    break;
                }
                
                // 读取项目数据
                const projectsDataForUpdate = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), 'utf8');
                const projectsForUpdate = JSON.parse(projectsDataForUpdate);
                
                // 查找并更新项目
                const projectIndex = projectsForUpdate.findIndex(p => p.id == updateProjectId);
                if (projectIndex === -1) {
                    response = {
                        success: false,
                        message: '未找到指定项目'
                    };
                    break;
                }
                
                // 更新项目信息 - 使用查询参数而不是req.body
                const updatedProject = { ...projectsForUpdate[projectIndex] };
                
                // 从查询参数中获取更新数据
                Object.keys(parsedUrl.query).forEach(key => {
                    if (key !== 'id' && key !== 'action') {
                        updatedProject[key] = parsedUrl.query[key];
                    }
                });
                
                updatedProject.updated_at = new Date().toISOString();
                projectsForUpdate[projectIndex] = updatedProject;
                
                // 保存更新后的数据
                fs.writeFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), JSON.stringify(projectsForUpdate, null, 2));
                
                response = {
                    success: true,
                    message: '项目更新成功',
                    data: updatedProject
                };
                break;
                
            case 'add_project':
                // 添加新项目
                const projectsDataForAdd = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), 'utf8');
                const projectsForAdd = JSON.parse(projectsDataForAdd);
                
                // 生成新项目ID
                const newProjectId = Math.max(...projectsForAdd.map(p => parseInt(p.id))) + 1;
                
                // 创建新项目 - 使用查询参数而不是req.body
                const newProject = {
                    id: newProjectId.toString(),
                    title: parsedUrl.query.title || '',
                    category_id: parsedUrl.query.category_id || '1',
                    category_name: parsedUrl.query.category_name || '',
                    content: parsedUrl.query.content || '',
                    url: parsedUrl.query.url || '',
                    tags: parsedUrl.query.tags || '',
                    status: parsedUrl.query.status || 'draft',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                // 添加其他查询参数
                Object.keys(parsedUrl.query).forEach(key => {
                    if (key !== 'id' && key !== 'action' && !newProject.hasOwnProperty(key)) {
                        newProject[key] = parsedUrl.query[key];
                    }
                });
                
                projectsForAdd.push(newProject);
                
                // 保存新数据
                fs.writeFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), JSON.stringify(projectsForAdd, null, 2));
                
                response = {
                    success: true,
                    message: '项目添加成功',
                    data: { id: newProjectId }
                };
                break;
                
            case 'delete_project':
                // 删除项目 - 通过GET请求处理
                const deleteProjectId = parsedUrl.query.id || '';
                if (!deleteProjectId) {
                    response = {
                        success: false,
                        message: '项目ID不能为空'
                    };
                    break;
                }
                
                // 读取项目数据
                const projectsDataForDelete = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), 'utf8');
                const projectsForDelete = JSON.parse(projectsDataForDelete);
                
                // 查找并删除项目
                const deleteProjectIndex = projectsForDelete.findIndex(p => p.id == deleteProjectId);
                if (deleteProjectIndex === -1) {
                    response = {
                        success: false,
                        message: '未找到指定项目'
                    };
                    break;
                }
                
                // 删除项目
                projectsForDelete.splice(deleteProjectIndex, 1);
                
                // 保存更新后的数据
                fs.writeFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), JSON.stringify(projectsForDelete, null, 2));
                
                response = {
                    success: true,
                    message: '项目删除成功'
                };
                break;
                
            case 'get_site_info':
                // 获取网站信息
                const siteInfo = {
                    title: 'ZhouYou',
                    description: '个人网站',
                    footer: 'ZhouYou © 2025 | <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">豫ICP备2407930208号-1</a>',
                    contact_info: {
                        email: 'contact@ZhouYou.net',
                        github: 'https://github.com/ZhouYou',
                        weibo: 'https://weibo.com/ZhouYou'
                    }
                };
                
                response = {
                    success: true,
                    data: siteInfo
                };
                break;
                
            default:
                // 默认返回所有数据
                const projectsData3 = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/projects.json'), 'utf8');
                const projects3 = JSON.parse(projectsData3);
                
                const categoriesData5 = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/categories.json'), 'utf8');
                const categories5 = JSON.parse(categoriesData5);
                
                const iconsData3 = fs.readFileSync(path.join(PROJECT_ROOT, './admin/data/icons.json'), 'utf8');
                const icons3 = JSON.parse(iconsData3);
                
                // 为每个项目添加分类名称
                projects3.forEach(project => {
                    project.category_name = '';
                    categories5.forEach(category => {
                        if (category.id == project.category_id) {
                            project.category_name = category.name;
                        }
                    });
                });
                
                response = {
                    success: true,
                    data: {
                        projects: projects3,
                        categories: categories5,
                        icons: icons3
                    }
                };
                break;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
    } catch (error) {
        console.error('API错误:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            message: error.message
        }));
    }
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 添加请求日志
    console.log(`Request: ${req.method} ${pathname}`);
    
    // 处理API请求
    if (pathname === '/api.php' || pathname === '/admin/api.php') {
        handleApiRequest(req, res);
        return;
    }
    
    // 处理Vite开发服务器请求（避免404错误）
    if (pathname === '/@vite/client') {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end('// Vite client stub - not needed in production');
        return;
    }
    
    // 处理静态文件请求
    handleStaticFileRequest(req, res);
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

// 导出处理函数，以便在主服务器中使用
module.exports = { handleApiRequest, handleStaticFileRequest };
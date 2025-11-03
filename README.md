你好，我是周游！欢迎来到我的 GitHub 主页！我是一名前端开发者，专注于应用构建、响应式的 Web。我对前端技术充满热情，同时也对前端开发和服务器管理有一定的了解。我在这里分享我的项目、学习笔记和一些有趣的想法。
这个界面是根据zyyo大佬借鉴他的网站有的灵感。后续还会再更新维护。

🚀 我的技能 技能图标

🌐前端开发：HTML、CSS、JavaScript、Vue 3、Vue Router、Pinia、Element UI
⚙️ 云端开发：Node.js, PHP, SQLite，MySQL, MongoDB
🛠️工具与环境：Git Linux Webpack、Vite、Docker
📊其他技能：Node.js 进行数据抓取、服务器管理等
🌱我正在学习

📚 Vue 3
🔧 Node.js 前工作室
🏗️各种框架等
📝博客与文章我偶尔会写一些技术文章，分享我的学习和经验。你可以访问我的博客或者主页

📬联系方式如果您有任何问题或想与我合作，欢迎通过以下方式联系我：

📧 邮箱：2101438979@qq.com
感谢您花时间访问我的 GitHub 主页！如果您喜欢我的项目或文章，欢迎给我一个 ⭐️ 或者关注我，我会继续分享更多有趣的内容。
个人网站项目


这是一个完整的个人网站项目，包含前台展示网站和后台管理系统。项目采用纯前端技术实现，使用HTML、CSS和JavaScript构建，支持响应式设计和暗色主题切换。

## 项目结构

```
one/                              # 项目根目录
├── README.md                      # 项目说明文档（本文件）
├── admin/                         # 管理后台目录
│   ├── README.md                  # 管理后台说明文档
│   ├── admin.html                 # 管理后台主页面
│   ├── login.html                 # 登录页面
│   ├── css/                       # 后台样式文件目录
│   │   ├── admin-style.css        # 后台样式文件
│   │   ├── login-style.css        # 登录页面样式文件
│   │   └── root.css               # 主题样式文件（包含暗色主题定义）
│   ├── js/                        # 后台JavaScript文件目录
│   │   ├── admin-api.js           # 数据处理API
│   │   ├── admin-common.js        # 通用功能
│   │   ├── login.js               # 登录功能脚本
│   │   └── module/                # 各功能模块脚本目录
│   └── data/                      # 后台数据文件目录
│       ├── articles.json          # 文章数据
│       ├── categories.json        # 分类数据
│       ├── icons.json             # 图标数据
│       ├── messages.json          # 留言数据
│       ├── photos.json            # 照片数据
│       ├── profile.json           # 个人资料数据
│       └── projects.json          # 项目数据
└── wangzhan/                      # 前台网站目录
    ├── README.md                  # 前台网站说明文档
    ├── index.html                 # 网站主页
    ├── blog.html                  # 博客页面
    ├── lyb.html                   # 留言板页面
    ├── photo.html                 # 相册页面
    └── static/                    # 静态资源目录
        ├── css/                   # 样式文件目录
        │   ├── root.css          # 主题样式文件（包含暗色主题定义）
        │   ├── style.css         # 主样式文件（完整样式定义）
        │   └── style.min.css     # 压缩后的样式文件
        ├── fonts/                 # 字体文件目录
        │   ├── Pacifico-Regular.ttf  # Pacifico字体文件（用于标题等装饰性文字）
        │   └── Ubuntu-Regular.ttf    # Ubuntu字体文件（用于正文等常规文字）
        ├── img/                   # 图片资源目录
        │   ├── admin/             # 管理后台相关图片目录（当前为空）
        │   ├── admin-avatar.png.placeholder # 管理员头像占位符文件
        │   ├── background/        # 背景图片目录
        │   ├── photo/             # 相册图片目录
        │   ├── tubiao/            # 图标目录
        │   ├── favicon.ico        # 网站图标
        │   ├── logo.png           # 网站Logo
        │   ├── logokuang.png      # Logo边框
        │   ├── qq.jpg             # QQ二维码
        │   ├── wxskm.jpg          # 微信收款码
        │   ├── wxzsm.jpg          # 微信支付码
        │   └── 个人简历.pdf       # 个人简历PDF文件
        ├── js/                    # JavaScript文件目录
        │   ├── api-handler.js     # API处理和服务器脚本
        │   ├── base.js            # 基础功能脚本
        │   ├── data-loader.js     # 数据加载脚本
        │   ├── image-viewer.js    # 图片查看器脚本
        │   ├── lazy-load.js       # 懒加载脚本
        │   ├── modals.js          # 模态框脚本
        │   ├── project-modal.js   # 项目模态框脚本
        │   ├── script.js          # 主脚本文件
        │   ├── script.min.js      # 压缩后的主脚本文件
        │   ├── skill-graph.js     # 技能图表脚本
        │   ├── sw.js              # Service Worker脚本
        │   ├── ui.js              # UI交互脚本
        │   └── ui-interactions.js # UI交互脚本
        ├── data/                  # 数据文件目录
        │   ├── articles.json      # 文章数据
        │   ├── categories.json    # 分类数据
        │   ├── icons.json         # 图标数据
        │   ├── messages.json      # 留言数据
        │   ├── photos.json        # 照片数据
        │   ├── profile.json       # 个人资料数据
        │   └── projects.json      # 项目数据
        └── svg/                   # SVG图形目录
            ├── skillPc.svg        # PC端技能图表SVG
            ├── skillWap.svg       # 移动端技能图表SVG
            ├── snake-Dark.svg     # 暗色主题贪吃蛇SVG
            └── snake-Light.svg    # 亮色主题贪吃蛇SVG
```

## 功能模块

### 前台网站功能

#### 1. 主页 (index.html)
- 个人简介展示
- 技能展示（使用SVG图表）
- 项目展示
- 社交链接
- 主题切换功能

#### 2. 博客页面 (blog.html)
- 文章列表展示
- 文章分类和标签
- 文章搜索功能
- 响应式布局

#### 3. 相册页面 (photo.html)
- 图片展示网格
- 图片查看器
- 图片上传功能（预留）
- 图片分类和搜索

#### 4. 留言板页面 (lyb.html)
- 留言列表
- 留言提交表单
- 留言回复功能

### 管理后台功能

#### 1. 仪表盘
- 显示网站统计数据（文章数量、相册数量、留言数量、总浏览量）
- 展示最新文章和最新留言
- 提供快速导航到各管理模块

#### 2. 文章管理
- 添加、编辑、删除文章
- 文章分类管理
- 文章状态管理（已发布/草稿）
- 文章搜索和筛选
- 文章浏览量统计

#### 3. 相册管理
- 添加、编辑、删除照片
- 相册分类管理
- 照片搜索和筛选
- 图片预览功能

#### 4. 留言管理
- 查看留言详情
- 标记留言已读/未读
- 删除留言
- 留言搜索和筛选

#### 5. 个人信息管理
- 编辑基本信息（姓名、职位、简介）
- 管理联系方式
- 管理技能列表
- 管理工作经验
- 管理教育背景

#### 6. 系统设置
- 网站基本设置（标题、描述、关键词）
- 主题设置

## 数据管理

### 数据目录合并说明

为了统一数据管理，admin/data目录和wangzhan/static/data目录已经合并。现在所有数据文件同时存在于两个目录中：

- `admin/data/` - 管理后台使用的数据目录
- `wangzhan/static/data/` - 前台网站使用的数据目录

两个目录中的数据文件内容完全相同，管理后台对数据的修改会同步到前台网站，反之亦然。这种设计确保了数据的一致性和完整性。

### 文章数据
- 存储位置：`admin/data/articles.json` 和 `wangzhan/static/data/articles.json`
- 字段说明：
  - `id`: 文章唯一标识
  - `title`: 文章标题
  - `excerpt`: 文章摘要
  - `content`: 文章内容
  - `category_id`: 分类ID（关联categories.json）
  - `author`: 作者
  - `cover_image`: 封面图片URL
  - `tags`: 标签（逗号分隔）
  - `view_count`: 浏览量
  - `is_published`: 是否发布（1: 已发布，0: 草稿）
  - `created_at`: 创建时间
  - `updated_at`: 更新时间

### 相册数据
- 存储位置：`admin/data/photos.json` 和 `wangzhan/static/data/photos.json`
- 字段说明：
  - `id`: 照片唯一标识
  - `title`: 照片标题
  - `description`: 照片描述
  - `image_url`: 图片URL
  - `category_id`: 分类ID（关联categories.json）
  - `created_at`: 创建时间
  - `updated_at`: 更新时间

### 留言数据
- 存储位置：`admin/data/messages.json` 和 `wangzhan/static/data/messages.json`
- 字段说明：
  - `id`: 留言唯一标识
  - `name`: 留言者姓名
  - `email`: 留言者邮箱
  - `content`: 留言内容
  - `ip_address`: IP地址
  - `is_read`: 是否已读（1: 已读，0: 未读）
  - `created_at`: 创建时间

### 个人信息数据
- 存储位置：`admin/data/profile.json` 和 `wangzhan/static/data/profile.json`
- 字段说明：
  - `name`: 姓名
  - `title`: 职位
  - `bio`: 个人简介
  - `avatar`: 头像URL
  - `contact`: 联系方式对象（包含email, phone, address等）
  - `skills`: 技能数组
  - `work_experience`: 工作经验数组
  - `education`: 教育背景数组

### 分类数据
- 存储位置：`admin/data/categories.json` 和 `wangzhan/static/data/categories.json`
- 字段说明：
  - `id`: 分类唯一标识
  - `name`: 分类名称
  - `description`: 分类描述
  - `type`: 分类类型（article: 文章，photo: 相册）

## 技术特点

1. **响应式设计**：适配PC端和移动端设备
2. **暗色主题**：支持亮色/暗色主题切换
3. **模块化代码**：JavaScript代码按功能模块组织
4. **懒加载**：图片和内容懒加载，提高页面加载速度
5. **本地存储**：使用localStorage存储用户偏好设置
6. **Service Worker**：实现离线缓存功能

## 使用说明

### 前台网站使用

1. 直接在浏览器中打开index.html即可访问网站
2. 使用npx http-server可以启动本地服务器进行开发
3. 修改static目录下的资源文件可以自定义网站内容和样式

### 管理后台使用

1. 登录管理后台：
   - 访问 `admin/login.html`
   - 输入用户名和密码（默认用户名：admin，密码：admin）
   - 点击登录按钮

2. 管理内容：
   - 使用左侧导航栏切换不同功能模块
   - 在各模块中进行相应的管理操作
   - 所有操作会实时更新对应的数据文件

3. 数据备份：
   - 定期备份 `admin/data/` 目录下的所有JSON文件
   - 可以使用 `备份项目.bat` 脚本进行备份

## 开发说明

1. **前端技术栈**：
   - HTML5
   - CSS3（使用CSS变量实现主题切换）
   - JavaScript（ES6+）
   - Font Awesome图标库

2. **数据存储**：
   - 使用JSON文件存储数据
   - 通过JavaScript读取和写入JSON文件
   - 数据文件位于 `admin/data/` 和 `wangzhan/static/data/` 目录

3. **开发建议**：
   - CSS文件分为完整版和压缩版，开发时使用完整版，部署时使用压缩版
   - JavaScript文件同样分为完整版和压缩版
   - 图片资源建议使用WebP格式以减小文件大小
   - 字体文件已包含必要的中文字体支持

## 部署说明

1. **本地部署**：
   ```bash
   # 启动前台网站服务器
   npx http-server -p 8000 -a 127.0.0.1 -C admin/login.html
   
   # 启动管理后台服务器
   npx http-server -p 8001 -a 127.0.0.1 -C admin/login.html
   ```

2. **生产环境部署**：
   - 确保服务器支持读写JSON文件
   - 配置适当的文件权限
   - 考虑使用HTTPS提高安全性

## 注意事项

1. 确保服务器支持读写JSON文件
2. 定期备份数据文件，防止数据丢失
3. 修改默认登录密码，提高安全性
4. 上传的图片文件存储在 `static/uploads/` 目录下
5. 修改数据文件后，前台页面会自动更新显示
6. 数据目录已合并：admin/data和wangzhan/static/data目录中的数据文件内容相同，修改任一目录中的文件都会影响网站显示
7. 建议优先通过管理后台进行数据修改，以确保数据的一致性和完整性

## 更新日志

- 2025-01-01: 创建项目基础结构
- 2025-01-02: 完成响应式布局和主题切换功能
- 2025-01-03: 添加博客和相册功能
- 2025-01-04: 完善留言板功能
- 2025-01-05: 优化性能和用户体验
- 2025-01-06: 合并admin/data和wangzhan/static/data目录，统一数据存储
- 2025-01-07: 修复主题切换功能问题，调整按钮位置
- 2025-01-08: 创建项目Git备份，整合说明文档

## 扩展功能

可以根据需要扩展以下功能：
- 用户权限管理
- 操作日志记录
- 数据导入导出
- 图片压缩和裁剪
- SEO优化设置
- 评论管理
- 友情链接管理

## 许可证

本项目采用 MIT 许可证。详情请参阅 LICENSE 文件。

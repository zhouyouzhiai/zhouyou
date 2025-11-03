// 个人信息管理逻辑
// 包含个人信息的编辑功能

class ProfileManage {
    constructor() {
        this.profile = null;
        this.init();
    }

    // 初始化
    async init() {
        await this.loadProfile();
        this.initEvents();
        this.renderProfile();
    }

    // 加载个人信息数据
    async loadProfile() {
        try {
            this.profile = await window.adminAPI.getProfile();
        } catch (error) {
            window.adminCommon.showToast('加载个人信息失败', 'error');
        }
    }

    // 初始化事件
    initEvents() {
        // 编辑按钮
        const editBtn = document.querySelector('#edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showProfileModal());
        }

        // 表单提交
        const form = document.querySelector('#profile-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // 头像上传预览
        const avatarInput = document.querySelector('#profile-avatar');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                this.previewAvatar(e.target.files[0]);
            });
        }

        // 技能标签添加
        const addSkillBtn = document.querySelector('#add-skill-btn');
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => this.addSkillInput());
        }

        // 工作经验添加
        const addWorkBtn = document.querySelector('#add-work-btn');
        if (addWorkBtn) {
            addWorkBtn.addEventListener('click', () => this.addWorkInput());
        }

        // 教育背景添加
        const addEducationBtn = document.querySelector('#add-education-btn');
        if (addEducationBtn) {
            addEducationBtn.addEventListener('click', () => this.addEducationInput());
        }
    }

    // 渲染个人信息
    renderProfile() {
        if (!this.profile) return;

        // 基本信息
        this.renderBasicInfo();
        
        // 技能
        this.renderSkills();
        
        // 工作经验
        this.renderWorkExperience();
        
        // 教育背景
        this.renderEducation();
        
        // 联系方式
        this.renderContactInfo();
    }

    // 渲染基本信息
    renderBasicInfo() {
        const avatar = document.querySelector('#profile-avatar-display');
        if (avatar && this.profile.avatar) {
            avatar.src = this.profile.avatar;
        }

        const name = document.querySelector('#profile-name');
        if (name) name.textContent = this.profile.name || '';

        const title = document.querySelector('#profile-title');
        if (title) title.textContent = this.profile.title || '';

        const bio = document.querySelector('#profile-bio');
        if (bio) bio.textContent = this.profile.bio || '';
    }

    // 渲染技能
    renderSkills() {
        const container = document.querySelector('#profile-skills');
        if (!container || !this.profile.skills) return;

        let html = '<div class="skills-container">';
        
        this.profile.skills.forEach(skill => {
            const level = parseInt(skill.level) || 0;
            html += `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-progress" style="width: ${level}%"></div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // 渲染工作经验
    renderWorkExperience() {
        const container = document.querySelector('#profile-work');
        if (!container || !this.profile.work_experience) return;

        let html = '<div class="timeline">';
        
        this.profile.work_experience.forEach(work => {
            html += `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h4 class="timeline-title">${work.position}</h4>
                        <h5 class="timeline-subtitle">${work.company}</h5>
                        <p class="timeline-date">${work.start_date} - ${work.end_date || '至今'}</p>
                        <p class="timeline-description">${work.description}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // 渲染教育背景
    renderEducation() {
        const container = document.querySelector('#profile-education');
        if (!container || !this.profile.education) return;

        let html = '<div class="timeline">';
        
        this.profile.education.forEach(edu => {
            html += `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h4 class="timeline-title">${edu.degree}</h4>
                        <h5 class="timeline-subtitle">${edu.school}</h5>
                        <p class="timeline-date">${edu.start_date} - ${edu.end_date || '至今'}</p>
                        <p class="timeline-description">${edu.description}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // 渲染联系方式
    renderContactInfo() {
        const container = document.querySelector('#profile-contact');
        if (!container || !this.profile.contact) return;

        let html = '<div class="contact-grid">';
        
        Object.entries(this.profile.contact).forEach(([key, value]) => {
            if (!value) return;
            
            let icon = '';
            let label = '';
            
            switch (key) {
                case 'email':
                    icon = 'fas fa-envelope';
                    label = '邮箱';
                    break;
                case 'phone':
                    icon = 'fas fa-phone';
                    label = '电话';
                    break;
                case 'address':
                    icon = 'fas fa-map-marker-alt';
                    label = '地址';
                    break;
                case 'github':
                    icon = 'fab fa-github';
                    label = 'GitHub';
                    break;
                case 'linkedin':
                    icon = 'fab fa-linkedin';
                    label = 'LinkedIn';
                    break;
                default:
                    icon = 'fas fa-info-circle';
                    label = key;
            }
            
            html += `
                <div class="contact-item">
                    <i class="${icon}"></i>
                    <div>
                        <div class="contact-label">${label}</div>
                        <div class="contact-value">${value}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // 显示个人信息编辑模态框
    showProfileModal() {
        const modal = document.querySelector('#profile-modal');
        if (!modal) return;

        // 重置表单
        const form = document.querySelector('#profile-form');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }

        // 填充表单数据
        this.populateForm();

        // 显示模态框
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 填充表单
    populateForm() {
        if (!this.profile) return;

        const form = document.querySelector('#profile-form');
        if (!form) return;

        // 基本信息
        const nameInput = form.querySelector('#profile-name-input');
        if (nameInput) nameInput.value = this.profile.name || '';

        const titleInput = form.querySelector('#profile-title-input');
        if (titleInput) titleInput.value = this.profile.title || '';

        const bioTextarea = form.querySelector('#profile-bio-input');
        if (bioTextarea) bioTextarea.value = this.profile.bio || '';

        const avatarInput = form.querySelector('#profile-avatar');
        if (avatarInput && this.profile.avatar) {
            // 显示当前头像
            const preview = document.querySelector('#avatar-preview');
            if (preview) {
                preview.src = this.profile.avatar;
                preview.style.display = 'block';
            }
        }

        // 联系方式
        if (this.profile.contact) {
            const emailInput = form.querySelector('#profile-email');
            if (emailInput) emailInput.value = this.profile.contact.email || '';

            const phoneInput = form.querySelector('#profile-phone');
            if (phoneInput) phoneInput.value = this.profile.contact.phone || '';

            const addressInput = form.querySelector('#profile-address');
            if (addressInput) addressInput.value = this.profile.contact.address || '';

            const githubInput = form.querySelector('#profile-github');
            if (githubInput) githubInput.value = this.profile.contact.github || '';

            const linkedinInput = form.querySelector('#profile-linkedin');
            if (linkedinInput) linkedinInput.value = this.profile.contact.linkedin || '';
        }

        // 技能
        if (this.profile.skills && this.profile.skills.length > 0) {
            const skillsContainer = form.querySelector('#skills-container');
            if (skillsContainer) {
                skillsContainer.innerHTML = '';
                
                this.profile.skills.forEach(skill => {
                    this.addSkillInput(skill);
                });
            }
        }

        // 工作经验
        if (this.profile.work_experience && this.profile.work_experience.length > 0) {
            const workContainer = form.querySelector('#work-container');
            if (workContainer) {
                workContainer.innerHTML = '';
                
                this.profile.work_experience.forEach(work => {
                    this.addWorkInput(work);
                });
            }
        }

        // 教育背景
        if (this.profile.education && this.profile.education.length > 0) {
            const educationContainer = form.querySelector('#education-container');
            if (educationContainer) {
                educationContainer.innerHTML = '';
                
                this.profile.education.forEach(edu => {
                    this.addEducationInput(edu);
                });
            }
        }
    }

    // 预览头像
    previewAvatar(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.querySelector('#avatar-preview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    // 添加技能输入
    addSkillInput(skill = null) {
        const container = document.querySelector('#skills-container');
        if (!container) return;

        const skillId = skill ? skill.id : 'skill-' + Date.now();
        const skillName = skill ? skill.name : '';
        const skillLevel = skill ? skill.level : '';

        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill-input-group';
        skillDiv.setAttribute('data-id', skillId);
        
        skillDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="skill-name-${skillId}">技能名称</label>
                    <input type="text" class="form-control" id="skill-name-${skillId}" name="skill-name" value="${skillName}" required>
                </div>
                <div class="form-group col-md-4">
                    <label for="skill-level-${skillId}">熟练度 (%)</label>
                    <input type="number" class="form-control" id="skill-level-${skillId}" name="skill-level" min="0" max="100" value="${skillLevel}" required>
                </div>
                <div class="form-group col-md-2">
                    <label>&nbsp;</label>
                    <button type="button" class="btn btn-danger btn-sm btn-remove-skill">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(skillDiv);

        // 添加删除事件
        const removeBtn = skillDiv.querySelector('.btn-remove-skill');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                skillDiv.remove();
            });
        }
    }

    // 添加工作经验输入
    addWorkInput(work = null) {
        const container = document.querySelector('#work-container');
        if (!container) return;

        const workId = work ? work.id : 'work-' + Date.now();
        const position = work ? work.position : '';
        const company = work ? work.company : '';
        const startDate = work ? work.start_date : '';
        const endDate = work ? work.end_date : '';
        const description = work ? work.description : '';

        const workDiv = document.createElement('div');
        workDiv.className = 'work-input-group';
        workDiv.setAttribute('data-id', workId);
        
        workDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>工作经验</h5>
                    <button type="button" class="btn btn-danger btn-sm btn-remove-work">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="work-position-${workId}">职位</label>
                            <input type="text" class="form-control" id="work-position-${workId}" name="work-position" value="${position}" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="work-company-${workId}">公司</label>
                            <input type="text" class="form-control" id="work-company-${workId}" name="work-company" value="${company}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="work-start-${workId}">开始时间</label>
                            <input type="date" class="form-control" id="work-start-${workId}" name="work-start" value="${startDate}" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="work-end-${workId}">结束时间 (留空表示至今)</label>
                            <input type="date" class="form-control" id="work-end-${workId}" name="work-end" value="${endDate}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="work-desc-${workId}">工作描述</label>
                        <textarea class="form-control" id="work-desc-${workId}" name="work-desc" rows="3">${description}</textarea>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(workDiv);

        // 添加删除事件
        const removeBtn = workDiv.querySelector('.btn-remove-work');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                workDiv.remove();
            });
        }
    }

    // 添加教育背景输入
    addEducationInput(education = null) {
        const container = document.querySelector('#education-container');
        if (!container) return;

        const eduId = education ? education.id : 'edu-' + Date.now();
        const degree = education ? education.degree : '';
        const school = education ? education.school : '';
        const startDate = education ? education.start_date : '';
        const endDate = education ? education.end_date : '';
        const description = education ? education.description : '';

        const eduDiv = document.createElement('div');
        eduDiv.className = 'education-input-group';
        eduDiv.setAttribute('data-id', eduId);
        
        eduDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>教育背景</h5>
                    <button type="button" class="btn btn-danger btn-sm btn-remove-education">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="edu-degree-${eduId}">学位</label>
                            <input type="text" class="form-control" id="edu-degree-${eduId}" name="edu-degree" value="${degree}" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="edu-school-${eduId}">学校</label>
                            <input type="text" class="form-control" id="edu-school-${eduId}" name="edu-school" value="${school}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="edu-start-${eduId}">开始时间</label>
                            <input type="date" class="form-control" id="edu-start-${eduId}" name="edu-start" value="${startDate}" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="edu-end-${eduId}">结束时间 (留空表示至今)</label>
                            <input type="date" class="form-control" id="edu-end-${eduId}" name="edu-end" value="${endDate}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edu-desc-${eduId}">教育描述</label>
                        <textarea class="form-control" id="edu-desc-${eduId}" name="edu-desc" rows="3">${description}</textarea>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(eduDiv);

        // 添加删除事件
        const removeBtn = eduDiv.querySelector('.btn-remove-education');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                eduDiv.remove();
            });
        }
    }

    // 保存个人信息
    async saveProfile() {
        const form = document.querySelector('#profile-form');
        if (!form) return;

        // 表单验证
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // 收集表单数据
        const formData = new FormData(form);
        
        const profileData = {
            name: formData.get('name'),
            title: formData.get('title'),
            bio: formData.get('bio'),
            avatar: formData.get('avatar') || this.profile.avatar,
            contact: {
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                github: formData.get('github'),
                linkedin: formData.get('linkedin')
            },
            skills: this.collectSkills(),
            work_experience: this.collectWorkExperience(),
            education: this.collectEducation(),
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        try {
            const result = await window.adminAPI.updateProfile(profileData);
            
            if (result.success) {
                window.adminCommon.showToast(result.message, 'success');
                this.closeModal();
                await this.loadProfile();
                this.renderProfile();
            } else {
                window.adminCommon.showToast(result.message || '保存失败', 'error');
            }
        } catch (error) {
            window.adminCommon.showToast('保存个人信息失败', 'error');
        }
    }

    // 收集技能数据
    collectSkills() {
        const skills = [];
        const skillGroups = document.querySelectorAll('.skill-input-group');
        
        skillGroups.forEach(group => {
            const nameInput = group.querySelector('input[name="skill-name"]');
            const levelInput = group.querySelector('input[name="skill-level"]');
            
            if (nameInput && levelInput && nameInput.value) {
                skills.push({
                    id: group.getAttribute('data-id'),
                    name: nameInput.value,
                    level: parseInt(levelInput.value) || 0
                });
            }
        });
        
        return skills;
    }

    // 收集工作经验数据
    collectWorkExperience() {
        const experiences = [];
        const workGroups = document.querySelectorAll('.work-input-group');
        
        workGroups.forEach(group => {
            const positionInput = group.querySelector('input[name="work-position"]');
            const companyInput = group.querySelector('input[name="work-company"]');
            const startInput = group.querySelector('input[name="work-start"]');
            const endInput = group.querySelector('input[name="work-end"]');
            const descInput = group.querySelector('textarea[name="work-desc"]');
            
            if (positionInput && companyInput && startInput && positionInput.value) {
                experiences.push({
                    id: group.getAttribute('data-id'),
                    position: positionInput.value,
                    company: companyInput.value,
                    start_date: startInput.value,
                    end_date: endInput.value || null,
                    description: descInput ? descInput.value : ''
                });
            }
        });
        
        return experiences;
    }

    // 收集教育背景数据
    collectEducation() {
        const education = [];
        const eduGroups = document.querySelectorAll('.education-input-group');
        
        eduGroups.forEach(group => {
            const degreeInput = group.querySelector('input[name="edu-degree"]');
            const schoolInput = group.querySelector('input[name="edu-school"]');
            const startInput = group.querySelector('input[name="edu-start"]');
            const endInput = group.querySelector('input[name="edu-end"]');
            const descInput = group.querySelector('textarea[name="edu-desc"]');
            
            if (degreeInput && schoolInput && startInput && degreeInput.value) {
                education.push({
                    id: group.getAttribute('data-id'),
                    degree: degreeInput.value,
                    school: schoolInput.value,
                    start_date: startInput.value,
                    end_date: endInput.value || null,
                    description: descInput ? descInput.value : ''
                });
            }
        });
        
        return education;
    }

    // 关闭模态框
    closeModal() {
        const modal = document.querySelector('#profile-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 只在个人信息管理页面初始化
    if (window.location.pathname.includes('profile') || document.querySelector('#profile-container')) {
        window.profileManage = new ProfileManage();
    }
});
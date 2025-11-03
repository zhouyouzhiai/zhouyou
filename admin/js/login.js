document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已登录
    if (AdminCommon.isLoggedIn()) {
        window.location.href = 'admin.html';
        return;
    }

    // DOM 元素
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const usernameGroup = document.getElementById('username-group');
    const passwordGroup = document.getElementById('password-group');
    const loginBtn = document.getElementById('login-btn');
    const toastContainer = document.getElementById('toast-container');

    // 显示 Toast 提示
    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <div class="toast-message">${message}</div>
        `;
        toastContainer.appendChild(toast);
        
        // 3秒后自动移除
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 密码显示/隐藏切换
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePasswordBtn.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
        togglePasswordBtn.setAttribute('aria-label', type === 'password' ? '显示密码' : '隐藏密码');
    });

    // 表单验证
    function validateForm() {
        let isValid = true;
        
        // 验证用户名
        if (usernameInput.value.trim().length < 3 || usernameInput.value.trim().length > 20) {
            showFieldError(usernameGroup, '请输入3-20个字符的用户名');
            isValid = false;
        } else {
            clearFieldError(usernameGroup);
        }
        
        // 验证密码
        if (passwordInput.value.length < 6 || passwordInput.value.length > 20) {
            showFieldError(passwordGroup, '请输入6-20个字符的密码');
            isValid = false;
        } else {
            clearFieldError(passwordGroup);
        }
        
        return isValid;
    }

    // 显示字段错误
    function showFieldError(fieldGroup, message) {
        fieldGroup.classList.add('error');
        
        // 移除已存在的错误提示
        const existingError = fieldGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // 创建新的错误提示
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        fieldGroup.appendChild(errorElement);
    }

    // 清除字段错误
    function clearFieldError(fieldGroup) {
        fieldGroup.classList.remove('error');
        
        // 移除错误提示
        const errorElement = fieldGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // 输入时验证
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });

    // 登录表单提交
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 表单验证
        if (!validateForm()) {
            showToast('请检查输入的信息是否正确');
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // 显示加载状态
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>登录中...</span>';
        
        try {
            // 使用AdminCommon的静态登录方法
            const loginResult = await AdminCommon.login(username, password);
            
            if (loginResult.success) {
                // 保存登录状态
                AdminCommon.setLoginState(loginResult.user, rememberMe);
                
                // 显示成功提示
                showToast('登录成功，正在跳转...', 'success');
                
                // 跳转到管理后台
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                showToast(loginResult.message || '登录失败');
                // 输入框抖动动画
                [usernameGroup, passwordGroup].forEach(group => {
                    group.classList.add('shake');
                    setTimeout(() => group.classList.remove('shake'), 500);
                });
            }
        } catch (error) {
            console.error('登录失败:', error);
            showToast('登录失败，请重试');
        } finally {
            // 恢复按钮状态
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>登录</span><i class="fas fa-sign-in-alt"></i>';
        }
    });

    // 键盘支持 - Enter键登录
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement.form === loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // 自动聚焦用户名输入框
    setTimeout(() => {
        usernameInput.focus();
    }, 300);
});
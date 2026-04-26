const messageEl = document.getElementById('message');
const adminMessageEl = document.getElementById('admin-message');

const paintMessage = (element, text, isError = false) => {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.style.color = isError ? '#b51f1f' : '#166534';
};

const showMessage = (text, isError = false) => {
  paintMessage(messageEl, text, isError);
};

const showAdminMessage = (text, isError = false) => {
  paintMessage(adminMessageEl, text, isError);
};

const form = document.getElementById('login-form') || document.getElementById('register-form');
const adminForm = document.getElementById('admin-login-form');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      username: String(formData.get('username') || '').trim(),
      password: String(formData.get('password') || '')
    };

    const endpoint = form.id === 'register-form' ? '/api/register' : '/api/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        return showMessage(data.error || 'Erro ao autenticar.', true);
      }

      showMessage(data.message || 'Sucesso. A redirecionar...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 700);
    } catch (error) {
      showMessage('Erro de rede. Tenta novamente.', true);
    }
  });
}

if (adminForm) {
  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(adminForm);
    const payload = {
      username: String(formData.get('username') || '').trim(),
      password: String(formData.get('password') || '')
    };

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        return showAdminMessage(data.error || 'Erro no login de admin.', true);
      }

      showAdminMessage(data.message || 'Sucesso. A redirecionar...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 700);
    } catch (error) {
      showAdminMessage('Erro de rede. Tenta novamente.', true);
    }
  });
}

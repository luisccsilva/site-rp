const messageEl = document.getElementById('message');

const showMessage = (text, isError = false) => {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#b51f1f' : '#166534';
};

const goToDashboard = () => {
  window.location.href = '/dashboard';
};

const form = document.getElementById('login-form') || document.getElementById('register-form');

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
      setTimeout(goToDashboard, 700);
    } catch (error) {
      showMessage('Erro de rede. Tenta novamente.', true);
    }
  });
}

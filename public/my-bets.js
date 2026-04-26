const betsBody = document.getElementById('bets-body');
const messageEl = document.getElementById('message');
const logoutBtn = document.getElementById('logout-btn');

const showMessage = (text, isError = false) => {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#b51f1f' : '#166534';
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    completed: 'Completa',
    cancelled: 'Cancelada'
  };

  return labels[status] || status;
};

const loadBets = async () => {
  const response = await fetch('/api/my-bets');

  if (response.status === 401) {
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  const bets = data.bets || [];

  if (!bets.length) {
    showMessage('Ainda nao tens apostas registadas.');
    return;
  }

  betsBody.innerHTML = '';

  bets.forEach((bet) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${bet.id}</td>
      <td>${bet.game}</td>
      <td>${Number(bet.odd).toFixed(2)}</td>
      <td><span class="status-badge status-${bet.status}">${getStatusLabel(bet.status)}</span></td>
    `;
    betsBody.appendChild(row);
  });
};

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login';
});

loadBets().catch(() => {
  showMessage('Erro ao carregar apostas.', true);
});

const gameForm = document.getElementById('admin-game-form');
const gameMessageEl = document.getElementById('game-message');
const betsMessageEl = document.getElementById('bets-message');
const gamesListEl = document.getElementById('admin-games-list');
const betsBodyEl = document.getElementById('admin-bets-body');
const betsFilterForm = document.getElementById('bets-filter-form');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const logoutBtn = document.getElementById('logout-btn');

const setMessage = (element, text, isError = false) => {
  element.textContent = text;
  element.style.color = isError ? '#b51f1f' : '#166534';
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    completed: 'Completa',
    cancelled: 'Cancelada'
  };

  return labels[status] || status;
};

const ensureAdminSession = async () => {
  const response = await fetch('/admin/session', {
    credentials: 'same-origin'
  });

  if (response.status === 401) {
    window.location.href = '/login';
    return false;
  }

  return true;
};

const loadGames = async () => {
  const response = await fetch('/admin/games', {
    credentials: 'same-origin'
  });

  if (response.status === 401) {
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  const games = data.games || [];
  gamesListEl.innerHTML = '';

  if (!games.length) {
    gamesListEl.innerHTML = '<p class="muted">Ainda nao existem jogos criados.</p>';
    return;
  }

  games.forEach((game) => {
    const item = document.createElement('article');
    item.className = 'game-item game-item-admin';
    item.innerHTML = `
      <div>
        <strong>${game.name}</strong>
        <p>Odd: ${Number(game.odd).toFixed(2)}</p>
      </div>
      <button type="button" data-game-id="${game.id}" class="danger-button">Apagar</button>
    `;
    gamesListEl.appendChild(item);
  });
};

const buildBetsQuery = () => {
  const formData = new FormData(betsFilterForm);
  const params = new URLSearchParams();
  const status = String(formData.get('status') || '').trim();
  const username = String(formData.get('username') || '').trim();

  if (status) {
    params.set('status', status);
  }

  if (username) {
    params.set('username', username);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

const loadBets = async () => {
  const response = await fetch(`/admin/bets${buildBetsQuery()}`, {
    credentials: 'same-origin'
  });

  if (response.status === 401) {
    window.location.href = '/login';
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    return setMessage(betsMessageEl, data.error || 'Nao foi possivel carregar apostas.', true);
  }

  const bets = data.bets || [];
  betsBodyEl.innerHTML = '';

  if (!bets.length) {
    setMessage(betsMessageEl, 'Nenhuma aposta encontrada com os filtros atuais.');
    return;
  }

  setMessage(betsMessageEl, '');

  bets.forEach((bet) => {
    const row = document.createElement('tr');
    const actions =
      bet.status === 'pending'
        ? `
          <button type="button" data-bet-id="${bet.id}" data-status="completed" class="success-button">Completar</button>
          <button type="button" data-bet-id="${bet.id}" data-status="cancelled" class="danger-button">Cancelar</button>
        `
        : '<span class="muted">Sem acoes</span>';

    row.innerHTML = `
      <td>${bet.username}</td>
      <td>${bet.game}</td>
      <td>${Number(bet.odd).toFixed(2)}</td>
      <td><span class="status-badge status-${bet.status}">${getStatusLabel(bet.status)}</span></td>
      <td class="actions-cell">${actions}</td>
    `;
    betsBodyEl.appendChild(row);
  });
};

gameForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(gameForm);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    odd: Number(formData.get('odd'))
  };

  try {
    const response = await fetch('/admin/games', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return setMessage(gameMessageEl, data.error || 'Nao foi possivel criar o jogo.', true);
    }

    setMessage(gameMessageEl, data.message || 'Jogo criado com sucesso.');
    gameForm.reset();
    await loadGames();
  } catch (error) {
    setMessage(gameMessageEl, 'Erro de rede ao criar jogo.', true);
  }
});

gamesListEl.addEventListener('click', async (event) => {
  const trigger = event.target.closest('[data-game-id]');

  if (!trigger) {
    return;
  }

  try {
    const response = await fetch(`/admin/games/delete/${trigger.dataset.gameId}`, {
      method: 'POST',
      credentials: 'same-origin'
    });

    const data = await response.json();

    if (!response.ok) {
      return setMessage(gameMessageEl, data.error || 'Nao foi possivel apagar o jogo.', true);
    }

    setMessage(gameMessageEl, data.message || 'Jogo apagado com sucesso.');
    await loadGames();
  } catch (error) {
    setMessage(gameMessageEl, 'Erro de rede ao apagar jogo.', true);
  }
});

betsFilterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await loadBets();
});

resetFiltersBtn.addEventListener('click', async () => {
  betsFilterForm.reset();
  await loadBets();
});

betsBodyEl.addEventListener('click', async (event) => {
  const actionButton = event.target.closest('[data-bet-id][data-status]');

  if (!actionButton) {
    return;
  }

  const payload = {
    status: actionButton.dataset.status
  };

  try {
    const response = await fetch(`/admin/bets/${actionButton.dataset.betId}/status`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return setMessage(betsMessageEl, data.error || 'Nao foi possivel atualizar a aposta.', true);
    }

    setMessage(betsMessageEl, data.message || 'Estado atualizado com sucesso.');
    await loadBets();
  } catch (error) {
    setMessage(betsMessageEl, 'Erro de rede ao atualizar a aposta.', true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login';
});

const bootstrapAdmin = async () => {
  const hasSession = await ensureAdminSession();

  if (!hasSession) {
    return;
  }

  await Promise.all([loadGames(), loadBets()]);
};

bootstrapAdmin().catch(() => {
  setMessage(gameMessageEl, 'Erro ao iniciar painel de admin.', true);
});

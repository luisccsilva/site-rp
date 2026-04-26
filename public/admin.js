const gameForm = document.getElementById('admin-game-form');
const gameMessageEl = document.getElementById('game-message');
const betsMessageEl = document.getElementById('bets-message');
const gamesListEl = document.getElementById('admin-games-list');
const betsBodyEl = document.getElementById('admin-bets-body');
const logoutBtn = document.getElementById('logout-btn');

const setMessage = (element, text, isError = false) => {
  element.textContent = text;
  element.style.color = isError ? '#b51f1f' : '#166534';
};

const ensureAdminSession = async () => {
  const response = await fetch('/admin/session');

  if (response.status === 401) {
    window.location.href = '/login';
    return false;
  }

  return true;
};

const loadGames = async () => {
  const response = await fetch('/admin/games');

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

const loadBets = async () => {
  const response = await fetch('/admin/bets');

  if (response.status === 401) {
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  const bets = data.bets || [];
  betsBodyEl.innerHTML = '';

  if (!bets.length) {
    setMessage(betsMessageEl, 'Ainda nao existem apostas de utilizadores.');
    return;
  }

  setMessage(betsMessageEl, '');

  bets.forEach((bet) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${bet.username}</td>
      <td>${bet.game}</td>
      <td>${Number(bet.odd).toFixed(2)}</td>
      <td>${Number(bet.amount).toFixed(2)}</td>
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
      method: 'POST'
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

const gamesList = document.getElementById('games-list');
const gameSelect = document.getElementById('game');
const oddInput = document.getElementById('odd');
const betForm = document.getElementById('bet-form');
const messageEl = document.getElementById('message');
const logoutBtn = document.getElementById('logout-btn');

let games = [];

const showMessage = (text, isError = false) => {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#b51f1f' : '#166534';
};

const updateOdd = () => {
  const selected = games.find((game) => game.name === gameSelect.value);
  oddInput.value = selected ? Number(selected.odd).toFixed(2) : '';
};

const loadGames = async () => {
  const response = await fetch('/api/games');

  if (response.status === 401) {
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  games = data.games || [];

  gamesList.innerHTML = '';
  gameSelect.innerHTML = '';

  games.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'game-item';
    card.innerHTML = `<strong>${item.name}</strong><p>Odd: ${Number(item.odd).toFixed(2)}</p>`;
    gamesList.appendChild(card);

    const option = document.createElement('option');
    option.value = item.name;
    option.textContent = `${item.name} (odd ${Number(item.odd).toFixed(2)})`;
    gameSelect.appendChild(option);
  });

  if (!games.length) {
    showMessage('Nao existem jogos disponiveis neste momento.', true);
    oddInput.value = '';
    return;
  }

  updateOdd();
};

betForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    game: gameSelect.value,
    odd: Number(oddInput.value),
    amount: Number(document.getElementById('amount').value)
  };

  try {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return showMessage(data.error || 'Nao foi possivel registar aposta.', true);
    }

    showMessage(data.message || 'Aposta criada.');
    betForm.reset();
    updateOdd();
  } catch (error) {
    showMessage('Erro de rede ao apostar.', true);
  }
});

gameSelect.addEventListener('change', updateOdd);

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login';
});

loadGames().catch(() => {
  showMessage('Falha ao carregar jogos.', true);
});

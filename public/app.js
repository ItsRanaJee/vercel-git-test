const form = document.getElementById('note-form');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const statusBox = document.getElementById('status');
const itemsList = document.getElementById('items-list');

async function setStatus(message, type = 'info') {
  statusBox.textContent = message;
  statusBox.className = 'status';

  if (type === 'success') {
    statusBox.classList.add('success');
  }

  if (type === 'error') {
    statusBox.classList.add('error');
  }
}

async function loadItems() {
  try {
    const response = await fetch('/api/items');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load items');
    }

    if (!data.length) {
      itemsList.innerHTML = '<li class="empty-state">No items saved yet. Add your first note above.</li>';
      return;
    }

    itemsList.innerHTML = data
      .map(
        (item) => `
          <li class="item">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </li>
        `
      )
      .join('');
  } catch (error) {
    itemsList.innerHTML = `<li class="empty-state">${error.message}</li>`;
  }
}

async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const result = await response.json();

    if (response.ok && result.supabaseConfigured) {
      setStatus('Supabase is connected and ready.', 'success');
      await loadItems();
      return;
    }

    setStatus(result.message || 'Supabase is not configured yet.', 'error');
    itemsList.innerHTML = '<li class="empty-state">Add your Supabase credentials to continue.</li>';
  } catch (error) {
    setStatus('The app could not reach the API.', 'error');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title || !description) {
    setStatus('Please enter both a title and a description.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Unable to save item');
    }

    form.reset();
    setStatus('Item saved successfully.', 'success');
    await loadItems();
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

checkHealth();

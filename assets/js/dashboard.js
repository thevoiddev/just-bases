let currentUser = null;
let allOlympiads = [];

const sections = {
  olympiads: document.getElementById('olympiads'),
  registered: document.getElementById('registered'),
  profile: document.getElementById('profile'),
  admin: document.getElementById('admin'),
};

const navItems = document.querySelectorAll('.nav-item');
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnHeader = document.getElementById('logoutBtnHeader');
const olympiadModal = document.getElementById('olympiadModal');
const createOlympiadModal = document.getElementById('createOlympiadModal');
const closeButtons = document.querySelectorAll('.close');

async function initDashboard() {
  try {
    currentUser = await api.getMe();
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('userNameNav').textContent = `${currentUser.firstName} ${currentUser.lastName}`;

    if (currentUser.role === 'admin') {
      document.getElementById('adminLink').style.display = 'flex';
    }

    loadOlympiads();
    loadRegisteredOlympiads();
    loadProfileData();

    if (currentUser.role === 'admin') {
      loadAdminOlympiads();
      loadAdminUsers();
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
    window.location.href = './login.html';
  }
}

async function loadOlympiads() {
  try {
    allOlympiads = await api.getOlympiads();
    const list = document.getElementById('olympiadsList');
    list.innerHTML = '';

    allOlympiads.forEach(olympiad => {
      const card = createOlympiadCard(olympiad, false);
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load olympiads:', error);
  }
}

async function loadRegisteredOlympiads() {
  try {
    const user = await api.getUser(currentUser._id);
    const list = document.getElementById('registeredList');
    list.innerHTML = '';

    if (user.registeredOlympiads && user.registeredOlympiads.length > 0) {
      user.registeredOlympiads.forEach(olympiad => {
        const card = createOlympiadCard(olympiad, true);
        list.appendChild(card);
      });
    } else {
      list.innerHTML = '<p class="empty-message">Вы не зарегистрированы ни на одну олимпиаду</p>';
    }
  } catch (error) {
    console.error('Failed to load registered olympiads:', error);
  }
}

async function loadAdminOlympiads() {
  try {
    const olympiads = await api.getOlympiads();
    const list = document.getElementById('adminOlympiadsList');
    list.innerHTML = '';

    olympiads.forEach(olympiad => {
      const card = createAdminOlympiadCard(olympiad);
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load admin olympiads:', error);
  }
}

async function loadAdminUsers() {
  try {
    const users = await api.getUsers();
    const list = document.getElementById('adminUsersList');
    list.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'users-table-content';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Имя</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>
              <select class="role-select" data-user-id="${user._id}">
                <option value="participant" ${user.role === 'participant' ? 'selected' : ''}>Участник</option>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
              </select>
            </td>
            <td>
              <button class="btn-delete" data-user-id="${user._id}">Удалить</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    list.appendChild(table);

    document.querySelectorAll('.role-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const userId = e.target.dataset.userId;
        const newRole = e.target.value;
        try {
          await api.updateUserRole(userId, newRole);
        } catch (error) {
          console.error('Failed to update user role:', error);
        }
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.dataset.userId;
        if (confirm('Вы уверены?')) {
          try {
            await api.deleteUser(userId);
            loadAdminUsers();
          } catch (error) {
            console.error('Failed to delete user:', error);
          }
        }
      });
    });
  } catch (error) {
    console.error('Failed to load admin users:', error);
  }
}

function createOlympiadCard(olympiad, isRegistered) {
  const card = document.createElement('div');
  card.className = 'olympiad-card';
  
  const dateStart = new Date(olympiad.startDate).toLocaleDateString('ru-RU');
  const dateEnd = new Date(olympiad.endDate).toLocaleDateString('ru-RU');
  
  card.innerHTML = `
    <div class="olympiad-card-image">
      <img src="${olympiad.image || './assets/images/placeholder.webp'}" alt="${olympiad.name}">
    </div>
    <div class="olympiad-card-content">
      <h3>${olympiad.name}</h3>
      <p class="olympiad-date">${dateStart} - ${dateEnd}</p>
      <p class="olympiad-location">📍 ${olympiad.location}</p>
      <p class="olympiad-participants">${olympiad.participants.length}/${olympiad.maxParticipants} участников</p>
      <button class="btn-info" data-olympiad-id="${olympiad._id}">Подробнее</button>
      ${!isRegistered ? `
        <button class="btn-register" data-olympiad-id="${olympiad._id}">Зарегистрироваться</button>
      ` : `
        <button class="btn-unregister" data-olympiad-id="${olympiad._id}">Отписаться</button>
      `}
    </div>
  `;

  card.querySelector('.btn-info').addEventListener('click', () => {
    showOlympiadModal(olympiad);
  });

  if (!isRegistered) {
    card.querySelector('.btn-register').addEventListener('click', async () => {
      try {
        await api.registerForOlympiad(olympiad._id);
        loadOlympiads();
        loadRegisteredOlympiads();
      } catch (error) {
        alert(error.message);
      }
    });
  } else {
    card.querySelector('.btn-unregister').addEventListener('click', async () => {
      try {
        await api.unregisterFromOlympiad(olympiad._id);
        loadOlympiads();
        loadRegisteredOlympiads();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  return card;
}

function createAdminOlympiadCard(olympiad) {
  const card = document.createElement('div');
  card.className = 'olympiad-card admin';
  
  const dateStart = new Date(olympiad.startDate).toLocaleDateString('ru-RU');
  const dateEnd = new Date(olympiad.endDate).toLocaleDateString('ru-RU');
  
  card.innerHTML = `
    <div class="olympiad-card-image">
      <img src="${olympiad.image || './assets/images/placeholder.webp'}" alt="${olympiad.name}">
    </div>
    <div class="olympiad-card-content">
      <h3>${olympiad.name}</h3>
      <p class="olympiad-date">${dateStart} - ${dateEnd}</p>
      <p class="olympiad-location">📍 ${olympiad.location}</p>
      <p class="olympiad-participants">${olympiad.participants.length}/${olympiad.maxParticipants} участников</p>
      <div class="admin-actions">
        <button class="btn-edit" data-olympiad-id="${olympiad._id}">Редактировать</button>
        <button class="btn-delete" data-olympiad-id="${olympiad._id}">Удалить</button>
      </div>
    </div>
  `;

  card.querySelector('.btn-edit').addEventListener('click', () => {
    showEditOlympiadModal(olympiad);
  });

  card.querySelector('.btn-delete').addEventListener('click', async () => {
    if (confirm('Вы уверены?')) {
      try {
        await api.deleteOlympiad(olympiad._id);
        loadAdminOlympiads();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  return card;
}

function showOlympiadModal(olympiad) {
  const modalBody = document.getElementById('modalBody');
  const dateStart = new Date(olympiad.startDate).toLocaleDateString('ru-RU');
  const dateEnd = new Date(olympiad.endDate).toLocaleDateString('ru-RU');
  
  modalBody.innerHTML = `
    <div class="modal-olympiad-info">
      <img src="${olympiad.image || './assets/images/placeholder.webp'}" alt="${olympiad.name}" class="modal-image">
      <p><strong>Описание:</strong> ${olympiad.description}</p>
      <p><strong>Место:</strong> ${olympiad.location}</p>
      <p><strong>Дата:</strong> ${dateStart} - ${dateEnd}</p>
      <p><strong>Участников:</strong> ${olympiad.participants.length}/${olympiad.maxParticipants}</p>
      <p><strong>Статус:</strong> ${olympiad.status}</p>
    </div>
  `;
  
  olympiadModal.style.display = 'block';
}

function showEditOlympiadModal(olympiad) {
  const form = document.getElementById('createOlympiadForm');
  document.getElementById('createOlympiadModal').style.display = 'block';
  
  document.getElementById('olympiadName').value = olympiad.name;
  document.getElementById('olympiadDescription').value = olympiad.description;
  document.getElementById('olympiadLocation').value = olympiad.location;
  document.getElementById('olympiadStartDate').value = new Date(olympiad.startDate).toISOString().slice(0, 16);
  document.getElementById('olympiadEndDate').value = new Date(olympiad.endDate).toISOString().slice(0, 16);
  document.getElementById('olympiadMaxParticipants').value = olympiad.maxParticipants;

  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateOlympiad(olympiad._id, {
        name: document.getElementById('olympiadName').value,
        description: document.getElementById('olympiadDescription').value,
        location: document.getElementById('olympiadLocation').value,
        startDate: document.getElementById('olympiadStartDate').value,
        endDate: document.getElementById('olympiadEndDate').value,
        maxParticipants: document.getElementById('olympiadMaxParticipants').value,
      });
      document.getElementById('createOlympiadModal').style.display = 'none';
      loadAdminOlympiads();
    } catch (error) {
      alert(error.message);
    }
  };
}

function loadProfileData() {
  document.getElementById('profileFirstName').value = currentUser.firstName;
  document.getElementById('profileLastName').value = currentUser.lastName;
  document.getElementById('profileEmail').value = currentUser.email;
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.dataset.section;
    
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[section].classList.add('active');

    document.getElementById('pageTitle').textContent = item.textContent.trim();
  });
});

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = './login.html';
};

logoutBtn.addEventListener('click', handleLogout);
if (logoutBtnHeader) {
  logoutBtnHeader.addEventListener('click', handleLogout);
}

closeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

document.getElementById('updateProfileBtn').addEventListener('click', async () => {
  try {
    await api.updateUser(currentUser._id, {
      firstName: document.getElementById('profileFirstName').value,
      lastName: document.getElementById('profileLastName').value,
    });
    currentUser = await api.getMe();
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    alert('Профиль обновлен');
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('createOlympiadBtn').addEventListener('click', () => {
  document.getElementById('createOlympiadForm').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createOlympiad({
        name: document.getElementById('olympiadName').value,
        description: document.getElementById('olympiadDescription').value,
        location: document.getElementById('olympiadLocation').value,
        startDate: document.getElementById('olympiadStartDate').value,
        endDate: document.getElementById('olympiadEndDate').value,
        maxParticipants: document.getElementById('olympiadMaxParticipants').value,
      });
      document.getElementById('createOlympiadModal').style.display = 'none';
      document.getElementById('createOlympiadForm').reset();
      loadAdminOlympiads();
    } catch (error) {
      alert(error.message);
    }
  };
  document.getElementById('createOlympiadModal').style.display = 'block';
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

initDashboard();

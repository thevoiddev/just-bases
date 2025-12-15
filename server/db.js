const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'data');
const usersFile = path.join(dbDir, 'users.json');
const olympiadsFile = path.join(dbDir, 'olympiads.json');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const initializeFiles = () => {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(olympiadsFile)) {
    fs.writeFileSync(olympiadsFile, JSON.stringify([], null, 2));
  }
};

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const readOlympiads = () => {
  try {
    const data = fs.readFileSync(olympiadsFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeOlympiads = (olympiads) => {
  fs.writeFileSync(olympiadsFile, JSON.stringify(olympiads, null, 2));
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  initializeFiles,
  readUsers,
  writeUsers,
  readOlympiads,
  writeOlympiads,
  generateId,
};

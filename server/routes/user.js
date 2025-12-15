const express = require('express');
const db = require('../db');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

const getOlympiadInfo = (olympiadIds) => {
  const olympiads = db.readOlympiads();
  return olympiadIds.map(id => {
    const olympiad = olympiads.find(o => o.id === id);
    if (!olympiad) return null;
    return {
      id: olympiad.id,
      name: olympiad.name,
      startDate: olympiad.startDate,
      endDate: olympiad.endDate,
      location: olympiad.location,
    };
  }).filter(o => o !== null);
};

router.get('/', adminAuth, (req, res) => {
  try {
    const users = db.readUsers();
    const withoutPasswords = users.map(u => {
      const { password, ...user } = u;
      return user;
    });
    res.json(withoutPasswords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, (req, res) => {
  try {
    const users = db.readUsers();
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    const enriched = {
      ...userWithoutPassword,
      registeredOlympiads: getOlympiadInfo(user.registeredOlympiads),
    };

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { firstName, lastName, email } = req.body;
    const users = db.readUsers();
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    db.writeUsers(users);

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', adminAuth, (req, res) => {
  try {
    const users = db.readUsers();
    const user = users.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filtered = users.filter(u => u.id !== req.params.id);
    db.writeUsers(filtered);

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/role', adminAuth, (req, res) => {
  try {
    const { role } = req.body;

    if (!['participant', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const users = db.readUsers();
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    db.writeUsers(users);

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

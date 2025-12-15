const express = require('express');
const db = require('../db');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

const getCreatorInfo = (createdById) => {
  const users = db.readUsers();
  const creator = users.find(u => u.id === createdById);
  if (!creator) return null;
  return {
    id: creator.id,
    firstName: creator.firstName,
    lastName: creator.lastName,
    email: creator.email,
  };
};

const getParticipantsInfo = (participantIds) => {
  const users = db.readUsers();
  return participantIds.map(id => {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }).filter(p => p !== null);
};

router.get('/', (req, res) => {
  try {
    const olympiads = db.readOlympiads();
    const enriched = olympiads.map(o => ({
      ...o,
      createdBy: getCreatorInfo(o.createdBy),
      participants: getParticipantsInfo(o.participants),
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const olympiads = db.readOlympiads();
    const olympiad = olympiads.find(o => o.id === req.params.id);
    
    if (!olympiad) {
      return res.status(404).json({ message: 'Olympiad not found' });
    }

    const enriched = {
      ...olympiad,
      createdBy: getCreatorInfo(olympiad.createdBy),
      participants: getParticipantsInfo(olympiad.participants),
    };

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', adminAuth, (req, res) => {
  try {
    const { name, description, startDate, endDate, location, maxParticipants, image } = req.body;

    const olympiad = {
      id: db.generateId(),
      name,
      description,
      startDate,
      endDate,
      location,
      maxParticipants,
      image,
      createdBy: req.user.id,
      participants: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    const olympiads = db.readOlympiads();
    olympiads.push(olympiad);
    db.writeOlympiads(olympiads);

    const enriched = {
      ...olympiad,
      createdBy: getCreatorInfo(olympiad.createdBy),
    };

    res.status(201).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', adminAuth, (req, res) => {
  try {
    const { name, description, startDate, endDate, location, maxParticipants, image, status } = req.body;

    const olympiads = db.readOlympiads();
    const olympiad = olympiads.find(o => o.id === req.params.id);
    
    if (!olympiad) {
      return res.status(404).json({ message: 'Olympiad not found' });
    }

    if (olympiad.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    olympiad.name = name || olympiad.name;
    olympiad.description = description || olympiad.description;
    olympiad.startDate = startDate || olympiad.startDate;
    olympiad.endDate = endDate || olympiad.endDate;
    olympiad.location = location || olympiad.location;
    olympiad.maxParticipants = maxParticipants || olympiad.maxParticipants;
    olympiad.image = image || olympiad.image;
    olympiad.status = status || olympiad.status;

    db.writeOlympiads(olympiads);

    const enriched = {
      ...olympiad,
      createdBy: getCreatorInfo(olympiad.createdBy),
      participants: getParticipantsInfo(olympiad.participants),
    };

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', adminAuth, (req, res) => {
  try {
    const olympiads = db.readOlympiads();
    const olympiad = olympiads.find(o => o.id === req.params.id);
    
    if (!olympiad) {
      return res.status(404).json({ message: 'Olympiad not found' });
    }

    if (olympiad.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filtered = olympiads.filter(o => o.id !== req.params.id);
    db.writeOlympiads(filtered);

    res.json({ message: 'Olympiad deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/register', auth, (req, res) => {
  try {
    const olympiads = db.readOlympiads();
    const olympiad = olympiads.find(o => o.id === req.params.id);
    
    if (!olympiad) {
      return res.status(404).json({ message: 'Olympiad not found' });
    }

    if (olympiad.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    if (olympiad.participants.length >= olympiad.maxParticipants) {
      return res.status(400).json({ message: 'Olympiad is full' });
    }

    olympiad.participants.push(req.user.id);
    db.writeOlympiads(olympiads);

    const users = db.readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (user && !user.registeredOlympiads.includes(olympiad.id)) {
      user.registeredOlympiads.push(olympiad.id);
      db.writeUsers(users);
    }

    const enriched = {
      ...olympiad,
      createdBy: getCreatorInfo(olympiad.createdBy),
      participants: getParticipantsInfo(olympiad.participants),
    };

    res.json({ message: 'Registered successfully', olympiad: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/unregister', auth, (req, res) => {
  try {
    const olympiads = db.readOlympiads();
    const olympiad = olympiads.find(o => o.id === req.params.id);
    
    if (!olympiad) {
      return res.status(404).json({ message: 'Olympiad not found' });
    }

    olympiad.participants = olympiad.participants.filter(p => p !== req.user.id);
    db.writeOlympiads(olympiads);

    const users = db.readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.registeredOlympiads = user.registeredOlympiads.filter(o => o !== olympiad.id);
      db.writeUsers(users);
    }

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

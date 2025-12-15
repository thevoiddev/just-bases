const db = require('./db');
const bcryptjs = require('bcryptjs');

function initializeDatabase() {
  try {
    db.initializeFiles();
    console.log('JSON database files initialized');

    const users = db.readUsers();
    const olympiads = db.readOlympiads();

    const adminExists = users.find(u => u.email === 'admin@justbases.com');
    
    if (!adminExists) {
      const hashedPassword = bcryptjs.hashSync('admin123', 10);
      const admin = {
        id: db.generateId(),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@justbases.com',
        password: hashedPassword,
        role: 'admin',
        registeredOlympiads: [],
        createdAt: new Date().toISOString(),
      };

      users.push(admin);
      db.writeUsers(users);
      console.log('✓ Admin user created: admin@justbases.com / admin123');
    } else {
      console.log('✓ Admin user already exists');
    }

    const olympiadExists = olympiads.find(o => o.name === 'TechnoBase');
    
    if (!olympiadExists) {
      const admin = users.find(u => u.email === 'admin@justbases.com');
      const olympiad = {
        id: db.generateId(),
        name: 'TechnoBase',
        description: 'Международная олимпиада по проектированию и разработке баз данных',
        startDate: '2024-02-23T00:00:00.000Z',
        endDate: '2024-02-24T00:00:00.000Z',
        location: 'Онлайн',
        maxParticipants: 100,
        createdBy: admin.id,
        participants: [],
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      };

      olympiads.push(olympiad);
      db.writeOlympiads(olympiads);
      console.log('✓ Sample olympiad created: TechnoBase');
    } else {
      console.log('✓ Sample olympiad already exists');
    }

    console.log('\n✓ Database initialization completed!');
    console.log('\nTest credentials:');
    console.log('  Email: admin@justbases.com');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();

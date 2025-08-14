const knex = require('knex');
const UserKnex = require('./models/UserKnex');
const WatchListKnex = require('./models/WatchListKnex');
const WatchProgressKnex = require('./models/WatchProgressKnex');
const config = require('./knexfile');

// Устанавливаем тестовую среду
process.env.NODE_ENV = 'test';

// Инициализируем модели
const { db } = require('./db/knex');

async function testModels() {
  try {
    console.log('Testing models...');
    
    // Генерируем уникальные данные для теста
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testUsername = `testuser-${timestamp}`;
    
    // Тест UserKnex
    console.log('\n--- Testing UserKnex ---');
    const userData = {
      username: testUsername,
      email: testEmail,
      password_hash: 'hashedpassword',
      is_email_verified: true
    };
    
    const createdUser = await UserKnex.create(userData);
    console.log('User created:', createdUser.id ? '✓' : '✗');
    
    const foundUser = await UserKnex.findById(createdUser.id);
    console.log('User found:', foundUser ? '✓' : '✗');
    
    const userInstance = new UserKnex(foundUser);
    const updatedUser = await userInstance.update({ email: 'updated@example.com' });
    console.log('User updated:', updatedUser.email === 'updated@example.com' ? '✓' : '✗');
    
    // Тест WatchListKnex
    console.log('\n--- Testing WatchListKnex ---');
    const watchListData = {
      user_id: createdUser.id,
      anime_id: 1,
      status: 'watching',
      progress: 5,
      episodes_watched: 3,
      score: 8,
      notes: 'Test notes',
      approved: true
    };
    
    const createdWatchList = await WatchListKnex.create(watchListData);
    console.log('WatchList created:', createdWatchList.id ? '✓' : '✗');
    
    const foundWatchList = await WatchListKnex.findById(createdWatchList.id);
    console.log('WatchList found:', foundWatchList ? '✓' : '✗');
    
    const updatedWatchList = await WatchListKnex.update(createdWatchList.id, { progress: 10 });
    console.log('WatchList updated:', updatedWatchList.progress === 10 ? '✓' : '✗');
    
    // Тест WatchProgressKnex
    console.log('\n--- Testing WatchProgressKnex ---');
    const progressData = {
      user_id: createdUser.id,
      anime_id: 1,
      episode_number: 4,
      is_watched: true,
      watch_time: 1200,
      last_position: 800
    };
    
    const createdProgress = await WatchProgressKnex.create(progressData);
    console.log('WatchProgress created:', createdProgress.id ? '✓' : '✗');
    
    const foundProgress = await WatchProgressKnex.findById(createdProgress.id);
    console.log('WatchProgress found:', foundProgress ? '✓' : '✗');
    
    const markedEpisode = await WatchProgressKnex.markEpisodeWatched(createdUser.id, 1, 5);
    console.log('Episode marked as watched:', markedEpisode ? '✓' : '✗');
    
    // Очистка
    await WatchProgressKnex.delete(createdProgress.id);
    await WatchListKnex.delete(createdWatchList.id);
    await UserKnex.delete(createdUser.id);
    
    console.log('\nAll tests completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error testing models:', error);
    process.exit(1);
  }
}

testModels();
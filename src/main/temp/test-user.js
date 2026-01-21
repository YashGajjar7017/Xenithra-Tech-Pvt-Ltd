const mongoose = require('mongoose')
const UserLogin = require('./Backend/models/UserLogin.models')
require('dotenv').config()

async function checkUsers() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL || 'mongodb+srv://yashacker:Iamyash@reactdb.d04du.mongodb.net',
      {
        dbName: 'ReactDB'
      }
    )

    const users = await UserLogin.find({})
    console.log('Existing users:', users.length)

    if (users.length === 0) {
      // Create a test user
      const testUser = new UserLogin({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        isVerified: true
      })

      await testUser.save()
      console.log('Test user created: testuser / password123')
    } else {
      console.log(
        'Users found:',
        users.map((u) => ({ username: u.username, email: u.email }))
      )
    }

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkUsers()

// MongoDB Initialization Script for Twitter API
// This script runs when MongoDB container starts for the first time

// Switch to Twitter database
db = db.getSiblingDB('Twitter');

// Create Twitter application user
db.createUser({
  user: 'twitter_user',
  pwd: 'twitter_password_secure_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'Twitter'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'Email is required and must be a string'
        },
        password: {
          bsonType: 'string',
          description: 'Password is required and must be a string'
        },
        name: {
          bsonType: 'string',
          description: 'Name is required and must be a string'
        }
      }
    }
  }
});

db.createCollection('tweets');
db.createCollection('hashtags');
db.createCollection('followers');
db.createCollection('likes');
db.createCollection('bookmarks');
db.createCollection('refresh_tokens');
db.createCollection('conversations');
db.createCollection('video_status');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1, password: 1 });

db.refresh_tokens.createIndex({ token: 1 });
db.refresh_tokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });

db.followers.createIndex({ user_id: 1, followed_user_id: 1 });

db.tweets.createIndex({ content: 'text' }, { default_language: 'none' });
db.tweets.createIndex({ user_id: 1 });
db.tweets.createIndex({ parent_id: 1 });

db.hashtags.createIndex({ name: 1 }, { unique: true });

db.likes.createIndex({ user_id: 1, tweet_id: 1 }, { unique: true });

db.bookmarks.createIndex({ user_id: 1, tweet_id: 1 }, { unique: true });

db.video_status.createIndex({ name: 1 });

db.conversations.createIndex({ sender_id: 1, receiver_id: 1 });

print('MongoDB initialization completed for Twitter API');
print('Created database: Twitter');
print('Created user: twitter_user');
print('Created collections with indexes'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createDbConnection } = require('../../lib/db');

exports.handler = async (event) => {
  let connection;

  try {
    // Parse request body
    const { name, email, password } = JSON.parse(event.body);

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Name, email, and password are required' }),
      };
    }

    // Connect to the database
    connection = await createDbConnection();

    // Check if email already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Email already registered' }),
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Registration successful',
        token,
        user: {
          id: result.insertId,
          email,
          name,
        },
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

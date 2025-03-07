const { createDbConnection } = require('../../lib/db');
const { verifyToken } = require('../../lib/auth');
const { v4: uuidv4 } = require('uuid');

// Lambda function to create a new appointment
exports.handler = async (event) => {
  let connection;
  
  try {
    // Verify user token
    const user = verifyToken(event.headers.Authorization);
    
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }
    
    // Parse request body
    const { title, date, time, description } = JSON.parse(event.body);
    
    // Validate inputs
    if (!title || !date || !time) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Title, date, and time are required' }),
      };
    }
    
    // Connect to the database
    connection = await createDbConnection();
    
    // Generate a unique ID for the appointment
    const id = uuidv4();
    
    // Insert appointment into database
    await connection.execute(
      'INSERT INTO appointments (id, user_id, title, date, time, description, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [id, user.userId, title, date, time, description || '']
    );
    
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Appointment created successfully',
        id,
      }),
    };
  } catch (error) {
    console.error('Create appointment error:', error);
    
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
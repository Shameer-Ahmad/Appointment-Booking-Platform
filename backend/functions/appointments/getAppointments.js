const jwt = require('jsonwebtoken');
const { createDbConnection } = require('../../lib/db');
const { verifyToken } = require('../../lib/auth');

// Lambda function to get all appointments for a user
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
    
    // Connect to the database
    connection = await createDbConnection();
    
    // Get all appointments for the user
    const [appointments] = await connection.execute(
      'SELECT * FROM appointments WHERE user_id = ? ORDER BY date ASC, time ASC',
      [user.userId]
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(appointments),
    };
  } catch (error) {
    console.error('Get appointments error:', error);
    
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
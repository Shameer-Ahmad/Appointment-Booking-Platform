const { createDbConnection } = require('../../lib/db');
const { verifyToken } = require('../../lib/auth');

// Lambda function to get a specific appointment
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
    
    // Get appointment ID from path parameters
    const appointmentId = event.pathParameters.id;
    
    // Connect to the database
    connection = await createDbConnection();
    
    // Get the appointment
    const [appointments] = await connection.execute(
      'SELECT * FROM appointments WHERE id = ? AND user_id = ?',
      [appointmentId, user.userId]
    );
    
    if (appointments.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Appointment not found' }),
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(appointments[0]),
    };
  } catch (error) {
    console.error('Get appointment error:', error);
    
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
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class AppointmentBookingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Database credentials secret
    const dbSecret = secretsmanager.Secret.fromSecretNameV2(
      this, 'DBSecret', 'appointment-booking-db-credentials'
    );
    
    // JWT secret
    const jwtSecret = secretsmanager.Secret.fromSecretNameV2(
      this, 'JWTSecret', 'appointment-booking-jwt-secret'
    );

    // Common Lambda environment variables
    const lambdaEnvironment = {
      DB_HOST: dbSecret.secretValueFromJson('host').toString(),
      DB_USER: dbSecret.secretValueFromJson('username').toString(),
      DB_PASSWORD: dbSecret.secretValueFromJson('password').toString(),
      DB_NAME: dbSecret.secretValueFromJson('dbname').toString(),
      JWT_SECRET: jwtSecret.secretValueFromJson('secret').toString(),
    };

    // Auth Lambda functions
    const loginFunction = new lambda.Function(this, 'LoginFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'login.handler',
      code: lambda.Code.fromAsset('functions/auth'),
      environment: lambdaEnvironment,
    });

    const registerFunction = new lambda.Function(this, 'RegisterFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'register.handler',
      code: lambda.Code.fromAsset('functions/auth'),
      environment: lambdaEnvironment,
    });

    // Appointment Lambda functions
    const getAppointmentsFunction = new lambda.Function(this, 'GetAppointmentsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getAppointments.handler',
      code: lambda.Code.fromAsset('functions/appointments'),
      environment: lambdaEnvironment,
    });

    const getAppointmentFunction = new lambda.Function(this, 'GetAppointmentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getAppointment.handler',
      code: lambda.Code.fromAsset('functions/appointments'),
      environment: lambdaEnvironment,
    });

    const createAppointmentFunction = new lambda.Function(this, 'CreateAppointmentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'createAppointment.handler',
      code: lambda.Code.fromAsset('functions/appointments'),
      environment: lambdaEnvironment,
    });

    const deleteAppointmentFunction = new lambda.Function(this, 'DeleteAppointmentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'deleteAppointment.handler',
      code: lambda.Code.fromAsset('functions/appointments'),
      environment: lambdaEnvironment,
    });

    // Grant Lambda functions access to secrets
    dbSecret.grantRead(loginFunction);
    dbSecret.grantRead(registerFunction);
    dbSecret.grantRead(getAppointmentsFunction);
    dbSecret.grantRead(getAppointmentFunction);
    dbSecret.grantRead(createAppointmentFunction);
    dbSecret.grantRead(deleteAppointmentFunction);

    jwtSecret.grantRead(loginFunction);
    jwtSecret.grantRead(registerFunction);
    jwtSecret.grantRead(getAppointmentsFunction);
    jwtSecret.grantRead(getAppointmentFunction);
    jwtSecret.grantRead(createAppointmentFunction);
    jwtSecret.grantRead(deleteAppointmentFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'AppointmentBookingApi', {
      restApiName: 'Appointment Booking API',
      description: 'API for the Appointment Booking application',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Auth routes
    const authResource = api.root.addResource('auth');
    
    const loginResource = authResource.addResource('login');
    loginResource.addMethod('POST', new apigateway.LambdaIntegration(loginFunction));
    
    const registerResource = authResource.addResource('register');
    registerResource.addMethod('POST', new apigateway.LambdaIntegration(registerFunction));

    // Appointments routes
    const appointmentsResource = api.root.addResource('appointments');
    appointmentsResource.addMethod('GET', new apigateway.LambdaIntegration(getAppointmentsFunction));
    appointmentsResource.addMethod('POST', new apigateway.LambdaIntegration(createAppointmentFunction));
    
    const appointmentResource = appointmentsResource.addResource('{id}');
    appointmentResource.addMethod('GET', new apigateway.LambdaIntegration(getAppointmentFunction));
    appointmentResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteAppointmentFunction));

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}
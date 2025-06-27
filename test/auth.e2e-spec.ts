import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from './../src/app.module';
import { Chance } from 'chance'; // For generating random test data

// Define interfaces for GraphQL responses
interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, any>;
}

interface GraphQLResponse<T = any> {
  // Allow T to default to any for flexibility
  data?: T | null;
  errors?: GraphQLError[];
}

// For the register mutation in beforeAll block
interface RegisterInBeforeAllData {
  register: {
    id: string;
    email: string;
    // Note: This specific mutation (in beforeAll) does not return accessToken or a nested user object.
  };
}

// For the login mutation
interface LoginData {
  login: {
    accessToken: string;
    refreshToken: string; // Added refreshToken
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles?: Array<{
        id: string;
        name: string;
        description?: string;
      }>;
      userBranches?: Array<{
        branchId: string;
        roleId: string;
        branch?: {
          id: string;
          name: string;
        };
        role?: {
          id: string;
          name: string;
        };
      }>;
    };
  };
}

// For the logout mutation
interface LogoutData {
  logout: {
    message: string;
  };
}

const chance = new Chance();

describe('AuthResolver (e2e) - /graphql', () => {
  let app: INestApplication;
  let httpServer: Server;

  // Test user credentials
  const testUserPassword = 'Password123!';
  const testUser = {
    email: chance.email() as string,
    password: testUserPassword,
    firstName: chance.first() as string,
    lastName: chance.last() as string,
    phoneNumber: `+${(chance.phone({ formatted: false }) as string).substring(0, 12)}`, // Ensure E.164 like format
  };
  let createdUserId: string;
  // let accessToken: string; // Commented out as it's assigned but not used
  let refreshTokenForLogout: string; // Added to store refresh token for logout tests

  const graphqlEndpoint = '/graphql';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Important for DTO validation
    await app.init();
    httpServer = app.getHttpServer();

    // Register a user for login tests
    const registerMutation = `
      mutation Register($input: SignUpDto!) {
        register(input: $input) {
          id
          email
        }
      }
    `;

    const response = await request(httpServer)
      .post(graphqlEndpoint)
      .send({
        query: registerMutation,
        variables: {
          input: testUser,
        },
      });
    const body = response.body as GraphQLResponse<RegisterInBeforeAllData>;

    expect(response.status).toBe(200);
    expect(body.data?.register.email).toEqual(testUser.email);
    if (body.data?.register.id) {
      createdUserId = body.data.register.id;
    }
    expect(createdUserId).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Register Mutation', () => {
    it('should fail to register with an email that already exists', async () => {
      const registerMutation = `
        mutation Register($input: SignUpDto!) {
          register(input: $input) {
            id
            email
            # Add other fields returned on successful registration if any, e.g., accessToken
          }
        }
      `;

      // Attempt to register again with the same email used in beforeAll
      const duplicateUserData = {
        ...testUser, // Spread the original testUser data
        password: 'AnotherPassword123!', // Different password, but email is the key
      };

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: registerMutation,
          variables: {
            input: duplicateUserData,
          },
        });
      const body = response.body as GraphQLResponse; // Expecting an error

      expect(response.status).toBe(200); // GraphQL typically returns 200 even for app errors
      expect(body.errors).toBeDefined();
      // The exact error message depends on your application's validation and error handling
      // It might be a generic unique constraint error or a custom message.
      // For example: 'User with this email already exists.' or 'Email is already taken.'
      // You might need to inspect the actual error message from your app and adjust this assertion.
      expect(body.errors?.[0].message).toMatch(
        /email already exists|already taken|unique constraint/i,
      );
      expect(body.data).toBeNull(); // Or check if data.register is null
    });

    it('should fail to register with a missing password', async () => {
      const registerMutation = `
        mutation Register($input: SignUpDto!) {
          register(input: $input) {
            id
            email
          }
        }
      `;
      const newUserEmail = chance.email(); // Use a new email to avoid conflict with existing user

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: registerMutation,
          variables: {
            input: {
              email: newUserEmail, // Ensure a unique email for this test
              firstName: testUser.firstName,
              lastName: testUser.lastName,
              phoneNumber: testUser.phoneNumber,
              // password is intentionally omitted
            },
          },
        });
      const body = response.body as GraphQLResponse;

      expect(response.status).toBe(200); // GraphQL validation errors still usually return 200 OK
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].extensions?.code).toBe('BAD_USER_INPUT');
      expect(body.errors?.[0].message).toBeDefined();
      expect(typeof body.errors?.[0].message).toBe('string');
      // Check for a message indicating password is required
      expect(body.errors?.[0].message).toContain(
        'Field "password" of required type "String!" was not provided.',
      );
      expect(body.data?.register).toBeUndefined(); // Or check body.data is null
    });

    it('should fail to register with a missing email', async () => {
      const registerMutation = `
        mutation Register($input: SignUpDto!) {
          register(input: $input) {
            id
            email # This won't be returned on failure but good to have in query
          }
        }
      `;

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: registerMutation,
          variables: {
            input: {
              password: testUser.password,
              firstName: testUser.firstName,
              lastName: testUser.lastName,
              phoneNumber: testUser.phoneNumber,
              // email is intentionally omitted
            },
          },
        });
      const body = response.body as GraphQLResponse;

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].extensions?.code).toBe('BAD_USER_INPUT');
      expect(body.errors?.[0].message).toBeDefined();
      expect(typeof body.errors?.[0].message).toBe('string');
      // Check for a message indicating email is required
      expect(body.errors?.[0].message).toContain(
        'Field "email" of required type "Email!" was not provided.',
      );
      expect(body.data?.register).toBeUndefined();
    });

    it('should fail to register with an invalid email format', async () => {
      const registerMutation = `
        mutation Register($input: SignUpDto!) {
          register(input: $input) {
            id
            email
          }
        }
      `;

      const invalidEmailUserData = {
        ...testUser, // use other valid fields from testUser
        email: 'invalid-email-format',
        password: 'Password123!', // ensure a valid password for this test
      };

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: registerMutation,
          variables: { input: invalidEmailUserData },
        });
      const body = response.body as GraphQLResponse;

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].extensions?.code).toBe('BAD_USER_INPUT');
      expect(body.errors?.[0].message).toBeDefined();
      expect(typeof body.errors?.[0].message).toBe('string');
      expect(body.errors?.[0].message).toContain(
        'Variable "$input" got invalid value "invalid-email-format" at "input.email"; Expected type "Email". Invalid email address format',
      );
      expect(body.data?.register).toBeUndefined();
    });

    // TODO: Add test for registration with weak password (if password policies are in place)
  });

  describe('Login Mutation', () => {
    it('should login successfully with valid credentials', async () => {
      const loginMutation = `
        mutation Login($input: SignInDto!) {
          login(input: $input) {
            accessToken
            refreshToken # Added refreshToken
            user {
              id
              email
              firstName
              lastName
              roles {
                id
                name
                description
              }
              userBranches {
                branchId
                roleId
                branch {
                  id
                  name
                }
                role {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: loginMutation,
          variables: {
            input: {
              email: testUser.email,
              password: testUser.password,
            },
          },
        });
      const body = response.body as GraphQLResponse<LoginData>;

      expect(response.status).toBe(200);
      expect(body.data?.login.accessToken).toBeDefined();
      expect(body.data?.login.refreshToken).toBeDefined(); // Added assertion for refreshToken
      expect(body.data?.login.user.id).toEqual(createdUserId);
      expect(body.data?.login.user.email).toEqual(testUser.email);
      // accessToken = body.data?.login.accessToken; // Save for potential future tests (commented out as unused)
      if (body.data?.login.refreshToken) {
        refreshTokenForLogout = body.data.login.refreshToken; // Store for logout test
      }
    });

    it('should login successfully with a real user from the database', async () => {
      // This test uses a real user from the database with a known password
      const realUserEmail = 'superadmin@churchsystem.org';
      const realUserPassword = 'Password123!';

      const loginMutation = `
        mutation Login($input: SignInDto!) {
          login(input: $input) {
            accessToken
            refreshToken
            user {
              id
              email
              firstName
              lastName
              roles {
                id
                name
                description
              }
              userBranches {
                branchId
                roleId
                branch {
                  id
                  name
                }
                role {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: loginMutation,
          variables: {
            input: {
              email: realUserEmail,
              password: realUserPassword,
            },
          },
        });
      const body = response.body as GraphQLResponse<LoginData>;

      expect(response.status).toBe(200);
      expect(body.data?.login.accessToken).toBeDefined();
      expect(body.data?.login.refreshToken).toBeDefined();
      expect(body.data?.login.user.email).toEqual(realUserEmail);
      expect(body.data?.login.user.firstName).toEqual('Super');
      expect(body.data?.login.user.lastName).toEqual('Admin');

      // Check that roles and userBranches are included in the response
      expect(body.data?.login.user.roles).toBeDefined();
      expect(Array.isArray(body.data?.login.user.roles)).toBe(true);
      expect(body.data?.login.user.userBranches).toBeDefined();
      expect(Array.isArray(body.data?.login.user.userBranches)).toBe(true);
    });

    it('should fail to login with invalid password', async () => {
      const loginMutation = `
        mutation Login($input: SignInDto!) {
          login(input: $input) {
            accessToken
          }
        }
`;

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: loginMutation,
          variables: {
            input: {
              email: testUser.email,
              password: 'WrongPassword123!',
            },
          },
        });
      const body = response.body as GraphQLResponse; // Using generic GraphQLResponse for error case

      expect(response.status).toBe(200); // GraphQL usually returns 200 even for app errors
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toEqual('Invalid credentials.'); // Or whatever your service returns
      expect(body.data).toBeNull(); // Or check specific data structure for errors
    });

    it('should fail to login with non-existent email', async () => {
      const loginMutation = `
        mutation Login($input: SignInDto!) {
          login(input: $input) {
            accessToken
          }
        }
      `;
      const nonExistentEmail = chance.email() as string;

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: loginMutation,
          variables: {
            input: {
              email: nonExistentEmail,
              password: 'anyPassword123',
            },
          },
        });
      const body = response.body as GraphQLResponse; // Using generic GraphQLResponse for error case

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toEqual('Invalid credentials.'); // Or specific error for user not found
      expect(body.data).toBeNull();
    });
  });

  describe('Logout Mutation', () => {
    it('should logout successfully with a valid refresh token', async () => {
      if (!refreshTokenForLogout) {
        throw new Error(
          'Refresh token not available for logout test. Ensure login test runs and captures it.',
        );
      }

      const logoutMutation = `
        mutation Logout($input: RefreshTokenInput!) {
          logout(input: $input) {
            message
          }
        }
      `;

      const response = await request(httpServer)
        .post(graphqlEndpoint)
        .send({
          query: logoutMutation,
          variables: {
            input: {
              refreshToken: refreshTokenForLogout,
            },
          },
        });
      const body = response.body as GraphQLResponse<LogoutData>;

      expect(response.status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.logout.message).toEqual('Successfully logged out.');
    });

    // TODO: Add test for attempting to logout with an invalid/revoked token
    // TODO: Add test for attempting to use a refresh token (e.g., for refreshToken mutation) after it has been used for logout
  });
});

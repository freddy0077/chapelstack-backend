# Authentication & User Management Module (`authentication.md`)

## 1. Overview

The Authentication and User Management module is responsible for verifying user identities, managing user accounts, and controlling access to system resources based on roles and permissions. It is a critical component for ensuring the security and integrity of the Church Management System.

This module interacts closely with the Branch Management module to enforce branch-specific access controls.

## 2. Core Responsibilities

-   **User Registration**: Handling new user sign-ups, including email verification and initial role assignment.
-   **User Authentication**: Verifying user credentials (e.g., email/password, social logins) and issuing access tokens (typically JWTs).
-   **Session Management**: Managing user sessions, including token refresh and logout mechanisms.
-   **Password Management**: Securely storing passwords (hashed and salted), handling password resets, and enforcing password policies.
-   **User Profile Management**: Allowing users to manage their own profile information (e.g., name, contact details, password changes).
-   **Role Management**: Defining and managing user roles (e.g., Super Admin, Branch Admin, Pastor, Staff, Member, Guest).
-   **Permission Management**: Defining granular permissions and associating them with roles.
-   **Access Control**: Enforcing authorization checks based on user roles and permissions for accessing different parts of the system and performing actions.
-   **Multi-Factor Authentication (MFA)**: Providing an extra layer of security for user logins.
-   **Audit Logging**: Logging important authentication and user management events (e.g., logins, failed login attempts, role changes).

## 3. Key Entities & Data Models

*(This section should detail the Prisma/TypeORM entities or database schema. Example below)*

### `User` Entity

```typescript
// Example Prisma Schema
model User {
  id             String        @id @default(cuid())
  email          String        @unique
  passwordHash   String
  firstName      String?
  lastName       String?
  phoneNumber    String?
  isActive       Boolean       @default(true)
  isEmailVerified Boolean       @default(false)
  lastLoginAt    DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relations
  userBranches   UserBranch[]  // Branch(es) the user belongs to and their role in each
  roles          Role[]        // System-wide roles (less common in pure multi-tenant)
  mfaSecrets     MfaSecret[]
  // ... other relations like audit logs, password reset tokens
}
```

### `Role` Entity

```typescript
// Example Prisma Schema
model Role {
  id          String       @id @default(cuid())
  name        String       @unique // e.g., SUPER_ADMIN, BRANCH_ADMIN, MEMBER
  description String?
  permissions Permission[] // Permissions associated with this role
  users       User[]       // Users with this system-wide role
  userBranches UserBranch[] // Users with this role within a specific branch
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

### `Permission` Entity

```typescript
// Example Prisma Schema
model Permission {
  id          String   @id @default(cuid())
  action      String   // e.g., "create", "read", "update", "delete"
  subject     String   // e.g., "Member", "Event", "FinancialRecord"
  description String?
  roles       Role[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([action, subject])
}
```

### `UserBranch` Entity (Junction Table for User-Branch-Role)

```typescript
// Example Prisma Schema
model UserBranch {
  userId    String
  branchId  String
  roleId    String // Role of the user within this specific branch

  user      User   @relation(fields: [userId], references: [id])
  branch    Branch @relation(fields: [branchId], references: [id])
  role      Role   @relation(fields: [roleId], references: [id]) // Role specific to this branch context

  assignedAt DateTime @default(now())
  assignedBy String?  // ID of user who assigned this role

  @@id([userId, branchId, roleId])
}
```

## 4. Core Functionalities & Use Cases

-   **User registers for an account**.
-   **User logs in with email and password**.
-   **User logs in using Google/Facebook/Apple (Social Login)**.
-   **User requests a password reset**.
-   **User enables Multi-Factor Authentication**.
-   **Admin assigns a `BRANCH_ADMIN` role to a user for a specific branch**.
-   **System checks if a user has permission to `create` an `Event` within their active branch**.
-   **User logs out, invalidating their session/token**.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints. Examples below)*

### GraphQL

**Queries:**

```graphql
# Get current authenticated user's profile
me: User

# Get a specific user by ID (admin only)
user(id: ID!): User

# List users (admin only, with pagination and filtering)
users(filter: UserFilterInput, pagination: PaginationInput): PaginatedUsers

# List available roles
roles: [Role!]

# List available permissions
permissions: [Permission!]
```

**Mutations:**

```graphql
# User registration
register(input: RegisterInput!): AuthPayload # Returns user and token

# User login
login(input: LoginInput!): AuthPayload

# Social login
socialLogin(provider: SocialProvider!, token: String!): AuthPayload

# Refresh access token
refreshToken(refreshToken: String!): TokenPayload

# Request password reset
requestPasswordReset(email: String!): Boolean

# Confirm password reset
confirmPasswordReset(token: String!, newPassword: String!): Boolean

# Change current user's password
changePassword(oldPassword: String!, newPassword: String!): Boolean

# Update current user's profile
updateMe(input: UpdateUserInput!): User

# Admin: Create a new user
adminCreateUser(input: CreateUserInput!): User

# Admin: Update a user
adminUpdateUser(id: ID!, input: UpdateUserInput!): User

# Admin: Assign a role to a user for a specific branch
adminAssignBranchRole(userId: ID!, branchId: ID!, roleId: ID!): UserBranch

# Admin: Revoke a role from a user for a specific branch
adminRevokeBranchRole(userId: ID!, branchId: ID!, roleId: ID!): Boolean

# Enable MFA
enableMfa: MfaSetupPayload # Returns QR code URI and secret

# Verify MFA code
verifyMfa(token: String!): AuthPayload

# Disable MFA
disableMfa(token: String!): Boolean
```

### REST API (if applicable)

-   `POST /auth/register`
-   `POST /auth/login`
-   `POST /auth/login/social`
-   `POST /auth/refresh-token`
-   `POST /auth/request-password-reset`
-   `POST /auth/confirm-password-reset`
-   `PUT /users/me/password`
-   `GET /users/me`
-   `PUT /users/me`
-   `GET /admin/users`
-   `POST /admin/users`

## 6. Session Management In-Depth

This section expands on the session management strategies, particularly focusing on token refresh and logout mechanisms.

### 6.1. Token Strategy

The system employs a two-token strategy for robust and secure session management:

-   **Access Tokens (JWT)**:
    -   **Purpose**: Used to authenticate API requests (GraphQL mutations/queries).
    -   **Lifespan**: Short-lived (e.g., 15 minutes to 1 hour) to minimize the impact if compromised.
    -   **Transmission**: Sent in the `Authorization: Bearer <token>` HTTP header.
    -   **Content**: Contains essential claims like `userId`, `email`, and potentially roles or a session identifier.
    -   **Security**: Stateless; verified by the server using a secure secret key.

-   **Refresh Tokens (JWT or Opaque String)**:
    -   **Purpose**: Used to obtain new access tokens without requiring the user to re-enter credentials.
    -   **Lifespan**: Longer-lived (e.g., 7 days to 30 days, configurable).
    -   **Storage & Transmission**:
        -   **Web Applications (Recommended)**: Stored in an HTTPOnly, Secure, `SameSite=Strict` (or `Lax`) cookie. This cookie is automatically handled by the browser and sent only to the token refresh endpoint, mitigating XSS and CSRF risks.
        -   **Mobile/Non-Browser Clients**: Stored in secure native device storage. The token is explicitly sent in the body of the refresh request.
    -   **Server-side Handling (Recommended for Enhanced Security)**:
        -   Refresh tokens (or their cryptographically secure hashes) should be stored in a dedicated database table (e.g., `UserRefreshTokens`) linked to the `User`.
        -   This table would include fields like `id`, `userId`, `tokenHash`, `expiresAt`, `createdAt`, `lastUsedAt`, `ipAddress` (of issuance), `userAgent` (of issuance).
        -   **Benefits**:
            -   **Revocation**: Allows specific refresh tokens to be invalidated (e.g., on logout from a device, or if a compromise is suspected).
            -   **Rotation Detection**: Helps detect if an old, supposedly invalidated token is reused after a new one has been issued as part of a rotation scheme.
            -   **"Logout from all devices"**: Achieved by invalidating all stored refresh tokens for a specific user.

### 6.2. Token Refresh Process

The process for refreshing an access token is as follows:

1.  The client's current access token expires.
2.  The client application detects the expiry (e.g., via a 401 error on an API call or by pre-emptively checking the token's `exp` claim).
3.  The client makes a request to the `refreshToken` GraphQL mutation:
    -   **Web**: The refresh token is automatically sent via the HTTPOnly cookie.
    -   **Mobile/Other**: The refresh token is included in the mutation's arguments.
4.  **Server-Side Logic (within the `refreshToken` resolver)**:
    a.  Extracts the refresh token (from the cookie or argument).
    b.  Validates the refresh token:
        i.  Is it structurally valid (e.g., a well-formed JWT)?
        ii. Is it within its own expiry window?
        iii. **If storing server-side**: Does a corresponding (hashed) token exist in the `UserRefreshTokens` table? Is it marked as active/valid? Does it belong to the user implied by the token (if self-contained) or a user context?
    c.  If the refresh token is valid:
        i.  Generate a new, short-lived access token.
        ii. **Refresh Token Rotation (Highly Recommended)**:
            -   Generate a new, long-lived refresh token.
            -   Invalidate the *old* refresh token in the database (e.g., mark as used, delete it, or replace its hash with the new one).
            -   Send the new access token and the new refresh token back to the client. For web clients, the new refresh token is set in a new HTTPOnly cookie. For other clients, it's part of the GraphQL response.
        iii. If not implementing full rotation, at least update the `lastUsedAt` timestamp for the existing refresh token.
    d.  If the refresh token is invalid (expired, revoked, not found), return an authentication error. The user must log in again.
5.  The client securely stores the new access token (and new refresh token if applicable) and retries the original failed request or continues operation.

### 6.3. Logout Process

-   **`logout` Mutation (Current Session/Device)**:
    1.  The client initiates a logout by calling the `logout` GraphQL mutation.
    2.  **Server-Side Logic**:
        a.  Identifies the refresh token associated with the current session. This is typically done via the HTTPOnly cookie for web clients. For mobile clients, they might need to send their current refresh token if server-side invalidation is desired for that specific token.
        b.  **If storing refresh tokens server-side**: The identified refresh token is invalidated (e.g., deleted from `UserRefreshTokens` or marked as revoked).
        c.  The server instructs the client to clear its tokens:
            -   **Web**: Sends a `Set-Cookie` header that clears the refresh token cookie (e.g., by setting its value to empty and its expiry date to the past).
            -   The client application should also discard the access token from its memory/local storage.
    3.  The mutation returns a success status.

-   **`logoutAll` Mutation (All Devices - Optional but Recommended)**:
    1.  The user (already authenticated) triggers this action, e.g., from a "security settings" page.
    2.  The client calls the `logoutAll` GraphQL mutation.
    3.  **Server-Side Logic**:
        a.  Identifies the currently authenticated user (e.g., from the `accessToken`).
        b.  **If storing refresh tokens server-side**: All active refresh tokens associated with this `userId` in the `UserRefreshTokens` table are invalidated.
        c.  The refresh token cookie for the *current session* is also cleared via a `Set-Cookie` header.
    4.  The mutation returns a success status. The user will be logged out from other devices/sessions when their respective access tokens expire and subsequent refresh attempts fail.

### 6.4. GraphQL Schema Considerations for Session Management

The existing `AuthPayload` (returned by `login`) and `TokenPayload` (returned by `refreshToken`) typically include the `accessToken` and `user` object.

-   **For Refresh Tokens Handled via HTTPOnly Cookies (Web)**:
    -   The `login` and `refreshToken` mutations will set the refresh token cookie using HTTP response headers (`Set-Cookie`). The GraphQL payload itself *does not* and *should not* include the refresh token string.
    -   The `logout` mutation will clear this cookie also via `Set-Cookie` headers.
    -   The `refreshToken` mutation does not need to accept `refreshToken` as an argument if it's reliably sent via cookie. However, for flexibility with non-browser clients, itcan be an optional argument, with cookie presence taking precedence or being the sole method for web.

-   **For Refresh Tokens Handled Explicitly in Payload (Mobile/Non-Browser Clients)**:
    -   `AuthPayload` and `TokenPayload` might need to include `refreshToken`:
        ```graphql
        type AuthPayload {
          accessToken: String!
          refreshToken: String # Sent if not using cookies
          user: User!
        }

        type TokenPayload {
          accessToken: String!
          refreshToken: String # Sent if rotating and not using cookies
        }
        ```
    -   The `refreshToken(refreshToken: String!)` mutation (already defined) would take the current refresh token as an argument.
    -   The `logout` mutation might need to accept the `refreshToken` as an argument if server-side invalidation of that specific token is required and it's not available via other means (like a session context derived from the access token).

The current schema (`refreshToken(refreshToken: String!): TokenPayload`) suggests an explicit refresh token argument. This is fine for non-browser clients or if you choose this over cookies for web (though less common for security reasons). If supporting both, the resolver logic needs to handle cookie presence vs. argument.

### 6.5. Key Security Considerations for Session Management

-   **Refresh Token Protection**:
    -   **HTTPOnly Cookies**: Essential for web to prevent JavaScript access (XSS).
    -   **Secure Flag**: Ensure cookies are only sent over HTTPS.
    -   **SameSite Attribute**: Use `Strict` or `Lax` to mitigate CSRF. `Strict` is more secure but can affect UX in some cross-site navigation scenarios.
    -   **Secure Storage**: For mobile/non-browser clients, use platform-provided secure storage mechanisms (e.g., Keychain on iOS, Keystore on Android).
    -   **Rotation**: Regularly rotate refresh tokens to limit the lifespan of any single token.
    -   **One-Time Use (Strict Rotation)**: If a refresh token is used, it's immediately invalidated, and a new one is issued. If an attempt is made to reuse an already used (and supposedly invalidated) refresh token, it could indicate a theft attempt, and all sessions for that user should be invalidated.
-   **Access Token Lifespan**: Keep it short.
-   **CSRF Protection**: While `SameSite` cookies help, for broader protection, consider standard CSRF tokens if not solely relying on `SameSite=Strict` and bearer token authentication for all state-changing actions.
-   **HTTPS**: Enforce HTTPS for all communication.
-   **Rate Limiting**: Apply to `login`, `refreshToken`, and `logout` endpoints.
-   **Audit Logging**: Log events like token issuance, refresh, and revocation.

-   `GET /admin/users/{id}`
-   `PUT /admin/users/{id}`
-   `POST /admin/users/{userId}/branches/{branchId}/roles`
-   `DELETE /admin/users/{userId}/branches/{branchId}/roles/{roleId}`

## 6. Security Considerations

-   **Password Hashing**: Use strong, adaptive hashing algorithms (e.g., Argon2, bcrypt) with unique salts per user.
-   **Token Security**: Use JWTs with appropriate algorithms (e.g., RS256), short expiry times for access tokens, and secure handling of refresh tokens.
-   **Input Validation**: Rigorously validate all inputs to prevent injection attacks and other vulnerabilities.
-   **Rate Limiting**: Implement rate limiting on authentication endpoints to prevent brute-force attacks.
-   **HTTPS**: Ensure all communication is over HTTPS.
-   **MFA**: Encourage or enforce MFA for sensitive roles.
-   **Principle of Least Privilege**: Users should only be granted the permissions necessary to perform their duties.
-   **Secure Storage of Secrets**: API keys, MFA secrets, etc., must be stored securely.

## 7. Integration with Other Modules

-   **Branch Management**: Crucial for scoping user roles and access to specific branches.
-   **All Modules**: Provides the `AuthGuard` (or equivalent) to protect endpoints and provides user context (e.g., `userId`, `branchId`, roles) to services.

## 8. Future Considerations

-   Single Sign-On (SSO) integration with external identity providers (e.g., SAML, OAuth 2.0).
-   Advanced anomaly detection for login attempts.
-   User impersonation features for support staff (with strict controls and auditing).

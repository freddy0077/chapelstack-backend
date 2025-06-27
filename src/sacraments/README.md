# Sacraments Module Implementation

## Overview

The Sacraments module provides a complete system for managing sacramental records within the church management system. It handles the creation, retrieval, updating, and deletion of sacramental records, as well as certificate uploads and management.

## Features

- **Complete CRUD Operations**: Create, read, update, and delete sacramental records
- **Member-Specific Records**: Retrieve all sacramental records for a specific member
- **Certificate Upload**: Upload and store certificate files for sacramental records
- **Type-Safe Implementation**: Strong typing with Prisma and GraphQL
- **Filtering Capabilities**: Search and filter sacramental records

## Technical Implementation

### Data Model

The module uses the Prisma ORM with the following models:

- `SacramentalRecord`: Stores information about sacraments administered to members
- `SacramentType` (enum): Defines the different types of sacraments (BAPTISM, CONFIRMATION, etc.)

### Architecture

The module follows NestJS best practices with a layered architecture:

1. **GraphQL Resolver Layer**: Handles API requests and responses
2. **Service Layer**: Contains business logic and data access
3. **Entity Layer**: Defines GraphQL types and DTOs
4. **Prisma Layer**: Handles database operations

### Type Safety

Special attention has been given to type safety:

- Explicit type assertions for Prisma client operations
- Type guards to ensure runtime type safety
- Mapping functions to convert between Prisma models and GraphQL entities

### File Upload

Certificate uploads are handled using:

- `graphql-upload` package for GraphQL file uploads
- File system operations for storing certificates
- URL generation for accessing certificates

## API Endpoints

### GraphQL Queries

- `sacramentalRecord(id: ID!)`: Get a specific sacramental record by ID
- `sacramentalRecords(filter: SacramentalRecordFilterInput)`: Get all sacramental records with optional filtering
- `sacramentsByMember(memberId: ID!)`: Get all sacramental records for a specific member

### GraphQL Mutations

- `createSacramentalRecord(input: CreateSacramentalRecordInput!)`: Create a new sacramental record
- `updateSacramentalRecord(input: UpdateSacramentalRecordInput!)`: Update an existing sacramental record
- `deleteSacramentalRecord(id: ID!)`: Delete a sacramental record
- `uploadSacramentalCertificate(recordId: ID!, file: Upload!)`: Upload a certificate for a sacramental record

## Usage Examples

### Creating a Sacramental Record

```graphql
mutation {
  createSacramentalRecord(input: {
    memberId: "member-uuid",
    sacramentType: BAPTISM,
    dateOfSacrament: "2025-01-15T10:00:00Z",
    locationOfSacrament: "St. Mary's Cathedral",
    officiantName: "Fr. John Smith",
    godparent1Name: "Jane Doe",
    godparent2Name: "John Doe",
    branchId: "branch-uuid"
  }) {
    id
    sacramentType
    dateOfSacrament
  }
}
```

### Uploading a Certificate

```graphql
mutation {
  uploadSacramentalCertificate(
    recordId: "record-uuid",
    file: Upload!
  ) {
    id
    certificateUrl
  }
}
```

### Retrieving Records for a Member

```graphql
query {
  sacramentsByMember(memberId: "member-uuid") {
    id
    sacramentType
    dateOfSacrament
    certificateUrl
  }
}
```

## Error Handling

The module implements comprehensive error handling:

- Not found errors when records don't exist
- Validation errors for invalid input
- File type validation for certificate uploads
- Proper error propagation to the GraphQL layer

## Security Considerations

- Access control is implemented at the resolver level
- File uploads are validated for type and size
- Certificate URLs are generated securely

## Future Enhancements

- Digital signature of certificates
- Direct integration with diocesan archives
- Workflow for requesting and issuing official copies
- Historical record importation

## Troubleshooting

If you encounter TypeScript or ESLint errors related to Prisma types:
1. Restart the TypeScript server in your IDE
2. Run `npx prisma generate` to regenerate Prisma client types
3. Check that your tsconfig.json includes the correct paths

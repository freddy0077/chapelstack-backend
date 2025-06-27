# Branches Module Implementation

## Overview

The Branches module provides functionality for managing church branches within the Church Management System. It allows for the creation, retrieval, updating, and deletion of branch records, along with branch-specific settings management. This implementation supports pagination, filtering, and soft deletion of branches.

## Core Features Implemented

### 1. Data Model

The implementation is based on a `Branch` entity with the following structure:

- `id`: Unique identifier for the branch (auto-generated)
- `name`: Name of the branch
- `address`: Optional physical address
- `city`: Optional city location
- `state`: Optional state/province
- `postalCode`: Optional postal/zip code
- `country`: Optional country
- `phoneNumber`: Optional contact phone number
- `email`: Optional contact email address (must be unique)
- `website`: Optional website URL
- `establishedAt`: Optional date when the branch was established
- `isActive`: Boolean flag indicating if the branch is active
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update
- `settings`: Collection of branch-specific settings

Additionally, the module includes a `BranchSetting` entity:

- `id`: Unique identifier for the setting
- `branchId`: ID of the branch this setting belongs to
- `key`: String identifier for the setting
- `value`: The value of the setting
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

### 2. CRUD Operations

#### Create Branch

```typescript
async create(createBranchInput: CreateBranchInput): Promise<Branch>
```

- Creates a new branch with the provided information
- Validates that no branch with the same email already exists
- Throws a `ConflictException` if a duplicate email is found
- Returns the newly created branch

#### Retrieve Branches

```typescript
async findAll(
  paginationInput: PaginationInput,
  filterInput?: BranchFilterInput
): Promise<{ items: Branch[]; totalCount: number; hasNextPage: boolean }>
```

- Retrieves branches with pagination support
- Supports filtering by name, city, state, country, email, and active status
- Returns a paginated result with total count and next page indicator

```typescript
async findOne(id: string): Promise<Branch>
```

- Retrieves a single branch by its ID
- Throws a `NotFoundException` if the branch doesn't exist
- Returns the branch with all its details

#### Update Branch

```typescript
async update(id: string, updateBranchInput: UpdateBranchInput): Promise<Branch>
```

- Updates an existing branch with new values
- Validates that the branch exists
- Checks for email uniqueness if email is being updated
- Throws appropriate exceptions for not found or conflict scenarios
- Returns the updated branch

#### Delete Branch (Soft Delete)

```typescript
async remove(id: string): Promise<Branch>
```

- Soft deletes a branch by setting `isActive` to false
- Validates that the branch exists
- Returns the updated (deactivated) branch
- If the branch is already inactive, returns it without changes

### 3. Branch Settings Management

```typescript
async findBranchSettings(branchId: string): Promise<BranchSetting[]>
```

- Retrieves all settings for a specific branch
- Validates that the branch exists
- Returns an array of branch settings

```typescript
async updateBranchSetting(
  branchId: string,
  { key, value }: UpdateBranchSettingInput
): Promise<BranchSetting>
```

- Updates or creates a setting for a specific branch
- Uses upsert operation (update if exists, create if not)
- Validates that the branch exists
- Returns the updated or created branch setting

```typescript
async getSettingsByBranchId(branchId: string): Promise<BranchSetting[]>
```

- Helper method to load settings for a branch
- Can be used with DataLoader for optimized batch loading
- Returns an array of branch settings

### 4. Type Conversion

The module includes a helper function `toGraphQLBranch` that converts Prisma model objects to GraphQL entity objects, handling nullable fields appropriately.

### 5. Error Handling

The implementation includes robust error handling:

- `NotFoundException`: Thrown when attempting to access a non-existent branch
- `ConflictException`: Thrown when attempting to create a branch with a duplicate email or update a branch to have an email that already exists

## Usage Examples

### Creating a New Branch

```typescript
const newBranch = await branchesService.create({
  name: 'Downtown Campus',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'USA',
  phoneNumber: '212-555-1234',
  email: 'downtown@example.church',
  website: 'https://downtown.example.church',
  establishedAt: new Date('2010-01-01'),
});
```

### Retrieving Branches with Pagination and Filtering

```typescript
const branchesPage = await branchesService.findAll(
  { skip: 0, take: 10 }, // Pagination
  { 
    nameContains: 'campus',
    isActive: true 
  } // Filter
);
```

### Updating a Branch

```typescript
const updatedBranch = await branchesService.update('branch-id', {
  phoneNumber: '212-555-5678',
  website: 'https://new-downtown.example.church',
});
```

### Managing Branch Settings

```typescript
// Add or update a branch setting
const setting = await branchesService.updateBranchSetting(
  'branch-id',
  { key: 'service.startTime', value: '10:00 AM' }
);

// Retrieve all settings for a branch
const settings = await branchesService.findBranchSettings('branch-id');
```

## Technical Implementation Details

- The service uses Prisma ORM for database interactions
- Soft deletion is implemented by setting `isActive` to false rather than removing records
- Email uniqueness is enforced at both the database and application levels
- The module supports case-insensitive filtering for text fields
- Transaction support ensures data consistency for complex operations

## Future Enhancements

The current implementation provides a solid foundation for the Branches module. Future enhancements could include:

1. **Hierarchical Branch Structure**: Support for parent-child relationships between branches
2. **Geolocation Features**: Adding latitude/longitude and distance-based search
3. **Advanced Filtering**: More complex filtering options and search capabilities
4. **Branch Merging**: Functionality to merge two branches and their associated data
5. **Branch Analytics**: Statistics and reporting on branch activities
6. **Multi-tenant Support**: Enhanced isolation between branches for multi-tenant deployments
7. **Branch Cloning**: Ability to create a new branch based on an existing one

## Integration with Other Modules

The Branches module is designed to be integrated with other modules in the application:

- **Settings Module**: Branch-specific settings complement global settings
- **Users Module**: Users can be associated with specific branches
- **Members Module**: Members can belong to specific branches
- **Events Module**: Events can be organized at specific branches

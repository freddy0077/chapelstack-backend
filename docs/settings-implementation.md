# Settings Module Implementation

## Overview

The Settings module provides a flexible key-value store for managing application-wide (global) and branch-specific configurations. This implementation allows administrators to create, retrieve, update, and delete settings with proper validation and error handling.

## Core Features Implemented

### 1. Data Model

The implementation is based on a `Setting` entity with the following structure:

- `id`: Unique identifier for the setting (auto-generated)
- `key`: String identifier for the setting (e.g., "app.name", "email.sender")
- `value`: The value of the setting (stored as a string)
- `branchId`: Optional branch identifier for branch-specific settings (null for global settings)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

### 2. Global and Branch-Specific Settings

- **Global Settings**: Settings that apply to the entire application (branchId = null)
- **Branch-Specific Settings**: Settings that only apply to a specific branch (branchId = branch identifier)

### 3. CRUD Operations

#### Create Settings

```typescript
async create(createSettingInput: CreateSettingInput): Promise<Setting>
```

- Creates a new setting with the provided key, value, and optional branchId
- Validates that no setting with the same key and branchId already exists
- Throws a `ConflictException` if a duplicate is found

#### Retrieve Settings

```typescript
async findAll(branchId?: string): Promise<Setting[]>
```

- Retrieves all settings
- If branchId is provided, returns settings for that specific branch AND global settings
- Results are ordered by branchId and key for consistency

```typescript
async findOne(id: string): Promise<Setting>
```

- Retrieves a single setting by its ID
- Throws a `NotFoundException` if the setting doesn't exist

```typescript
async findByKey(key: string, branchId?: string): Promise<Setting>
```

- Retrieves a setting by its key and optional branchId
- Throws a `NotFoundException` if the setting doesn't exist

#### Update Settings

```typescript
async update(id: string, updateSettingInput: UpdateSettingInput): Promise<Setting>
```

- Updates an existing setting with new values
- Validates that the setting exists
- Checks for conflicts if key or branchId is being changed
- Throws appropriate exceptions for not found or conflict scenarios

#### Delete Settings

```typescript
async remove(id: string): Promise<Setting>
```

- Deletes a setting by its ID
- Validates that the setting exists before deletion
- Throws a `NotFoundException` if the setting doesn't exist

### 4. Error Handling

The implementation includes robust error handling:

- `NotFoundException`: Thrown when attempting to access a non-existent setting
- `ConflictException`: Thrown when attempting to create a duplicate setting or update a setting in a way that would create a conflict

## Usage Examples

### Creating a Global Setting

```typescript
const newGlobalSetting = await settingsService.create({
  key: 'app.name',
  value: 'Church Management System',
  // branchId is undefined, making this a global setting
});
```

### Creating a Branch-Specific Setting

```typescript
const newBranchSetting = await settingsService.create({
  key: 'timezone',
  value: 'America/New_York',
  branchId: 'branch-123',
});
```

### Retrieving Settings for a Branch

```typescript
// This will return both branch-specific settings for branch-123 AND global settings
const branchSettings = await settingsService.findAll('branch-123');
```

### Updating a Setting

```typescript
const updatedSetting = await settingsService.update('setting-id', {
  value: 'new-value',
});
```

## Technical Implementation Details

- The service uses Prisma ORM for database interactions
- `findFirst` is used for queries involving nullable fields (e.g., branchId) to ensure proper TypeScript type safety
- The implementation handles the case where branchId is undefined vs. null consistently

## Future Enhancements

The current implementation provides a solid foundation for the Settings module. Future enhancements could include:

1. **Type-Safe Settings**: Adding support for typed settings (boolean, number, JSON objects)
2. **Setting Categories**: Organizing settings into logical categories
3. **Default Values**: Support for default values when a setting is not found
4. **Validation Rules**: Adding validation rules for specific setting keys
5. **Caching**: Implementing caching to improve performance for frequently accessed settings
6. **Audit Logging**: Tracking changes to settings for audit purposes
7. **Bulk Operations**: Support for updating multiple settings at once

## Integration with Other Modules

The Settings module is designed to be used by other modules in the application. Any module that needs configurable behavior can use the Settings service to retrieve and potentially update configuration values.

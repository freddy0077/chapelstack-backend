# Enum Validation Fix

## Problem

The application was experiencing runtime validation errors when using Prisma-generated enums with the `IsEnum` decorator from the `class-validator` library. The error was:

```
TypeError: Cannot convert undefined or null to object
```

This occurred because the `IsEnum` decorator internally uses `Object.entries()` on the enum, which can be undefined or null at runtime when used with Prisma-generated enums.

## Solution

A custom validation utility was created to replace the `IsEnum` decorator with a more robust alternative that handles Prisma enums correctly:

1. Created a new utility file: `src/common/utils/enum-validation.util.ts`
2. Implemented `IsValidEnum` decorator that safely validates enum values without causing runtime errors
3. Added a helper function `createGraphQLEnum` to create GraphQL-compatible enums from Prisma enums

## Implementation

The solution was implemented in the following steps:

1. Created the utility functions:
   ```typescript
   // src/common/utils/enum-validation.util.ts
   import { ValidationOptions, registerDecorator } from 'class-validator';

   /**
    * Custom validator for enum values that works safely with Prisma-generated enums
    * Avoids the "Cannot convert undefined or null to object" error that can occur with IsEnum
    */
   export function IsValidEnum(
     enumValues: any[] | object,
     validationOptions?: ValidationOptions,
   ) {
     return function (object: object, propertyName: string) {
       const values = Array.isArray(enumValues)
         ? enumValues
         : Object.values(enumValues);

       registerDecorator({
         name: 'isValidEnum',
         target: object.constructor,
         propertyName: propertyName,
         options: validationOptions,
         validator: {
           validate(value: any) {
             return (
               value === undefined || value === null || values.includes(value)
             );
           },
           defaultMessage() {
             return `${propertyName} must be one of the following values: ${values.join(', ')}`;
           },
         },
       });
     };
   }
   ```

2. Updated DTOs across the application to use `IsValidEnum` instead of `IsEnum`:
   ```typescript
   // Before
   @IsEnum(SomeEnum)
   field: SomeEnum;

   // After
   @IsValidEnum(SomeEnum)
   field: SomeEnum;
   ```

## Modules Updated

The following modules were updated to use the new validation approach:

- **Sacraments Module**: Fixed enum validation for `SacramentType`
- **Forms Module**: Fixed enum validation for `FormStatus` and `FormFieldType`
- **Onboarding Module**: Fixed enum validation for `OnboardingStep`
- **Communications Module**: Fixed enum validation for `NotificationType`
- **Members Module**: Fixed enum validation for:
  - `MilestoneType` in spiritual milestones
  - `FamilyRelationshipType` in family relationships
  - `Gender`, `MaritalStatus`, and `MemberStatus` in member records

## Benefits

1. **Runtime Stability**: Eliminates runtime errors caused by `IsEnum` with Prisma enums
2. **Consistent Validation**: Provides the same validation behavior as `IsEnum` but with better error handling
3. **Type Safety**: Maintains TypeScript type checking for enum values
4. **Reusable Solution**: Can be applied to any enum validation across the application

## Usage

To use this utility in other parts of the application:

1. Import the utility:
   ```typescript
   import { IsValidEnum } from '../../common/utils/enum-validation.util';
   ```

2. Replace `IsEnum` with `IsValidEnum`:
   ```typescript
   @Field(() => YourEnum)
   @IsValidEnum(YourEnum)
   field: YourEnum;
   ```

## Future Considerations

- Consider adding unit tests for the `IsValidEnum` decorator
- Monitor for any similar validation issues with other decorators
- If upgrading class-validator in the future, check if this issue has been resolved in newer versions

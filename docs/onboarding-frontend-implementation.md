# Onboarding & Setup Module - Frontend Implementation Guide

This document provides guidance for implementing the frontend components that interact with the Onboarding & Setup Module's GraphQL APIs. It serves as a reference for frontend developers working on the Church Management System.

## Table of Contents

1. [Overview](#overview)
2. [GraphQL API Reference](#graphql-api-reference)
3. [Implementation Flow](#implementation-flow)
4. [Component Structure](#component-structure)
5. [File Upload Implementation](#file-upload-implementation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling](#error-handling)
8. [Example Implementations](#example-implementations)

## Overview

The Onboarding & Setup Module provides a step-by-step guided process for administrators to configure essential system settings and input initial data for a new church or branch. The frontend implementation should present this as a wizard-like interface with clear progress tracking and intuitive navigation.

## GraphQL API Reference

### Queries

#### `onboardingProgress`
Retrieves the current progress of the onboarding process for a specific branch.

```graphql
query GetOnboardingProgress($branchId: ID!) {
  onboardingProgress(branchId: $branchId) {
    id
    branchId
    steps {
      key
      completed
      completedAt
    }
    currentStep
    isComplete
  }
}
```

#### `generateMemberImportTemplate`
Generates a template CSV file for member data import.

```graphql
query GenerateMemberImportTemplate {
  generateMemberImportTemplate
}
```

#### `generateFundsImportTemplate`
Generates a template CSV file for funds data import.

```graphql
query GenerateFundsImportTemplate {
  generateFundsImportTemplate
}
```

### Mutations

#### `initializeOnboarding`
Initializes or resets the onboarding process for a branch.

```graphql
mutation InitializeOnboarding($branchId: ID!) {
  initializeOnboarding(branchId: $branchId) {
    id
    branchId
    steps {
      key
      completed
      completedAt
    }
    currentStep
    isComplete
  }
}
```

#### `completeOnboardingStep`
Marks a specific onboarding step as completed.

```graphql
mutation CompleteOnboardingStep($input: CompleteOnboardingStepInput!) {
  completeOnboardingStep(input: $input) {
    id
    branchId
    steps {
      key
      completed
      completedAt
    }
    currentStep
    isComplete
  }
}
```

#### `resetOnboarding`
Resets the onboarding process for a branch, clearing all progress.

```graphql
mutation ResetOnboarding($branchId: ID!) {
  resetOnboarding(branchId: $branchId) {
    id
    branchId
    currentStep
    isComplete
  }
}
```

#### `initiateBranchSetup`
Creates a new branch with initial configuration.

```graphql
mutation InitiateBranchSetup($input: InitialBranchSetupInput!) {
  initiateBranchSetup(input: $input)
}
```

#### `configureInitialSettings`
Configures initial system settings for a branch.

```graphql
mutation ConfigureInitialSettings($branchId: ID!, $input: InitialSettingsInput!) {
  configureInitialSettings(branchId: $branchId, input: $input)
}
```

#### `createSuperAdminUser`
Creates the initial super admin user for a branch.

```graphql
mutation CreateSuperAdminUser(
  $email: String!
  $password: String!
  $firstName: String!
  $lastName: String!
  $branchId: ID!
) {
  createSuperAdminUser(
    email: $email
    password: $password
    firstName: $firstName
    lastName: $lastName
    branchId: $branchId
  )
}
```

#### `importMemberData`
Imports member data from a CSV file.

```graphql
mutation ImportMemberData(
  $branchId: ID!
  $file: Upload!
  $mapping: String!
) {
  importMemberData(
    branchId: $branchId
    file: $file
    mapping: $mapping
  ) {
    success
    totalRecords
    importedRecords
    errors {
      row
      column
      message
    }
    message
  }
}
```

#### `importFinancialData`
Imports financial data (funds, accounts, or contributions) from a CSV file.

```graphql
mutation ImportFinancialData(
  $branchId: ID!
  $file: Upload!
  $mapping: String!
  $type: String!
) {
  importFinancialData(
    branchId: $branchId
    file: $file
    mapping: $mapping
    type: $type
  ) {
    success
    totalRecords
    importedRecords
    errors {
      row
      column
      message
    }
    message
  }
}
```

## Implementation Flow

The frontend implementation should follow this general flow:

1. **Welcome Screen**
   - Introduction to the CMS
   - Start onboarding button

2. **Super Admin Creation**
   - Form for creating the first admin user
   - Uses `createSuperAdminUser` mutation

3. **Branch Setup**
   - Form for inputting branch details
   - Uses `initiateBranchSetup` mutation

4. **Initial Settings Configuration**
   - Forms for basic system settings
   - Uses `configureInitialSettings` mutation

5. **Data Import**
   - Member data import
   - Financial data import
   - Template download options
   - Uses import mutations and template queries

6. **Progress Tracking**
   - Progress bar or checklist
   - Uses `onboardingProgress` query
   - Uses `completeOnboardingStep` mutation

7. **Completion**
   - Summary of setup
   - Links to documentation or support

## Component Structure

Suggested component structure for the frontend implementation:

```
/src
  /components
    /onboarding
      OnboardingWizard.jsx       # Main wizard container
      ProgressTracker.jsx        # Progress bar/stepper component
      /steps
        WelcomeStep.jsx          # Introduction step
        AdminSetupStep.jsx       # Super admin creation
        BranchSetupStep.jsx      # Branch configuration
        SettingsStep.jsx         # Initial settings
        MemberImportStep.jsx     # Member data import
        FinancialImportStep.jsx  # Financial data import
        CompletionStep.jsx       # Final summary
      /common
        FileUploader.jsx         # File upload component
        MappingSelector.jsx      # CSV column mapping component
        ImportResults.jsx        # Display import results
```

## File Upload Implementation

For file uploads with GraphQL, use the `Upload` scalar type provided by Apollo Client:

```javascript
import { useMutation } from '@apollo/client';
import { IMPORT_MEMBER_DATA } from '../graphql/mutations';

function MemberImportStep() {
  const [importMembers, { loading, error, data }] = useMutation(IMPORT_MEMBER_DATA);
  
  const handleFileUpload = async (file, mapping) => {
    try {
      const result = await importMembers({
        variables: {
          branchId: 'your-branch-id',
          file: file,
          mapping: JSON.stringify(mapping)
        }
      });
      
      // Handle success
    } catch (err) {
      // Handle error
    }
  };
  
  // Component JSX
}
```

Ensure your Apollo Client is configured to handle file uploads:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

const client = new ApolloClient({
  link: createUploadLink({
    uri: 'http://your-api-endpoint/graphql',
  }),
  cache: new InMemoryCache()
});
```

## Authentication & Authorization

Most onboarding endpoints require authentication and specific permissions:

1. **Initial Steps** (branch creation, super admin creation) may not require authentication
2. **Later Steps** require authentication with specific permissions:
   - `onboarding:read` for queries
   - `onboarding:write` for mutations
   - Additional permissions like `members:write` for specific operations

Implement an authentication context to manage tokens and user state:

```javascript
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  
  // Authentication logic
  
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Error Handling

Implement robust error handling for API interactions:

```javascript
const [importMembers, { loading, error, data }] = useMutation(IMPORT_MEMBER_DATA, {
  onError: (error) => {
    // Check for different error types
    if (error.graphQLErrors) {
      // Handle GraphQL errors (e.g., validation errors)
    } else if (error.networkError) {
      // Handle network errors
    } else {
      // Handle other errors
    }
  }
});
```

For import operations, display detailed error information from the response:

```jsx
{data?.importMemberData?.errors && (
  <div className="error-container">
    <h3>Import Errors</h3>
    <ul>
      {data.importMemberData.errors.map((error, index) => (
        <li key={index}>
          Row {error.row}, Column {error.column}: {error.message}
        </li>
      ))}
    </ul>
  </div>
)}
```

## Example Implementations

### Progress Tracker Component

```jsx
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ONBOARDING_PROGRESS } from '../graphql/queries';

function ProgressTracker({ branchId }) {
  const { loading, error, data } = useQuery(GET_ONBOARDING_PROGRESS, {
    variables: { branchId },
    fetchPolicy: 'network-only', // Ensures fresh data
  });

  if (loading) return <p>Loading progress...</p>;
  if (error) return <p>Error loading progress: {error.message}</p>;

  const { steps, currentStep, isComplete } = data.onboardingProgress;

  return (
    <div className="progress-tracker">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
        />
      </div>
      
      <ul className="step-list">
        {steps.map((step) => (
          <li 
            key={step.key} 
            className={`step ${step.completed ? 'completed' : ''} ${currentStep === step.key ? 'active' : ''}`}
          >
            {step.key}
          </li>
        ))}
      </ul>
      
      {isComplete && (
        <div className="completion-badge">
          Setup Complete!
        </div>
      )}
    </div>
  );
}

export default ProgressTracker;
```

### Member Import Component

```jsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { IMPORT_MEMBER_DATA } from '../graphql/mutations';
import { GENERATE_MEMBER_IMPORT_TEMPLATE } from '../graphql/queries';

function MemberImportStep({ branchId, onComplete }) {
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState({});
  
  const [importMembers, { loading, error, data }] = useMutation(IMPORT_MEMBER_DATA);
  const { data: templateData } = useQuery(GENERATE_MEMBER_IMPORT_TEMPLATE);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleMappingChange = (field, value) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await importMembers({
        variables: {
          branchId,
          file,
          mapping: JSON.stringify(mapping)
        }
      });
      
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Import error:', err);
    }
  };
  
  const downloadTemplate = () => {
    if (templateData?.generateMemberImportTemplate) {
      window.open(templateData.generateMemberImportTemplate, '_blank');
    }
  };
  
  return (
    <div className="member-import-step">
      <h2>Import Members</h2>
      
      <div className="template-section">
        <p>Download a template CSV file to get started:</p>
        <button onClick={downloadTemplate}>Download Template</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="file-upload">
          <label>
            Select CSV File:
            <input type="file" accept=".csv" onChange={handleFileChange} />
          </label>
        </div>
        
        {file && (
          <div className="mapping-section">
            <h3>Map CSV Columns</h3>
            {/* Mapping UI - simplified for example */}
            <div className="mapping-field">
              <label>First Name Column:</label>
              <input 
                type="text" 
                value={mapping.firstName || ''} 
                onChange={(e) => handleMappingChange('firstName', e.target.value)} 
              />
            </div>
            {/* Additional mapping fields */}
          </div>
        )}
        
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Importing...' : 'Import Members'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          {error.message}
        </div>
      )}
      
      {data?.importMemberData && (
        <div className="import-results">
          <h3>Import Results</h3>
          <p>Status: {data.importMemberData.success ? 'Success' : 'Failed'}</p>
          <p>Total Records: {data.importMemberData.totalRecords}</p>
          <p>Imported Records: {data.importMemberData.importedRecords}</p>
          
          {data.importMemberData.errors && data.importMemberData.errors.length > 0 && (
            <div className="import-errors">
              <h4>Errors:</h4>
              <ul>
                {data.importMemberData.errors.map((error, index) => (
                  <li key={index}>
                    Row {error.row}, Column {error.column}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MemberImportStep;
```

This guide provides a foundation for implementing the frontend components that interact with the Onboarding & Setup Module's GraphQL APIs. Adapt and extend these examples based on your specific UI design and requirements.

# Church Management System - Frontend Implementation Guide

This document provides comprehensive guidance for implementing frontend components that interact with the Church Management System's GraphQL APIs. It covers all modules in the order of implementation and serves as a reference for frontend developers.

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication & User Management](#authentication--user-management)
3. [Branch Management](#branch-management)
4. [Settings Module](#settings-module)
5. [Member Management](#member-management)
6. [Onboarding & Setup](#onboarding--setup)
7. [Communications Module](#communications-module)
8. [Content Management](#content-management)
9. [Forms Module](#forms-module)
10. [Ministries Module](#ministries-module)
11. [Finance Management](#finance-management)
12. [Attendance Tracking](#attendance-tracking)
13. [Children's Ministry](#childrens-ministry)
14. [Reporting Module](#reporting-module)
15. [Common Implementation Patterns](#common-implementation-patterns)

## Introduction

This guide documents the GraphQL APIs available in the Church Management System backend and provides implementation guidance for frontend developers. Each section covers a specific module, including:

- Available queries and mutations
- Data structures and types
- Implementation examples
- Best practices

### Apollo Client Setup

For all modules, we recommend using Apollo Client for GraphQL interactions:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';

// HTTP link for queries and mutations
const httpLink = createUploadLink({
  uri: 'http://your-api-endpoint/graphql',
});

// Auth link for adding the token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

## Authentication & User Management

The Authentication module handles user registration, login, password management, and access control.

### GraphQL API Reference

#### Queries

```graphql
query GetCurrentUser {
  me {
    id
    email
    firstName
    lastName
    role
    permissions
  }
}
```

#### Mutations

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}

mutation Register($input: RegisterUserInput!) {
  register(input: $input) {
    id
    email
  }
}

mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email)
}

mutation ResetPassword($token: String!, $password: String!) {
  resetPassword(token: $token, password: $password)
}
```

### Implementation Example

```jsx
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../graphql/mutations';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation(LOGIN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login({ 
        variables: { email, password } 
      });
      
      // Store token in localStorage
      localStorage.setItem('token', data.login.token);
      
      // Redirect or update app state
    } catch (err) {
      // Error is handled by Apollo Client
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="error">{error.message}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Branch Management

The Branch Management module handles church branches/locations management.

### GraphQL API Reference

#### Queries

```graphql
query GetBranches {
  branches {
    id
    name
    address
    city
    state
    country
    phone
    email
    isMainBranch
  }
}

query GetBranch($id: ID!) {
  branch(id: $id) {
    id
    name
    address
    city
    state
    country
    phone
    email
    isMainBranch
  }
}
```

#### Mutations

```graphql
mutation CreateBranch($input: CreateBranchInput!) {
  createBranch(input: $input) {
    id
    name
  }
}

mutation UpdateBranch($id: ID!, $input: UpdateBranchInput!) {
  updateBranch(id: $id, input: $input) {
    id
    name
  }
}

mutation DeleteBranch($id: ID!) {
  deleteBranch(id: $id)
}
```

## Settings Module

The Settings module manages system-wide and branch-specific configuration.

### GraphQL API Reference

#### Queries

```graphql
query GetSettings($branchId: ID) {
  settings(branchId: $branchId) {
    id
    key
    value
    branchId
  }
}

query GetSetting($key: String!, $branchId: ID) {
  setting(key: $key, branchId: $branchId) {
    id
    key
    value
    branchId
  }
}
```

#### Mutations

```graphql
mutation UpdateSetting($key: String!, $value: String!, $branchId: ID) {
  updateSetting(key: $key, value: $value, branchId: $branchId) {
    id
    key
    value
    branchId
  }
}

mutation UpdateSettings($input: [SettingInput!]!, $branchId: ID) {
  updateSettings(input: $input, branchId: $branchId) {
    id
    key
    value
    branchId
  }
}
```

## Member Management

The Member Management module handles church member records, groups, and relationships.

### GraphQL API Reference

#### Queries

```graphql
query GetMembers($branchId: ID!, $filter: MemberFilterInput, $pagination: PaginationInput) {
  members(branchId: $branchId, filter: $filter, pagination: $pagination) {
    items {
      id
      firstName
      lastName
      email
      phoneNumber
      address
      dateOfBirth
      gender
      membershipStatus
      joinDate
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}

query GetMember($id: ID!) {
  member(id: $id) {
    id
    firstName
    lastName
    email
    phoneNumber
    address
    dateOfBirth
    gender
    membershipStatus
    joinDate
    familyRelationships {
      id
      relationType
      relatedMember {
        id
        firstName
        lastName
      }
    }
    groups {
      id
      name
    }
  }
}
```

#### Mutations

```graphql
mutation CreateMember($input: CreateMemberInput!) {
  createMember(input: $input) {
    id
    firstName
    lastName
  }
}

mutation UpdateMember($id: ID!, $input: UpdateMemberInput!) {
  updateMember(id: $id, input: $input) {
    id
    firstName
    lastName
  }
}

mutation DeleteMember($id: ID!) {
  deleteMember(id: $id)
}

mutation AddMemberToGroup($memberId: ID!, $groupId: ID!) {
  addMemberToGroup(memberId: $memberId, groupId: $groupId)
}

mutation RemoveMemberFromGroup($memberId: ID!, $groupId: ID!) {
  removeMemberFromGroup(memberId: $memberId, groupId: $groupId)
}
```

## Onboarding & Setup

The Onboarding & Setup module guides new churches through initial system configuration.

### GraphQL API Reference

#### Queries

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

query GenerateMemberImportTemplate {
  generateMemberImportTemplate
}

query GenerateFundsImportTemplate {
  generateFundsImportTemplate
}
```

#### Mutations

```graphql
mutation InitializeOnboarding($branchId: ID!) {
  initializeOnboarding(branchId: $branchId) {
    id
    branchId
    currentStep
  }
}

mutation CompleteOnboardingStep($input: CompleteOnboardingStepInput!) {
  completeOnboardingStep(input: $input) {
    id
    currentStep
    isComplete
  }
}

mutation InitiateBranchSetup($input: InitialBranchSetupInput!) {
  initiateBranchSetup(input: $input)
}

mutation CreateSuperAdminUser($email: String!, $password: String!, $firstName: String!, $lastName: String!, $branchId: ID!) {
  createSuperAdminUser(email: $email, password: $password, firstName: $firstName, lastName: $lastName, branchId: $branchId)
}

mutation ImportMemberData($branchId: ID!, $file: Upload!, $mapping: String!) {
  importMemberData(branchId: $branchId, file: $file, mapping: $mapping) {
    success
    totalRecords
    importedRecords
    errors {
      row
      column
      message
    }
  }
}

mutation ImportFinancialData($branchId: ID!, $file: Upload!, $mapping: String!, $type: String!) {
  importFinancialData(branchId: $branchId, file: $file, mapping: $mapping, type: $type) {
    success
    totalRecords
    importedRecords
    errors {
      row
      column
      message
    }
  }
}
```

### File Upload Implementation

For file uploads with GraphQL, use the `Upload` scalar type:

```javascript
import { useMutation } from '@apollo/client';
import { IMPORT_MEMBER_DATA } from '../graphql/mutations';

function MemberImportComponent({ branchId }) {
  const [importMembers, { loading, error, data }] = useMutation(IMPORT_MEMBER_DATA);
  
  const handleFileUpload = async (file, mapping) => {
    try {
      const result = await importMembers({
        variables: {
          branchId,
          file,
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

## Communications Module

The Communications module handles email templates, email sending, SMS, and in-app notifications.

### GraphQL API Reference

#### Queries

```graphql
query GetEmailTemplates($branchId: ID!) {
  emailTemplates(branchId: $branchId) {
    id
    name
    subject
    content
    variables
  }
}

query GetNotifications($userId: ID!) {
  notifications(userId: $userId) {
    id
    title
    message
    type
    read
    createdAt
  }
}
```

#### Mutations

```graphql
mutation CreateEmailTemplate($input: CreateEmailTemplateInput!) {
  createEmailTemplate(input: $input) {
    id
    name
  }
}

mutation SendEmail($input: SendEmailInput!) {
  sendEmail(input: $input) {
    id
    status
  }
}

mutation SendSms($input: SendSmsInput!) {
  sendSms(input: $input) {
    id
    status
  }
}

mutation CreateNotification($input: CreateNotificationInput!) {
  createNotification(input: $input) {
    id
    title
  }
}

mutation MarkNotificationAsRead($id: ID!) {
  markNotificationAsRead(id: $id) {
    id
    read
  }
}
```

## Content Management

The Content Management module handles sermons, series, speakers, and media items.

### GraphQL API Reference

#### Queries

```graphql
query GetSermons($filter: SermonFilterInput, $pagination: PaginationInput) {
  sermons(filter: $filter, pagination: $pagination) {
    items {
      id
      title
      description
      date
      speaker {
        id
        name
      }
      series {
        id
        title
      }
      mediaItems {
        id
        type
        url
      }
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}

query GetSeries {
  series {
    id
    title
    description
    startDate
    endDate
    imageUrl
  }
}

query GetSpeakers {
  speakers {
    id
    name
    bio
    imageUrl
  }
}
```

#### Mutations

```graphql
mutation CreateSermon($input: CreateSermonInput!) {
  createSermon(input: $input) {
    id
    title
  }
}

mutation CreateSeries($input: CreateSeriesInput!) {
  createSeries(input: $input) {
    id
    title
  }
}

mutation CreateSpeaker($input: CreateSpeakerInput!) {
  createSpeaker(input: $input) {
    id
    name
  }
}

mutation UploadMediaItem($sermonId: ID!, $file: Upload!, $type: MediaType!) {
  uploadMediaItem(sermonId: $sermonId, file: $file, type: $type) {
    id
    url
    type
  }
}
```

## Forms Module

The Forms module handles dynamic form creation and submission management.

### GraphQL API Reference

#### Queries

```graphql
query GetForms($branchId: ID!) {
  forms(branchId: $branchId) {
    id
    title
    description
    fields {
      id
      label
      type
      required
      options
    }
  }
}

query GetFormSubmissions($formId: ID!, $pagination: PaginationInput) {
  formSubmissions(formId: $formId, pagination: $pagination) {
    items {
      id
      submittedBy {
        id
        firstName
        lastName
      }
      values {
        fieldId
        value
      }
      submittedAt
    }
    totalCount
  }
}
```

#### Mutations

```graphql
mutation CreateForm($input: CreateFormInput!) {
  createForm(input: $input) {
    id
    title
  }
}

mutation UpdateForm($id: ID!, $input: UpdateFormInput!) {
  updateForm(id: $id, input: $input) {
    id
    title
  }
}

mutation SubmitForm($formId: ID!, $input: SubmitFormInput!) {
  submitForm(formId: $formId, input: $input) {
    id
    submittedAt
  }
}
```

## Common Implementation Patterns

### Error Handling

Implement consistent error handling across all API interactions:

```javascript
const [mutation, { loading, error, data }] = useMutation(MUTATION, {
  onError: (error) => {
    // Check for different error types
    if (error.graphQLErrors) {
      // Handle GraphQL errors (e.g., validation errors)
      error.graphQLErrors.forEach(({ message, extensions }) => {
        if (extensions?.code === 'UNAUTHENTICATED') {
          // Handle authentication errors
          logout();
          navigate('/login');
        } else {
          // Handle other GraphQL errors
          toast.error(message);
        }
      });
    } else if (error.networkError) {
      // Handle network errors
      toast.error('Network error. Please check your connection.');
    } else {
      // Handle other errors
      toast.error('An unexpected error occurred.');
    }
  }
});
```

### Pagination

Implement consistent pagination for list views:

```jsx
function PaginatedList({ query, variables, renderItem }) {
  const { loading, error, data, fetchMore } = useQuery(query, {
    variables: {
      ...variables,
      pagination: { page: 1, pageSize: 10 }
    }
  });

  const handleLoadMore = () => {
    fetchMore({
      variables: {
        pagination: {
          page: Math.floor(data.items.length / 10) + 1,
          pageSize: 10
        }
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          items: [...prev.items, ...fetchMoreResult.items],
          pageInfo: fetchMoreResult.pageInfo
        };
      }
    });
  };

  if (loading && !data) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <div className="items-list">
        {data.items.map(renderItem)}
      </div>
      {data.pageInfo.hasNextPage && (
        <button onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Form Handling

Implement consistent form handling:

```jsx
function DataForm({ initialValues, onSubmit, validationSchema, children }) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, setStatus }) => {
        try {
          await onSubmit(values);
          setStatus({ success: true });
        } catch (error) {
          setStatus({ success: false, error: error.message });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, status }) => (
        <Form>
          {status?.error && <div className="error">{status.error}</div>}
          {status?.success && <div className="success">Successfully submitted!</div>}
          
          {children}
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

### Authentication Context

Implement an authentication context for managing user state:

```javascript
import { createContext, useState, useEffect, useContext } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const client = useApolloClient();
  
  const { loading, data } = useQuery(GET_CURRENT_USER, {
    skip: !token,
    fetchPolicy: 'network-only'
  });
  
  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data]);
  
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    client.resetStore();
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token, 
      user, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

This guide provides a foundation for implementing frontend components that interact with the Church Management System's GraphQL APIs. Adapt and extend these examples based on your specific UI design and requirements.

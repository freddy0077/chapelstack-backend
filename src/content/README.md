# Content Management Module

## Overview

The Content Management module handles all digital content produced by the church, including sermons, media files, series, and speakers. It provides a comprehensive solution for uploading, storing, retrieving, and managing various types of content.

## Features

### Core Components

- **Sermon Management**: Create, update, search, and filter sermons with metadata
- **Media Library**: Store and organize various media files (audio, video, images, documents)
- **Series Management**: Group related sermons into series with start/end dates
- **Speaker Profiles**: Manage speaker information with optional links to member profiles
- **S3 File Storage**: Secure file uploads and management using AWS S3

### Key Services

- **SermonsService**: CRUD operations for sermons with filtering and search capabilities
- **MediaItemsService**: Manage media files with type-based queries
- **SeriesService**: CRUD operations with specialized queries like getActiveSeries
- **SpeakersService**: Manage speaker profiles with CRUD operations
- **S3UploadService**: Generate presigned URLs for secure S3 uploads and handle file deletion

### GraphQL API

- **Queries**: Fetch individual items or lists with filtering and pagination
- **Mutations**: Create, update, and delete operations for all entity types
- **File Operations**: Upload and delete files with proper S3 integration

## Implementation Details

### S3 File Upload Integration

The module uses AWS SDK v3 to interact with S3 for secure file storage:

1. **Presigned URL Generation**:
   - Client requests a presigned URL via GraphQL mutation
   - Server generates a unique file key using UUID
   - Server returns a presigned URL valid for 15 minutes
   - Client uploads directly to S3 using the presigned URL

2. **File Organization**:
   - Files are organized in directories based on media type
   - Each file gets a unique UUID-based name to prevent collisions
   - File metadata is stored in the MediaItem database entity

3. **File Deletion**:
   - Deletion removes both the S3 file and database record
   - Comprehensive error handling ensures data consistency

### Environment Configuration

The following environment variables are required:

```
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Usage Examples

### Uploading a File

```typescript
// Client-side code
const { data } = await client.mutate({
  mutation: gql`
    mutation GetUploadUrl($input: FileUploadInput!) {
      getPresignedUploadUrl(input: $input) {
        uploadUrl
        fileUrl
        mediaItemId
      }
    }
  `,
  variables: {
    input: {
      fileName: "sermon.mp3",
      contentType: "audio/mpeg",
      mediaType: "AUDIO_FILE",
      description: "Sunday sermon",
      branchId: "branch-uuid"
    }
  }
});

// Upload file to S3 using the presigned URL
await fetch(data.getPresignedUploadUrl.uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type
  }
});
```

### Deleting a File

```typescript
// Client-side code
const { data } = await client.mutate({
  mutation: gql`
    mutation DeleteFile($id: String!) {
      deleteFile(id: $id)
    }
  `,
  variables: {
    id: "media-item-uuid"
  }
});
```

## Testing

The module includes comprehensive unit tests for all services and resolvers:

- **Service Tests**: Test core business logic with mocked dependencies
- **Resolver Tests**: Test GraphQL operations with mocked services
- **S3 Integration Tests**: Test S3 operations with mocked AWS SDK

Run tests with:

```bash
npm test -- content
```

## Future Enhancements

### Planned Features

1. **User Context Integration**:
   - Add user context to file operations for better auditing
   - Implement role-based access control for content management

2. **File Processing Improvements**:
   - Update file size after upload completion
   - Add file validation and virus scanning
   - Support chunked uploads for large files

### Advanced Features (Roadmap)

1. **Media Processing**:
   - Automatic transcription for audio/video content
   - Thumbnail generation for videos
   - Image optimization and resizing

2. **Content Delivery**:
   - CDN integration for optimized content delivery
   - Adaptive bitrate streaming for video content
   - Podcast feed generation for sermon series

3. **Enhanced Search**:
   - Full-text search across sermon transcripts
   - AI-powered content tagging and categorization
   - Scripture reference extraction and linking

4. **Live Streaming**:
   - Integration with live streaming services
   - Recording and archiving of live streams
   - Real-time analytics for live content

5. **Digital Rights Management**:
   - Content access controls for premium content
   - Download restrictions and watermarking
   - Usage analytics and reporting

## Contributing

When extending this module, please follow these guidelines:

1. Maintain separation of concerns between services and resolvers
2. Add comprehensive tests for all new functionality
3. Follow existing patterns for error handling and validation
4. Document new environment variables or configuration requirements

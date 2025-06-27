# Content Management Module (Sermons, Media) (`content.md`)

## 1. Overview

The Content Management module is responsible for managing various types of digital content produced by the church, primarily focusing on sermons (audio, video, text), but also potentially including articles, blog posts, photo galleries, and other media resources. This module facilitates the organization, storage, and delivery of this content.

Content can be associated with specific branches, series, speakers, or topics.

## 2. Core Responsibilities

-   **Sermon Management**: Uploading, categorizing, and managing sermon recordings (audio/video), transcripts, and notes.
-   **Media Library**: Storing and organizing other media files like images, documents, and promotional videos.
-   **Content Categorization**: Tagging content with topics, speakers, series, dates, and scripture references.
-   **Metadata Management**: Storing relevant metadata for each content item (e.g., title, description, speaker, date, series).
-   **File Storage Integration**: Interfacing with file storage solutions (e.g., local storage, AWS S3, Cloudinary) for media files.
-   **Content Delivery**: Providing APIs for retrieving content to be displayed on websites, mobile apps, or other platforms.
-   **Search and Filtering**: Enabling users to search and filter content based on various criteria.

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Include entities like `Sermon`, `MediaItem`, `Series`, `Speaker`, `ContentTag`, `Attachment`, etc.)*

```typescript
// Example Placeholder Schema (referencing MEMORY for sermon system)
model Sermon {
  id             String    @id @default(cuid())
  title          String
  description    String?
  datePreached   DateTime
  speakerId      String
  // speaker     Speaker   @relation(fields: [speakerId], references: [id])
  seriesId       String?
  // series      Series?   @relation(fields: [seriesId], references: [id])
  mainScripture  String?
  // scriptureReferences ScriptureReference[]
  audioUrl       String?
  videoUrl       String?
  transcriptUrl  String?   // Link to PDF or text file
  transcriptText String?   // Or store directly
  duration       Int?      // In seconds
  // attachments  Attachment[] // For sermon notes, slides etc.
  branchId       String
  // branch      Branch    @relation(fields: [branchId], references: [id])
  status         ContentStatus @default(DRAFT) // DRAFT, PUBLISHED, ARCHIVED
  viewCount      Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Speaker {
  id          String    @id @default(cuid())
  name        String
  bio         String?
  // memberId String?   // Link to Member profile if applicable
  // sermons  Sermon[]
  branchId    String?   // Can be global or branch-specific
  // branch   Branch?   @relation(fields: [branchId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Series {
  id          String    @id @default(cuid())
  title       String
  description String?
  // sermons  Sermon[]
  startDate   DateTime?
  endDate     DateTime?
  artworkUrl  String?
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model MediaItem {
  id          String    @id @default(cuid())
  title       String
  description String?
  fileUrl     String    // URL to the media file (image, video, document)
  mimeType    String
  fileSize    Int       // In bytes
  type        MediaType // Enum: IMAGE, VIDEO, AUDIO, DOCUMENT, OTHER
  branchId    String
  // branch   Branch    @relation(fields: [branchId], references: [id])
  uploadedBy  String    // UserId
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  PENDING_REVIEW
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO_FILE // Distinct from Sermon audio which might be handled differently
  DOCUMENT_PDF
  DOCUMENT_WORD
  SLIDESHOW
  OTHER
}
```

## 4. Core Functionalities & Use Cases

-   Media team uploads a video recording of the Sunday sermon, along with sermon notes (PDF).
-   Staff creates a new sermon series and associates multiple sermons with it.
-   A website visitor searches for sermons by a specific speaker or topic.
-   Admin uploads images to a gallery for a recent church event.
-   Content is tagged with relevant scripture references for easy lookup.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here. Refer to MEMORY for sermon API details.)*

### GraphQL (Example - extending from memory)

**Queries:**
-   `sermon(id: ID!): Sermon`
-   `sermons(filter: SermonFilterInput, pagination: PaginationInput): PaginatedSermons`
-   `speaker(id: ID!): Speaker`
-   `speakers(filter: SpeakerFilterInput, pagination: PaginationInput): PaginatedSpeakers`
-   `series(id: ID!): Series`
-   `listSeries(filter: SeriesFilterInput, pagination: PaginationInput): PaginatedSeries` // Corrected name
-   `mediaItem(id: ID!): MediaItem`
-   `mediaItems(filter: MediaFilterInput, pagination: PaginationInput): [MediaItem!]`

**Mutations:**
-   `createSermon(input: CreateSermonInput!): Sermon`
-   `updateSermon(id: ID!, input: UpdateSermonInput!): Sermon`
-   `deleteSermon(id: ID!): Boolean`
-   `createSpeaker(input: CreateSpeakerInput!): Speaker`
-   `createSeries(input: CreateSeriesInput!): Series`
-   `uploadMediaItem(input: UploadMediaInput!, file: Upload!): MediaItem`
-   `addAttachmentToSermon(sermonId: ID!, mediaItemId: ID!, attachmentType: String): Sermon`

## 6. Integration with Other Modules

-   **Uploads Module**: (As per MEMORY) Handles the actual file upload process to local storage or S3.
-   **Branch Management**: Content can be scoped by branch.
-   **Event & Calendar Management**: Linking sermons or media to specific events.
-   **Website Integration**: Provides content for the church's public website.
-   **Member Management**: Linking speakers to member profiles.

## 7. Security Considerations

-   **Copyright Management**: Ensuring the church has rights to distribute uploaded media.
-   **Access Control**: Differentiating between public content and internal-only resources.
-   **Storage Security**: Protecting media files in storage (e.g., S3 bucket policies).
-   Preventing upload of malicious files.

## 8. Future Considerations

-   Advanced video processing (e.g., automatic transcription, thumbnail generation).
-   Live streaming capabilities.
-   Podcast feed generation.
-   Digital rights management (DRM) for protected content.
-   Integration with content delivery networks (CDNs) for optimized delivery.

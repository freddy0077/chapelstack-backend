# Form Builder & Management Module (`forms.md`)

## 1. Overview

The Form Builder & Management module allows administrators or authorized staff to create custom forms for various purposes, such as event registrations, surveys, contact forms, volunteer sign-ups, or custom data collection. It provides a user-friendly interface to design forms, manage submissions, and view results.

Forms can be designed to be branch-specific or general.

## 2. Core Responsibilities

-   **Form Creation**: Providing a visual builder or structured interface to define form fields (e.g., text input, dropdown, checkboxes, radio buttons, date pickers, file uploads).
-   **Field Configuration**: Allowing customization of form fields, including labels, placeholders, validation rules (required, email format, min/max length), and conditional logic (show/hide fields based on other field values).
-   **Form Templates**: Potentially offering pre-built templates for common use cases.
-   **Submission Management**: Storing and organizing form submissions.
-   **Data Viewing & Export**: Allowing users to view submitted data in a table format and export it (e.g., to CSV).
-   **Notifications**: Sending email notifications to administrators or specific users upon form submission.
-   **Embedding & Linking**: Providing ways to embed forms on websites or share direct links to forms.
-   **Access Control**: Defining who can create forms and who can view submissions for specific forms.

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Include entities like `Form`, `FormField`, `FormSubmission`, `SubmissionValue`.)*

```typescript
// Example Placeholder Schema
model Form {
  id            String    @id @default(cuid())
  title         String
  description   String?
  branchId      String?   // Null if it's a global form
  // branch     Branch?   @relation(fields: [branchId], references: [id])
  createdById   String    // UserId of the creator
  // createdBy  User      @relation(fields: [createdById], references: [id])
  status        FormStatus @default(DRAFT) // DRAFT, PUBLISHED, ARCHIVED
  // fields     FormField[]
  // submissions FormSubmission[]
  publishedAt   DateTime?
  expiresAt     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum FormStatus {
  DRAFT
  PUBLISHED
  CLOSED // No longer accepting submissions
  ARCHIVED
}

model FormField {
  id          String    @id @default(cuid())
  formId      String
  // form     Form      @relation(fields: [formId], references: [id])
  label       String
  fieldType   FieldType // Enum: TEXT, TEXTAREA, EMAIL, NUMBER, DATE, SELECT, RADIO, CHECKBOX, FILE_UPLOAD
  options     Json?     // For SELECT, RADIO, CHECKBOX (e.g., [{label: "Option 1", value: "opt1"}])
  isRequired  Boolean   @default(false)
  placeholder String?
  validationRules Json? // e.g., {minLength: 5, regex: "^[A-Za-z]+$"}
  order       Int       // Display order of the field
  conditionalLogic Json? // e.g., {showIfField: "fieldId", hasValue: "someValue"}
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum FieldType {
  TEXT_INPUT
  TEXT_AREA
  EMAIL_INPUT
  NUMBER_INPUT
  DATE_PICKER
  SELECT_DROPDOWN
  RADIO_BUTTONS
  CHECKBOXES
  FILE_UPLOAD
  HEADING
  PARAGRAPH
}

model FormSubmission {
  id          String    @id @default(cuid())
  formId      String
  // form     Form      @relation(fields: [formId], references: [id])
  submittedAt DateTime  @default(now())
  submitterIp String?
  // submitterUserId String? // If submitted by a logged-in user
  // values   SubmissionValue[]
  branchId    String?   // Contextual branch of submission, if form is branch-specific
  // branch   Branch?   @relation(fields: [branchId], references: [id])
  createdAt   DateTime  @default(now())
}

model SubmissionValue {
  id             String    @id @default(cuid())
  submissionId   String
  // submission  FormSubmission @relation(fields: [submissionId], references: [id])
  fieldId        String    // Corresponds to FormField.id
  // formField   FormField @relation(fields: [fieldId], references: [id])
  value          Json      // Actual submitted value for the field
  createdAt      DateTime  @default(now())
}
```

## 4. Core Functionalities & Use Cases

-   Staff creates a new form for "Vacation Bible School Registration" with fields for child's name, age, allergies, and parent contact.
-   A member fills out a "Contact Us" form on the church website.
-   Admin views all submissions for the VBS registration form and exports the data to CSV.
-   A form is configured to send an email notification to the event coordinator upon each new VBS registration.
-   A simple survey form is created to gather feedback after a church event.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here.)*

### GraphQL (Example)

**Queries:**
-   `form(id: ID!): Form` (includes fields)
-   `forms(branchId: ID, filter: FormFilterInput): [Form!]`
-   `formSubmissions(formId: ID!, filter: SubmissionFilterInput, pagination: PaginationInput): [FormSubmission!]` (includes submission values)
-   `getPublicForm(formId: ID!): Form` // For rendering a form publicly, only includes published forms

**Mutations:**
-   `createForm(input: CreateFormInput!): Form`
-   `updateForm(id: ID!, input: UpdateFormInput!): Form` (allows adding/updating/deleting fields)
-   `publishForm(id: ID!): Form`
-   `closeForm(id: ID!): Form`
-   `submitForm(formId: ID!, values: [SubmissionValueInput!]!): FormSubmission`
-   `deleteFormSubmission(id: ID!): Boolean`
-   `deleteForm(id: ID!): Boolean`

## 6. Integration with Other Modules

-   **Event & Calendar Management**: Forms can be used for event registrations.
-   **Volunteer Management**: Forms for volunteer applications.
-   **Visitor Management**: Forms for guest cards or information capture.
-   **Communication Tools**: Sending notifications upon form submission.
-   **Website Integration**: Embedding forms on public-facing websites.
-   **Branch Management**: Forms can be scoped to specific branches.

## 7. Security Considerations

-   **Data Privacy**: Protecting sensitive information collected through forms (e.g., PII, health information).
-   **Spam Prevention**: Implementing measures like CAPTCHA to prevent spam submissions on public forms.
-   **Input Validation**: Robust server-side validation of submitted data to prevent injection attacks or data corruption.
-   **File Upload Security**: If file uploads are allowed, scanning files for malware and restricting file types/sizes.
-   Access control for viewing form submissions.

## 8. Future Considerations

-   More advanced form builder UI with drag-and-drop functionality.
-   Multi-page forms.
-   Payment integration for forms (e.g., event registration fees).
-   Workflow automation triggered by form submissions (e.g., creating a task, adding to a mailing list).
-   Analytics on form views and completion rates.

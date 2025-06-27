# Sacramental Records Module (`sacraments.md`)

## 1. Overview

The Sacramental Records module is dedicated to managing and preserving records of sacraments administered within the church. This includes baptisms, first communions, confirmations, marriages, and other significant religious rites. Accurate and accessible sacramental records are crucial for pastoral care and official church documentation.

These records are branch-specific, tied to the location where the sacrament was administered or where the member is primarily registered.

## 2. Core Responsibilities

-   **Recording Sacraments**: Capturing detailed information for each sacrament administered, including dates, locations, recipients, officiants, and witnesses/sponsors.
-   **Certificate Management**: Storing digital copies of sacramental certificates and potentially generating new certificates based on templates.
-   **Standardized Formats**: Ensuring sacramental records follow standardized formats as required by the church or diocese.
-   **Linkage to Member Profiles**: Connecting sacramental records to the respective member profiles.
-   **Search and Retrieval**: Allowing authorized personnel to search for and retrieve sacramental records.
-   **Privacy and Security**: Maintaining the confidentiality and integrity of sensitive sacramental data.

## 3. Key Entities & Data Models

*(Detail the Prisma/TypeORM entities or database schema here. Include entities like `SacramentalRecord`, `SacramentType`, etc. This might overlap or extend the `SpiritualMilestone` entity from the Members module, or be a distinct set of more formal records.)*

```typescript
// Example Placeholder Schema (could extend/formalize SpiritualMilestone)
model SacramentalRecord {
  id                String    @id @default(cuid())
  memberId          String
  // member         Member    @relation(fields: [memberId], references: [id])
  sacramentType     SacramentType // Enum: BAPTISM, FIRST_COMMUNION, CONFIRMATION, MARRIAGE, ORDINATION, ANOINTING_OF_SICK
  dateOfSacrament   DateTime
  locationOfSacrament String    // e.g., "St. Mary's Parish, Main Altar"
  officiantName     String    // Name of the priest/minister
  // officiantId    String?   // Optional link to User/Member if officiant is in system
  godparent1Name    String?   // For Baptism
  godparent2Name    String?   // For Baptism
  sponsorName       String?   // For Confirmation
  witness1Name      String?   // For Marriage
  witness2Name      String?   // For Marriage
  certificateNumber String?   @unique
  certificateUrl    String?   // Link to scanned certificate
  notes             String?
  branchId          String    // Branch where record is held or sacrament occurred
  // branch         Branch    @relation(fields: [branchId], references: [id])
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum SacramentType {
  BAPTISM
  EUCHARIST_FIRST_COMMUNION
  CONFIRMATION
  RECONCILIATION_FIRST
  ANOINTING_OF_THE_SICK
  HOLY_ORDERS_DIACONATE
  HOLY_ORDERS_PRIESTHOOD
  MATRIMONY
  RCIA_INITIATION
  OTHER
}
```

## 4. Core Functionalities & Use Cases

-   Parish secretary records a new baptism, including godparents and a scanned certificate.
-   A member requests a copy of their confirmation certificate; staff searches and retrieves the record.
-   A priest records a marriage, including witness information.
-   Generating an annual report of all sacraments administered in a branch.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here.)*

### GraphQL (Example)

**Queries:**
-   `sacramentalRecord(id: ID!): SacramentalRecord`
-   `listSacramentalRecords(memberId: ID, filter: SacramentalRecordFilterInput): [SacramentalRecord!]`
-   `sacramentsByMember(memberId: ID!): [SacramentalRecord!]`

**Mutations:**
-   `createSacramentalRecord(input: CreateSacramentalRecordInput!): SacramentalRecord`
-   `updateSacramentalRecord(id: ID!, input: UpdateSacramentalRecordInput!): SacramentalRecord`
-   `uploadSacramentalCertificate(recordId: ID!, file: Upload!): SacramentalRecord`
-   `deleteSacramentalRecord(id: ID!): Boolean`

## 6. Integration with Other Modules

-   **Member Management**: Directly links sacramental events to member profiles. Often, these are key spiritual milestones.
-   **Branch Management**: Records are scoped by branch.
-   **Content Management/Uploads**: For storing and managing scanned certificate files.

## 7. Security Considerations

-   **High Confidentiality**: Sacramental records are highly personal and often legally significant. Access must be strictly controlled.
-   **Data Integrity**: Ensuring records are accurate and cannot be tampered with.
-   **Long-term Preservation**: These records often need to be kept indefinitely.
-   Compliance with diocesan or canonical law regarding record keeping.

## 8. Future Considerations

-   Digital signature of certificates.
-   Direct integration with diocesan archives.
-   Workflow for requesting and issuing official copies of certificates.
-   Historical record importation.

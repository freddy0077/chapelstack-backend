# Comprehensive Member Seeder

This seeder creates 1000 comprehensive member records with all complements of membership data for robust testing and demonstration of the enhanced Member Management system.

## Overview

The Comprehensive Member Seeder generates realistic member data with complete profiles, family relationships, sacramental records, contributions, and all supporting entities. This enables thorough testing of the Member Management system's full capabilities and data integrity.

## What Gets Created

### 📊 **1000 Members with Complete Profiles**
- **Personal Information**: First, middle, last names, titles, gender, date of birth
- **Contact Information**: Email, phone, alternative phone, complete addresses
- **Demographics**: Marital status, occupation, employer, nationality, education
- **Family Information**: Father/mother names and occupations, emergency contacts
- **Church Information**: Membership dates, status, type, spiritual milestones
- **GDPR Compliance**: Consent dates, privacy levels, data retention settings
- **System Fields**: Member IDs, profile images, audit trails

### 👨‍👩‍👧‍👦 **Family Relationships**
- **Spouse Relationships**: Realistic marriage connections between members
- **Parent-Child Relationships**: Multi-generational family structures
- **Extended Family**: Siblings, relatives, and family networks
- **Relationship Metadata**: Start dates, active status, relationship types

### ⛪ **Sacramental Records**
- **Baptisms**: 80% of members have baptism records with dates, locations, ministers
- **Confirmations**: 60% of members have confirmation records
- **Marriages**: 40% of married members have marriage ceremony records
- **Realistic Timing**: Sacraments follow logical chronological order

### 💰 **Contribution History**
- **Multiple Contributions**: Each member has 1-12 contribution records
- **Diverse Methods**: Cash, check, card, bank transfer, mobile money
- **Various Types**: Tithes, offerings, special funds, building fund, missions
- **Realistic Amounts**: $25-$525 per contribution with proper currency

### 📞 **Communication Preferences**
- **Email Preferences**: Newsletter, events, reminders, prayer requests
- **SMS Settings**: Events, reminders, emergency notifications
- **Phone Preferences**: Call permissions, emergency contacts, preferred times
- **Physical Mail**: Traditional communication preferences
- **Push Notifications**: Mobile app notification settings

### 📈 **Member Analytics**
- **Attendance Metrics**: Total attendance, monthly averages, last attendance
- **Financial Analytics**: Total contributions, monthly averages, last contribution
- **Engagement Scores**: Participation levels, risk assessments
- **Ministry Involvement**: Volunteer hours, ministry participation counts
- **Communication Metrics**: Response rates, engagement tracking

### 🔍 **Search Index**
- **Optimized Search**: Pre-indexed names, phones, emails, addresses
- **Tagging System**: Occupation, status, demographic tags
- **Search Rankings**: Relevance scoring for efficient queries
- **Performance**: Fast search capabilities across large datasets

### 📋 **Membership History**
- **Status Changes**: Visitor → Member → Active Member progressions
- **Type Changes**: Child → Youth → Adult membership transitions
- **Change Tracking**: Dates, reasons, notes, responsible parties
- **Audit Trail**: Complete history of membership evolution

### 🔐 **Audit Trails**
- **Creation Records**: Who created each member and when
- **Change Tracking**: All modifications with timestamps
- **System Metadata**: IP addresses, user agents, action types
- **Compliance**: Full audit trail for data governance

## Realistic Data Distribution

### 📊 **Demographics**
- **Gender**: 52% female, 48% male (realistic church demographics)
- **Age Groups**: 
  - Children (5-22): 15%
  - Young Adults (23-42): 20%
  - Middle-aged (43-62): 30%
  - Seniors (63-87): 35%

### ⛪ **Membership Distribution**
- **Status**: 90% Active, 8% Inactive, 2% Transferred
- **Types**: Regular (70%), Senior (15%), Youth (8%), Child (5%), Clergy (2%)
- **Tenure**: New (30%), Recent (20%), Established (30%), Veterans (20%)

### 👪 **Family Structures**
- **Marital Status**: Realistic age-based distribution
- **Family Size**: 1-6 members per family unit
- **Relationships**: Spouse, parent-child, sibling connections
- **Household Heads**: 30% designated as head of household

## Usage

### Running the Seeder

```bash
# Navigate to backend directory
cd chapelstack-backend

# Run the comprehensive member seeder
npm run seed:comprehensive-members
```

### Alternative Methods

```bash
# Direct execution
ts-node src/database/seeders/run-comprehensive-seeder.ts

# Using the seeder class directly
ts-node -e "
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ComprehensiveMembersSeeder } from './src/database/seeders/comprehensive-members.seeder';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(ComprehensiveMembersSeeder);
  await seeder.seed();
  await app.close();
}
run();
"
```

## Prerequisites

### Database Setup
- PostgreSQL database running and accessible
- Prisma schema migrated and up to date
- Organization and branch records exist
- Super admin user exists for audit trails

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/chapelstack_local"
```

### Dependencies
- NestJS application context
- Prisma Client
- Member ID Generation Service
- All related modules properly imported

## Performance

### Execution Time
- **Batch Processing**: 50 members per batch for memory efficiency
- **Estimated Time**: 5-10 minutes for 1000 members
- **Memory Usage**: Optimized with batch processing
- **Database Load**: Distributed across multiple transactions

### Monitoring
The seeder provides real-time progress updates:
- Batch processing status
- Individual member creation confirmations
- Error reporting and handling
- Final summary statistics

## Testing Capabilities

### What You Can Test
- **Member List Views**: Large dataset performance
- **Search Functionality**: Complex queries across indexed data
- **Filtering Systems**: Multiple filter combinations
- **Family Relationships**: Parent-child, spouse connections
- **Analytics Dashboards**: Real engagement metrics
- **Communication Systems**: Preference-based messaging
- **Audit Trails**: Complete change tracking
- **Data Export**: Large dataset exports
- **Performance**: System behavior under load

### Validation
- **Data Integrity**: All relationships properly linked
- **Constraint Compliance**: Foreign keys, unique constraints
- **Business Rules**: Age-appropriate relationships, logical dates
- **GDPR Compliance**: Proper consent and privacy settings

## Troubleshooting

### Common Issues
1. **Missing Prerequisites**: Ensure organization/branch exist
2. **Database Permissions**: Verify write access to all tables
3. **Memory Issues**: Reduce batch size if needed
4. **Timeout Errors**: Increase database connection timeout

### Error Handling
- Individual member creation errors don't stop the entire process
- Detailed error logging for debugging
- Graceful handling of constraint violations
- Rollback capabilities for failed batches

## Data Cleanup

### Removing Seeded Data
```sql
-- WARNING: This will remove ALL seeded data
DELETE FROM audit_log WHERE user_agent = 'ComprehensiveMembersSeeder/1.0';
DELETE FROM member_search_index WHERE member_id IN (SELECT id FROM member WHERE email LIKE '%.%@example.com');
DELETE FROM member_analytics WHERE member_id IN (SELECT id FROM member WHERE email LIKE '%.%@example.com');
-- Continue for all related tables...
DELETE FROM member WHERE email LIKE '%.%@example.com';
```

### Selective Cleanup
Use the audit trail to identify and remove specific seeder runs based on timestamps and user agent strings.

## Integration

### Frontend Testing
The seeded data integrates seamlessly with:
- Member list and grid views
- Advanced search and filtering
- Family relationship displays
- Analytics dashboards
- Communication preference management
- Audit trail viewing

### API Testing
All GraphQL queries and mutations work with seeded data:
- `members` query with large datasets
- `searchMembers` with complex filters
- Member creation and updates
- Relationship management
- Analytics aggregation

## Conclusion

The Comprehensive Member Seeder provides a robust foundation for testing and demonstrating the full capabilities of the enhanced Member Management system. With 1000 realistic members and all supporting data, you can thoroughly validate system performance, user experience, and data integrity across all features.

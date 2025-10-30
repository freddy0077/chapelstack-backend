# Finance Module Migration Guide
## Step-by-Step Guide to Deploy Finance Accounting System

**Date:** 2025-10-27  
**Version:** 1.0  
**Environment:** Docker

---

## Prerequisites

- Docker and Docker Compose installed
- ChapelStack backend running
- Database backup completed
- Access to Docker commands

---

## Step 1: Backup Current Database

**CRITICAL: Always backup before migration!**

```bash
# From project root
make backup

# Or manually
docker-compose exec db pg_dump -U chapel chapel > backup_before_finance_$(date +%Y%m%d_%H%M%S).sql
```

---

## Step 2: Verify Schema Changes

The new finance module adds the following tables:
- `Account` - Chart of Accounts
- `JournalEntry` - Journal entry headers
- `JournalEntryLine` - Journal entry lines (DR/CR)
- `FiscalPeriod` - Fiscal period management
- `OfferingBatch` - Offering collection batches
- `OfferingType` - Offering type configuration

And adds to existing `Transaction` table:
- `journalEntryId` - Link to journal entry (backward compatibility)

---

## Step 3: Create Migration

```bash
# From project root
make migrate-create name=add_finance_module

# This will:
# 1. Generate migration files
# 2. Apply migration to database
# 3. Update Prisma client
```

**Alternative (if containers not running):**

```bash
# Start services first
make up

# Wait for services to be healthy
sleep 10

# Then create migration
make migrate-create name=add_finance_module
```

---

## Step 4: Verify Migration Success

```bash
# Check if tables were created
make shell-db

# In PostgreSQL shell:
\dt

# You should see new tables:
# - Account
# - JournalEntry
# - JournalEntryLine
# - FiscalPeriod
# - OfferingBatch
# - OfferingType

# Exit PostgreSQL
\q
```

---

## Step 5: Generate Prisma Client

```bash
# Generate updated Prisma client
make prisma-generate

# Restart backend to load new client
make restart-backend
```

---

## Step 6: Seed Default Chart of Accounts

Create a seeder file for default accounts:

```bash
# Access backend shell
make shell-backend

# Run seeder (we'll create this next)
npm run db:seed:finance

# Exit shell
exit
```

---

## Step 7: Verify Installation

```bash
# Check backend logs
make logs-backend

# Should see:
# - Prisma client generated
# - Migration applied successfully
# - No errors

# Access Prisma Studio to view new tables
make prisma-studio

# Opens at http://localhost:5555
```

---

## Rollback Procedure (If Needed)

If migration fails or you need to rollback:

```bash
# Stop services
make down

# Restore from backup
docker-compose up -d db
sleep 5
docker-compose exec -T db psql -U chapel chapel < backup_before_finance_YYYYMMDD_HHMMSS.sql

# Restart all services
make up
```

---

## Common Issues & Solutions

### Issue 1: Migration Fails - Unique Constraint

**Error:** `Unique constraint failed on the fields: (accountCode,organisationId,branchId)`

**Solution:**
```bash
# This is expected on first run - no data exists yet
# If you have existing data, ensure no duplicate account codes
```

### Issue 2: Prisma Client Not Updated

**Error:** `Property 'account' does not exist on type 'PrismaClient'`

**Solution:**
```bash
make prisma-generate
make restart-backend
```

### Issue 3: Container Not Running

**Error:** `Error: No container found for backend`

**Solution:**
```bash
# Check container status
make ps

# Start services if not running
make up

# Wait for health checks
sleep 10

# Try migration again
make migrate-create name=add_finance_module
```

### Issue 4: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
```bash
# Check database health
docker-compose ps db

# Restart database
docker-compose restart db

# Wait for it to be ready
sleep 5

# Try again
make migrate-create name=add_finance_module
```

---

## Post-Migration Tasks

### 1. Create Default Chart of Accounts

We'll create a seeder script next that will:
- Create default asset accounts (Cash, Mobile Money, Bank)
- Create default revenue accounts (Tithe, Offering, Harvest, Building Fund)
- Create default expense accounts (Utilities, Salaries, Ministry)
- Create default equity accounts (Net Assets)

### 2. Create Default Offering Types

Seed default offering types:
- Tithes
- General Offering
- Harvest Offering
- Building Fund
- Missions & Outreach
- Welfare/Benevolence
- Thanksgiving Offering
- First Fruit Offering

### 3. Set Up Fiscal Periods

Create fiscal periods for current year (2024-2025)

### 4. Test Journal Entry Creation

Create a test journal entry to verify system works

---

## Next Steps

After successful migration:

1. ✅ Database schema updated
2. ⏭️ Create seeder for default COA
3. ⏭️ Create seeder for offering types
4. ⏭️ Create seeder for fiscal periods
5. ⏭️ Build GraphQL resolvers
6. ⏭️ Build services (AccountService, JournalEntryService, OfferingService)
7. ⏭️ Create migration script for existing transactions
8. ⏭️ Build frontend components

---

## Verification Checklist

- [ ] Database backup completed
- [ ] Migration applied successfully
- [ ] New tables visible in database
- [ ] Prisma client generated
- [ ] Backend restarted without errors
- [ ] No breaking changes to existing APIs
- [ ] Transaction model still accessible
- [ ] Logs show no errors

---

## Support

If you encounter issues:

1. Check logs: `make logs-backend`
2. Check database: `make shell-db`
3. Review migration files in `prisma/migrations/`
4. Restore from backup if needed
5. Contact development team

---

**Migration Prepared By:** Finance Development Team  
**Last Updated:** 2025-10-27  
**Status:** Ready for Execution

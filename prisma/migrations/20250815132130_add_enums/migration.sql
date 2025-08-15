-- Migration: Add Gender and MembershipStatus enums, normalize data, and alter Member columns

-- 1) Create enums if they do not already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
    CREATE TYPE "Gender" AS ENUM ('MALE','FEMALE','UNKNOWN','NOT_SPECIFIED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MembershipStatus') THEN
    CREATE TYPE "MembershipStatus" AS ENUM ('VISITOR','REGULAR_ATTENDEE','MEMBER','ACTIVE_MEMBER','INACTIVE_MEMBER','TRANSFERRED','DECEASED');
  END IF;
END$$;

-- 2) Normalize and alter gender column when currently text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Member' AND column_name = 'gender' AND data_type = 'text'
  ) THEN
    -- Normalize existing values to valid enum members
    UPDATE "Member"
    SET gender = CASE
      WHEN gender IS NULL OR gender = '' THEN 'NOT_SPECIFIED'
      WHEN UPPER(gender) IN ('MALE','M') THEN 'MALE'
      WHEN UPPER(gender) IN ('FEMALE','F') THEN 'FEMALE'
      WHEN UPPER(gender) IN ('UNKNOWN','UNSPECIFIED','N/A','NA') THEN 'UNKNOWN'
      ELSE 'NOT_SPECIFIED'
    END;

    -- Alter column type to enum with explicit cast
    ALTER TABLE "Member"
      ALTER COLUMN gender TYPE "Gender" USING gender::text::"Gender";
  END IF;

  -- Ensure default is set
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Member' AND column_name = 'gender'
  ) THEN
    ALTER TABLE "Member" ALTER COLUMN gender SET DEFAULT 'NOT_SPECIFIED'::"Gender";
  END IF;
END$$;

-- 3) Normalize and alter membershipStatus column when currently text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Member' AND column_name = 'membershipStatus' AND data_type = 'text'
  ) THEN
    -- Normalize existing values to valid enum members
    UPDATE "Member"
    SET "membershipStatus" = CASE
      WHEN "membershipStatus" IS NULL OR "membershipStatus" = '' THEN 'VISITOR'
      WHEN UPPER("membershipStatus") IN ('VISITOR') THEN 'VISITOR'
      WHEN UPPER("membershipStatus") IN ('REGULAR_ATTENDEE','REGULAR ATTENDEE') THEN 'REGULAR_ATTENDEE'
      WHEN UPPER("membershipStatus") IN ('MEMBER') THEN 'MEMBER'
      WHEN UPPER("membershipStatus") IN ('ACTIVE_MEMBER','ACTIVE MEMBER') THEN 'ACTIVE_MEMBER'
      WHEN UPPER("membershipStatus") IN ('INACTIVE_MEMBER','INACTIVE MEMBER') THEN 'INACTIVE_MEMBER'
      WHEN UPPER("membershipStatus") IN ('TRANSFERRED') THEN 'TRANSFERRED'
      WHEN UPPER("membershipStatus") IN ('DECEASED') THEN 'DECEASED'
      ELSE 'VISITOR'
    END;

    -- Alter column type to enum with explicit cast
    ALTER TABLE "Member"
      ALTER COLUMN "membershipStatus" TYPE "MembershipStatus" USING "membershipStatus"::text::"MembershipStatus";
  END IF;

  -- Ensure default is set
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Member' AND column_name = 'membershipStatus'
  ) THEN
    ALTER TABLE "Member" ALTER COLUMN "membershipStatus" SET DEFAULT 'VISITOR'::"MembershipStatus";
  END IF;
END$$;

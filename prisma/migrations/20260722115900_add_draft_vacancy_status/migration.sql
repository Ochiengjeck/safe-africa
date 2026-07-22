-- AlterEnum
-- Added in its own migration so the new value is committed before it is
-- referenced as a column default (Postgres forbids using a new enum value in
-- the same transaction it is added).
ALTER TYPE "VacancyStatus" ADD VALUE 'DRAFT';

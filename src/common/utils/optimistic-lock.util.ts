import { BadRequestException, ConflictException } from '@nestjs/common';

/**
 * Optimistic Locking Utility
 * Prevents concurrent update conflicts using version numbers
 */

export interface OptimisticLockOptions {
  entityName: string;
  currentVersion?: number;
  expectedVersion?: number;
}

/**
 * Validate optimistic lock before update
 * Throws ConflictException if versions don't match
 */
export function validateOptimisticLock(options: OptimisticLockOptions): void {
  const { entityName, currentVersion, expectedVersion } = options;

  if (expectedVersion === undefined) {
    // No version check requested
    return;
  }

  if (currentVersion === undefined) {
    throw new BadRequestException(`${entityName} does not support versioning`);
  }

  if (currentVersion !== expectedVersion) {
    throw new ConflictException(
      `${entityName} has been modified by another user. ` +
      `Expected version: ${expectedVersion}, Current version: ${currentVersion}. ` +
      `Please refresh and try again.`
    );
  }
}

/**
 * Increment version for update
 */
export function incrementVersion(currentVersion: number): number {
  return currentVersion + 1;
}

/**
 * Build optimistic lock update data
 * Returns update object with incremented version
 */
export function buildOptimisticLockUpdate(
  currentVersion: number,
  updateData: any
): any {
  return {
    ...updateData,
    version: incrementVersion(currentVersion),
  };
}

/**
 * Optimistic lock wrapper for Prisma updates
 * Usage:
 * 
 * const result = await withOptimisticLock(
 *   prisma.journalEntry,
 *   id,
 *   expectedVersion,
 *   { status: 'POSTED', postedBy: userId },
 *   'Journal Entry'
 * );
 */
export async function withOptimisticLock<T>(
  model: any,
  id: string,
  expectedVersion: number | undefined,
  updateData: any,
  entityName: string
): Promise<T> {
  // Get current record
  const current = await model.findUnique({
    where: { id },
    select: { version: true },
  });

  if (!current) {
    throw new BadRequestException(`${entityName} not found`);
  }

  // Validate version
  validateOptimisticLock({
    entityName,
    currentVersion: current.version,
    expectedVersion,
  });

  // Update with incremented version
  const result = await model.update({
    where: {
      id,
      version: current.version, // Ensure version hasn't changed
    },
    data: buildOptimisticLockUpdate(current.version, updateData),
  });

  if (!result) {
    throw new ConflictException(
      `${entityName} was modified by another user. Please refresh and try again.`
    );
  }

  return result;
}

/**
 * Check if entity has been modified since last read
 */
export async function hasBeenModified(
  model: any,
  id: string,
  expectedVersion: number
): Promise<boolean> {
  const current = await model.findUnique({
    where: { id },
    select: { version: true },
  });

  if (!current) {
    return true; // Entity doesn't exist
  }

  return current.version !== expectedVersion;
}

/**
 * Get current version of entity
 */
export async function getCurrentVersion(
  model: any,
  id: string
): Promise<number | null> {
  const current = await model.findUnique({
    where: { id },
    select: { version: true },
  });

  return current?.version ?? null;
}

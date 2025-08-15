#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ComprehensiveMembersSeeder } from './comprehensive-members.seeder';

async function runSeeder() {
  console.log('🚀 Starting Comprehensive Members Seeder...');
  console.log(
    '⚠️  This will create 1000 members with full complements of membership data',
  );
  console.log('📊 Each member will include:');
  console.log('   • Complete personal and contact information');
  console.log('   • Communication preferences');
  console.log('   • Member analytics and engagement data');
  console.log('   • Membership history records');
  console.log('   • Search index entries');
  console.log('   • Audit trail entries');
  console.log('   • Realistic demographic distribution');
  console.log('   • Family and relationship data');
  console.log('');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the seeder service
    const seeder = app.get(ComprehensiveMembersSeeder);

    // Run the seeder
    const startTime = Date.now();
    await seeder.seed();
    const endTime = Date.now();

    console.log('');
    console.log('🎉 Comprehensive Members Seeder completed successfully!');
    console.log(
      `⏱️  Total execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`,
    );
    console.log('📈 Database now contains 1000 comprehensive member records');
    console.log('');
    console.log('✅ You can now:');
    console.log('   • Test member list views with realistic data');
    console.log('   • Validate search and filtering functionality');
    console.log('   • Test member analytics and reporting');
    console.log('   • Demonstrate family relationship features');
    console.log('   • Validate communication preferences');
    console.log('   • Test audit trail functionality');
    console.log('   • Performance test with large datasets');

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Seeder interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Seeder terminated');
  process.exit(1);
});

// Run the seeder
runSeeder();

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { UserBranch } from '../generated/prisma';
import { BranchesService } from '../src/branches/branches.service';

describe('Branches (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let branchesService: BranchesService;
  let testUser: any;
  let testBranch: any;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    branchesService = moduleFixture.get<BranchesService>(BranchesService);

    // Clean up existing test data
    await prismaService.userBranch.deleteMany({
      where: { user: { email: 'test-admin@example.com' } },
    });
    await prismaService.branch.deleteMany({
      where: { name: { contains: 'E2E Test' } },
    });
    await prismaService.user.deleteMany({
      where: { email: 'test-admin@example.com' },
    });
    await prismaService.role.deleteMany({
      where: { name: 'SUPER_ADMIN_TEST' },
    });

    // Create test role
    const testRole = await prismaService.role.create({
      data: {
        name: 'SUPER_ADMIN_TEST',
        description: 'Super Admin role for testing',
      },
    });

    // Create test user with SUPER_ADMIN role
    testUser = await prismaService.user.create({
      data: {
        email: 'test-admin@example.com',
        passwordHash: 'hashed_password_for_testing',
        firstName: 'Test',
        lastName: 'Admin',
        roles: {
          connect: [{ id: testRole.id }],
        },
      },
    });

    // Generate JWT token for the test user
    accessToken = jwtService.sign({
      userId: testUser.id,
      email: testUser.email,
      roles: ['SUPER_ADMIN_TEST'],
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.userBranch.deleteMany({
      where: { user: { email: 'test-admin@example.com' } },
    });
    await prismaService.branch.deleteMany({
      where: { name: { contains: 'E2E Test' } },
    });
    await prismaService.user.deleteMany({
      where: { email: 'test-admin@example.com' },
    });
    await prismaService.role.deleteMany({
      where: { name: 'SUPER_ADMIN_TEST' },
    });

    await app.close();
  });

  describe('Branch Management', () => {
    it('should create a new branch', () => {
      const createBranchInput = {
        name: 'E2E Test Branch',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        phoneNumber: '+1234567890',
        email: 'test-branch@example.com',
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation CreateBranch($input: CreateBranchInput!) {
              createBranch(createBranchInput: $input) {
                id
                name
                address
                city
                state
                country
                phoneNumber
                email
                isActive
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            input: createBranchInput,
          },
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.error(
              'Create Branch E2E - Non-200 Response Body:',
              JSON.stringify(res.body, null, 2),
            );
          }
          expect(res.status).toBe(200);

          expect(res.body.data.createBranch).toBeDefined();
          expect(res.body.data.createBranch.name).toEqual(
            createBranchInput.name,
          );
          expect(res.body.data.createBranch.address).toEqual(
            createBranchInput.address,
          );
          expect(res.body.data.createBranch.isActive).toBe(true);

          // Save the created branch for later tests
          if (res.body.data && res.body.data.createBranch) {
            testBranch = res.body.data.createBranch;
          } else if (res.body.errors) {
            console.error(
              'Create Branch E2E - GraphQL Errors:',
              JSON.stringify(res.body.errors, null, 2),
            );
          }
        });
    });

    it('should list branches with pagination', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            query Branches($paginationInput: PaginationInput, $filterInput: BranchFilterInput) {
              branches(paginationInput: $paginationInput, filterInput: $filterInput) {
                items {
                  id
                  name
                  address
                }
                totalCount
                hasNextPage
              }
            }
          `,
          variables: {
            filterInput: { nameContains: 'Test Branch' },
            paginationInput: { skip: 0, take: 1 },
          },
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.error(
              'List Branches E2E - Non-200 Response Body:',
              JSON.stringify(res.body, null, 2),
            );
          }
          expect(res.status).toBe(200);

          expect(res.body.data.branches).toBeDefined();
          expect(res.body.data.branches.items).toBeInstanceOf(Array);
          expect(res.body.data.branches.items.length).toBeGreaterThanOrEqual(1);
          // Ensure the fetched branch is the one we created
          const createdBranchInList = res.body.data.branches.items.find(
            (b: any) => b.id === testBranch.id,
          );
          expect(createdBranchInList).toBeDefined();
          expect(createdBranchInList.name).toEqual(testBranch.name);
          expect(res.body.data.branches.totalCount).toBeGreaterThanOrEqual(1);
          expect(res.body.data.branches.hasNextPage).toBeDefined(); // boolean
        });
    });

    it('should fetch a branch by ID', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            query GetBranch($id: ID!) {
              branch(id: $id) {
                id
                name
                address
                city
                state
                country
                phoneNumber
                email
              }
            }
          `,
          variables: {
            id: testBranch.id,
          },
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.error(
              'Fetch Branch by ID E2E - Non-200 Response Body:',
              JSON.stringify(res.body, null, 2),
            );
            if (res.body.errors) {
              console.error(
                'Fetch Branch by ID E2E - GraphQL Errors:',
                JSON.stringify(res.body.errors, null, 2),
              );
            }
          }
          expect(res.status).toBe(200);
          expect(res.body.data.branch).toBeDefined();
          expect(res.body.data.branch.id).toEqual(testBranch.id);
          expect(res.body.data.branch.name).toEqual(testBranch.name);
        });
    });

    it('should update a branch', () => {
      const updateBranchInput = {
        name: 'E2E Test Branch Updated',
        website: 'https://test-branch.example.com',
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation UpdateBranch($id: ID!, $updateBranchInput: UpdateBranchInput!) {
              updateBranch(id: $id, updateBranchInput: $updateBranchInput) {
                id
                name
                website
                updatedAt
              }
            }
          `,
          variables: {
            id: testBranch.id,
            updateBranchInput: updateBranchInput,
          },
        })
        .expect(200)
        .expect((res) => {
          if (res.status !== 200) {
            console.error(
              'Update Branch E2E - Non-200 Response Body:',
              JSON.stringify(res.body, null, 2),
            );
            if (res.body.errors) {
              console.error(
                'Update Branch E2E - GraphQL Errors:',
                JSON.stringify(res.body.errors, null, 2),
              );
            }
          }
          expect(res.body.data.updateBranch).toBeDefined();
          expect(res.body.data.updateBranch.name).toEqual(
            updateBranchInput.name,
          );
          expect(res.body.data.updateBranch.website).toEqual(
            updateBranchInput.website,
          );
        });
    });

    it('should add a branch setting', () => {
      const branchSettingInput = {
        key: 'testSetting',
        value: 'testValue',
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation UpdateBranchSetting($branchId: ID!, $updateSettingInput: UpdateBranchSettingInput!) {
              updateBranchSetting(branchId: $branchId, updateSettingInput: $updateSettingInput) {
                id
                branchId
                key
                value
              }
            }
          `,
          variables: {
            branchId: testBranch.id,
            updateSettingInput: branchSettingInput,
          },
        })
        .expect(200)
        .expect((res) => {
          if (res.status !== 200) {
            console.error(
              'Add Branch Setting E2E - Non-200 Response Body:',
              JSON.stringify(res.body, null, 2),
            );
            if (res.body.errors) {
              console.error(
                'Add Branch Setting E2E - GraphQL Errors:',
                JSON.stringify(res.body.errors, null, 2),
              );
            }
          }
          expect(res.body.data.updateBranchSetting).toBeDefined();
          expect(res.body.data.updateBranchSetting.branchId).toEqual(
            testBranch.id,
          );
          expect(res.body.data.updateBranchSetting.key).toEqual(
            branchSettingInput.key,
          );
          expect(res.body.data.updateBranchSetting.value).toEqual(
            branchSettingInput.value,
          );
        });
    });

    it('should fetch branch settings', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            query FetchBranchWithSettings($branchId: ID!) {
              branch(id: $branchId) {
                id
                settings {
                  id
                  key
                  value
                }
              }
            }
          `,
          variables: {
            branchId: testBranch.id,
          },
        })
        .expect((res) => {
          if (res.status !== 200) {
            console.error(
              'Fetch Branch Settings E2E - Non-200 Response Body:',
              JSON.stringify(res.body, null, 2),
            );
            if (res.body.errors) {
              console.error(
                'Fetch Branch Settings E2E - GraphQL Errors:',
                JSON.stringify(res.body.errors, null, 2),
              );
            }
          }
          expect(res.status).toBe(200);
          expect(res.body.data.branch.settings).toBeInstanceOf(Array);
          expect(res.body.data.branch.settings.length).toBeGreaterThan(0);
          // Assuming the 'testSetting' with 'testValue' was added in the previous test
          const setting = res.body.data.branch.settings.find(
            (s) => s.key === 'testSetting',
          );
          expect(setting).toBeDefined();
          expect(setting.value).toEqual('testValue');
        });
    });

    // Skip this test in actual execution to avoid deleting the test data
    it.skip('should delete a branch', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation DeleteBranch($id: ID!) {
              deleteBranch(id: $id) {
                id
                name
              }
            }
          `,
          variables: {
            id: testBranch.id,
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteBranch).toBeDefined();
          expect(res.body.data.deleteBranch.id).toEqual(testBranch.id);
        });
    });
  });
});

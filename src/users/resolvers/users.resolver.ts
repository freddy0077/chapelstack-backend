import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Field, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { CreateUsersWithRoleInput } from '../dto/create-users-with-role.input';

@ObjectType()
class CreatedUserResult {
  @Field()
  email: string;
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  roleName: string;
  @Field({ nullable: true })
  id?: string;
  @Field({ nullable: true })
  error?: string;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => [CreatedUserResult])
  async createUsersWithRole(
    @Args('input') input: CreateUsersWithRoleInput,
  ): Promise<CreatedUserResult[]> {
    const results: CreatedUserResult[] = [];
    for (const userInput of input.users) {
      try {
        const role = await this.prisma.role.findFirst({
          where: { name: userInput.roleName },
        });

        if (!role) {
          throw new Error(`Role '${userInput.roleName}' not found.`);
        }

        const saltRounds = 10;
        const passwordHash: string = await bcrypt.hash(
          userInput.password,
          saltRounds,
        );

        const user = await this.prisma.user.create({
          data: {
            email: userInput.email,
            passwordHash,
            firstName: userInput.firstName,
            lastName: userInput.lastName,
            roles: { connect: { id: role.id } },
            organisation: { connect: { id: input.organisationId } },
            userBranches: userInput.branchId
              ? {
                  create: {
                    branch: { connect: { id: userInput.branchId } },
                    role: { connect: { id: role.id } },
                  },
                }
              : undefined,
            member: {
              create: {
                firstName: userInput.firstName,
                lastName: userInput.lastName,
                email: userInput.email,
                organisation: { connect: { id: input.organisationId } },
                branch: userInput.branchId
                  ? { connect: { id: userInput.branchId } }
                  : undefined,
                gender: 'UNKNOWN',
              },
            },
          },
        });

        results.push({
          id: user.id,
          email: userInput.email,
          firstName: userInput.firstName,
          lastName: userInput.lastName,
          roleName: userInput.roleName,
        });
      } catch (e) {
        if (e instanceof Error) {
          results.push({
            email: userInput.email,
            firstName: userInput.firstName,
            lastName: userInput.lastName,
            roleName: userInput.roleName,
            error: e.message,
          });
        } else {
          results.push({
            email: userInput.email,
            firstName: userInput.firstName,
            lastName: userInput.lastName,
            roleName: userInput.roleName,
            error: String(e),
          });
        }
      }
    }
    return results;
  }
}

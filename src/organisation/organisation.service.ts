import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganisationInput } from './dto/create-organisation.input';
import { UpdateOrganisationInput } from './dto/update-organisation.input';

@Injectable()
export class OrganisationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organisation.findMany();
  }

  async findOne(id: string) {
    return this.prisma.organisation.findUnique({ where: { id } });
  }

  async create(input: CreateOrganisationInput) {
    // Map only fields that exist in the Prisma Organisation model
    return this.prisma.organisation.create({
      data: {
        name: input.name,
        email: input.email,
        phoneNumber: input.phoneNumber,
        website: input.website,
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country,
        zipCode: input.zipCode,
        denomination: input.denomination,
        foundingYear: input.foundingYear,
        size: input.size,
        vision: input.vision,
        missionStatement: input.missionStatement,
        description: input.description,
        timezone: input.timezone,
        currency: input.currency,
        primaryColor: input.primaryColor ?? '',
        secondaryColor: input.secondaryColor ?? '',
      },
    });
  }

  async update(id: string, input: UpdateOrganisationInput) {
    return this.prisma.organisation.update({ where: { id }, data: input });
  }

  async delete(id: string) {
    await this.prisma.organisation.delete({ where: { id } });
    return true;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';
import { CreateCategoryInput } from '../dto/create-category.input';
import { UpdateCategoryInput } from '../dto/update-category.input';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    const data: Prisma.CategoryCreateInput = {
      name: createCategoryInput.name,
    };

    return this.prisma.category.create({ data });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(
    id: string,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    // Check if category exists
    const existingCategory = await this.findOne(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const data: Prisma.CategoryUpdateInput = {
      name: updateCategoryInput.name,
    };

    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Category> {
    // Check if category exists
    const existingCategory = await this.findOne(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.delete({ where: { id } });
  }
}

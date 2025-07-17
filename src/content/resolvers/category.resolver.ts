import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CategoryService } from '../services/category.service';
import { CategoryEntity } from '../entities/category.entity';
import { CreateCategoryInput } from '../dto/create-category.input';
import { UpdateCategoryInput } from '../dto/update-category.input';

@Resolver(() => CategoryEntity)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Mutation(() => CategoryEntity)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ): Promise<CategoryEntity> {
    const category = await this.categoryService.create(createCategoryInput);
    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  @Query(() => [CategoryEntity])
  async categories(): Promise<CategoryEntity[]> {
    // Convert Date fields to string to match CategoryEntity
    const categories = await this.categoryService.findAll();
    return categories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  @Query(() => CategoryEntity, { nullable: true })
  async category(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CategoryEntity | null> {
    const c = await this.categoryService.findOne(id);
    return c
      ? {
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }
      : null;
  }

  @Mutation(() => CategoryEntity)
  async updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ): Promise<CategoryEntity> {
    const category = await this.categoryService.update(
      updateCategoryInput.id,
      updateCategoryInput,
    );
    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  @Mutation(() => CategoryEntity)
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CategoryEntity> {
    const category = await this.categoryService.remove(id);
    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

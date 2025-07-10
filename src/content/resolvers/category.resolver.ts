import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { CategoryService } from '../services/category.service';
import { CategoryEntity } from '../entities/category.entity';

@Resolver(() => CategoryEntity)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

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
}

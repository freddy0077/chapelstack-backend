import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IPaginatedType<T> {
  dataXXX: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function PaginatedResponseDto<TItem>(
  TItemClass: Type<TItem>,
): Type<IPaginatedType<TItem>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<TItem> {
    @Field(() => [TItemClass])
    dataXXX: TItem[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    pageSize: number;

    @Field(() => Int)
    totalPages: number;
  }
  return PaginatedType as Type<IPaginatedType<TItem>>;
}

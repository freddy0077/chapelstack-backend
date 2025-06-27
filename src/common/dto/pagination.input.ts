import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to skip',
    defaultValue: 0,
  })
  @IsOptional()
  @Min(0)
  skip?: number = 0;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to take (limit)',
    defaultValue: 10,
  })
  @IsOptional()
  @Min(1)
  take?: number = 10;
}

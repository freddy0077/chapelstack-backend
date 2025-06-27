import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImportError {
  @Field()
  row: number;

  @Field()
  column: string;

  @Field()
  message: string;
}

@ObjectType()
export class ImportResult {
  @Field()
  success: boolean;

  @Field()
  totalRecords: number;

  @Field()
  importedRecords: number;

  @Field(() => [ImportError], { nullable: true })
  errors?: ImportError[];

  @Field({ nullable: true })
  message?: string;
}

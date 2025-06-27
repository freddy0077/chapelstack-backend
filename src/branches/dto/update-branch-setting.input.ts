import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateBranchSettingInput {
  @Field({
    description:
      'The key of the setting to update. e.g., "defaultCurrency", "timezone"',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  key: string;

  @Field({
    description: 'The new value for the setting.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255) // Adjust as needed for expected setting value lengths
  value: string;
}

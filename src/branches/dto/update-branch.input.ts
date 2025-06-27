import { InputType, PartialType } from '@nestjs/graphql';
import { CreateBranchInput } from './create-branch.input';

@InputType()
export class UpdateBranchInput extends PartialType(CreateBranchInput) {
  // ID is not part of CreateBranchInput, but needed for updates.
  // It will be passed as a separate GQL argument, not in this input object for the mutation typically.
  // However, if you prefer it in the input, you can add it here.
}

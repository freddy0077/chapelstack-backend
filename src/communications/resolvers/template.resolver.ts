import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TemplateService } from '../services/template.service';
import { CreateEmailTemplateInput } from '../dto/create-email-template.input';
import { UpdateEmailTemplateInput } from '../dto/update-email-template.input';
import { EmailTemplateDto } from '../dto/email-template.dto';

@Resolver(() => EmailTemplateDto)
export class TemplateResolver {
  constructor(private readonly templateService: TemplateService) {}

  @Query(() => [EmailTemplateDto])
  async templates(
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<EmailTemplateDto[]> {
    return this.templateService.getTemplates(branchId, organisationId);
  }

  @Query(() => EmailTemplateDto)
  async template(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EmailTemplateDto> {
    return this.templateService.getTemplate(id);
  }

  @Mutation(() => EmailTemplateDto)
  async createTemplate(
    @Args('input') input: CreateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    return this.templateService.createTemplate(input);
  }

  @Mutation(() => EmailTemplateDto)
  async updateTemplate(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    return this.templateService.updateTemplate(id, input);
  }

  @Mutation(() => Boolean)
  async deleteTemplate(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.templateService.deleteTemplate(id);
  }
}

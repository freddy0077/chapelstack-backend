import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EmailService } from '../services/email.service';
import { SendEmailInput } from '../dto/send-email.input';
import { EmailMessageDto } from '../dto/email-message.dto';
import { CreateEmailTemplateInput } from '../dto/create-email-template.input';
import { UpdateEmailTemplateInput } from '../dto/update-email-template.input';
import { EmailTemplateDto } from '../dto/email-template.dto';

@Resolver(() => EmailMessageDto)
export class EmailResolver {
  constructor(private readonly emailService: EmailService) {}

  @Mutation(() => Boolean)
  async sendEmail(@Args('input') input: SendEmailInput): Promise<boolean> {
    return this.emailService.sendEmail(input);
  }

  @Query(() => [EmailMessageDto])
  async emails(
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<EmailMessageDto[]> {
    return this.emailService.getEmails(branchId, organisationId);
  }

  @Query(() => EmailMessageDto)
  async emailById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EmailMessageDto> {
    return this.emailService.getEmailById(id);
  }

  @Query(() => [EmailTemplateDto])
  async templates(
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<EmailTemplateDto[]> {
    return this.emailService.getEmailTemplates(branchId, organisationId);
  }

  @Query(() => EmailTemplateDto)
  async template(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EmailTemplateDto> {
    return this.emailService.getEmailTemplate(id);
  }

  @Mutation(() => EmailTemplateDto)
  async createEmailTemplate(
    @Args('input') input: CreateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    return this.emailService.createEmailTemplate(input);
  }

  @Mutation(() => EmailTemplateDto)
  async updateEmailTemplate(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmailTemplateInput,
  ): Promise<EmailTemplateDto> {
    return this.emailService.updateEmailTemplate(id, input);
  }

  @Mutation(() => Boolean)
  async deleteEmailTemplate(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.emailService.deleteEmailTemplate(id);
  }
}

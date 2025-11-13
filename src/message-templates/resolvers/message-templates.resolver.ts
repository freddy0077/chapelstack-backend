import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MessageTemplatesService } from '../services/message-templates.service';
import { MessageTemplate } from '../entities/message-template.entity';
import { CreateMessageTemplateInput } from '../dto/create-message-template.input';
import { UpdateMessageTemplateInput } from '../dto/update-message-template.input';
import { MessageTemplateFiltersInput } from '../dto/message-template-filters.input';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import GraphQLJSON from 'graphql-type-json';

@Resolver(() => MessageTemplate)
@UseGuards(GqlAuthGuard)
export class MessageTemplatesResolver {
  constructor(private messageTemplatesService: MessageTemplatesService) {}

  @Query(() => [MessageTemplate], { name: 'messageTemplates' })
  async getMessageTemplates(
    @CurrentUser() user: any,
    @Args('filters', { type: () => MessageTemplateFiltersInput, nullable: true })
    filters?: MessageTemplateFiltersInput,
  ): Promise<MessageTemplate[]> {
    return this.messageTemplatesService.findAll(
      user.organisationId,
      user.branchId,
      filters,
    );
  }

  @Query(() => MessageTemplate, { name: 'messageTemplate' })
  async getMessageTemplate(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MessageTemplate> {
    return this.messageTemplatesService.findOne(id, user.organisationId);
  }

  @Mutation(() => MessageTemplate)
  async createMessageTemplate(
    @CurrentUser() user: any,
    @Args('input') input: CreateMessageTemplateInput,
  ): Promise<MessageTemplate> {
    return this.messageTemplatesService.create(
      input,
      user.organisationId,
      user.branchId,
      user.id,
    );
  }

  @Mutation(() => MessageTemplate)
  async updateMessageTemplate(
    @CurrentUser() user: any,
    @Args('input') input: UpdateMessageTemplateInput,
  ): Promise<MessageTemplate> {
    return this.messageTemplatesService.update(input, user.organisationId);
  }

  @Mutation(() => GraphQLJSON)
  async deleteMessageTemplate(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.messageTemplatesService.delete(id, user.organisationId);
  }

  @Mutation(() => MessageTemplate)
  async duplicateMessageTemplate(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MessageTemplate> {
    return this.messageTemplatesService.duplicate(
      id,
      user.organisationId,
      user.id,
    );
  }
}

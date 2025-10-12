import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SmsService } from '../services/sms.service';
import { SendSmsInput } from '../dto/send-sms.input';
import { SmsMessageDto } from '../dto/sms-message.dto';
import { SendMessageResponse } from '../dto/send-message-response.dto';

@Resolver(() => SmsMessageDto)
export class SmsResolver {
  constructor(private readonly smsService: SmsService) {}

  @Mutation(() => Boolean)
  async sendSms(@Args('input') input: SendSmsInput): Promise<boolean> {
    return this.smsService.sendSms(input);
  }

  @Mutation(() => SendMessageResponse)
  async sendSmsWithTracking(
    @Args('input') input: SendSmsInput,
  ): Promise<SendMessageResponse> {
    return this.smsService.sendSmsWithTracking(input);
  }

  @Query(() => [SmsMessageDto])
  async sms(
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<SmsMessageDto[]> {
    return this.smsService.getSms(branchId, organisationId);
  }

  @Query(() => SmsMessageDto)
  async smsById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SmsMessageDto> {
    return this.smsService.getSmsMessage(id);
  }
}

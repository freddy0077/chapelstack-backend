import { Injectable } from '@nestjs/common';
import { SendNotificationInput } from './interfaces';
import { DispatcherService } from './services/dispatcher.service';

@Injectable()
export class NotificationsFacade {
  constructor(private readonly dispatcher: DispatcherService) {}

  async send(input: SendNotificationInput) {
    return this.dispatcher.send(input);
  }
}

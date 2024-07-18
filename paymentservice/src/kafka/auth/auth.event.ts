import { Inject, Injectable } from "@nestjs/common";
import { ClientKafka, Payload } from "@nestjs/microservices";

@Injectable()
export class AuthEvent {
  constructor(@Inject('AUTH_KAFKA_PRODUCER') private readonly _authClient: ClientKafka) {}

  async onModuleInit() {
    this._authClient.subscribeToResponseOf('get-jwt-auth.auth');
    await this._authClient.connect();
  }

  async getUserAuth(@Payload() message: { token: string }) {
    return this._authClient.send('get-jwt-auth.auth', message);
  }
}
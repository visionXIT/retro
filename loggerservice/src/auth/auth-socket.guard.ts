import { Injectable } from "@nestjs/common";
import { AuthEvent } from "kafka/auth/auth.event";
import { lastValueFrom } from "rxjs";
import { Socket } from "socket.io";
import { DEBUG, DEBUG_USER } from "utils/env";

@Injectable()
export class AuthGuard {
  constructor(private _authEvent: AuthEvent) {}

  async checkUserAuth(client: Socket) {
    if (DEBUG) {
      return DEBUG_USER;
    }
    const token = this.extractTokenFromHeader(client);
    if (!token) {
      client.emit('message', 'User is not authorized');
      client.disconnect();
      return;
    }
    let jwtUser;
    try {
      jwtUser = await lastValueFrom(
        await this._authEvent.getUserAuth({token})
      );
    } catch (error: unknown) {
      console.log(error);
      client.emit('message', 'Oops, a server error occured');
      client.disconnect();
      return;
    }

    if (!jwtUser) {
      client.emit('message', 'User session expired');
      client.disconnect();
      return;
    }
    client.data.userId = jwtUser.userId;

    return jwtUser.userId;
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const [type, token] = client.handshake?.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";


@Injectable()
export class WsGuard implements CanActivate {

    constructor(private jwtService: JwtService){}


    //in authguard i defined this method at the botttom
    private extractTokenFromHeader(client: Socket): string | undefined {

        const authHeader = client.handshake.headers.authorization;
        if(!authHeader) return undefined;
        const [type,token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
        
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // raw socket.io connection object instead of http request
        //request object in http is similar to getClient in WS
        const client: Socket = context.switchToWs().getClient(); 

        //extract token, socketio sends it in the 'auth' object during connection
        const token = client.handshake.auth?.token || this.extractTokenFromHeader(client);

        if(!token){
            throw new UnauthorizedException('No token provided for Websocket');
        }

        try{
            const payload = await this.jwtService.verifyAsync(token);

            client['user'] = payload;
            return true;
        } catch{
            throw new UnauthorizedException('Invalid WebSocket token');
        }

    }
    
}
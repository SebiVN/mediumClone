import { configuration } from '@app/configuration';
import { ExpressRequest } from '@app/types/expressRequest.interface';
import { UserService } from '@app/user/user.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];

    try {
      console.log(configuration().jwt.secret);
      const decodeToken = verify(token, configuration().jwt.secret);
      const user = await this.userService.findById(decodeToken.id);
      req.user = user;
      next();
      return;
    } catch {
      next();
      req.user = null;
    }
  }
}

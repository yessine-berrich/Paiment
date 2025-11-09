import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;

    console.log(`📥 Request: ${method} ${url}`);

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(`📤 Response Status: ${response.statusCode} | Time: ${Date.now() - now}ms`);
      }),
      map((data) => {
        // Si la réponse contient un user, on retire le mot de passe
        if (data && data.user) {
          const { password, ...userWithoutPassword } = data.user;
          return { ...data, user: userWithoutPassword };
        }

        // Sinon, on retourne la réponse telle quelle
        return data;
      }),
    );
  }
}

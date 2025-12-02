import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { authService } from './auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: authService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // callbackURL: 'http://localhost:3000/auth/github/callback',//[back] é pra onde redireciona depois de autenticar 
      callbackURL: 'https://two025-2-guiadev.onrender.com/auth/github/callback',//é pra onde redireciona depois de autenticar 
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, username, photos, emails } = profile;
    const user = {
      githubId: id,
      username,
      email: emails?.[0]?.value,
      avatar: photos?.[0]?.value,
    };
    return this.authService.validateOAuthUser(user);
  }
}

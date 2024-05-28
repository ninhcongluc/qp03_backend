import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../modules/user/user.model';
import AppDataSource from './connect-db';

const userRepository = AppDataSource.getRepository(User);
export function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:8000/auth/google/callback'
      },
      async function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        let user = await userRepository.findOne({ where: { googleId: profile.id } });
        if (!user) {
          user = userRepository.create({ googleId: profile.id, firstName: profile.displayName });
          await userRepository.save(user);
        }

        return cb(null, user);
      }
    )
  );

  passport.serializeUser(function (user: User, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    const user = await userRepository.findOne(id);
    done(null, user);
  });
}

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/user.js');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://notepad-3jem.onrender.com/auth/google/callback",
    passReqToCallback: true
  },
  async function (request, accessToken, refreshToken, profile, done) {
    try {
      if (!profile.email || !profile.email.length) {
        return done("Google profile email is missing", null);
      }

      let user = await User.findByGoogleId(profile.id);

      if (!user) {
        user = new User({
          googleId: profile.id,
          email: profile.email,
          username: profile.displayName,
          password: profile.password
        });

        await user.save();
      }

      return done(null, user);
    } catch (error) {
      console.error(error);
      return done(error, null);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  User.findById(user, (err, user) => done(err, user));
});

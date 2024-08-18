const express = require('express');
const session = require('express-session');
const passport = require('passport');
const ejs = require('ejs');
const GitHubStrategy = require('passport-github').Strategy;
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
(accessToken, refreshToken, profile, done) => {
    console.log("User Token:", accessToken); // Log the user token (step 6)
    return done(null, profile);
}));

app.get('/', (req, res) => {
    res.render('index'); // Step 1: Start at home page with login button
});

app.get('/auth/github', passport.authenticate('github')); // Step 2: Redirect to GitHub for authorization

app.get('/auth/github/callback', // Step 4: GitHub redirects to this callback URL with an authorization code
    passport.authenticate('github', { failureRedirect: '/' }), // Step 5: Exchange code for access token
    (req, res) => {
        res.redirect('/profile'); // Step 6: Redirect to profile page after successful authentication
    });

app.get('/profile', (req, res) => {
    res.render('profile', { user: req.user }); // Step 7: Display user profile data
});

app.get('/logout', (req, res) => {
    req.logout(() => {}); // Step 8: Log the user out
    res.redirect('/'); // Redirect to home page after logout
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

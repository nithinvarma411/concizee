import { User } from "../model/user.model.js";

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = new User({
            email: profile.emails[0].value,
            googleID: profile.id
        });

        await newUser.save();
        newUser.isNewUser = true;  // Mark new user
        return done(null, newUser);
    } catch (error) {
        return done(error, null);
    }
}));

const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account consent'
});


const googleAuthCallback = passport.authenticate('google', {
    failureRedirect: '/',
    session: false,
    prompt: 'select_account consent',

});

const googleAuthSuccess = (req, res) => {
    if (!req.user) {
        return res.status(401).send({ message: "Authentication failed" });
    }

    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '10d' });

    res.cookie('token', token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });


    const redirectURL = process.env.ORIGIN;


    res.redirect(redirectURL);
};

const toggleMode = async (req, res) => {
    try {
        const userId = req.user.id;

        const mode = await User.findById(userId).select("mode");

        let updatedMode;

        if (mode == "dark") {
            updatedMode = await User.findByIdAndUpdate(userId, {mode: "light"}, {new: true});
        } else {
            updatedMode = await User.findByIdAndUpdate(userId, {mode: "dark"}, {new: true});
        }

        if (!updatedMode) {
            res.status(404).send({message: "Updated Mode not found"});
        }

        res.status(200).send({mode: updatedMode});

    } catch (error) {
        console.log("error toggling mode", error);
        return res.status(500).send({message: "Internal Server Error"});
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
};

export { googleAuth, googleAuthCallback, googleAuthSuccess, logout, toggleMode };
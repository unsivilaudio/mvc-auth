const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// @TODO EXTRACT THIS STUFF TO .env file
const JWT_SECRET = 'The Quick Brown Fox Jumped Over The Lazy Dog';
const JWT_EXPIRES_IN = '90d';
const JWT_COOKIE_EXPIRES_IN = 30 * 1000 * 60 * 60 * 24;

const signToken = id =>
    jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });

const createToken = user => {
    const token = signToken(user._id);
    const cookieOpts = {
        expires: new Date(
            Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        secure: true,
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'development') cookieOpts.secure = false;

    return { token, cookieOpts };
    // res.cookie('jwt', token, cookieOpts);
};

const checkAuthExpiration = iat => Date.now(iat) < Date.now();

const isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt && req.cookies.jwt !== 'loggedOut') {
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            JWT_SECRET
        );
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next();
        }
        const isExpired = checkAuthExpiration(decoded.exp);
        if (isExpired) {
            res.cookie('jwt', 'loggedOut');
            return next();
        }
        res.locals.user = currentUser;
        return next();
    }
    next();
};

module.exports = {
    createToken,
    isLoggedIn,
};

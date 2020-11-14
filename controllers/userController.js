const authController = require('./authController');
const { validationResult } = require('express-validator');

//controllers have the middlewere function
const HttpError = require('../utils/http-error-handler');
const User = require('../models/user');

let DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Max',
        email: 'max@gmail.com',
        password: 'tests',
    },
];

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const { name, email, password, places } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead.',
            422
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image:
            'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
        password,
        places,
    });

    try {
        await createdUser.save();
        const { token, cookieOpts } = authController.createToken(createdUser);
        res.cookie('jwt', token, cookieOpts);
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).render('landing', {
        title: 'A Simple MVC Auth Demo',
        success: {
            message: `Welcome to MVC Auth ${createdUser.name}`,
        },
    });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            401
        );
        return next(error);
    }

    existingUser.comparePassword(password, function (err, isMatch) {
        if (isMatch) {
            req.user = existingUser;
            res.locals.user = existingUser;

            const { token, cookieOpts } = authController.createToken(
                existingUser
            );
            res.cookie('jwt', token, cookieOpts);

            return res.render('landing', {
                title: 'A Simple MVC Auth Demo',
                success: {
                    message: `Welcome Back to MVC Auth, ${existingUser.name}!`,
                },
            });
        } else {
            new HttpError('Invalid Email or Password', 401);
            res.render('login', {
                title: 'Log in to MVC Auth',
                error: {
                    message: 'Invalid Username or Password',
                },
            });
        }
    });
};

const logout = (req, res) => {
    res.cookie('jwt', 'loggedOut');
    res.redirect('/');
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.logout = logout;

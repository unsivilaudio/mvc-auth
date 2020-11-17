const authController = require('./authController');
const { validationResult } = require('express-validator');

//controllers have the middlewere function
const HttpError = require('../utils/http-error-handler');
const User = require('../models/user');

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
    const { name, email, password, places } = req.body;

    const user = new User({
        name,
        email,
        image:
            'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
        password,
        places,
    });

    try {
        await user.save();
        const { token, cookieOpts } = authController.createToken(user);
        res.cookie('jwt', token, cookieOpts);
        res.status(201).render('landing', {
            title: 'A Simple MVC Auth Demo',
            success: {
                message: `Welcome to MVC Auth ${user.name}`,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).render('landing', {
            title: 'A simple MVC Auth Demo',
            error: {
                message: 'Oops! Something went wrong. Please try again later.',
            },
        });
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        existingUser = await User.findOne({ email: email });
        if (!existingUser) throw new Error('Invalid email or password');

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
            }

            throw new Error('Invalid email or password');
        });
    } catch (error) {
        return res.status(400).render('login', {
            title: 'Login to Demo',
            error,
        });
    }
};

const logout = (req, res) => {
    res.cookie('jwt', 'loggedOut');
    res.redirect('/');
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.logout = logout;

const uuid = require('uuid');
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
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        console.log('LN90 ', err);
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
            console.log('logged in!');
            return res.json({ message: 'Logged in!' });
        } else {
            const error = new HttpError('Invalid Email or Password', 401);
            next(error);
        }
    });
};
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

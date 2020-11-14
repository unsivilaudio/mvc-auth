const express = require('express');
const mongoose = require('mongoose');
const viewRoutes = require('./routes/root');
const authRoutes = require('./routes/auth');

const MONGO_URI = 'mongodb://localhost:27017/mvc-auth';
const MONGO_OPTS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
};
const APP_PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

app.use('/', viewRoutes);
app.use('/auth', authRoutes);

const start = async () => {
    await mongoose.connect(MONGO_URI, MONGO_OPTS);
    const db = mongoose.connection;
    db.on('connect', () => console.log('[Mongo] Connected to DB.'));

    app.listen(APP_PORT, () =>
        console.log(`[Server] Listening on port ${APP_PORT}`)
    );
};

start();

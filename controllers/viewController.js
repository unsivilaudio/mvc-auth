const getLogin = (req, res) => {
    res.render('login', { title: 'Login to Demo' });
};

const getSignup = (req, res) => {
    res.render('signup', { title: 'Sign up to Demo' });
};

const getLanding = (req, res) => {
    res.render('landing', { title: 'Basic Auth Demo using MVC' });
};

module.exports = { getLogin, getSignup, getLanding };

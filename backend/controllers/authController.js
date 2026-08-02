const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Mongoose User model

// 1. Send the user to GitHub's login page
exports.githubLogin = (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:user`;
    res.redirect(githubAuthUrl);
};

// 2. GitHub redirects back here with a temporary code
exports.githubCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect('http://localhost:5173?error=no_code');
    }

    try {
        // Trade the code for an Access Token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
            },
            { headers: { Accept: 'application/json' } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Use the token to fetch the user's GitHub profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const githubUser = userResponse.data;

        // --- DATABASE LOGIC ---
        // 1. Check if this user already exists in our database
        let user = await User.findOne({ githubId: githubUser.id });

        // 2. If they don't exist, create a new account for them
        if (!user) {
            user = await User.create({
                githubId: githubUser.id,
                username: githubUser.login,
                avatar: githubUser.avatar_url
            });
        }

        // Generate our JWT token using the database user details
        const jwtToken = jwt.sign(
            { 
                userId: user._id, 
                githubId: user.githubId, 
                username: user.username,
                avatar: user.avatar
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect back to React with the token
        res.redirect(`http://localhost:5173?token=${jwtToken}`);

    } catch (error) {
        console.error('GitHub Auth Error:', error.message);
        res.redirect('http://localhost:5173?error=auth_failed');
    }
};
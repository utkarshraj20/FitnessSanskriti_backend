const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
    const cookieAuthToken = req.cookies.authToken;
    const cookieRefreshToken = req.cookies.refreshToken;
    const headerAuthToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : '';
    const headerRefreshToken = req.headers['x-refresh-token'];
    const authToken = headerAuthToken || cookieAuthToken;
    const refreshToken = headerRefreshToken || cookieRefreshToken;

    // console.log("Check Auth Token MIDDLEWARE CALLED", authToken)

    if (!authToken || !refreshToken) {
        return res.status(401).json({ message: 'Authentication failed: No authToken or refreshToken provided' , ok : false });
    }

    jwt.verify(authToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            // Auth token has expired, check the refresh token
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY, (refreshErr, refreshDecoded) => {
                if (refreshErr) {
                    // Both tokens are invalid, send an error message and prompt for login
                    return res.status(401).json({ message: 'Authentication failed: Both tokens are invalid', ok: false });
                } else {
                    // Generate new auth and refresh tokens
                    const newAuthToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_SECRET_KEY, { expiresIn: '10m' });
                    const newRefreshToken = jwt.sign({ userId: refreshDecoded.userId }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '10d' });

                    // Set the new tokens as cookies in the response
                    res.cookie('authToken', newAuthToken, { httpOnly: true, secure: true, sameSite: 'None' });
                    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None' });
                    res.setHeader('x-auth-token', newAuthToken);
                    res.setHeader('x-refresh-token', newRefreshToken);

                    // Continue processing the request with the new auth token
                    req.userId = refreshDecoded.userId;
                    req.ok = true;
                    next();
                }
            });
        } else {
            // Auth token is valid, continue with the request
            req.userId = decoded.userId;
            next();
        }
    });
}

module.exports = checkAuth;

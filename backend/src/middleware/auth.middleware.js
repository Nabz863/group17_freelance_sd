//REPLACE stuff with environment variables from Azure!
const { auth } = require('express-oauth2-jwt-bearer');
const { expressJwtSecret } = require('jwks-rsa');

// Auth0 middleware
const jwtCheck = auth({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://dev-ttpqtow83wgggk7p.us.auth0.com/.well-known/jwks.json`//REPLACE ${process.env.AUTH0_DOMAIN}
  }),
  audience: 'https://dev-ttpqtow83wgggk7p.us.auth0.com/api/v2/',//REPLACE process.env.AUTH0_AUDIENCE
  issuer: `https://dev-ttpqtow83wgggk7p.us.auth0.com/`,//REPLACE ${process.env.AUTH0_DOMAIN}
  algorithms: ['RS256']
});

// Role checking middleware remains similar
const checkRole = (roles) => (req, res, next) => {
  if (!req.auth || !req.auth.payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userRoles = req.auth.payload[`https://dev-ttpqtow83wgggk7p.us.auth0.com/roles`] || [];//REPLACE ${process.env.AUTH0_NAMESPACE}
  if (!roles.some(role => userRoles.includes(role))) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  
  next();
};

module.exports = { jwtCheck, checkRole };

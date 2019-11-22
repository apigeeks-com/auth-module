const { assignDefaults, addAuthorize } = require('./_utils')

module.exports = function github (strategy) {
  assignDefaults(strategy, {
    _scheme: 'oauth2',
    _name: 'keycloak',
    authorization_endpoint: `${strategy.url}/auth`,
    userinfo_endpoint: `${strategy.url}/userinfo`,
    token_endpoint: `${strategy.url}/token`,
    token_key: 'access_token',
    token_type: 'Bearer',
    response_type: 'code',
    grant_type: 'authorization_code',

    scope: ['openid', 'profile', 'email']
  })

  addAuthorize.call(this, strategy, true)
}

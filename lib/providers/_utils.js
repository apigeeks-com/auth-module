const axios = require('axios')
const bodyParser = require('body-parser')
const queryString = require('querystring');

function assignDefaults (strategy, defaults) {
  Object.assign(strategy, Object.assign({}, defaults, strategy))
}

function addAuthorize (strategy, isSubmitAsFormData) {
  // Get client_secret, client_id, token_endpoint and audience
  const clientSecret = strategy.client_secret
  const clientID = strategy.client_id
  const tokenEndpoint = strategy.token_endpoint
  const audience = strategy.audience

  // IMPORTANT: remove client_secret from generated bundle
  delete strategy.client_secret

  // Endpoint
  const endpoint = `/_auth/oauth/${strategy._name}/authorize`
  strategy.access_token_endpoint = endpoint

  // Set response_type to code
  strategy.response_type = 'code'

  // Form data parser
  const formMiddleware = bodyParser.urlencoded({ extended: true })

  // Register endpoint
  this.options.serverMiddleware.unshift({
    path: endpoint,
    handler: (req, res, next) => {
      if (req.method !== 'POST') {
        return next()
      }

      formMiddleware(req, res, () => {
        const {
          code,
          redirect_uri: redirectUri = strategy.redirect_uri,
          response_type: responseType = strategy.response_type,
          grant_type: grantType = strategy.grant_type
        } = req.body

        if (!code) {
          return next()
        }

        let data = {
          client_id: clientID,
          client_secret: clientSecret,
          grant_type: grantType,
          response_type: responseType,
          redirect_uri: redirectUri,
          audience: audience,
          code
        }

        let headers = {
          Accept: 'application/json'
        }

        if (isSubmitAsFormData) {
          data = queryString.stringify(data);
          headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        }

        axios
          .request({
            method: 'post',
            url: tokenEndpoint,
            data,
            headers
          })
          .then(response => {
            res.end(JSON.stringify(response.data))
          })
          .catch(error => {
            // Debug auth
            if (error.response) {
              if (error.response.data) {
                console.log(JSON.stringify(error.response.data));
              } else {
                console.log(error);
              }
            } else if (error.message) {
              console.log(error.message);
            } else {
              console.log(error);
            }

            return next(error)
          })
      })
    }
  })
}

module.exports = {
  addAuthorize,
  assignDefaults
}

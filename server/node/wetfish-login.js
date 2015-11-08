var request = require('request');
var crypto = require('crypto');

var login =
{
    ready: false,
    app_id: false,
    app_secret: false,

    parse: function(input)
    {
        try
        {
            var parsed = JSON.parse(response.body);
        }
        catch(error)
        {
            var parsed = {'status': 'error', 'message': 'Unable to decode response from server'};
        }

        return parsed;
    }

    init: function(config)
    {
        if(typeof config == "undefined")
        {
            console.log("No config options found!");
            return;
        }

        if(typeof config.app_id == "undefined" || typeof config.app_secret == "undefined")
        {
            console.log("Config must contain app_id and app_secret.");
            return;
        }

        login.app_id = config.app_id;
        login.app_secret = config.app_secret;
    },
    
    // A function for verifying tokens
    verify: function(token, callback)
    {        
        request.get('https://login.wetfish.net/apps/verify', {form: {token: token}}, function(error, response)
        {
            var input = login.parse(response.body);
        
            if(input.status == 'error')
            {
                callback(input);
                return;
            }
                
            var challenge = input.challenge;
            var data = new Buffer(input.data, 'base64');

            // Generate response
            var signature = crypto.createHmac("sha256", login.app_secret).update(challenge + data + login.app_id).digest("hex");

            // Post request
            request.post('https://login.wetfish.net/apps/verify', {form: {challenge: challenge, signature: signature}}, function(error, response)
            {
                var data = login.parse(response.body);
                callback(data);
            });
        
        });
    }
    
    // Maybe some day there will be SDKs for other languages too ^_~
};

module.exports = login;

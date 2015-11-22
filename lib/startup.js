if(Meteor.isClient) {
    AutoFormHooks = ({
        getServerMessage: {
            onError : function (method, error) {
                //если это не от сервера, тогда просто пропустим
                if(method !== 'method') {
                    return true;
                }
                if(!error) {
                    return false;
                }
                var commonOptions = {
                    timeout: 7000
                };

                _.extend(commonOptions,error.details.options);

                if(commonOptions.redirect) {
                    Router.go('rows.edit', {_id: commonOptions.redirect});
                }

                Notifications[error.error](error.reason, error.details.message, commonOptions);
            }
        }
    });
}
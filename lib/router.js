var onBeforeActionHooks = {
    checkLogin: function (pause) {
        //do something here before routing to the actual rowsList template
        //maybe we should move to login template here
/*        if (Meteor.loggingIn()) {
            this.render('loading');
        }*/
        /*if (!Meteor.user()) {
            // render the login template but keep the url in the browser the same
            this.render('login');
        }
        else {
            this.next();
        }*/
        this.next();
    }
};

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

Router.map(function () {
    this.route('rowsList', {
        path: '/',
        data: function () {
            return Meteor.call('rowsList');
        }
    });
});

Router.map(function () {
    this.route('rowAdd');
});

Router.onBeforeAction(onBeforeActionHooks.checkLogin);
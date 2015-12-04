Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});


Router.map(function() {
    this.route('rowsList', {
        path: '/',
        name: 'rows.list'
    });

    this.route('rowAdd',
        function () {
          this.render('rowAdd');
        },
        {
        path: '/rowadd',
        name: 'rows.add'
    });

    this.route('rowEdit',
        function () {
            this.render('rowEdit');
        },
        {
        path: '/rowedit/:_id',
        name: 'rows.edit',
        data: function() {
            return Meteor.users.findOne({"rows._id": this.params._id});
        }
    });

    //---------ADMIN PART--------------
    this.route('adminRowadd',
        function () {
            this.render('adminRowadd');
        },
        {
            path: '/admin/rowadd',
            name: 'admin.rows.add'
        });

    this.route('adminUserList',
        {
            path: '/admin/userlist',
            name: 'admin.userlist'
        });

    this.route('adminUserAdd',
        {
            path: '/admin/user/add',
            name: 'admin.useradd'
        });
    this.route('adminUserEdit',
        {
            path: '/admin/user/:_id/edit',
            name: 'admin.useredit',
            data: function() {
                return Meteor.users.findOne({_id: this.params._id});
            }
        });

    this.route('adminUserView',
        {
            path: '/admin/user/:_id/view',
            name: 'admin.userview',
            data: function() {
                return Meteor.users.findOne({_id: this.params._id});
            }
        });

    this.route('adminUserGraphs',
        {
            path: '/admin/user/:_id/graphs',
            name: 'admin.graphs.peruser',
            data: function() {
                return {
                    user: Meteor.users.findOne({_id: this.params._id}),
                    data: Meteor.users.findOne({"rows.userId": this.params._id})
                };
            }
        });

    this.route('adminPostParse',
        {
            path: '/admin/post/parse',
            name: 'admin.postparse'
        });

});



var requireLogin = function () {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('login');
        }
    } else {
        this.next();
    }
};

var checkAdminPass = function (request) {
    if(/^\/admin/.test(request.url) && !Roles.userIsInRole(Meteor.user()._id, 'admin')) {
        this.render('notFound');
        return;
    }
    this.next();
};

Router.onBeforeAction('dataNotFound', {only: 'rowPage'});
Router.onBeforeAction(requireLogin);
Router.onBeforeAction(checkAdminPass);

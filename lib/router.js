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
            return Rows.findOne({_id: this.params._id});
        }
    });

    //---------ADMIN PART--------------
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
            path: '/admin/user/edit/:_id',
            name: 'admin.useredit',
            data: function() {
                return Meteor.users.findOne({_id: this.params._id});
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

Router.onBeforeAction('dataNotFound', {only: 'rowPage'});
Router.onBeforeAction(requireLogin);

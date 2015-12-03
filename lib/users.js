Schemas.User = new SimpleSchema({
    username: {
        type: String,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        label: 'E-mail',
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        label: 'Подтвержденный E-mail',
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    flatNumber: {
        label: "№ квартиры",
        type: Number,
        min:1, //this code is for DES17 ONLY. Please edit if the system will be used
        max: 440,
        index: true,
        unique: true,
        optional: true //this is NOT required for an administrator
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },

    // Option 2: [String] type
    // If you are sure you will never need to use role groups, then
    // you can specify [String] as the type
    roles: {
        type: [String],
        optional: true
    }
});

Schemas.addUser = new SimpleSchema({
    email: {
        type: String,
        label: 'E-mail'
    },
    password: {
        label: 'Пароль',
        type: String
    },
    flatNumber: {
        type: Number,
        min:1, //this code is for DES17 ONLY. Please edit if the system will be used
        max: 440,
        optional: true, //this is NOT required for an administrator,
        label: '№ квартиры (опционально)'
    },
    isAdmin: {
        type: Boolean,
        optional: true,
        label: "Сделать администратором"
    }
});

Meteor.users.attachSchema(Schemas.User);


Meteor.users.allow({
   insert: function(userId) {
       return Roles.userIsInRole(userId, ['admin']);
   },
    update: function (userId) {
        return Roles.userIsInRole(userId, ['admin']);
    },
    remove: function (userId, doc) {
        return Roles.userIsInRole(userId, ['admin']);
    }
});
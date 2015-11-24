var Mail = {};
Mail.mailConfig = {
    user: 'admin@des17.ru',
    password: 'Wain180102',
    host: 'imap.mail.ru',
    port: 993,
    tls: true
};


Mail.MailParser = Meteor.npmRequire('mailparser').MailParser;
Mail.mailParser = new Mail.MailParser();
Mail.Imap = Meteor.npmRequire('imap');
Mail.inspect = Meteor.npmRequire('util').inspect;
Mail.imap = new Mail.Imap(Mail.mailConfig);


var runMethod = function () {
};

console.log(runMethod());
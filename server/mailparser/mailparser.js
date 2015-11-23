var Mail = {};
Mail.mailConfig = {
    user: '***',
    password: '***',
    host: 'imap.***.ru',
    port: 993,
    tls: true
};


Mail.MailParser = Meteor.npmRequire('mailparser').MailParser;
Mail.mailParser = new Mail.MailParser();

Mail.Imap = Meteor.npmRequire('imap');
Mail.inspect = Meteor.npmRequire('util').inspect;

Mail.imap = new Mail.Imap(Mail.mailConfig);


Mail.openInbox = function (cb) {
    this.imap.openBox('ПОКАЗАНИЯ СЧЕТЧИКОВ', true, cb);
};


Mail.imap.once('ready', function() {
    Mail.openInbox(function(err, box) {
        if (err) throw err;
        console.log(box);
/*        var request = Mail.imap.search(['ALL'], function(err, results) {
            console.log(results.length);
            if(!results) {
                console.log("No messages found!");
                return false;
            }

            var f = Mail.imap.seq.fetch('1:'+results.length, {
                bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
                struct: true
            });

            f.on('message', function(msg, seqno) {
                var prefix = '(#' + seqno + ') ';
                console.log(prefix);
                msg.on('body', function(stream, info) {
                    var buffer = '';
                    stream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function() {
                        var message = Mail.Imap.parseHeader(buffer);
                        var messageString = Mail.inspect(Mail.Imap.parseHeader(buffer));
                        console.log('-------------------------');
                        console.log(prefix);
                        console.log(messageString);
                        //console.log('From: %s', message.from);
                        //console.log('Subj: %s', message.subject);
                    });
                });
                msg.once('attributes', function(attrs) {
                    //console.log(prefix + 'Attributes: %s', Mail.inspect(attrs, false, 8));
                });
                msg.once('end', function() {
                    //console.log(prefix + 'Finished');
                });
            });
            f.once('error', function(err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function() {
                console.log('Done fetching all messages!');
                Mail.imap.end();
            });
        });*/

    });
});

Mail.imap.once('error', function(err) {
    console.log(err);
});

Mail.imap.once('end', function() {
    console.log('Connection ended');
});

Mail.imap.connect();
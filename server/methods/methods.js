Meteor.methods({
    //a method for adding new row
    'rowAdd': function (doc) {
        check(doc, Schemas.Row);
        var userId = this.userId,
            existingRow,
            tomorrowDate, thenDate;

        //��������, ��� ���� ������������ ��� �������� ��������� �� ������.
        existingRow = Meteor.call('checkExistingRow', doc);
        //���� ��� ���, ����� ����������, �������� �� ��� ����������� �������������� ���������
        //� ������, ���� �� ��� ���� ��������� ��� �� �����������, �������� ��
        console.log(existingRow);
        if (!existingRow) {
            console.log("No such row");
            return Rows.insert(doc);
        }
        //��������� �������. ���������, ����� �� ������������ �� �������������.
        //�������������� ��������� �������� ������ � ������ ����� ����� �� ����������
        tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        thenDate = existingRow.createdAt;
        console.log("Dates check:", tomorrowDate, thenDate);
        if(+tomorrowDate > +thenDate) {
            console.log("Edit possible!");
        }
        else {
            console.log("Edit impossible");
        }


    },
    'rowGet': function (rowId) {
        return Rows.findOne({userId: Meteor.userId(), _id: rowId});
    },

    'checkExistingRow': function (doc) {
        check(doc, Schemas.Row);
        return Rows.findOne({month: doc.month, year: doc.year});
    },

    'rowsList': function (rowId) {
        return Rows.find({userId: Meteor.userId()});
    },

    'rowsListInsecure': function (rowId) {
        console.log("Insecure rows called");
        var res = Rows.find();
        console.log(res);
        return res;
    }
});
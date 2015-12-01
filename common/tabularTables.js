TabularTables = {};
Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);
TabularTables.Rows = new Tabular.Table({
    name: "Rows",
    collection: Rows,
    columns: [
        {
            data: "month",
            title: "Период показаний",
            tmpl: Meteor.isClient && Template.rowItemPeriod

        },
        {data: "coldwater1", title: "ХВС1"},
        {data: "coldwater2", title: "ХВС2"},
        {data: "hotwater1", title: "ГВС1"},
        {data: "hotwater2", title: "ГВС2"},
        {data: "heat", title: "Тепло"},
        {data: "electricity", title: "Электричество"},
        {
            data: 'electricity_direct',
            title: "Прямой договор",
            tmpl: Meteor.isClient && Template.rowItemCheckbox
        },
        {data: "comment", title: "Комментарий"}
    ],
    extraFields: ['year'],
    selector: function( userId ) {
        if(Roles.userIsInRole(userId,'admin')) {
            return {};
        }
        return { userId: userId }
    },
    searchable: false,
    language: {
        "processing": "Подождите...",
        "search": "Поиск:",
        "lengthMenu": "Показать _MENU_ записей",
        "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
        "infoEmpty": "Записи с 0 до 0 из 0 записей",
        "infoFiltered": "(отфильтровано из _MAX_ записей)",
        "infoPostFix": "",
        "loadingRecords": "Загрузка записей...",
        "zeroRecords": "Записи отсутствуют.",
        "emptyTable": "В таблице отсутствуют данные",
        "paginate": {
            "first": "Первая",
            "previous": "Предыдущая",
            "next": "Следующая",
            "last": "Последняя"
        },
        "aria": {
            "sortAscending": ": активировать для сортировки столбца по возрастанию",
            "sortDescending": ": активировать для сортировки столбца по убыванию"
        }
    }
});
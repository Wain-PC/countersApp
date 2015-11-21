/**
 * Created by Wain on 18.11.2015.
 */
Template.rowItem.helpers({
    getMonthCaption: function (monthId) {
        var arr = ['Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь'];
        return arr[monthId - 1];
    },
    getCheckbox: function (checked) {
        console.log(checked);
        return '{{{>rowItemCheckbox}}}';
    }
});
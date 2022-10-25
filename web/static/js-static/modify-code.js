/* /create-element div's manager*/

$(document).ready(function () {
    var current_element = '';

    $('#data-type').change(function () {

        var id = $(this).val();
        var el = $('#' + id + '-div');
        el.show();
        $('#code-id-div').show();
        $('html').animate({scrollTop: el.offset().top},500);
        // hide previously showed element
        if (current_element != '') $('#' + current_element).hide();

        // store id of previously selected element
        current_element = id + '-div'
    });
});
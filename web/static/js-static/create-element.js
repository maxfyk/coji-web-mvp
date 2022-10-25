/* /create-element div's manager*/

$(document).ready(function () {
    var current_element = '';

    $('#data-type').change(function () {

        var id = $(this).val();
        var el = $('#' + id + '-div');
        el.show();
        $('#code-location-div').show();
        $('html').animate({scrollTop: el.offset().top}, 500);
        // hide previously showed element
        if (current_element != '') $('#' + current_element).hide();

        // store id of previously selected element
        current_element = id + '-div'
    });
});


function insert_piece(letter) {
    document.getElementById('keyboard-decode-in').value += letter;
}

function remove_last() {
    var in_str = document.getElementById('keyboard-decode-in').value;
    document.getElementById('keyboard-decode-in').value = in_str.substr(0, in_str.length - 1);
}

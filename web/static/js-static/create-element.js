/* /create-element div's manager*/

$(document).ready(function () {
    var form = document.getElementById('form')
    var input = document.getElementById('user-data')
    form.addEventListener('submit', function (e) {
        get_user_details(input);
    })

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

async function get_user_details(input) {
    var user_data = {
        'lat': null,
        'lon': null,
        'decode-type': 'scan',
        'os': platform.os.family,
        'os-version': platform.os.version,
        'browser': platform.name,
        'browser-version': platform.version,
        'device': platform.product,
    }
    var lat, lon;
    var userLocation = new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(function (pos) {
            lat = pos.coords.latitude
            lon = pos.coords.longitude
            resolve({lat, lon});
        })
    })
    await userLocation.then(function (value) {
        user_data['lat'] = value.lat;
        user_data['lon'] = value.lon;
    });
    input.value = JSON.stringify(user_data)
    form.submit()
}

function insert_piece(letter) {
    document.getElementById('keyboard-decode-in').value += letter;
}

function remove_last() {
    var in_str = document.getElementById('keyboard-decode-in').value;
    document.getElementById('keyboard-decode-in').value = in_str.substr(0, in_str.length - 1);
}


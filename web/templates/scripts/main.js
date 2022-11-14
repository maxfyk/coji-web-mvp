var video = $('.video-preview')[0];
var lat = null, lon = null;

/*permissions*/
$(function () {

    navigator.geolocation.getCurrentPosition(function (pos) {
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
    })

    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment',
            width: {
                optional: [
                    {minWidth: 320},
                    {minWidth: 640},
                    {minWidth: 1024},
                    {minWidth: 1280},
                ]
            }
        }
    })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err0r) {
            console.log("Something went wrong with permissions!");
        });
    navigator.geolocation.getCurrentPosition(function (position) {
    }, showError);

});

function location_redirector() {
    navigator.geolocation.getCurrentPosition(function (position) {
        window.location.href = '/location-decode/' + position.coords.latitude + ',' + position.coords.longitude;
        return 0;
    }, showError);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert('Please grant access to your location!');
            break;
        case error.UNKNOWN_ERROR:
            alert('Please grant access to your location!');
            break;
    }
}

const headers = {
    'Content-Type': 'application/json',
};

/*Scan button*/
document.getElementById("scan-button").addEventListener("click", function () {
    scanCode();
});


async function scanCode() {
    var stream = document.querySelector("video");
    var btnCapture = document.getElementById("scan-button");

    btnCapture.style.background = "transparent url('/static/icons/scan-loading.gif') no-repeat top left";
    btnCapture.style.backgroundSize = "cover";
    var capture = document.createElement('canvas');

    if (null != stream) {
        capture.width = stream.videoWidth;
        capture.height = stream.videoHeight;
        var ctx = capture.getContext('2d');

        ctx.drawImage(stream, 0, 0, stream.videoWidth, stream.videoHeight);
    }
    var base64Img = capture.toDataURL('image/jpeg', 1).replace('data:image/jpeg;base64,', '');

    var data = {
        'decode-type': 'scan',
        'in-data': base64Img,
        'user-id': null,
        'style-info': {
            'name': 'geom-original',
        },
        'user-data': {
            'lat': lat,
            'lon': lon,
            'decode-type': 'scan',
            'os': platform.os.family,
            'os-version': platform.os.version,
            'browser': platform.name,
            'browser-version': platform.version,
            'device': platform.product,
        }
    }
    await fetch(`{{API_URL}}/coji-code/decode`, options = {
        method: 'POST', body: JSON.stringify(data), headers: headers, mode: 'cors'
    })
        .then(await function (response) {
            return response.text();
        }).then(await function (text) {
            btnCapture.style.background = "transparent url('/static/icons/scan-button.png') no-repeat top left";
            btnCapture.style.backgroundSize = "cover";

            var resp = JSON.parse(text);
            if (resp['error']) {
                alert(resp['text'])
            } else {
                window.location.replace('data-preview/' + resp['code-id']);
            }
        });

    btnCapture.style.background = "transparent url('/static/icons/scan-button.png') no-repeat top left";
    btnCapture.style.backgroundSize = "cover";

}

/*keybaord decode*/

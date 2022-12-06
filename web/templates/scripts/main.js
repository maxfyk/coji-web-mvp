var lat = null, lon = null;
const headers = {
    'Content-Type': 'application/json',
};
var video;
/*permissions*/
$(function () {
    navigator.geolocation.getCurrentPosition(function (pos) {
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
    })

    navigator.mediaDevices.getUserMedia({
        video: {
            // width: {min: 640, ideal: 640, max: 1280},
            // height: {min: 480, ideal: 480, max: 720},
            facingMode: 'environment',
        }
    })
        .then(function (stream) {
            video = document.querySelector("#stream");
            video.srcObject = stream;
            video.play();
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            initFinish();
        })
        .catch(function (error) {
            console.log(error);
            console.log("Something went wrong with permissions!");
            $(".usage-help").text('This app requires camera permission to work!');
        });
    navigator.geolocation.getCurrentPosition(function (position) {
    }, showError);
});

function initFinish() {
    $(".usage-help-div").hide();
    $(".usage-help-div").toggle(500);
    $(".usage-help").text('Point your camera at the code and then press the scan button!👀');
    $('.mindar-ui-loading').remove();
}

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

/*Scan button*/
document.getElementById("scan-button").addEventListener("click", function () {
    scanCode();
});

var failedToScan = false;

async function scanCode() {
    if (!failedToScan) {
        $(".usage-help").text('Taking a picture...📸\nHold still!');

    }
    var stream = document.getElementById("stream");
    var btnCapture = document.getElementById("scan-button");

    btnCapture.style.background = "transparent url('/static/icons/scan-loading.gif') no-repeat top left";
    btnCapture.style.backgroundSize = "cover";
    var rect = document.querySelector('.scan-border').getBoundingClientRect();
    let canvas = document.createElement('canvas');

    canvas.width = stream.videoWidth;
    canvas.height = stream.videoHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(stream, 0, 0, canvas.width, canvas.height);
    // console.log(canvas.toDataURL('image/jpeg', 1).replace('data:image/jpeg;base64,', ''));
    // console.log(rect.x, rect.y, document.querySelector('#stream').offsetLeft, document.querySelector('#stream').offsetTop)
    var imageData = ctx.getImageData(rect.x + (stream.videoWidth / 2 - document.querySelector('#stream').offsetLeft), rect.y + (stream.videoHeight / 2 - document.querySelector('#stream').offsetTop), rect.width, rect.height)

    var canvas1 = document.createElement("canvas");
    canvas1.width = 220;
    canvas1.height = 220;
    var ctx1 = canvas1.getContext("2d");
    ctx1.putImageData(imageData, 0, 0);

    var base64Img = canvas1.toDataURL('image/jpeg', 1).replace('data:image/jpeg;base64,', '');
    console.log(base64Img);
    var data = {
        'decode-type': 'scan', 'in-data': base64Img, 'user-id': null, 'style-info': {
            'name': 'geom-original',
        }, 'user-data': {
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
    $(".usage-help").text('Scanning🔎...');
    $('body').append('<div class="mindar-ui-overlay mindar-ui-loading"> <div class="loader"> </div></div>');
    await fetch('{{API_URL}}/coji-code/decode', options = {
            method: 'POST', body: JSON.stringify(data), headers: headers, mode: 'cors'
        }
    )
        .then(await function (response) {
            return response.text();
        }).then(await function (text) {
            btnCapture.style.background = "transparent url('/static/icons/scan-button.png') no-repeat top left";
            btnCapture.style.backgroundSize = "cover";

            var resp = JSON.parse(text);
            if (resp['error']) {
                // alert(resp['text'])
            } else {
                failedToScan = false;
                window.location.replace('data-preview/' + resp['code-id']);
            }
        });
    btnCapture.style.background = "transparent url('/static/icons/scan-button.png') no-repeat top left";
    btnCapture.style.backgroundSize = "cover";
    failedToScan = true;
    $(".usage-help").text('Please adjust your camera and try again!👀');
    $('.mindar-ui-loading').remove();
}

String.prototype.width = function (font) {
    var o = $('<div></div>')
        .text(this)
        .css({
            'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': font,
        })
        .appendTo($('body')), w = o.width();

    o.remove();

    return w;
}
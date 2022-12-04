var lat = null, lon = null;
const headers = {
    'Content-Type': 'application/json',
};
const liveView = $('#live-view');
const sceneEl = document.querySelector('a-scene');
var video;
var videoRatioW, videoRatioH, videoTopOffset, videoLeftOffset, videoW, videoH;
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
            video = document.querySelector("video");
            video.srcObject = stream;
            video.play();
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            sceneEl.addEventListener('arReady', initVideoRatio);
        })
        .catch(function (error) {
            console.log(error);
            console.log("Something went wrong with permissions!");
        });
    navigator.geolocation.getCurrentPosition(function (position) {
    }, showError);
});

var children = [];

async function initVideoRatio() {
    var video_jq = $('video');
    videoW = parseInt(video_jq.css('width').replace('px', ''));
    videoH = parseInt(video_jq.css('height').replace('px', ''));
    videoTopOffset = parseInt(video_jq.css('top').replace('px', ''));
    videoLeftOffset = parseInt(video_jq.css('left').replace('px', ''));
    videoRatioW = videoW / video.videoWidth;
    videoRatioH = videoH / video.videoHeight;

    $(".usage-help").text('Point your camera at the code and then press the scan button!');
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
    var stream = document.querySelector("video");
    var btnCapture = document.getElementById("scan-button");

    btnCapture.style.background = "transparent url('/static/icons/scan-loading.gif') no-repeat top left";
    btnCapture.style.backgroundSize = "cover";
    var capture = document.createElement('canvas');

    if (null != stream) {
        capture.width = 360;
        capture.height = capture.width * (stream.height / stream.width);
        var ctx = capture.getContext('2d');
        ctx.drawImage(stream, 0, 0, capture.width, capture.height);
    }
    var base64Img = capture.toDataURL('image/jpeg', 1).replace('data:image/jpeg;base64,', '');
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
    if (!failedToScan) {
        $(".usage-help").text('Scanning🔎...');

    }
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
    $(".usage-help").text('Please move your camera closer!');
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
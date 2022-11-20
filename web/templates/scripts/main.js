var lat = null, lon = null;
const headers = {
    'Content-Type': 'application/json',
};
const liveView = $('#live-view');
const sceneEl = document.querySelector('a-scene');
var video = document.querySelector("video");
var isScanning = null, failedToScan = false;
var videoRatioW, videoRatioH, videoTopOffset, videoLeftOffset, videoW, videoH;
let model;

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
        }
    })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
            sceneEl.addEventListener('arReady', initVideoRatio);
            sceneEl.addEventListener('arReady', autoScan);

        })
        .catch(function (err0r) {
            console.log("Something went wrong with permissions!");
        });
    navigator.geolocation.getCurrentPosition(function (position) {
    }, showError);
});
var children = [];

function initVideoRatio() {
    var video_jq = $('video');
    console.log(video_jq);
    videoW = parseInt(video_jq.css('width').replace('px', ''));
    videoH = parseInt(video_jq.css('height').replace('px', ''));
    videoTopOffset = parseInt(video_jq.css('top').replace('px', ''));
    videoLeftOffset = parseInt(video_jq.css('left').replace('px', ''));
    videoRatioW = videoW / video.videoWidth;
    videoRatioH = videoH / video.videoHeight;
    // console.log('W', video_jq.css('width'), video.videoWidth, videoRatioW, videoLeftOffset)
    // console.log('H', video_jq.css('height'), video.videoHeight, videoRatioH, videoTopOffset)
}

var framesCount = 0;

async function autoScan() {
    if (!model) {
        model = await tflite.ObjectDetector.create('https://api.coji-code.com/coji-code/get-asset/model/coji.tflite');
    }
    var predictions = model.detect(video);
    // Remove any highlighting we did previous frame.
    console.log('predicting');
    for (let i = 0; i < children.length; i++) {
        children[i].remove();
    }
    children.splice(0);
    if (predictions.length && predictions[0].classes[0].probability >= 0.4) {
        var prediction = predictions[0];
        var prediction_score = prediction.classes[0].probability;
        // console.log('pred score', prediction_score);
        $(".usage-help-div").hide();
        var x = (prediction.boundingBox.originX * videoRatioW) / 1.01;
        var y = (prediction.boundingBox.originY * videoRatioH) / 1.01;
        var w = (prediction.boundingBox.width * videoRatioW);
        var h = (prediction.boundingBox.height * videoRatioH);
        // console.log('Area ratio', ((w * h) / (videoW * videoH)));
        // console.log(w, h, videoW, videoH)
        var areaRatio = (w * h) / (videoW * videoH);
        liveView.append('<div id="detected-code-instance"></div>');
        liveView.append(`<p id="detected-code-text"></p>`);
        var infoText = $('#detected-code-text');
        var infoInstance = $('#detected-code-instance');
        var infoObjText, infoTextColor;

        if (areaRatio >= 0.036 || isScanning) {
            infoTextColor = '#FFCC00';

            infoObjText = 'Scanning⌛';
            if (failedToScan) {
                infoObjText = 'Retrying⌛';
                framesCount = 0;
            } else if (isScanning) {
                if (framesCount >= 5) {
                    infoObjText = 'Fetching data⌛';

                } else {
                    infoObjText = 'Scanning⌛';
                    framesCount += 1;
                }
            }
            infoInstance.css('background', "transparent url('/static/icons/scan-loading.gif') no-repeat top left");
            infoInstance.css('background-position', 'center');
            infoInstance.css('background-size', '50%');
            if (!isScanning) {
                scanCode();
            }
        } else {
            infoObjText = 'Get closer🥺';
            infoTextColor = '#FB3B1E';
            // infoInstance.css('background', 'rgba(251, 59, 30, 0.2)');
            infoInstance.css('background', 'none');
        }
        infoText.text(infoObjText);
        infoText.css({
            'margin-left': x + (Math.abs((w / 2) - (infoObjText.width('3.6vh Calibri') / 2))) + videoLeftOffset + 'px',
            'margin-top': y - (h / 2.2) + videoTopOffset - 30 + 'px',
            'width': w - 20 + 'px',
            'height': h - 20 + 'px',
            'color': infoTextColor,
        });

        infoInstance.css({
            'left': x + videoLeftOffset + 'px',
            'top': y - (h / 1.4) + videoTopOffset + 'px',
            'width': w + 'px',
            'height': h + 'px',
        });
        children.push(infoInstance);
        children.push(infoText);
    } else {
        failedToScan = false;
        $(".usage-help-div").show();
    }
    window.requestAnimationFrame(autoScan);
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


// /*Scan button*/
// document.getElementById("scan-button").addEventListener("click", function () {
//     scanCode();
// });


async function scanCode() {
    isScanning = true;
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
                // alert(resp['text'])
                failedToScan = true;
            } else {
                window.location.replace('data-preview/' + resp['code-id']);
            }
        });
    btnCapture.style.background = "transparent url('/static/icons/scan-button.png') no-repeat top left";
    btnCapture.style.backgroundSize = "cover";
    isScanning = false;

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
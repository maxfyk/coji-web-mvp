var lat = null, lon = null;
const headers = {
    'Content-Type': 'application/json',
};
const liveView = $('#live-view');
const sceneEl = document.querySelector('a-scene');
var video;
var isScanning = null, failedToScan = false;
var videoRatioW, videoRatioH, videoTopOffset, videoLeftOffset, videoW, videoH;
// let model = false;
let camera;
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
            sceneEl.addEventListener('arReady', autoScan);

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
    // console.log('W', video_jq.css('width'), video.videoWidth, videoRatioW, videoLeftOffset)
    // console.log('H', video_jq.css('height'), video.videoHeight, videoRatioH, videoTopOffset)
    // if (!model) {
    //     $('body').append('<div class="mindar-ui-overlay mindar-ui-loading"> <div class="loader"> </div></div>');
    //     console.log('MODEL loading');
    //     model = await tflite.loadTFLiteModel('/static/ar-js-static/coji.tflite');
    //     console.log('MODEL');
    //     console.log(model);
    //     $('.mindar-ui-loading').remove();
    //     $(".usage-help").text('Point your camera at the code!');
    // }
    $(".usage-help").text('Point your camera at the code and then press the scan button!');
}

var framesCount = 0;
var frameZero = true;
//
// async function autoScan() {
//     if (!model || model === 'undefined') {
//         return window.requestAnimationFrame(autoScan);
//     }
//     let input = tf.image.resizeBilinear(tf.browser.fromPixels(video), [640, 640]);
//     input = tf.sub(tf.div(tf.expandDims(input), 127.5), 1);
//     input = input.reshape([1, 3, 640, 640]);
//     console.log('after reshape');
//     let predictions = await model.predict(input);
//     console.log('after predictions');
//     console.log(predictions);
//     predictions = predictions.arraySync()[0];
//     console.log(predictions);
//     // Remove any highlighting we did previous frame.
//     for (let i = 0; i < children.length; i++) {
//         children[i].remove();
//     }
//     children.splice(0);
//     if (frameZero) {
//         frameZero = false;
//         return window.requestAnimationFrame(autoScan);
//     } else if (predictions.length && predictions[0].classes[0].probability >= 0.4) {
//         var prediction = predictions[0];
//         var prediction_score = prediction.classes[0].probability;
//         // console.log('pred score', prediction_score);
//         $(".usage-help-div").hide();
//         var x = (prediction.boundingBox.originX * videoRatioW) / 1.01;
//         var y = (prediction.boundingBox.originY * videoRatioH) / 1.01;
//         var w = (prediction.boundingBox.width * videoRatioW);
//         var h = (prediction.boundingBox.height * videoRatioH);
//         // console.log('Area ratio', ((w * h) / (videoW * videoH)));
//         // console.log(w, h, videoW, videoH)
//         var areaRatio = (w * h) / (videoW * videoH);
//         liveView.append('<div id="detected-code-instance"></div>');
//         liveView.append(`<p id="detected-code-text"></p>`);
//         var infoText = $('#detected-code-text');
//         var infoInstance = $('#detected-code-instance');
//         var infoObjText, infoTextColor;
//
//         if (areaRatio >= 0.036 || isScanning) {
//             infoTextColor = '#FFCC00';
//
//             infoObjText = 'Hold still!';
//             if (failedToScan) {
//                 infoObjText = 'Retrying⌛️';
//                 framesCount = 0;
//             } else if (isScanning) {
//                 if (framesCount >= 5) {
//                     infoObjText = 'Fetching⌛️';
//
//                 } else {
//                     infoObjText = 'Hold still!';
//                     framesCount += 1;
//                 }
//             }
//             infoInstance.css('background', "transparent url('/static/icons/scan-loading.gif') no-repeat top left");
//             infoInstance.css('background-position', 'center');
//             infoInstance.css('background-size', '50%');
//             if (!isScanning) {
//                 scanCode();
//             }
//         } else {
//             infoObjText = 'Get closer🥺';
//             infoTextColor = '#FB3B1E';
//             // infoInstance.css('background', 'rgba(251, 59, 30, 0.2)');
//             infoInstance.css('background', 'none');
//         }
//         infoText.text(infoObjText);
//         infoText.css({
//             'margin-left': x + (Math.abs((w / 2) - (infoObjText.width('3.6vh Calibri') / 2))) + videoLeftOffset + 'px',
//             'margin-top': y - (h / 2.2) + videoTopOffset - 30 + 'px',
//             'width': w - 20 + 'px',
//             'height': h - 20 + 'px',
//             'color': infoTextColor,
//         });
//
//         infoInstance.css({
//             'left': x + videoLeftOffset + 'px',
//             'top': y - (h / 1.6) + videoTopOffset + 'px',
//             'width': w + 'px',
//             'height': h + 'px',
//         });
//         children.push(infoInstance);
//         children.push(infoText);
//     } else {
//         failedToScan = false;
//         $(".usage-help-div").show();
//     }
//     window.requestAnimationFrame(autoScan);
// }

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


async function scanCode() {
    $(".usage-help").text('Taking a picture...📸\nHold still!');
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
    $(".usage-help").text('Scanning...');
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
                failedToScan = true;
                frameZero = true;
            } else {
                window.location.replace('data-preview/' + resp['code-id']);
            }
        });
    btnCapture.style.background = "transparent url('/static/icons/scan-button.png') no-repeat top left";
    btnCapture.style.backgroundSize = "cover";
    if (failedToScan) {
        isScanning = false;
    }
    $(".usage-help").text('Please move closer and then try again!');

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
var video = $('.video-preview')[0];


/*permissions*/
$(function () {
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
                    {minWidth: 1920},
                    {minWidth: 2560},
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
});

const headers = {
    'Content-Type': 'application/json',
};

/*Scan button*/
document.getElementById("scan-button").addEventListener("click", function () {
    scanCode();
});


async function scanCode() {
    var stream = document.getElementById("stream");
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
        'decode-type': 'image',
        'in-data': base64Img,
        'user-id': null,
        'style-info': {
            'name': 'geom-original',
        }
    }
    await fetch(`/image-decode-request`, options = {
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

// async function scanAutoCron() {
//     var stream = document.getElementById("stream");
//     var btnCapture = document.getElementById("scan-button");
//
//     var capture = document.createElement('canvas');
//
//     if (null != stream) {
//         capture.width = stream.videoWidth;
//         capture.height = stream.videoHeight;
//         var ctx = capture.getContext('2d');
//
//         ctx.drawImage(stream, 0, 0, stream.videoWidth, stream.videoHeight);
//     }
//     var base64Img = capture.toDataURL('image/jpeg', 1).replace('data:image/jpeg;base64,', '');
//     var data = {
//         'decode-type': 'image',
//         'in-data': base64Img,
//         'user-id': null,
//         'style-info': {
//             'name': 'geom-original',
//         }
//     }
//     await fetch(`{{API_URL}}/coji-code/decode`, options = {
//         method: "POST", body: JSON.stringify(data), headers: headers,
//     })
//         .then(await function (response) {
//             return response.text();
//         }).then(await function (text) {
//             btnCapture.style.background = "transparent url('/static/icons/scan-button.png') no-repeat top left";
//             btnCapture.style.backgroundSize = "cover";
//
//             console.log('POST response text:');
//             console.log(text);
//
//             var resp = JSON.parse(text);
//             if (!resp['error']) {
//                 window.location.replace('data-preview/' + resp['code-id']);
//             }
//         });
// }
//
// var scancron = window.setInterval(function(){
//     scanAutoCron();
// }, 2000);

/*keybaord decode*/

import os

import json
import validators
import requests as r
from flask import (Flask, Response, redirect, render_template, request)
from flask_cors import CORS

from static.constants import *

app = Flask(__name__)
CORS(app)
API_URL = os.environ.get('API_URL') or 'https://api.coji.ai'
DATA_TYPES = ['text', 'url']  # , 'file'


# GET pages
# main page
@app.route('/', methods=['get'])
def index():
    """Main page"""
    return render_template('index.html')


@app.route('/index-iframe', methods=['get'])
def index_iframe():
    """Index page iframe"""
    return render_template('index-iframe.html')


# data preview page
@app.route('/data-preview/<id>', methods=['get'])
def data_preview(id):
    """Retrieve the encoded info"""
    resp = r.get(f'{API_URL}/coji-code/get/{id}')
    if resp.status_code == 200:
        code_info = resp.json().get('data', None)
        if not code_info:
            return render_template('error-page.html', ERROR='Code not found!')
        elif code_info['data-type'] == 'text':
            return render_template('data-preview-text.html', code_info=code_info)
        elif code_info['data-type'] == 'ar-model':
            return render_template('data-preview-ar-model.html', in_data=code_info['in-data'])
        elif code_info['data-type'] == 'ar-preview':
            resp = r.get(code_info['in-data'])
            preview_code = resp.content.decode('utf8')
            return render_template('data-preview-ar.html', PREVIEW_CODE=preview_code)
        elif code_info['data-type'] == 'url':
            return redirect(code_info['in-data'])
        return 'Not yet supported'
    elif resp.status_code == 422:
        return render_template('error-page.html', ERROR='Code not found!')

    return render_template('error-page.html', ERROR='Something went wrong!')


# map location page
@app.route('/location-decode/<location>', methods=['get'])
def location_decode(location):
    """Dummy map with codes"""
    resp = r.get(f'{API_URL}/coji-code/get-by-city/{location}')
    if resp.status_code == 200:
        codes = resp.json().get('data', None)
        return render_template('location-decode.html', CODES=enumerate(codes.items()), LOCATION=location)
    return render_template('index.html', ERROR='Something went wrong')


# keyboard decode page
@app.route('/keyboard-decode', methods=['get'])
def keyboard_decode():
    """Decode using keyboard"""
    return render_template('keyboard-decode.html')


# what is this page
@app.route('/what-is-this', methods=['get'])
def what_is_this():
    """Info page"""
    return render_template('what-is-this.html')


# POST pages
@app.route('/keyboard-decode', methods=['post'])
def keyboard_decode_post():
    """Decode using keyboard (post)"""
    code_in = request.form.get('keyboard-decode-in', None)
    user_data = request.form.get('user-data', None)
    print(code_in)
    if code_in:
        if user_data:
            user_data = json.loads(user_data)
        in_data = DECODE_POST_JSON.copy()
        in_data['decode-type'] = 'keyboard'
        in_data['in-data'] = code_in
        in_data['user-data'] = user_data
        resp = r.post(f'{API_URL}/coji-code/decode', json=in_data)
        data = resp.json()
        if resp.status_code == 200 and not data.get('error'):
            return redirect('data-preview/' + data['code-id'], code=302)
        error = data.get('text') or 'Failed to decode your code, please try again later!'
    else:
        error = 'Please enter the code first!'
    return render_template('keyboard-decode.html', ERROR=error)


# static

@app.route('/scripts/main.js')
def scripts_main_js():
    return render_template('scripts/main.js', API_URL=API_URL)


if bool(os.environ.get('IS_DEV_ENV', True)):
    print('CODE GENERATION ENABLED!')


    @app.route('/create-code')
    def create_code():
        return render_template('create-code.html', data_types=DATA_TYPES)


    @app.route('/create-code-submit', methods=['post'])
    def create_code_post():
        """Create a new code (post form)"""
        data_type = request.form.get('data-type', None)
        in_data = request.form.get(f'{data_type}-in', None)
        location = request.form.get('location-in', None)

        if data_type and in_data:
            if data_type == 'url' and validators.url(in_data) or data_type != 'url':
                data = CREATE_POST_JSON.copy()
                data['in-data'] = in_data
                data['data-type'] = data_type
                data['location'] = location
                resp = r.post(f'{API_URL}/coji-code/create', json=data)
                data = resp.json()
                if resp.status_code == 200 and not data.get('error'):
                    return render_template('download-code.html', code_image=data['image'], char_code=data['code'])
                error = data.get('text') or 'Failed create a new code, try again later'
            else:
                error = 'You url is not valid!'
        else:
            error = 'Wrong values. Please try again!'
        return render_template('create-code.html', ERROR=error)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)

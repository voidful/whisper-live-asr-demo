import argparse
import json
import os
import sys
import warnings
from datetime import datetime
from http.client import HTTPException
from io import BytesIO

from asrp import HFWhisperInference
from flask import Flask, send_from_directory, send_file, jsonify, Response
from flask import request, redirect
from flask_cors import CORS, cross_origin
from gevent.pywsgi import WSGIServer
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
warnings.filterwarnings("ignore")


class ServerError(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        error_dict = dict(self.payload or ())
        error_dict['message'] = self.message
        return error_dict


def make_app(asr_model, static_dir: str = None) -> Flask:
    static_dir = os.path.abspath(static_dir)
    app = Flask(__name__, static_folder=static_dir)

    def write_wav(blob):
        buf = BytesIO()
        opus_data = BytesIO(blob)
        audio = AudioSegment.from_file(opus_data)
        duration = audio.duration_seconds
        return {'file': audio.export(buf, format='wav'), 'duration': duration}

    @app.route('/')
    def index() -> Response:  # pylint: disable=unused-variable
        if static_dir is not None:
            return send_file(os.path.join(static_dir, 'index.html'))

    @app.route('/<path:path>')
    def static_proxy(path: str) -> Response:
        if static_dir is not None:
            return send_from_directory(static_dir, path)
        else:
            return send_file(os.path.join(static_dir, 'index.html'))

    @app.before_request
    def before_request():
        if not request.is_secure:
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            return redirect(url, code=code)

    @app.route('/asr', methods=['POST'])
    @cross_origin()
    def home():
        if request.method == 'POST':
            start_time = datetime.now()
            wav = write_wav(request.data)
            text = asr_model.file_to_text(wav['file'])
            res = {'result': text,
                   'character_count': len(''.join(text.split())),
                   'audio_duration': wav['duration'],
                   'receive_time': start_time.isoformat(),
                   'return_time': datetime.now().isoformat(),
                   'transcribe_time': (datetime.now() - start_time).total_seconds()}
            return json.dumps(res, ensure_ascii=False)
        return "ASR"

    @app.errorhandler(Exception)
    def handle_error(e):
        code = 500
        if isinstance(e, HTTPException):
            code = e.code
        return jsonify(error=str(e)), code

    return app


def main(args):
    parser = argparse.ArgumentParser(description='Serve up a demo website model')
    parser.add_argument('--model', type=str, help='huggingface speech model')
    parser.add_argument('--port', type=int, default=12380, help='port to serve the demo on')

    args = parser.parse_args(args)
    asr = HFWhisperInference(model_name=args.model)

    app = make_app(asr, static_dir='./website')
    CORS(app)

    http_server = WSGIServer(('0.0.0.0', args.port),
                             application=app,
                             keyfile='key.pem',
                             certfile='cert.pem')
    print("Server started on port", args.port)
    http_server.serve_forever()


if __name__ == "__main__":
    main(sys.argv[1:])

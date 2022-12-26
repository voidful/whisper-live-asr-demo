FROM pytorch/pytorch:latest
ENV DEBIAN_FRONTEND="noninteractive" TZ="Asia/Taipei"

RUN apt-get -y update
RUN apt-get install -y libsndfile1 build-essential ffmpeg

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Python dependencies
COPY requirements.txt /usr/src/app/requirements.txt
RUN pip install -r requirements.txt
RUN conda install pytorch torchvision torchaudio pytorch-cuda=11.7 -c pytorch -c nvidia

# Copy source project
COPY . /usr/src/app/
RUN openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -sha256 -days 3650 -subj /CN=localhost -out cert.pem
CMD PYTHONIOENCODING=utf8 python app.py --model voidful/whisper-small-zh-TW --port 443
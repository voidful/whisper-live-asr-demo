# Whisper Live Demo
- all whisper model in huggingface's model hub https://huggingface.co/models?other=whisper
- running vad in frontend with multiple adjustable parameters to save backed resources

![](https://i.imgur.com/y5TytRz.png)

## How to run:

1. generate cert:

```shell
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -sha256 -days 3650 -subj /CN=localhost -out cert.pem
```

2. run server with [`voidful/whisper-small-zh-TW`](https://huggingface.co/voidful/whisper-small-zh-TW) from huggingface:

```shell
PYTHONIOENCODING=utf8 python app.py --model voidful/whisper-small-zh-TW --port 443
```

or

`docker compose up`

3. open `https://localhost:443` in browser
4. enjoy!

## configuration
webad vad event bus api:  
https://github.com/voidful/WeBAD/tree/master#webad-event-bus-api-solution

## Notes
you can also generate cert from    
https://certbot.eff.org/instructions
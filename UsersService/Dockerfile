FROM python:3.12

WORKDIR /src

COPY main.py /src
COPY settings.py /src
COPY app /src/app
COPY openssl /src/openssl
COPY requirements.txt /src

RUN pip install -r requirements.txt

CMD ["python3", "main.py"]
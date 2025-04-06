FROM ubuntu:latest
WORKDIR /app

RUN apt update
RUN apt install -y httpdirfs
RUN mkdir index

CMD httpdirfs -f --cache --no-range-check ${INDEX_URL} index

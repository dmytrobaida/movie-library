FROM ubuntu:latest
WORKDIR /app

RUN apt update
RUN apt install -y httpdirfs

CMD ["bash"]
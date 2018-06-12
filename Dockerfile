FROM node:9-alpine
LABEL maintainer="Lance Bekker <lebeker@gmail.com>"

RUN apk add --no-cache --virtual .persistent-deps \
        openssl \
    # Install node packages
    && npm install --silent --save-dev -g \
        typescript

COPY dist app

# Set up the application directory
# VOLUME ["/app"]  ??? 4 DEV ???
WORKDIR /app

CMD ["node", "/app/run.js"]
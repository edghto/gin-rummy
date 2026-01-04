FROM golang:1.25-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o gin-rummy

FROM golang:1.25-alpine AS app

COPY --from=build app/gin-rummy /usr/bin/gin-rummy
COPY prompt.tmpl /usr/etc/gin-rummy-prompt.tmpl

CMD ["gin-rummy"]
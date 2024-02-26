# Verwenden Sie ein offizielles Go-Bild für den Build
FROM archlinux:latest as builder

RUN pacman -Syu --noconfirm
RUN pacman -S --noconfirm go git taglib gcc pkgconf

WORKDIR /app
COPY go.mod go.sum ./
COPY cmd cmd
COPY pkg pkg

ENV CGO_ENABLED=1
ENV GOOS=linux
RUN go env -w GOMODCACHE=/gomod-cache
RUN go env -w GOCACHE=/go-cache

RUN --mount=type=cache,target=/gomod-cache \
  go mod download
RUN --mount=type=cache,target=/gomod-cache --mount=type=cache,target=/go-cache \ 
  go build -o main cmd/main.go


FROM archlinux:latest

RUN pacman -Syu --noconfirm
RUN pacman -S --noconfirm taglib

WORKDIR /app
COPY --from=builder /app/main .
COPY ./config.docker.toml ./config.toml

EXPOSE 8080
CMD ["./main"]
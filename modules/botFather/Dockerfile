FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod go.sum* ./

RUN go mod download

COPY . .

RUN go build -o bot-father bot-father.go container_handler.go types.go

# Expose the port the app runs on
EXPOSE 8081

CMD ["./bot-father"]

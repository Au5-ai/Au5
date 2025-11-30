package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

var botImage string

func main() {
	botImage = os.Getenv("BOT_IMAGE")
	if botImage == "" {
		botImage = "mhakarimi/au5-bot:latest"
	}
	log.Printf("Using bot image: %s", botImage)

	http.HandleFunc("/create-container", createContainerHandler)
	http.HandleFunc("/remove-container", removeContainerHandler)
	http.HandleFunc("/removal-status", checkRemovalStatusHandler)
	fmt.Println("BotFather is listening on :8081")

	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

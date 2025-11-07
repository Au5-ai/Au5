package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/create-container", createContainerHandler)
	http.HandleFunc("/remove-container", removeContainerHandler)
	http.HandleFunc("/removal-status", checkRemovalStatusHandler)
	fmt.Println("BotFather is listening on :8081")
	
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

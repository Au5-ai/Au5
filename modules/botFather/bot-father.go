package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/create-container", createContainerHandler)
	fmt.Println("BotFather is listening on :8080")
	http.ListenAndServe(":8080", nil)
}

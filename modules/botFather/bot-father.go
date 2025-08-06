package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

func createContainerHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cli.Close()

	response, err := cli.ContainerCreate(ctx, &container.Config{
		Image: "redis",
	}, nil, nil, nil, "")

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if response.ID == "" {
		http.Error(w, "Failed to create container", http.StatusInternalServerError)
		return
	}

	startOptions := container.StartOptions{
		// CheckpointID: "checkpoint-id",     // Optional: ID of checkpoint to restore from
		// CheckpointDir: "/path/to/checkpoint", // Optional: Directory containing checkpoint files
	}
	
	err = cli.ContainerStart(ctx, response.ID, startOptions)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to start container: %v", err), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Container created and started: %s\n", response.ID)
}

func main() {
	http.HandleFunc("/create-container", createContainerHandler)
	fmt.Println("BotFather is listening on :8080")
	http.ListenAndServe(":8080", nil)
}

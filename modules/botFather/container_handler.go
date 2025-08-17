package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

func createContainerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var meetingConfig MeetingConfig
	if err := json.NewDecoder(r.Body).Decode(&meetingConfig); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cli.Close()

	// Convert MeetingConfig to a single JSON environment variable
	meetingConfigJSON, err := json.Marshal(meetingConfig)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to marshal meeting config: %v", err), http.StatusInternalServerError)
		return
	}
	
	envVars := []string{
		"MEETING_CONFIG=" + string(meetingConfigJSON),
	}

	response, err := cli.ContainerCreate(ctx, &container.Config{
		Image: "au5-bot",
		Env:   envVars,
	},  &container.HostConfig{
        NetworkMode: container.NetworkMode("au5"),
    }, nil, nil, "Bot--"+meetingConfig.MeetId+"--"+meetingConfig.HashToken)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if response.ID == "" {
		http.Error(w, "Failed to create container", http.StatusInternalServerError)
		return
	}

	startOptions := container.StartOptions{
	}

	err = cli.ContainerStart(ctx, response.ID, startOptions)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to start container: %v", err), http.StatusInternalServerError)
		return
	}

	// Return success response with container ID and meeting config
	response_data := map[string]any{
		"container_id":  response.ID,
		"message":       "Container created and started successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response_data)
}

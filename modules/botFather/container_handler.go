// package main

// import (
// 	"context"
// 	"encoding/json"
// 	"fmt"
// 	"net/http"

// 	"github.com/docker/docker/api/types/container"
// 	"github.com/docker/docker/client"
// )

// func createContainerHandler(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	var meetingConfig MeetingConfig
// 	if err := json.NewDecoder(r.Body).Decode(&meetingConfig); err != nil {
// 		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
// 		return
// 	}

// 	ctx := context.Background()

// 	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	defer cli.Close()

// 	// Convert MeetingConfig to a single JSON environment variable
// 	meetingConfigJSON, err := json.Marshal(meetingConfig)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Failed to marshal meeting config: %v", err), http.StatusInternalServerError)
// 		return
// 	}

// 	envVars := []string{
// 		"MEETING_CONFIG=" + string(meetingConfigJSON),
// 	}

// 	response, err := cli.ContainerCreate(ctx, &container.Config{
// 		Image: "au5-bot",
// 		Env:   envVars,
// 	},  &container.HostConfig{
//         NetworkMode: container.NetworkMode("au5"),
//     }, nil, nil, "Bot--" + meetingConfig.MeetId+"--"+meetingConfig.HashToken)

// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	if response.ID == "" {
// 		http.Error(w, "Failed to create container", http.StatusInternalServerError)
// 		return
// 	}

// 	startOptions := container.StartOptions{
// 	}

// 	err = cli.ContainerStart(ctx, response.ID, startOptions)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Failed to start container: %v", err), http.StatusInternalServerError)
// 		return
// 	}

// 	// Return success response with container ID and meeting config
// 	response_data := map[string]any{
// 		"container_id":  response.ID,
// 		"message":       "Container created and started successfully",
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(response_data)
// }

// func removeContainerHandler(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	var removeRequest struct {
// 		MeetId    string `json:"meetId"`
// 		HashToken string `json:"hashToken"`
// 	}

// 	if err := json.NewDecoder(r.Body).Decode(&removeRequest); err != nil {
// 		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
// 		return
// 	}

// 	if removeRequest.MeetId == "" || removeRequest.HashToken == "" {
// 		http.Error(w, "meetId and hashToken are required", http.StatusBadRequest)
// 		return
// 	}

// 	ctx := context.Background()

// 	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	defer cli.Close()

// 	// Construct the container name based on the pattern used in creation
// 	containerName := "Bot--" + removeRequest.MeetId + "--" + removeRequest.HashToken

// 	// Find the container by name
// 	containers, err := cli.ContainerList(ctx, container.ListOptions{All: true})
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Failed to list containers: %v", err), http.StatusInternalServerError)
// 		return
// 	}

// 	var containerID string
// 	for _, cont := range containers {
// 		for _, name := range cont.Names {
// 			// Container names include a leading '/', so we need to check with and without it
// 			if name == "/"+containerName || name == containerName {
// 				containerID = cont.ID
// 				break
// 			}
// 		}
// 		if containerID != "" {
// 			break
// 		}
// 	}

// 	if containerID == "" {
// 		http.Error(w, fmt.Sprintf("Container not found for meetId: %s and hashToken: %s", removeRequest.MeetId, removeRequest.HashToken), http.StatusNotFound)
// 		return
// 	}

// 	// Stop the container first (if it's running)
// 	if err := cli.ContainerStop(ctx, containerID, container.StopOptions{}); err != nil {
// 		// Log the error but continue with removal - container might already be stopped
// 		fmt.Printf("Warning: Failed to stop container %s: %v\n", containerID, err)
// 	}

// 	// Remove the container
// 	if err := cli.ContainerRemove(ctx, containerID, container.RemoveOptions{Force: true}); err != nil {
// 		http.Error(w, fmt.Sprintf("Failed to remove container: %v", err), http.StatusInternalServerError)
// 		return
// 	}

// 	// Return success response
// 	response_data := map[string]any{
// 		"container_id": containerID,
// 		"message":      "Container stopped and removed successfully",
// 		"meetId":       removeRequest.MeetId,
// 		"hashToken":    removeRequest.HashToken,
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(response_data)
// }

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

// ---------- Utility Helpers ----------

func jsonResponse(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func jsonError(w http.ResponseWriter, status int, message string) {
	jsonResponse(w, status, map[string]string{"error": message})
}

func newDockerClient() (*client.Client, error) {
	return client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
}

func containerName(meetId, hashToken string) string {
	return "Bot--" + meetId + "--" + hashToken
}

// ---------- Handlers ----------

func createContainerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var meetingConfig MeetingConfig
	if err := json.NewDecoder(r.Body).Decode(&meetingConfig); err != nil {
		jsonError(w, http.StatusBadRequest, fmt.Sprintf("Invalid JSON: %v", err))
		return
	}

	ctx := context.Background()
	cli, err := newDockerClient()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer cli.Close()

	// Convert MeetingConfig to environment variable
	meetingConfigJSON, err := json.Marshal(meetingConfig)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to marshal meeting config: %v", err))
		return
	}

	envVars := []string{
		"MEETING_CONFIG=" + string(meetingConfigJSON),
	}

	resp, err := cli.ContainerCreate(
		ctx,
		&container.Config{
			Image: "au5-bot",
			Env:   envVars,
		},
		&container.HostConfig{NetworkMode: container.NetworkMode("au5")},
		nil,
		nil,
		containerName(meetingConfig.MeetId, meetingConfig.HashToken),
	)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create container: %v", err))
		return
	}

	if err := cli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		jsonError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to start container: %v", err))
		return
	}

	jsonResponse(w, http.StatusOK, map[string]any{
		"container_id": resp.ID,
		"message":      "Container created and started successfully",
	})
}

func removeContainerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req MeetingConfig
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, fmt.Sprintf("Invalid JSON: %v", err))
		return
	}
	if req.MeetId == "" || req.HashToken == "" {
		jsonError(w, http.StatusBadRequest, "meetId and hashToken are required")
		return
	}

	ctx := context.Background()
	cli, err := newDockerClient()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer cli.Close()

	name := containerName(req.MeetId, req.HashToken)

	// Try stopping container
	if err := cli.ContainerStop(ctx, name, container.StopOptions{}); err != nil {
		log.Printf("Warning: Failed to stop container %s: %v\n", name, err)
	}

	// Remove container
	if err := cli.ContainerRemove(ctx, name, container.RemoveOptions{Force: true}); err != nil {
		jsonError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to remove container: %v", err))
		return
	}

	jsonResponse(w, http.StatusOK, map[string]any{
		"container_id": name,
		"message":      "Container stopped and removed successfully",
		"meetId":       req.MeetId,
		"hashToken":    req.HashToken,
	})
}
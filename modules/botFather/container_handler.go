package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

// Global status tracker for removal operations
var (
	removalStatuses = make(map[string]*RemovalStatus)
	statusMutex     = sync.RWMutex{}
)

// Helper functions for status tracking
func setRemovalStatus(containerName string, status *RemovalStatus) {
	statusMutex.Lock()
	defer statusMutex.Unlock()
	removalStatuses[containerName] = status
}

func getRemovalStatus(containerName string) (*RemovalStatus, bool) {
	statusMutex.RLock()
	defer statusMutex.RUnlock()
	status, exists := removalStatuses[containerName]
	return status, exists
}

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

	var req struct {
		MeetId    string `json:"meetId"`
		HashToken string `json:"hashToken"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, fmt.Sprintf("Invalid JSON: %v", err))
		return
	}
	if req.MeetId == "" || req.HashToken == "" {
		jsonError(w, http.StatusBadRequest, "meetId and hashToken are required")
		return
	}

	name := containerName(req.MeetId, req.HashToken)

	// Respond immediately to client
	jsonResponse(w, http.StatusAccepted, map[string]any{
		"container_name": name,
		"message":        "Container removal initiated",
		"meetId":         req.MeetId,
		"hashToken":      req.HashToken,
		"status":         "processing",
	})

	// Handle container removal asynchronously
	go func() {
		// Set initial status
		setRemovalStatus(name, &RemovalStatus{
			Status:    "processing",
			Message:   "Container removal in progress",
			Timestamp: time.Now().Unix(),
		})

		if err := removeContainerAsync(name); err != nil {
			log.Printf("Error removing container %s: %v", name, err)
			setRemovalStatus(name, &RemovalStatus{
				Status:    "failed",
				Message:   "Container removal failed",
				Error:     err.Error(),
				Timestamp: time.Now().Unix(),
			})
		} else {
			log.Printf("Successfully removed container %s", name)
			setRemovalStatus(name, &RemovalStatus{
				Status:    "completed",
				Message:   "Container removed successfully",
				Timestamp: time.Now().Unix(),
			})
		}
	}()
}

// removeContainerAsync handles the actual container removal process
func removeContainerAsync(containerName string) error {
	ctx := context.Background()
	cli, err := newDockerClient()
	if err != nil {
		return fmt.Errorf("failed to create docker client: %v", err)
	}
	defer cli.Close()

	// Try stopping container first
	if err := cli.ContainerStop(ctx, containerName, container.StopOptions{}); err != nil {
		log.Printf("Warning: Failed to stop container %s: %v", containerName, err)
		// Continue with removal even if stop fails
	}

	// Remove container
	if err := cli.ContainerRemove(ctx, containerName, container.RemoveOptions{Force: true}); err != nil {
		return fmt.Errorf("failed to remove container %s: %v", containerName, err)
	}

	return nil
}

// checkRemovalStatusHandler allows clients to check the status of a removal operation
func checkRemovalStatusHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	meetId := r.URL.Query().Get("meetId")
	hashToken := r.URL.Query().Get("hashToken")

	if meetId == "" || hashToken == "" {
		jsonError(w, http.StatusBadRequest, "meetId and hashToken query parameters are required")
		return
	}

	name := containerName(meetId, hashToken)
	status, exists := getRemovalStatus(name)

	if !exists {
		jsonError(w, http.StatusNotFound, "No removal operation found for this container")
		return
	}

	jsonResponse(w, http.StatusOK, map[string]any{
		"container_name": name,
		"meetId":         meetId,
		"hashToken":      hashToken,
		"removal_status": status,
	})
}
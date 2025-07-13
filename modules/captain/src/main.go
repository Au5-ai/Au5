package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
)

type AutoLeaveConfig struct {
	WaitingEnter      int `json:"waitingEnter"`
	NoParticipant     int `json:"noParticipant"`
	AllParticipantsLeft int `json:"allParticipantsLeft"`
}

type MeetingSettings struct {
	VideoRecording     bool   `json:"video_recording"`
	AudioRecording     bool   `json:"audio_recording"`
	Transcription      bool   `json:"transcription"`
	TranscriptionModel string `json:"transcription_model"`
}

type MeetingConfig struct {
	HubUrl          string          `json:"hubUrl"`
	Platform        string          `json:"platform"`
	MeetingUrl      string          `json:"meetingUrl"`
	BotDisplayName  string          `json:"botDisplayName"`
	MeetingId       string          `json:"meetingId"`
	Language        string          `json:"language"`
	AutoLeave       AutoLeaveConfig `json:"autoLeave"`
	MeetingSettings MeetingSettings `json:"meeting_settings"`
}

func handleStartBot(w http.ResponseWriter, r *http.Request) {
	var config MeetingConfig
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	configBytes, err := json.Marshal(config)
	if err != nil {
		http.Error(w, "Failed to serialize config", http.StatusInternalServerError)
		return
	}
	configStr := string(configBytes)

	// Compose podman command
	cmd := exec.Command("podman", "run", "-d",
		"--name", config.MeetingId,
		"--network=au5net",
		"-e", fmt.Sprintf("MEETING_CONFIG=%s", configStr),
		"au5-bot",
	)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		log.Printf("Failed to run podman: %s", stderr.String())
		http.Error(w, "Failed to start bot container", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Bot started for meeting ID: %s\n", config.MeetingId)
}

func main() {
	http.HandleFunc("/meeting/addBot", handleStartBot)
	fmt.Println("Server started on :1370")
	log.Fatal(http.ListenAndServe(":1380", nil))
}

package main

type AutoLeaveConfig struct {
	WaitingEnter        int `json:"waitingEnter"`
	NoParticipant       int `json:"noParticipant"`
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
	MeetId          string          `json:"meetId"`
	HashToken       string          `json:"hashToken"`
	Language        string          `json:"language"`
	AutoLeave       AutoLeaveConfig `json:"autoLeave"`
	MeetingSettings MeetingSettings `json:"meeting_settings"`
}
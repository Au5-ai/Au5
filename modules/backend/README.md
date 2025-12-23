Configs for backend module.

```

# Environment variables for CORS
ENV Cors__AllowedOrigins__0="http://localhost:3001"
ENV Cors__AllowedOrigins__1="https://localhost:8000"
ENV Cors__AllowedOrigins__2="https://localhost:8001"

# Environment variables for JWT Settings
ENV JwtSettings__SecretKey="CgOZGhxCXD4gpFfA8iPGBS5f0ZzGva1i2R9hLFiPICc="
ENV JwtSettings__EncryptionKey="NekPtiUPYrlLr0dx3zJRtwga3pJNgccm1aO5+zWGMOc="
ENV JwtSettings__Issuer="Au5.BackEnd"
ENV JwtSettings__Audience="Au5.Client"
ENV JwtSettings__ExpiryMinutes="1000"

# Environment variables for Organization Configuration
ENV Organization__Direction="rtl"
ENV Organization__Language="fa-IR"
ENV Organization__HubUrl="http://localhost:1366/meetingHub"
ENV Organization__ServiceBaseUrl="http://localhost:1366"
ENV Organization__BotFatherUrl="http://localhost:8081"
ENV Organization__BotHubUrl="http://host.containers.internal:1366/meetingHub"
ENV Organization__PanelUrl="http://localhost:3001"
ENV Organization__OpenAIProxyUrl="https://api.openai.com/v1"
ENV Organization__OpenAIToken="YOUR_OPENAI_API_KEY"
ENV Organization__AutoLeaveWaitingEnter="30000"
ENV Organization__AutoLeaveNoParticipant="60000"
ENV Organization__AutoLeaveAllParticipantsLeft="120000"
ENV Organization__MeetingVideoRecording="false"
ENV Organization__MeetingAudioRecording="false"
ENV Organization__MeetingTranscription="true"
ENV Organization__MeetingTranscriptionModel="liveCaption"
ENV Organization__SmtpUseSSl="false"
ENV Organization__SmtpHost="https://mail.au5.ai"
ENV Organization__SmtpPort="25"
ENV Organization__SmtpUser="Admin@au5.ai"
ENV Organization__SmtpPassword="!QAZ2wsx"

# Environment variables for Cache Settings
ENV ServiceSettings__UseRedis="false"
ENV ServiceSettings__TokenCleanupIntervalMinutes="60"

```

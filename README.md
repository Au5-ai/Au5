![High Level Design](docs/au5-hld.png)

> [!WARNING]
> This software has not received external security review and may contain vulnerabilities and may not necessarily meet its stated security goals. Do not use it for sensitive use cases, and do not rely on its security until it has been reviewed. Work in progress.

# Au5 Bot

This bot is designed to integrate with platforms like Google Meet, Zoom, and others to transcribe participant speech in real-time. Transcriptions are sent to a server using WebSocket for further processing or storage.

## Features

- Real-time transcription of meeting participants
- Supports multiple platforms (Google Meet, Zoom, etc.)
- Pushes transcriptions to a server via WebSocket
- Configurable meeting settings (language, recording, auto-leave, etc.)

  https://github.com/Au5-ai/Au5/tree/main/modules/bot

# Au5 Backend

## Start SqlServer

docker run --network=au5 -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=!qaz@wsx" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-lts

## 🔌 Redis Setup (with Docker or Podman)

This project uses Redis for caching or other services. If you don't have a Redis instance running already, you can start one using Docker or Podman.

### Start Redis Container

**Using Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis
```

**Using Podman:**

```bash
podman run -d --name redis -p 6379:6379 docker.io/library/redis
```

This will run a Redis container accessible at localhost:6379.

🛠️ Configuration Notes

The application is set up to connect to Redis at:

```bash
localhost:6379
```

If you are running Redis on a different host or port or
using a Docker network or a cloud Redis provider (like Azure Redis, AWS ElastiCache, etc.),

👉 You must update your Redis connection string in your configuration file:

```bash
  "ConnectionStrings": {
    "Redis": "localhost:6379"
}
```


<h1>Email Sending Mechanism</h1>

<p>This guide explains how to configure and use the email sending functionality in this application for both production and development environments.</p>

<h2>1. Production Configuration</h2>

<p>For production, enter SMTP server details in the <code>SystemConfig</code> table:</p>

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>SmtpHost</td><td>Hostname of your SMTP server (e.g., smtp.example.com)</td></tr>
    <tr><td>SmtpPort</td><td>Port of the SMTP server (e.g., 587)</td></tr>
    <tr><td>SmtpUser</td><td>Username for authentication</td></tr>
    <tr><td>SmtpPassword</td><td>Password for authentication</td></tr>
    <tr><td>UseSsl</td><td>true to enable SSL/TLS, false otherwise</td></tr>
  </tbody>
</table>

<p>Example configuration:</p>

<table>
  <thead>
    <tr>
      <th>SmtpHost</th><th>SmtpPort</th><th>SmtpUser</th><th>SmtpPassword</th><th>UseSsl</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>smtp.example.com</td>
      <td>587</td>
      <td>user@example.com</td>
      <td>password123</td>
      <td>true</td>
    </tr>
  </tbody>
</table>

<h2>2. Development Configuration</h2>

<p>For development, you can run a fake SMTP server to test email sending without sending real emails. Popular options include <strong>MailKit</strong> or similar tools. These servers allow you to inspect outgoing emails locally.</p>

<ul>
  <li>SMTP Host: <strong>localhost</strong></li>
  <li>SMTP Port: <strong>1025</strong> (example port)</li>
  <li>SSL: <strong>false</strong></li>
  <li>Username/Password: <strong>not required</strong></li>
</ul>

<p>As an example, you can refer to <a href="https://github.com/axllent/mailpit">Mailpit</a> for a ready-to-use fake SMTP solution.</p>

<h2>3. Code Usage</h2>

<p>Before sending emails, the app configures the SMTP connection based on <code>SystemConfig</code> values:</p>

<h3>3.1 How it works</h3>
<ul>
  <li>If <code>UseSsl</code> is true, a secure connection is used. Otherwise, the connection is unencrypted.</li>
  <li>If username and password are provided, the SMTP client authenticates. Otherwise, authentication is skipped.</li>
  <li>This allows sending emails in both production and development environments.</li>
</ul>




# Au5 Extension

# Au5 Captain

# Au5 Panel

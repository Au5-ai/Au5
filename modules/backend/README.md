// Option 1: Simplified (if meetId is the primary identifier)
GET /meetings/{meetId}/transcription
GET /meetings/{meetId}/ai-contents
POST /meetings/{meetId}/bots
PATCH /meetings/{meetId} // with { "status": "closed" }
PATCH /meetings/{meetId} // with { "isFavorite": true }
PATCH /meetings/{meetId} // with { "isArchived": true }
POST /meetings/{meetId}/spaces/{spaceId}
GET /meetings/{meetId}/export?format=text

// Plural (REST standard) - GOOD
/users, /spaces, /meetings, /assistants, /reactions

// Singular - INCONSISTENT
/authentication, /system, /setup, /ai

// Recommended: Be consistent with plural nouns
/authentication → /auth-sessions or /tokens
/system → /system-configs
/setup → /setup-tasks or /onboarding

// AuthenticationController has custom error handling
return BadRequest(new ProblemDetails { ... })

// Others rely on global exception handler
// Need consistent error response format across all endpoints

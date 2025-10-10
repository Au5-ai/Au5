# Create Collection API

Create a new vector collection in the database for storing and retrieving vector embeddings.

## Endpoint

```
POST /api/collections/create
```

## Request Body

### Basic Example

```json
{
    "space_id": "my_collection"
}
```

### Full Example

```json
{
    "space_id": "my_collection",
    "config": {
        "size": 1536,
        "distance": "cosine",
        "on_disk": true
    }
}
```

### Parameters

| Name | Type | Required | Description | Default |
|------|------|----------|-------------|---------|
| space_id | string | Yes | Name of the collection to create. Must be unique. | - |
| config | object | No | Collection configuration | `CollectionConfig()` |
| config.size | integer | No | Dimension of vectors to be stored | 128 |
| config.distance | string | No | Distance function for similarity search | "cosine" |
| config.on_disk | boolean | No | Whether to store vectors on disk | true |

### Config Details

#### Distance Functions
- `"cosine"`: Cosine similarity (default) - Best for normalized vectors
- `"euclidean"`: Euclidean distance - Best for absolute distances
- `"dot"`: Dot product - Best for comparing magnitudes

#### Storage Options
- `on_disk`: When true (default), vectors are stored on disk for persistence. When false, vectors are kept in memory for faster access.

## Response

The API uses a standardized Result type that wraps all responses.

### Success Response (200 OK)

```json
{
    "status": 200,
    "is_success": true,
    "data": null,
    "error": null
}
```

### Error Responses

#### Collection Already Exists (400 Bad Request)

```json
{
    "status": 400,
    "is_success": false,
    "data": null,
    "error": "Collection already exists"
}
```

#### Creation Failed (500 Internal Server Error)

```json
{
    "status": 500,
    "is_success": false,
    "data": null,
    "error": "Failed to create collection"
}
```

## Example CURL

### Minimal Request
```bash
curl -X POST http://localhost:8000/api/collections/create \
  -H "Content-Type: application/json" \
  -d '{
    "space_id": "my_collection"
  }'
```

### Full Request
```bash
curl -X POST http://localhost:8000/api/collections/create \
  -H "Content-Type: application/json" \
  -d '{
    "space_id": "my_collection",
    "config": {
      "size": 1536,
      "distance": "cosine",
      "on_disk": true
    }
  }'
```

## Notes

1. Collections are uniquely identified by their `space_id`. Attempting to create a collection with an existing name will result in a 400 error.
2. The default vector size of 128 is suitable for small embeddings. For OpenAI embeddings, set size to 1536.
3. All responses use the Result type which includes status code, success flag, optional data, and optional error message.
4. On-disk storage (default) provides persistence but might be slower than in-memory storage.
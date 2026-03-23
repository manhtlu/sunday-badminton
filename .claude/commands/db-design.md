# /db-design — Design database schema from description

## Workflow

1. **Understand requirements** — analyze the user's description to identify:
   - Entities and their attributes
   - Relationships (1:1, 1:N, N:N)
   - Business rules and constraints
   - Query/access patterns (critical for NoSQL)

2. **Detect database type & stack**:

   **Relational (SQL)** — default when relationships are complex or ACID is required:
   - `composer.json` → Laravel migrations (Blueprint syntax)
   - `prisma/schema.prisma` → Prisma schema
   - `requirements.txt` with sqlalchemy/django → Python ORM
   - No ORM detected → raw SQL

   **NoSQL** — when user specifies or when data fits document/key-value model:
   - `package.json` with `mongodb`/`mongoose` → Mongoose schema
   - `package.json` with `firebase`/`firebase-admin` → Firestore rules + structure
   - `package.json` with `dynamoose`/`@aws-sdk/client-dynamodb` → DynamoDB table design
   - `requirements.txt` with `pymongo`/`motor` → PyMongo schema
   - `composer.json` with `mongodb/laravel-mongodb` → Laravel MongoDB
   - No driver detected → generic document schema (JSON)

   If ambiguous, ask the user which database type they prefer.

3. **Design schema**:

   ### For Relational (SQL)
   - Table names: plural, snake_case
   - Column names: snake_case
   - Always include `id`, `created_at`, `updated_at`
   - Foreign keys: `{referenced_table_singular}_id`
   - Index naming: `idx_{table}_{columns}`
   - Use appropriate column types (avoid generic `string` when specific types exist)
   - Add soft deletes (`deleted_at`) only when explicitly required

   ### For NoSQL (Document DB — MongoDB/Firestore/DynamoDB)
   - Collection names: plural, snake_case
   - Field names: snake_case (or camelCase if project convention)
   - Always include `created_at`, `updated_at`
   - Design around **access patterns**, not normalization:
     - Embed when: data is read together, 1:1 or 1:few, rarely changes independently
     - Reference when: data is shared across collections, 1:many or N:N, frequently updated independently
   - For DynamoDB: define partition key (PK), sort key (SK), and GSIs based on query patterns
   - For MongoDB: define indexes based on query patterns, use compound indexes when appropriate
   - For Firestore: define collection hierarchy and security rules structure
   - Document size limits: MongoDB 16MB, Firestore 1MB, DynamoDB 400KB

4. **Generate diagram**:

   ### For Relational — ERD (Mermaid)
   ```mermaid
   erDiagram
       TABLE_A ||--o{ TABLE_B : "relationship"
       TABLE_A {
           bigint id PK
           string name
           timestamp created_at
           timestamp updated_at
       }
   ```

   ### For NoSQL — Document Structure + Access Patterns
   ```mermaid
   graph TD
       subgraph Collection: users
           U["{ _id, name, email, profile: {...} }"]
       end
       subgraph Collection: orders
           O["{ _id, user_id, items: [...], status }"]
       end
       U -->|"user_id (reference)"| O
   ```

   Also output JSON sample documents:
   ```json
   // users collection
   {
     "_id": "ObjectId",
     "name": "string",
     "email": "string",
     "profile": {
       "avatar": "string",
       "bio": "string"
     },
     "created_at": "ISODate",
     "updated_at": "ISODate"
   }
   ```

5. **Generate implementation plan**:

   ### For SQL — Migration order:
   - Independent tables first (no foreign key dependencies)
   - Dependent tables after their references exist
   - Pivot tables last

   ### For NoSQL — Setup order:
   - Collection creation + indexes/GSIs
   - Validation rules / JSON Schema (if supported)
   - Security rules (Firestore) or IAM policies (DynamoDB)
   - Seed data structure

6. **Output format**:

   ```
   ## Database Design

   ### Type
   SQL (PostgreSQL/MySQL) or NoSQL (MongoDB/Firestore/DynamoDB)

   ### Diagram
   <mermaid diagram>

   ### Collections/Tables
   For each collection/table:
   - Purpose
   - Fields/Columns with types and constraints
   - Indexes (+ GSIs for DynamoDB)
   - Embedding vs referencing decisions (NoSQL)
   - Relationships

   ### Access Patterns (NoSQL)
   | # | Query | Collection | Index/Key | Notes |
   |---|-------|-----------|-----------|-------|
   | 1 | Get user by email | users | idx_users_email | unique |

   ### Implementation Order
   1. step — what it creates
   2. ...

   ### Notes
   - Design decisions and trade-offs
   - Embedding vs referencing rationale (NoSQL)
   - Scaling considerations (only if relevant)
   ```

7. **Ask before generating code** — present the design first, generate code only after user confirms.

## Input

$ARGUMENTS

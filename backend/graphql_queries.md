# GraphQL Operations for Playground

## 1. Register User using Mutation
**Operation:**
```graphql
mutation Register($username: String!, $email: String!, $password: String!) {
  register(input: {
    username: $username,
    email: $email,
    password: $password
  }) {
    id
    username
    email
    role
    createdAt
  }
}
```

**Variables:**
```json
{
  "username": "sohaib",
  "email": "sohaib@example.com",
  "password": "Dark:911"
}
```

---

## 2. Login using Mutation
**Operation:**
```graphql
mutation Login($username: String!, $password: String!) {
  login(input: {
    username: $username,
    password: $password
  }) {
    token
    user {
      id
      username
      role
    }
  }
}
```

**Variables:**
```json
{
  "username": "sohaib",
  "password": "Dark:911"
}
```

---

## 3. Get Current User Profile (Protected)
**Operation:**
```graphql
query Me {
  me {
    id
    username
    email
    role
  }
}
```

**Headers:**
To use this query, you must add the Authorization header in the "HTTP Headers" tab (bottom left of Playground):
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```
*(Replace `JWT_TOKEN` with the token string received from the Login mutation)*


## Testing and Verification

### Frontend

Run the production build:

```bash
cd client
npm install
npm run build
```

A successful build confirms that the frontend compiles. It does not prove that all UI interactions or API workflows work correctly.

### Backend

Run the backend tests:

```bash
cd server
npm install
npm test
```

Review the test output for passed, failed, and skipped tests. Integration tests that require MongoDB must be run with a valid local environment configuration.

### Manual Verification

Before submission, verify:

- Customer registration and login
- Administrator login and access restrictions
- Ticket creation and customer ticket listing
- Ticket search, filtering, and pagination
- Admin ticket status and priority updates
- Profile loading and saving, if supported
- Logout and protected-route behavior

Only report workflows as verified after testing them.

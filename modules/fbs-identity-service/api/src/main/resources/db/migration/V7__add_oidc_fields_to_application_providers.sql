ALTER TABLE application_providers ADD COLUMN oidc_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE application_providers ADD COLUMN redirect_uris TEXT NULL;
ALTER TABLE application_providers ADD COLUMN post_logout_redirect_uris TEXT NULL;
ALTER TABLE application_providers ADD COLUMN client_type VARCHAR(32) NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE application_providers ADD COLUMN scopes VARCHAR(255) NOT NULL DEFAULT 'openid,profile,email';
ALTER TABLE application_providers ADD COLUMN client_secret VARCHAR(255) NULL;

UPDATE application_providers
SET oidc_enabled = TRUE,
    client_id = 'course-management',
    redirect_uris = 'http://localhost:8082/oauth2/callback,http://127.0.0.1:8082/oauth2/callback',
    scopes = 'openid,profile,email'
WHERE id = 'course-management';

UPDATE application_providers
SET oidc_enabled = TRUE,
    client_id = 'sql-playground',
    redirect_uris = 'http://localhost:3001/oauth2/callback,http://127.0.0.1:3001/oauth2/callback,https://sql-playground.feedback.thm.de/oauth2/callback',
    scopes = 'openid,profile,email'
WHERE id = 'sql-playground';

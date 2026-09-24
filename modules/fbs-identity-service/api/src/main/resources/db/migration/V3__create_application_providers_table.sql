CREATE TABLE application_providers (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(64) NOT NULL,
    url VARCHAR(512) NOT NULL,
    embed_mode VARCHAR(32) NOT NULL DEFAULT 'IFRAME',
    required_global_role VARCHAR(32) NOT NULL DEFAULT 'ALL',
    navbar_position INT NOT NULL DEFAULT 100,
    show_in_navbar BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    client_id VARCHAR(128) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO application_providers (id, title, description, icon, url, embed_mode, required_global_role, navbar_position, show_in_navbar, is_default, is_active)
VALUES
('course-management', 'Kurse & Aufgaben', 'Verwaltung von Kursen, Aufgaben, Einreichungen und Noten', 'school', 'http://localhost:8082', 'IFRAME', 'USER', 10, TRUE, TRUE, TRUE),
('sql-playground', 'SQL Playground', 'Freies Experimentieren mit relationalen Datenbanken', 'terminal', 'http://localhost:3001', 'IFRAME', 'USER', 20, TRUE, FALSE, TRUE);

-- Seed initial default admin user (admin / admin123) for local, Docker and CI environments
INSERT IGNORE INTO `user`
    (`user_id`, `prename`, `surname`, `email`, `password`, `username`, `privacy_checked`, `deleted`, `alias`, `global_role`)
VALUES
    (1, 'Ada', 'Admin', 'admin@example.org',
     '$2y$10$W7tXl9/M7FC8EwxYn9UU7.3/rgWUGCODhsqInUxPJwYEZNzogxPF2',
     'admin', 1, 0, NULL, 0);

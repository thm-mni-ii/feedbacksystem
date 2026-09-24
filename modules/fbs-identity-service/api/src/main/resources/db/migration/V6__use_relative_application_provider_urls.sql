UPDATE application_providers
SET url = '/course-management/'
WHERE id = 'course-management' AND (url LIKE 'http://localhost%' OR url LIKE 'https://fbs.minikube.local%' OR url = '/course-management');

UPDATE application_providers
SET url = '/sql-playground/'
WHERE id = 'sql-playground' AND (url LIKE 'http://localhost%' OR url LIKE 'https://fbs.minikube.local%' OR url = '/sql-playground');

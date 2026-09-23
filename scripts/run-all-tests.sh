#!/usr/bin/env bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}        FBS 2.0 - Complete Test Suite Runner        ${NC}"
echo -e "${BLUE}====================================================${NC}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Identity Service Unit & Integration Tests
echo -e "\n${YELLOW}[1/4] Running Identity Service Gradle Tests...${NC}"
(
  cd "$ROOT_DIR/modules/fbs-identity-service/api"
  ./gradlew test --info
)
echo -e "${GREEN}✓ Identity Service tests passed.${NC}"

# 2. Web Shell Vitest & Type Check
echo -e "\n${YELLOW}[2/4] Running Web Shell Vitest Suite & Type Check...${NC}"
(
  cd "$ROOT_DIR/modules/fbs-web-shell"
  npm run type-check
  npm test
  npm run build-only
)
echo -e "${GREEN}✓ Web Shell tests & build passed.${NC}"

# 3. SQL Playground Angular Build
echo -e "\n${YELLOW}[3/4] Building SQL Playground...${NC}"
(
  cd "$ROOT_DIR/modules/sql-playground/web"
  npm run build
)
echo -e "${GREEN}✓ SQL Playground build passed.${NC}"

# 4. Playwright E2E Test Suite (if services are running or requested)
if [ "${RUN_E2E:-false}" = "true" ]; then
  echo -e "\n${YELLOW}[4/4] Running Playwright E2E Tests...${NC}"
  npx playwright test
  echo -e "${GREEN}✓ E2E tests passed.${NC}"
else
  echo -e "\n${BLUE}[4/4] Skipping E2E tests (Set RUN_E2E=true to execute against running docker topology).${NC}"
fi

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}        All FBS 2.0 Test Suites Passed!             ${NC}"
echo -e "${GREEN}====================================================${NC}"

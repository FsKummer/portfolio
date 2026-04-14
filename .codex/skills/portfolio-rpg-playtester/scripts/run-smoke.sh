#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-$PWD}"
BASE_URL="${2:-${PLAYTEST_BASE_URL:-}}"
PORT="${PLAYTEST_PORT:-4173}"
VISITOR_NAME="${PLAYTEST_NAME:-Codex}"
AVATAR="${PLAYTEST_AVATAR:-girl}"
HEADLESS="${PLAYTEST_HEADLESS:-1}"
CACHE_DIR="${PLAYWRIGHT_GAME_TESTER_CACHE_DIR:-${XDG_CACHE_HOME:-$HOME/.cache}/portfolio-rpg-playtester}"
TOOL_DIR="$CACHE_DIR/tooling"
RUN_DIR="$(mktemp -d "${TMPDIR:-/tmp}/portfolio-rpg-playtester.XXXXXX")"
ARTIFACT_DIR="${PLAYTEST_ARTIFACT_DIR:-$RUN_DIR/artifacts}"
SERVER_LOG="$RUN_DIR/vite.log"
SERVER_PID=""

if [[ "$HEADLESS" == "0" || "$HEADLESS" == "false" || "$HEADLESS" == "FALSE" ]]; then
  HEADLESS_BOOL="false"
else
  HEADLESS_BOOL="true"
fi

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

mkdir -p "$ARTIFACT_DIR" "$TOOL_DIR"

if [[ ! -f "$REPO_DIR/package.json" ]]; then
  echo "Expected repo root with package.json. Got: $REPO_DIR" >&2
  exit 1
fi

if [[ ! -f "$TOOL_DIR/package.json" ]]; then
  npm --prefix "$TOOL_DIR" init -y >/dev/null 2>&1
fi

if [[ ! -d "$TOOL_DIR/node_modules/@playwright/test" ]]; then
  npm --prefix "$TOOL_DIR" install --silent --save-dev @playwright/test@latest
fi

npx --prefix "$TOOL_DIR" playwright install chromium >/dev/null

if [[ -z "$BASE_URL" ]]; then
  BASE_URL="http://127.0.0.1:$PORT"
  (
    cd "$REPO_DIR"
    npm run dev -- --host 127.0.0.1 --port "$PORT" >"$SERVER_LOG" 2>&1
  ) &
  SERVER_PID="$!"

  for _ in $(seq 1 60); do
    if curl -fsS "$BASE_URL" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! curl -fsS "$BASE_URL" >/dev/null 2>&1; then
    echo "Dev server failed to start. Log: $SERVER_LOG" >&2
    exit 1
  fi
fi

cat >"$RUN_DIR/playwright.config.js" <<EOF
module.exports = {
  testDir: '$RUN_DIR',
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: 'line',
  outputDir: '$RUN_DIR/test-results',
  use: {
    baseURL: '$BASE_URL',
    browserName: 'chromium',
    headless: ${HEADLESS_BOOL},
    viewport: { width: 1440, height: 960 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  workers: 1,
}
EOF

cat >"$RUN_DIR/portfolio-smoke.spec.js" <<'EOF'
const { test, expect } = require('@playwright/test')

const visitorName = process.env.PLAYTEST_NAME || 'Codex'
const avatar = process.env.PLAYTEST_AVATAR || 'girl'
const artifactDir = process.env.PLAYTEST_ARTIFACT_DIR

test('portfolio RPG smoke flow', async ({ page }) => {
  const runtimeErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(`[console] ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => {
    runtimeErrors.push(`[pageerror] ${error.message}`)
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas')

  await page.evaluate(() => {
    window.localStorage.removeItem('felipe-kummer-portfolio-profile')
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas')

  for (let attempts = 0; attempts < 8; attempts += 1) {
    const input = page.locator('#traveler-name')
    if (await input.count()) {
      break
    }
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1100)
  }

  const input = page.locator('#traveler-name')
  await expect(input).toBeVisible()
  await input.fill(visitorName)
  await input.press('Enter')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await page.waitForTimeout(900)
  await canvas.click({ position: { x: 640, y: 360 } })

  const profileKey = 'felipe-kummer-portfolio-profile'
  const expectAvatar = async () => {
    await page.waitForFunction(
      (expected) => {
        try {
          const raw = window.localStorage.getItem('felipe-kummer-portfolio-profile')
          const parsed = raw ? JSON.parse(raw) : null
          return parsed?.avatar === expected
        } catch {
          return false
        }
      },
      avatar,
      { timeout: 5000 },
    )
  }

  const cardX = avatar === 'girl' ? 830 : 450
  await canvas.click({ position: { x: cardX, y: 336 } })
  await expectAvatar()

  await page.waitForTimeout(1800)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1800)

  await page.screenshot({ path: `${artifactDir}/world-start.png` })

  const hold = async (key, ms) => {
    await page.keyboard.down(key)
    await page.waitForTimeout(ms)
    await page.keyboard.up(key)
  }

  await hold('ArrowUp', 550)
  await hold('ArrowRight', 800)
  await page.keyboard.down('Shift')
  await hold('ArrowDown', 450)
  await page.keyboard.up('Shift')
  await hold('ArrowLeft', 650)
  await page.keyboard.press('h')
  await page.keyboard.press('h')

  await page.screenshot({ path: `${artifactDir}/world-after-move.png` })

  const profile = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  }, profileKey)

  expect(profile?.visitorName).toBe(visitorName)
  expect(profile?.avatar).toBe(avatar)

  if (runtimeErrors.length > 0) {
    throw new Error(`Runtime issues detected:\n${runtimeErrors.join('\n')}`)
  }
})
EOF

PLAYTEST_NAME="$VISITOR_NAME" \
PLAYTEST_AVATAR="$AVATAR" \
PLAYTEST_ARTIFACT_DIR="$ARTIFACT_DIR" \
NODE_PATH="$TOOL_DIR/node_modules" \
npx --prefix "$TOOL_DIR" playwright test "$RUN_DIR/portfolio-smoke.spec.js" --config "$RUN_DIR/playwright.config.js"

echo "Artifacts: $ARTIFACT_DIR"

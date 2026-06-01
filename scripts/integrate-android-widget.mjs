#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'native/android-widget')
const androidMain = join(root, 'android/app/src/main')

function copyTree(from, to) {
  mkdirSync(to, { recursive: true })
  cpSync(from, to, { recursive: true })
}

copyTree(join(src, 'java/com'), join(androidMain, 'java/com'))
copyTree(join(src, 'res/layout'), join(androidMain, 'res/layout'))
copyTree(join(src, 'res/xml'), join(androidMain, 'res/xml'))

const stringsPath = join(androidMain, 'res/values/strings.xml')
const strings = readFileSync(stringsPath, 'utf8')
const widgetKeys = ['widget_name', 'widget_description', 'widget_brand', 'widget_spendable_label']
if (!widgetKeys.every((key) => strings.includes(key))) {
  const widgetStrings = readFileSync(join(src, 'res/values/widget_strings.xml'), 'utf8')
  const entries = widgetStrings
    .replace(/<\/?resources>/g, '')
    .trim()
  writeFileSync(stringsPath, strings.replace('</resources>', `${entries}\n</resources>`))
}

const manifestPath = join(androidMain, 'AndroidManifest.xml')
const manifest = readFileSync(manifestPath, 'utf8')
if (!manifest.includes('BalanceAppWidgetProvider')) {
  const snippet = readFileSync(join(src, 'AndroidManifest.snippet.xml'), 'utf8').trim()
  writeFileSync(
    manifestPath,
    manifest.replace('    </application>', `        ${snippet}\n\n    </application>`),
  )
}

console.log('Widget nativo integrado en android/app/src/main')

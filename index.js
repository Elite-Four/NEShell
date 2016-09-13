#!/usr/bin/env node

'use strict'

const ansiEscapes = require('ansi-escapes')
const Canvas = require('canvas')
require('keypress')(process.stdin)
const NesNes = require('nesnes')
require('raf').polyfill()

const NEShell = module.exports = (filename) => {
  const canvas = new Canvas(256, 224)
  const emulator = new NesNes(canvas)

  const video = emulator.output.video
  const renderFrame = video.renderer.renderFrame
  video.renderer.renderFrame = function () {
    renderFrame.apply(this, arguments)
    process.stdout.write(ansiEscapes.cursorTo(0, 0))
    process.stdout.write(ansiEscapes.image(canvas.toBuffer()))
  }
  process.stdout.write(ansiEscapes.cursorHide)
  process.stdout.write(ansiEscapes.eraseScreen)

  process.stdin.on('keypress', (ch, key) => {
    if (key.name === 'escape') {
      process.stdout.write(ansiEscapes.cursorShow)
      process.exit(0)
    }
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()

  emulator.load(filename, true)
}

if (require.main === module) {
  const filename = process.argv[2]
  NEShell(filename)
}

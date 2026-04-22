import path from 'node:path'
import fs from 'node:fs/promises'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { genDts, resetDtsTracking } from '../src/core/generator'
import type { Options } from '../src/types'

describe('dtsDir cleanup', () => {
  const tempDir = path.resolve(__dirname, './temp-dts-test')
  const oldDtsDir = path.resolve(tempDir, './old-dts')
  const newDtsDir = path.resolve(tempDir, './new-dts')

  beforeEach(async () => {
    // Create temporary test directories
    await fs.mkdir(tempDir, { recursive: true })
    await fs.mkdir(oldDtsDir, { recursive: true })
    await fs.mkdir(newDtsDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up temporary test directories
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
    // Reset DTS tracking state
    resetDtsTracking()
  })

  it('should clean up old dts files when dtsDir changes', async () => {
    const symbolIds = new Set(['icon1', 'icon2', 'icon3'])

    // First generation: use old dtsDir
    const oldOptions: Options = {
      iconDir: path.resolve(__dirname, './icons'),
      dtsDir: oldDtsDir,
      componentName: 'SvgIcon',
      projectType: 'vue',
    }

    await genDts(symbolIds, oldOptions)

    // Verify files were created in old directory
    const oldDtsPath = path.resolve(oldDtsDir, './svg-component.d.ts')
    const oldGlobalDtsPath = path.resolve(oldDtsDir, './svg-component-global.d.ts')

    expect(await fs.access(oldDtsPath).then(() => true).catch(() => false)).toBe(true)
    expect(await fs.access(oldGlobalDtsPath).then(() => true).catch(() => false)).toBe(true)

    // Second generation: use new dtsDir
    const newOptions: Options = {
      iconDir: path.resolve(__dirname, './icons'),
      dtsDir: newDtsDir,
      componentName: 'SvgIcon',
      projectType: 'vue',
    }

    await genDts(symbolIds, newOptions)

    // Verify files were created in new directory
    const newDtsPath = path.resolve(newDtsDir, './svg-component.d.ts')
    const newGlobalDtsPath = path.resolve(newDtsDir, './svg-component-global.d.ts')

    expect(await fs.access(newDtsPath).then(() => true).catch(() => false)).toBe(true)
    expect(await fs.access(newGlobalDtsPath).then(() => true).catch(() => false)).toBe(true)

    // Verify old declaration files were cleaned up
    expect(await fs.access(oldDtsPath).then(() => true).catch(() => false)).toBe(false)
    expect(await fs.access(oldGlobalDtsPath).then(() => true).catch(() => false)).toBe(false)
  })

  it('should clean up old dts files for react projects', async () => {
    const symbolIds = new Set(['react-icon1', 'react-icon2'])

    // First generation: use old dtsDir
    const oldOptions: Options = {
      iconDir: path.resolve(__dirname, './icons'),
      dtsDir: oldDtsDir,
      componentName: 'SvgIcon',
      projectType: 'react',
    }

    await genDts(symbolIds, oldOptions)

    // Verify file was created in old directory
    const oldDtsPath = path.resolve(oldDtsDir, './svg-component.d.ts')
    expect(await fs.access(oldDtsPath).then(() => true).catch(() => false)).toBe(true)

    // Second generation: use new dtsDir
    const newOptions: Options = {
      iconDir: path.resolve(__dirname, './icons'),
      dtsDir: newDtsDir,
      componentName: 'SvgIcon',
      projectType: 'react',
    }

    await genDts(symbolIds, newOptions)

    // Verify file was created in new directory
    const newDtsPath = path.resolve(newDtsDir, './svg-component.d.ts')
    expect(await fs.access(newDtsPath).then(() => true).catch(() => false)).toBe(true)

    // Verify old declaration file was cleaned up
    expect(await fs.access(oldDtsPath).then(() => true).catch(() => false)).toBe(false)
  })
})
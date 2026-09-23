import type Phaser from 'phaser'

export const GAME_UI_FONT_FAMILY = 'Verdana, "Trebuchet MS", sans-serif'

export function fitTextWidth(text: Phaser.GameObjects.Text, width: number) {
  let size = Number.parseFloat(String(text.style.fontSize))
  while (text.width > width && size > 14) {
    text.setFontSize(--size)
  }
  return text
}

// Measure with the actual font, wrapping, stroke and padding used on screen.
export function paginateText(text: Phaser.GameObjects.Text, message: string, height: number) {
  const previous = text.text
  const pages: string[] = []
  for (const paragraph of message.split(/\n\s*\n/).filter((part) => part.trim())) {
    let page: string[] = []
    for (const line of text.getWrappedText(paragraph.trim())) {
      text.setText([...page, line].join('\n'))
      if (text.height > height && page.length) {
        pages.push(page.join('\n'))
        page = []
      }
      page.push(line)
    }
    if (page.length) pages.push(page.join('\n'))
  }
  text.setText(previous)
  return pages.length ? pages : ['']
}

export function revealPanel(scene: Phaser.Scene, panel: Phaser.GameObjects.Container) {
  scene.tweens.killTweensOf(panel)
  panel.setVisible(true).setAlpha(0).setScale(0.98)
  scene.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 180, ease: 'Cubic.easeOut' })
}

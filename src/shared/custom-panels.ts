export const CUSTOM_PANEL_ICONS = ['globe', 'git-pull-request', 'ticket', 'list-todo'] as const
export type CustomPanelIcon = (typeof CUSTOM_PANEL_ICONS)[number]

/** A right sidebar tab that shows a user-configured web page. */
export type CustomPanelConfig = {
  id: string
  title: string
  url: string
  icon: CustomPanelIcon
}

export type CustomPanelTabKey = `custom-panel:${string}`

export function customPanelTabKey(id: string): CustomPanelTabKey {
  return `custom-panel:${id}`
}

export function isCustomPanelTabKey(tab: unknown): tab is CustomPanelTabKey {
  return typeof tab === 'string' && tab.startsWith('custom-panel:') && tab.length > 13
}

/** Panels with a URL, in order. */
export function resolveCustomPanels(
  settings: { customPanels?: CustomPanelConfig[] } | null | undefined
): CustomPanelConfig[] {
  if (!Array.isArray(settings?.customPanels)) {
    return []
  }
  return settings.customPanels.filter(
    (panel) =>
      panel && typeof panel.id === 'string' && typeof panel.url === 'string' && panel.url.trim()
  )
}

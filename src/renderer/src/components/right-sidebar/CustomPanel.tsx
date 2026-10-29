import { useEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { ORCA_BROWSER_GUEST_WEB_PREFERENCES_ATTRIBUTE } from '../../../../shared/browser-guest-web-preferences'
import { moveFocusToRendererBeforeWebviewDetach } from '@/components/browser-pane/host-guest/webview-registry'
import { useBrowserPageWebviewPartition } from '@/components/browser-pane/host-guest/use-browser-page-webview-partition'
import { translate } from '@/i18n/i18n'
import { Button } from '../ui/button'
import { customPanelTabKey, type CustomPanelTabKey } from '../../../../shared/custom-panels'
import { CUSTOM_PANEL_ICON_COMPONENTS, useCustomPanels } from './custom-panels'

type PanelState = 'loading' | 'ready' | 'unavailable'

// Electron reports ERR_ABORTED (-3) when a navigation is superseded, e.g. by a redirect; that is not a failure.
const ERR_ABORTED = -3

/** Right sidebar tab that shows a user-configured web page (Settings > Browser > Custom Panels). */
export default function CustomPanel({ tabKey }: { tabKey: CustomPanelTabKey }): React.JSX.Element {
  const panel = useCustomPanels().find((p) => customPanelTabKey(p.id) === tabKey)
  const url = panel?.url.trim() ?? ''
  const Icon =
    CUSTOM_PANEL_ICON_COMPONENTS[panel?.icon ?? 'globe'] ?? CUSTOM_PANEL_ICON_COMPONENTS.globe
  // Default browser profile: same cookies as Orca's built-in browser, and an allowlisted partition.
  const partition = useBrowserPageWebviewPartition({
    sessionProfileId: null,
    sessionPartition: null
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PanelState>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !url) {
      return
    }
    setState('loading')
    let failed = false
    const webview = document.createElement('webview') as Electron.WebviewTag
    webview.setAttribute('partition', partition)
    webview.setAttribute('webpreferences', ORCA_BROWSER_GUEST_WEB_PREFERENCES_ATTRIBUTE)
    webview.setAttribute(
      'aria-label',
      translate('auto.components.right.sidebar.customPanel', 'Custom panel')
    )
    webview.style.display = 'flex'
    webview.style.width = '100%'
    webview.style.height = '100%'
    webview.style.border = 'none'
    const onStart = (): void => {
      failed = false
    }
    const onStop = (): void => {
      if (!failed) {
        setState('ready')
      }
    }
    const onFail = (event: Electron.DidFailLoadEvent): void => {
      if (!event.isMainFrame || event.errorCode === ERR_ABORTED) {
        return
      }
      failed = true
      setState('unavailable')
    }
    webview.addEventListener('did-start-loading', onStart)
    webview.addEventListener('did-stop-loading', onStop)
    webview.addEventListener('did-fail-load', onFail)
    container.appendChild(webview)
    webview.setAttribute('src', url)
    return () => {
      webview.removeEventListener('did-start-loading', onStart)
      webview.removeEventListener('did-stop-loading', onStop)
      webview.removeEventListener('did-fail-load', onFail)
      moveFocusToRendererBeforeWebviewDetach(webview)
      webview.remove()
    }
  }, [url, partition, attempt])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className="flex min-h-0 flex-1"
        style={{ visibility: state === 'unavailable' ? 'hidden' : 'visible' }}
      />
      {state === 'unavailable' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <Icon className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {translate('auto.components.right.sidebar.customPanel.nothingAt', 'Nothing at')}{' '}
            <span className="break-all font-mono text-xs">{url}</span>
          </p>
          <Button size="sm" variant="outline" onClick={() => setAttempt((n) => n + 1)}>
            <RotateCw className="size-3.5" />
            {translate('auto.components.right.sidebar.customPanel.retry', 'Retry')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

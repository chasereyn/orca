import { Suspense, useState } from 'react'
import { lazyWithRetry as lazy } from '@/lib/lazy-with-retry'
import type { ActiveRightSidebarTab } from '@/store/slices/editor'
import {
  customPanelTabKey,
  isCustomPanelTabKey,
  type CustomPanelTabKey
} from '../../../../shared/custom-panels'
import { useCustomPanels } from './custom-panels'
import { isPluginPanelTabKey } from '../../../../shared/plugins/manifest/plugin-manifest'

const FileExplorer = lazy(() => import('./FileExplorer'))
const SourceControl = lazy(() => import('./SourceControl'))
const ChecksPanel = lazy(() => import('./ChecksPanel'))
const PortsPanel = lazy(() => import('./PortsPanel'))
const AiVaultSidebarPanel = lazy(() => import('./AiVaultSidebarPanel'))
const FolderWorkspaceWorktreesPanel = lazy(() => import('./FolderWorkspaceWorktreesPanel'))
const FolderWorkspacePrChecksPanel = lazy(() => import('./FolderWorkspacePrChecksPanel'))
const PluginPanel = lazy(() => import('./PluginPanel'))
const CustomPanel = lazy(() => import('./CustomPanel'))

type RightSidebarPanelContentProps = {
  effectiveTab: ActiveRightSidebarTab
  rightSidebarOpen: boolean
}

export function RightSidebarPanelContent({
  effectiveTab,
  rightSidebarOpen
}: RightSidebarPanelContentProps): React.JSX.Element {
  const customPanels = useCustomPanels()
  // Why: custom panels stay mounted once opened so switching tabs or closing the sidebar never reloads their page.
  const [openedCustomPanels, setOpenedCustomPanels] = useState<ReadonlySet<CustomPanelTabKey>>(
    () => new Set()
  )
  if (isCustomPanelTabKey(effectiveTab) && !openedCustomPanels.has(effectiveTab)) {
    setOpenedCustomPanels(new Set(openedCustomPanels).add(effectiveTab))
  }
  const tab = rightSidebarOpen ? effectiveTab : null
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={null}>
        {tab === 'explorer' && <FileExplorer />}
        {tab === 'source-control' && <SourceControl />}
        {tab === 'checks' && <ChecksPanel />}
        {/* SSH forwarding needs raw ports.detect data absent from the workspace-scoped status popover. */}
        {tab === 'ports' && <PortsPanel isVisible={rightSidebarOpen && effectiveTab === 'ports'} />}
        {tab === 'vault' && <AiVaultSidebarPanel />}
        {tab === 'workspaces' && <FolderWorkspaceWorktreesPanel />}
        {tab === 'pr-checks' && (
          <FolderWorkspacePrChecksPanel
            isVisible={rightSidebarOpen && effectiveTab === 'pr-checks'}
          />
        )}
        {customPanels
          .map((panel) => customPanelTabKey(panel.id))
          .filter((key) => openedCustomPanels.has(key))
          .map((key) => (
            <CustomPanel key={key} tabKey={key} isVisible={tab === key} />
          ))}
        {/* Remount on plugin changes so an old iframe cannot post through the next plugin's rebound bridge. */}
        {tab !== null && isPluginPanelTabKey(tab) && <PluginPanel key={tab} tabKey={tab} />}
      </Suspense>
    </div>
  )
}

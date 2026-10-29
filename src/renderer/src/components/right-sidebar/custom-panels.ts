import { useMemo } from 'react'
import { GitPullRequest, Globe, ListTodo, Ticket } from 'lucide-react'
import { useAppStore } from '@/store'
import {
  resolveCustomPanels,
  type CustomPanelConfig,
  type CustomPanelIcon
} from '../../../../shared/custom-panels'

export const CUSTOM_PANEL_ICON_COMPONENTS: Record<CustomPanelIcon, typeof Globe> = {
  globe: Globe,
  'git-pull-request': GitPullRequest,
  ticket: Ticket,
  'list-todo': ListTodo
}

export function useCustomPanels(): CustomPanelConfig[] {
  const customPanels = useAppStore((s) => s.settings?.customPanels)
  return useMemo(() => resolveCustomPanels({ customPanels }), [customPanels])
}

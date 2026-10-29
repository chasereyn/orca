import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import {
  CUSTOM_PANEL_ICONS,
  resolveCustomPanels,
  type CustomPanelConfig,
  type CustomPanelIcon
} from '../../../../shared/custom-panels'
import { CUSTOM_PANEL_ICON_COMPONENTS } from '../right-sidebar/custom-panels'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { SearchableSetting } from './SearchableSetting'
import { translate } from '@/i18n/i18n'
import { createBrowserUuid } from '@/lib/browser-uuid'

type CustomPanelsSettingProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

const inputProps = { spellCheck: false, autoCapitalize: 'none', autoCorrect: 'off' } as const

export function CustomPanelsSetting({
  settings,
  updateSettings
}: CustomPanelsSettingProps): React.JSX.Element {
  const saved = resolveCustomPanels(settings)
  const savedKey = JSON.stringify(saved)
  const [draft, setDraft] = useState<CustomPanelConfig[]>(saved)
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- savedKey tracks the saved list by value.
  useEffect(() => setDraft(saved), [savedKey])

  // Text fields save on blur; structural edits (icon, add, remove) save immediately.
  const save = (panels: CustomPanelConfig[]): void => {
    setDraft(panels)
    updateSettings({ customPanels: panels.filter((panel) => panel.url.trim()) })
  }
  const edit = (index: number, patch: Partial<CustomPanelConfig>): CustomPanelConfig[] =>
    draft.map((panel, i) => (i === index ? { ...panel, ...patch } : panel))

  const title = translate('auto.components.settings.CustomPanelsSetting.title', 'Custom Panels')
  const description = translate(
    'auto.components.settings.CustomPanelsSetting.description',
    'Web pages shown as tabs in the right sidebar, in this order.'
  )
  return (
    <SearchableSetting
      title={title}
      description={description}
      keywords={['custom', 'panel', 'sidebar', 'url', 'webview', 'page', 'tab']}
      className="space-y-2 py-2"
    >
      <div className="space-y-0.5">
        <Label>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {draft.map((panel, index) => (
        <div key={panel.id} className="flex items-center gap-2">
          <Select
            value={panel.icon}
            onValueChange={(icon) => save(edit(index, { icon: icon as CustomPanelIcon }))}
          >
            <SelectTrigger size="sm" className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_PANEL_ICONS.map((icon) => {
                const Icon = CUSTOM_PANEL_ICON_COMPONENTS[icon]
                return (
                  <SelectItem key={icon} value={icon} aria-label={icon}>
                    <Icon className="size-4" />
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Input
            value={panel.title}
            onChange={(event) => setDraft(edit(index, { title: event.target.value }))}
            onBlur={() => save(draft)}
            placeholder={translate('auto.components.settings.CustomPanelsSetting.name', 'Title')}
            className="h-7 w-28 text-xs"
            {...inputProps}
          />
          <Input
            value={panel.url}
            onChange={(event) => setDraft(edit(index, { url: event.target.value }))}
            onBlur={() => save(draft)}
            placeholder="http://localhost:3000"
            className="h-7 min-w-0 flex-1 text-xs"
            {...inputProps}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            aria-label={translate('auto.components.settings.CustomPanelsSetting.remove', 'Remove')}
            onClick={() => save(draft.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() =>
          setDraft([
            ...draft,
            { id: createBrowserUuid().slice(0, 8), title: '', url: '', icon: 'globe' }
          ])
        }
      >
        <Plus className="size-3.5" />
        {translate('auto.components.settings.CustomPanelsSetting.add', 'Add panel')}
      </Button>
    </SearchableSetting>
  )
}

export type SettingMetric = {
  label: string
  value: string
  trend: string
}

export type SettingItem = {
  module: string
  status: string
  updatedAt: string
}

export type SettingsData = {
  metrics: SettingMetric[]
  settings: SettingItem[]
  degraded: boolean
  degradedSources: string[]
}

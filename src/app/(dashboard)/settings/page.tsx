import { getCurrentUserInfo, getUserId } from '@/lib/auth'
import { getBudgetForUser } from '@/lib/data'
import { hasValidDatabase } from '@/lib/env'
import { DatabaseSetupRequired } from '@/components/setup/DatabaseSetupRequired'
import { BudgetSettingsForm } from '@/components/settings/BudgetSettingsForm'
import { InstallAppPrompt } from '@/components/settings/InstallAppPrompt'
import { formatCurrency } from '@/lib/formatters'
import {
  User, Wallet, Bell, Webhook, Smartphone,
  CheckCircle2, XCircle,
} from 'lucide-react'

interface SettingRowProps {
  label: string
  value?: string
  description?: string
  badge?: { text: string; ok: boolean }
}

function SettingRow({ label, value, description, badge }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              badge.ok
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {badge.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {badge.text}
          </span>
        )}
        {value && <span className="text-sm text-zinc-400">{value}</span>}
      </div>
    </div>
  )
}

interface SectionProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-2.5 border-b border-zinc-800 px-5 py-3.5">
        <Icon size={14} className="text-zinc-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</h2>
      </div>
      <div className="divide-y divide-zinc-800/60 px-5">
        {children}
      </div>
    </section>
  )
}

const hasN8n = !!process.env.N8N_WEBHOOK_URL && process.env.N8N_WEBHOOK_URL.startsWith('http')

export default async function SettingsPage() {
  const user = await getCurrentUserInfo()
  const userId = await getUserId()
  const budget = await getBudgetForUser(userId)
  if (!budget) return <DatabaseSetupRequired />

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-100">Ajustes</h1>
        <p className="text-sm text-zinc-500">Configuración de la cuenta</p>
      </div>

      <div className="space-y-4 lg:max-w-xl">
        <Section icon={User} title="Cuenta">
          <SettingRow
            label="Nombre"
            value={user.firstName}
            description="Tu nombre en la aplicación"
          />
          <SettingRow
            label="Autenticación"
            description="Gestionar sesión y seguridad"
            badge={{ text: 'Activa', ok: true }}
          />
        </Section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-2.5 border-b border-zinc-800 px-5 py-3.5">
            <Wallet size={14} className="text-zinc-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Presupuesto y ahorros
            </h2>
          </div>
          <div className="px-5">
            <SettingRow
              label="Disponible hoy (calculado)"
              value={formatCurrency(budget.dailyBudget)}
              description="Se recalcula con gastos, ingresos y fijos pagados"
            />
            <BudgetSettingsForm budget={budget} />
          </div>
        </section>

        <Section icon={Smartphone} title="Instalar app">
          <InstallAppPrompt />
        </Section>

        <Section icon={Bell} title="Notificaciones">
          <SettingRow
            label="Alerta de desvío"
            description="Avisar cuando el gasto supera el ritmo diario"
            badge={{ text: 'Activada', ok: true }}
          />
          <SettingRow
            label="Resumen semanal"
            description="Envío de resumen cada lunes"
            badge={{ text: 'Desactivada', ok: false }}
          />
        </Section>

        <Section icon={Webhook} title="Integraciones">
          <SettingRow
            label="n8n Webhook"
            description="Sincronización con automatizaciones"
            badge={{ text: hasN8n ? 'Conectado' : 'Sin configurar', ok: hasN8n }}
          />
          <SettingRow
            label="Base de datos"
            description="PostgreSQL en la nube"
            badge={{ text: hasValidDatabase ? 'Conectado' : 'Sin configurar', ok: hasValidDatabase }}
          />
        </Section>

        <p className="px-1 text-center text-xs text-zinc-700">
          Linkeweb v0.1.0 · Next.js 16.2 · React 19.2
        </p>
      </div>
    </div>
  )
}

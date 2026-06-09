import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { ErrorAlert } from '../../components/feedback/ErrorAlert'
import { login, register } from '../../services/api/auth'
import type { LoginPayload, RegisterPayload } from '../../services/api/auth/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { clearRefreshToken, setAccessToken, setRefreshToken } from '../../utils/auth'

type AuthMode = 'login' | 'register'

const initialLoginData: LoginPayload = {
  email: '',
  password: '',
}

const initialRegisterData: RegisterPayload = {
  name: '',
  email: '',
  password: '',
  corporateName: '',
  cnpj: '',
  phone: '',
}

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<AuthMode>('login')
  const [errorMessage, setErrorMessage] = useState<ApiErrorDisplay | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loginData, setLoginData] = useState<LoginPayload>(initialLoginData)
  const [registerData, setRegisterData] = useState<RegisterPayload>(initialRegisterData)

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.accessToken)
      if (response.refreshToken) {
        setRefreshToken(response.refreshToken)
      } else {
        clearRefreshToken()
      }
      navigate(fromPath, { replace: true })
    },
    onError: (error) => {
      setErrorMessage(parseApiError(error, 'Request failed. Please try again.'))
    },
  })

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async () => {
      setSuccessMessage('Account created successfully. Please login.')
      setErrorMessage(null)
      setMode('login')
      setLoginData((previous) => ({ ...previous, email: registerData.email }))
      setRegisterData(initialRegisterData)
    },
    onError: (error) => {
      setErrorMessage(parseApiError(error, 'Request failed. Please try again.'))
    },
  })

  const isSubmitting = loginMutation.isPending || registerMutation.isPending

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    loginMutation.mutate(loginData)
  }

  const handleRegisterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    registerMutation.mutate(registerData)
  }

  return (
    <div className="min-h-screen bg-surface p-5">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid-cols-[1.05fr_1fr]">
          <section className="hidden flex-col justify-between bg-brand-900 p-10 text-white lg:flex">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
                Ekklesia Platform
              </p>
              <h1 className="text-4xl font-semibold leading-tight">Manage your church operations with confidence.</h1>
              <p className="mt-5 text-sm text-white/80">
                Sign in to continue or create your account to start configuring your church data, users and services.
              </p>
            </div>
            <p className="text-xs text-white/60">Secure access with JWT authentication and optional mock mode for local development.</p>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-6 flex items-center rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === 'login' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === 'register' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Register
              </button>
            </div>

            {errorMessage ? <ErrorAlert error={errorMessage} /> : null}

            {successMessage && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
            )}

            <div className="min-h-[540px]">
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(event) => setLoginData((previous) => ({ ...previous, email: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                    placeholder="you@church.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(event) => setLoginData((previous) => ({ ...previous, password: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="register-name" className="text-sm font-medium text-slate-700">
                      Full name
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      value={registerData.name}
                      onChange={(event) => setRegisterData((previous) => ({ ...previous, name: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="register-email" className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(event) => setRegisterData((previous) => ({ ...previous, email: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                      placeholder="you@church.com"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="register-password" className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(event) => setRegisterData((previous) => ({ ...previous, password: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="register-corporate-name" className="text-sm font-medium text-slate-700">
                      Church legal name
                    </label>
                    <input
                      id="register-corporate-name"
                      type="text"
                      value={registerData.corporateName}
                      onChange={(event) => setRegisterData((previous) => ({ ...previous, corporateName: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                      placeholder="Ekklesia Church"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="register-cnpj" className="text-sm font-medium text-slate-700">
                      CNPJ
                    </label>
                    <input
                      id="register-cnpj"
                      type="text"
                      value={registerData.cnpj}
                      onChange={(event) => setRegisterData((previous) => ({ ...previous, cnpj: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="register-phone" className="text-sm font-medium text-slate-700">
                      Phone
                    </label>
                    <input
                      id="register-phone"
                      type="text"
                      value={registerData.phone}
                      onChange={(event) => setRegisterData((previous) => ({ ...previous, phone: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

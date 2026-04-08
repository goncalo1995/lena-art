'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'

export function AdminRevalidateButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleRevalidate = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'all' }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(`Site atualizado! ${data.locales?.length || 2} idiomas revalidados.`)
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Erro ao revalidar')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro de rede ao revalidar')
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'success': return <Check className="size-4" />
      case 'error': return <AlertCircle className="size-4" />
      case 'loading': return <RefreshCw className="size-4 animate-spin" />
      default: return <RefreshCw className="size-4" />
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleRevalidate} 
        disabled={status === 'loading'}
        variant={status === 'error' ? 'destructive' : status === 'success' ? 'default' : 'outline'}
        size="sm"
      >
        {getIcon()}
        {status === 'loading' ? 'Atualizando...' : 
         status === 'success' ? 'Atualizado!' : 
         status === 'error' ? 'Erro' : 
         'Atualizar Site'}
      </Button>
      {message && (
        <p className={`text-xs ${status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

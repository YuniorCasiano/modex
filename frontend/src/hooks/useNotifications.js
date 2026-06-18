import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'modex_notifications'

export function useNotifications(user) {
    const [notifications, setNotifications] = useState([])
    const [unread, setUnread] = useState(0)

    // Cargar notificaciones del localStorage al iniciar
    useEffect(() => {
        if (!user) return
        try {
            const key = STORAGE_KEY + '_' + user.email
            const saved = JSON.parse(localStorage.getItem(key) || '[]')
            setNotifications(saved)
            setUnread(saved.filter(n => !n.read).length)
        } catch { setNotifications([]) }
    }, [user])

    // Polling cada 30 segundos para chequear cambios de estado de pedidos
    useEffect(() => {
        if (!user) return
        const token = localStorage.getItem('modex_token') || ''
        if (!token) return

        const checkOrders = async () => {
            try {
                const res = await fetch('/api/orders/my-orders', {
                    headers: { Authorization: 'Bearer ' + token }
                })
                if (!res.ok) return
                const data = await res.json()
                const orders = Array.isArray(data) ? data : data.value || []

                const key = STORAGE_KEY + '_' + user.email
                const existing = JSON.parse(localStorage.getItem(key) || '[]')
                const existingMap = {}
                existing.forEach(n => { existingMap[n.id] = n })

                // Detectar cambios de estado
                const newNotifs = [...existing]
                let hasNew = false

                orders.forEach(order => {
                    const notifId = `order_${order.id}_${order.status}`
                    if (!existingMap[notifId] && order.status !== 'PENDING') {
                        const statusLabels = {
                            CONFIRMED: '✅ Pedido confirmado',
                            SHIPPED:   '📦 Pedido enviado',
                            DELIVERED: '🎉 Pedido entregado',
                            CANCELLED: '❌ Pedido cancelado',
                        }
                        const statusDesc = {
                            CONFIRMED: 'Tu pedido ha sido confirmado y está siendo preparado.',
                            SHIPPED:   'Tu pedido está en camino. ¡Pronto lo recibirás!',
                            DELIVERED: '¡Tu pedido fue entregado! Esperamos que lo disfrutes.',
                            CANCELLED: 'Tu pedido ha sido cancelado.',
                        }
                        if (statusLabels[order.status]) {
                            newNotifs.unshift({
                                id: notifId,
                                title: statusLabels[order.status],
                                message: `${order.productName} — ${statusDesc[order.status]}`,
                                orderId: order.id,
                                status: order.status,
                                read: false,
                                createdAt: new Date().toISOString(),
                            })
                            hasNew = true
                        }
                    }
                })

                if (hasNew) {
                    // Guardar solo las últimas 20
                    const trimmed = newNotifs.slice(0, 20)
                    localStorage.setItem(key, JSON.stringify(trimmed))
                    setNotifications(trimmed)
                    setUnread(trimmed.filter(n => !n.read).length)
                }
            } catch {}
        }

        checkOrders()
        const interval = setInterval(checkOrders, 30000)
        return () => clearInterval(interval)
    }, [user])

    const markAllRead = useCallback(() => {
        if (!user) return
        const key = STORAGE_KEY + '_' + user.email
        const updated = notifications.map(n => ({ ...n, read: true }))
        localStorage.setItem(key, JSON.stringify(updated))
        setNotifications(updated)
        setUnread(0)
    }, [notifications, user])

    const markRead = useCallback((id) => {
        if (!user) return
        const key = STORAGE_KEY + '_' + user.email
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
        localStorage.setItem(key, JSON.stringify(updated))
        setNotifications(updated)
        setUnread(updated.filter(n => !n.read).length)
    }, [notifications, user])

    const clearAll = useCallback(() => {
        if (!user) return
        const key = STORAGE_KEY + '_' + user.email
        localStorage.setItem(key, JSON.stringify([]))
        setNotifications([])
        setUnread(0)
    }, [user])

    const addNotification = useCallback((title, message) => {
        if (!user) return
        const key = STORAGE_KEY + '_' + user.email
        const notif = { id: Date.now().toString(), title, message, read: false, createdAt: new Date().toISOString() }
        const updated = [notif, ...notifications].slice(0, 20)
        localStorage.setItem(key, JSON.stringify(updated))
        setNotifications(updated)
        setUnread(prev => prev + 1)
    }, [notifications, user])

    return { notifications, unread, markAllRead, markRead, clearAll, addNotification }
}
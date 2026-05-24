import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open,  setOpen]  = useState(false)

  const key = i => i.id + '-' + i.size + '-' + i.color

  const add = item => setItems(prev => {
    const k = key(item)
    const ex = prev.find(i => key(i) === k)
    return ex ? prev.map(i => key(i) === k ? { ...i, qty: i.qty + item.qty } : i) : [...prev, item]
  })

  const remove = k  => setItems(p => p.filter(i => key(i) !== k))
  const clear  = () => setItems([])
  const total  = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count  = items.reduce((s, i) => s + i.qty, 0)

  return <Ctx.Provider value={{ items, add, remove, clear, total, count, open, setOpen }}>{children}</Ctx.Provider>
}
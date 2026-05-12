import { supabase } from './supabaseClient'

export const storage = {
  async list(table, token, isDemo) {
    if (isDemo) {
      return JSON.parse(localStorage.getItem(table) || "[]")
    }
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data
  },

  async save(table, record, token, isDemo) {
    if (isDemo) {
      const list = JSON.parse(localStorage.getItem(table) || "[]")
      const item = { ...record, id: Date.now().toString() }
      localStorage.setItem(table, JSON.stringify([item, ...list]))
      return item
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from(table)
      .insert({ ...record, user_id: user.id })
      .select()
      .single()
    if (error) { console.error(error); return null }
    return data
  },

  async remove(table, id, token, isDemo) {
    if (isDemo) {
      const list = JSON.parse(localStorage.getItem(table) || "[]")
      localStorage.setItem(table, JSON.stringify(list.filter(i => i.id !== id)))
      return
    }
    await supabase.from(table).delete().eq('id', id)
  }
}

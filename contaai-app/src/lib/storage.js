import { supabase } from './supabaseClient'

export const storage = {
  async list(table, token, isDemo) {
    if (isDemo) {
      return JSON.parse(localStorage.getItem(table) || "[]")
    }
    try {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
      if (error) { console.error('List error:', error); return [] }
      return data || []
    } catch (err) {
      console.error('List exception:', err)
      return []
    }
  },

  async save(table, record, token, isDemo) {
    if (isDemo) {
      const list = JSON.parse(localStorage.getItem(table) || "[]")
      const item = { ...record, id: Date.now().toString() }
      localStorage.setItem(table, JSON.stringify([item, ...list]))
      return item
    }
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Auth error:', userError)
        return null
      }
      const { data, error } = await supabase
        .from(table)
        .insert({ ...record, user_id: user.id })
        .select()
        .single()
      if (error) { 
        console.error('Save error:', error)
        return null 
      }
      return data
    } catch (err) {
      console.error('Save exception:', err)
      return null
    }
  },

  async remove(table, id, token, isDemo) {
    if (isDemo) {
      const list = JSON.parse(localStorage.getItem(table) || "[]")
      localStorage.setItem(table, JSON.stringify(list.filter(i => i.id !== id)))
      return
    }
    try {
      await supabase.from(table).delete().eq('id', id)
    } catch (err) {
      console.error('Remove error:', err)
    }
  }
}

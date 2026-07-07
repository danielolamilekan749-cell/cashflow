import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Create a mock client if environment variables are missing (for sandbox mode)
function createMockSupabaseClient() {
  const mockBuilder = () => ({
    select: () => mockBuilder(),
    insert: () => mockBuilder(),
    update: () => mockBuilder(),
    delete: () => mockBuilder(),
    upsert: () => mockBuilder(),
    eq: () => mockBuilder(),
    order: () => mockBuilder(),
    single: () => ({
      then: (cb: (result: { data: any; error: any }) => void) => {
        cb({ data: null, error: null })
        return { catch: () => {} }
      }
    }),
    then: (cb: (result: { data: any; error: any }) => void) => {
      cb({ data: null, error: null })
      return { catch: () => {} }
    },
  })

  return {
    from: () => mockBuilder(),
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient() as any

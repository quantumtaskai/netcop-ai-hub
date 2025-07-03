import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, User } from '@/lib/supabase'

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Actions
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateWallet: (amount: number) => Promise<void>
  topUpWallet: (packageId: string) => void
  refreshUser: () => Promise<void>
  initializeSession: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signUp: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
          });
          if (error) throw error;

          // If session is present, user does not need to confirm email
          let user = data.user;
          if (!user && data.session) {
            user = data.session.user;
          }

          if (!user) {
            set({ isLoading: false });
            throw new Error("Signup failed: No user returned from Supabase.");
          }

          // Now insert into users table
          if (!user.email) throw new Error('User email is missing from auth response.');
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email.split('@')[0],
              wallet_balance: 0.00
            }]);
          if (profileError) throw profileError;

          // Fetch the created user
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          if (fetchError) throw fetchError;

          set({ user: userData, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          console.log('Starting signin process...')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          console.log('Auth signin result:', { data, error })
          if (error) {
            console.error('Auth signin error:', error)
            throw new Error(error.message || 'Authentication failed')
          }
          if (data.user) {
            console.log('Auth successful, fetching user profile...')
            // Fetch the user profile from users table
            const { data: userData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (profileError) {
              console.error('Profile fetch error:', profileError)
              
              // Check if it's a missing profile (common after database migration)
              if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows')) {
                console.log('Profile not found, creating new profile...')
                // Create missing profile for existing auth user
                const { error: insertError } = await supabase
                  .from('users')
                  .insert([{
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
                    wallet_balance: 0.00
                  }])
                
                if (insertError) {
                  console.error('Failed to create profile:', insertError)
                  throw new Error('Failed to create user profile. Please contact support.')
                }
                
                // Fetch the newly created profile
                const { data: newUserData, error: refetchError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', data.user.id)
                  .single()
                
                if (refetchError || !newUserData) {
                  throw new Error('Failed to retrieve user profile after creation')
                }
                
                set({ user: newUserData, isLoading: false })
                console.log('Profile created and signin completed:', newUserData)
              } else {
                throw new Error(`Database error: ${profileError.message}`)
              }
            } else {
              set({ user: userData, isLoading: false })
              console.log('Signin completed successfully:', userData)
            }
          } else {
            throw new Error('No user data returned from authentication')
          }
        } catch (error: any) {
          console.error('Signin failed:', error)
          const errorMessage = error.message || 'Login failed. Please try again.'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        
        try {
          console.log('Starting signout process...')
          
          const { error } = await supabase.auth.signOut()
          
          console.log('Signout result:', { error })
          
          if (error) {
            console.error('Signout error:', error)
            throw error
          }
          
          set({ user: null, isLoading: false })
          console.log('Signout completed successfully')
        } catch (error: any) {
          console.error('Signout failed:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          console.log('Sending password reset email to:', email)
          const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          })
          console.log('Reset password result:', { data, error })
          if (error) throw error
          set({ isLoading: false })
          console.log('Password reset email sent successfully')
        } catch (error: any) {
          console.error('Password reset failed:', error)
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      updateWallet: async (amount: number) => {
        const { user } = get()
        if (!user) return

        try {
          console.log('Updating wallet:', { userId: user.id, currentBalance: user.wallet_balance, amount })
          
          const newBalance = user.wallet_balance + amount
          
          const { data, error } = await supabase
            .from('users')
            .update({ wallet_balance: newBalance })
            .eq('id', user.id)
            .select()
            .single()

          console.log('Wallet update result:', { data, error })

          if (error) {
            console.error('Wallet update error:', error)
            throw error
          }

          set({ user: data })
          console.log('Wallet updated successfully:', data.wallet_balance, 'AED')
        } catch (error: any) {
          console.error('Wallet update failed:', error)
          set({ error: error.message })
          throw error
        }
      },

      refreshUser: async () => {
        try {
          console.log('🔄 Refreshing user data from database...')
          
          // First check current session
          const { data: session } = await supabase.auth.getSession()
          if (!session.session) {
            console.log('❌ No active session found')
            set({ user: null, error: 'Session expired. Please log in again.' })
            return
          }

          // Then get the user
          const { data: authUser, error: authError } = await supabase.auth.getUser()
          if (authError || !authUser.user) {
            console.log('❌ No auth user found:', authError?.message)
            set({ user: null, error: 'Authentication failed. Please log in again.' })
            return
          }

          console.log('👤 Fetching user data for:', authUser.user.id)
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.user.id)
            .single()
          
          if (error) {
            console.error('❌ Failed to fetch user data:', error)
            throw error
          }

          console.log('✅ User data refreshed:', { 
            id: userData.id, 
            email: userData.email, 
            wallet_balance: userData.wallet_balance 
          })
          set({ user: userData, error: null })
        } catch (error: any) {
          console.error('❌ Failed to refresh user:', error)
          set({ error: error.message })
          throw error
        }
      },

      topUpWallet: (packageId: string) => {
        const { user } = get()
        if (!user) {
          console.error('❌ Cannot top up wallet: No user found')
          return
        }

        console.log('💰 Starting wallet top-up:', { packageId, userId: user.id })
        
        // Create checkout session URL for wallet top-up
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL
        const successUrl = `${baseUrl}/wallet?session_id={CHECKOUT_SESSION_ID}&payment=success&package=${packageId}`
        const cancelUrl = `${baseUrl}/wallet?payment=cancelled`
        
        const checkoutUrl = `/api/wallet/create-checkout?package=${packageId}&user=${user.id}&success=${encodeURIComponent(successUrl)}&cancel=${encodeURIComponent(cancelUrl)}`
        
        console.log('🔗 Redirecting to wallet checkout:', { 
          packageId, 
          checkoutUrl,
          userId: user.id 
        })
        
        // Redirect to checkout
        window.location.href = checkoutUrl
      },

      setUser: (user: User | null) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      // Initialize session - called on app start
      initializeSession: async () => {
        try {
          console.log('🚀 Initializing session...')
          const { data: session } = await supabase.auth.getSession()
          
          if (session.session && session.session.user) {
            console.log('📱 Found existing session for:', session.session.user.id)
            
            // Fetch user data from database
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.session.user.id)
              .single()
            
            if (!error && userData) {
              console.log('✅ Session restored:', { id: userData.id, email: userData.email, wallet_balance: userData.wallet_balance })
              set({ user: userData, error: null })
            } else {
              console.log('❌ User data not found for session, checking if profile needs creation...')
              
              // Check if it's missing profile (database might be fresh)
              if (error?.code === 'PGRST116' || error?.message?.includes('No rows')) {
                console.log('Creating missing profile for session user...')
                try {
                  const { error: insertError } = await supabase
                    .from('users')
                    .insert([{
                      id: session.session.user.id,
                      email: session.session.user.email!,
                      name: session.session.user.user_metadata?.name || session.session.user.email!.split('@')[0],
                      wallet_balance: 0.00
                    }])
                  
                  if (!insertError) {
                    // Fetch the newly created profile
                    const { data: newUserData } = await supabase
                      .from('users')
                      .select('*')
                      .eq('id', session.session.user.id)
                      .single()
                    
                    if (newUserData) {
                      console.log('✅ Profile created and session restored:', newUserData)
                      set({ user: newUserData, error: null })
                      return
                    }
                  }
                } catch (profileError) {
                  console.error('Failed to create profile during session init:', profileError)
                }
              }
              
              // If we get here, profile creation failed or other error
              console.log('Clearing session due to profile issues')
              set({ user: null })
            }
          } else {
            console.log('ℹ️ No existing session found')
            set({ user: null })
          }
        } catch (error: any) {
          console.error('❌ Failed to initialize session:', error)
          set({ user: null, error: error.message })
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
) 
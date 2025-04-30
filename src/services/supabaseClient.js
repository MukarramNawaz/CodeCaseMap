// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createBrowserClient } from '@supabase/ssr';
import { parse, serialize } from 'cookie';

const COOKIE_NAME = 'sb:token';

function getCookie(name) {
  const cookies = parse(document.cookie || '');
  return cookies[name] || null;
}

function setCookie(name, value, options = {}) {
  document.cookie = serialize(name, value, {
    path: '/',
    ...options,
  });
}

function removeCookie(name) {
  setCookie(name, '', { maxAge: -1 });
}

export const supabase = createBrowserClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: {
        getItem: (key) => Promise.resolve(getCookie(key)),
        setItem: (key, value) => {
          setCookie(key, value, { 
            maxAge: 86400, // 24 hours in seconds
            sameSite: false,
            httpOnly: false
          });
          return Promise.resolve();
        },
        removeItem: (key) => {
          removeCookie(key);
          return Promise.resolve();
        },
      },
      storageKey: COOKIE_NAME,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);



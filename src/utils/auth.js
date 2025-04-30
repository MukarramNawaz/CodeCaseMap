export const getAuthToken = () => {
  const storageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT}-auth-token`;
  const tokenData = localStorage.getItem(storageKey);
  if (!tokenData) return null;
  
  const { access_token } = JSON.parse(tokenData);
  return access_token;
};

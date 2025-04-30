// api.js
import { supabase } from './supabaseClient';
import store from '../store';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Register User
export const registerUser = async (email, password, name) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Login User
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get User Subscription Status
export const getUserSubscription = async (userId) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) throw error;
    
    return {
      success: true,
      data: subscription,
      hasActiveSubscription: !!subscription,
      planDetails: subscription?.plans || null,
      expiresAt: subscription?.current_period_end || null
    };
  } catch (error) {
    console.error('GetUserSubscription Error:', error);
    return {
      success: false,
      message: error.message,
      hasActiveSubscription: false,
      planDetails: null,
      expiresAt: null
    };
  }
};

// Get User Info
export const getUserInfo = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) throw new Error('No user found');
    
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      // If user doesn't exist in the users table, create a new record
      if (userError.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ 
            id: user.id,
            name: user.user_metadata?.full_name || user.email,
            profile_picture: user.user_metadata?.avatar_url,
            email: user.user_metadata?.email || user.email,
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        userData = newUser;
      } else {
        throw userError;
      }
    }
    
    // Get subscription data
    const { data: subscriptionData, hasActiveSubscription } = await getUserSubscription(user.id);
    
    const combinedData = {
      ...user,
      ...userData,
      name: userData?.name || user.user_metadata?.full_name || user.email,
      profile_picture: userData?.profile_picture || user.user_metadata?.avatar_url,
      phone: userData?.phone || '',
      age: userData?.age || '',
      gender: userData?.gender || 'Male',
      marital_status: userData?.marital_status || 'Single',
      about: userData?.about || '',
      subscription: subscriptionData,
      hasActiveSubscription
    };
    
    return { success: true, data: combinedData };
  } catch (error) {
    console.error('GetUserInfo Error:', error);
    return { 
      success: false, 
      message: error.message,
      // Ensure we return a serializable error object
      error: {
        message: error.message,
        code: error.code,
      }
    };
  }
};

// Logout
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const uploadAvatar = async (file) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!file) return { success: true, publicUrl: null };

    // List existing avatar files for the user
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(user.id);

    // Delete existing avatar files
    if (existingFiles?.length > 0) {
      const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filesToDelete);

      if (deleteError) throw deleteError;
    }

    // Generate a unique filename
    const fileExt = file.type.split('/')[1];
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    // Upload the new file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { success: true, publicUrl: data.publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, message: error.message };
  }
};

export const updateUserInfoApi = async (name, email, imageFile, userData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    let updateData = {
      name: userData.name,
      phone: userData.phone,
      age: userData.age,
      gender: userData.gender,
      marital_status: userData.marital_status, // Make sure we use the correct field name
      about: userData.about
    };

    // Only handle image upload if a new image is provided
    if (imageFile) {
      const uploadResult = await uploadAvatar(imageFile);
      if (!uploadResult.success) throw new Error(uploadResult.message);
      if (uploadResult.publicUrl) {
        updateData.profile_picture = uploadResult.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get All Conversations (Threads)
export const getAllConversations = async () => {
  try {
    const userId = store.getState().user.userInfo.id;
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Delete All Conversations (Threads)
export const deleteAllConversations = async () => {
  try {
    const userId = store.getState().user.userInfo.id;
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get Conversation by ID (Get Messages by Thread ID)
export const getConversationById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Delete Conversation by ID (Delete Thread)
export const deleteConversationById = async (id) => {
  try {
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Update Conversation by ID (Update Thread Name)
export const updateConversationById = async (id, newName) => {
  try {
    const { data, error } = await supabase
      .from('threads')
      .update({ name: newName })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Create Conversation
export const createConversation = async (initialMessage) => {
  const threadName = initialMessage.length > 32 
    ? `${initialMessage.slice(0, 32)}...` 
    : initialMessage;

  const response = await fetch(`${API_BASE_URL}/api/createthread`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // This is the fetch equivalent of axios's `withCredentials: true`
    body: JSON.stringify({ thread_name: threadName })
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  return data; // Expected to be { id }
};

// send message to the conversation
export const sendMessageToConversation = async (threadId, message) => {
  const resp = await fetch(
    `${API_BASE_URL}/api/sendmessage`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: threadId, role: 'user', content: message })
    }
  );
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || 'Failed to send message');
  }
  return resp.json(); // { message_id }
};

// 3) Stream assistant responses via Server-Sent Events
export const streamAssistant = (threadId, onUpdate, onDone, onError) => {
  const evtSource = new EventSource(
    `${API_BASE_URL}/api/stream?thread_id=${threadId}`,
    { withCredentials: true }
  );
  evtSource.onmessage = (e) => {
    if (e.data === '[DONE]') {
      evtSource.close();
      onDone();
    } else {
      const { content } = JSON.parse(e.data);
      onUpdate(content);
    }
  };
  evtSource.onerror = (err) => {
    evtSource.close();
    onError(err);
  };
  return () => evtSource.close();
};


// Get Plans
export const getPlans = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/subscription/plans?language=en-us`,
      {
        headers: {
          accept: "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// api.js
import { supabase } from './supabaseClient';
import store from '../store';

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
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        userData = newUser;
      } else {
        throw userError;
      }
    }
    
    const combinedData = {
      ...user,
      ...userData,
      name: userData?.name || user.user_metadata?.full_name || user.email,
      profile_picture: userData?.profile_picture || user.user_metadata?.avatar_url,
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

// Update User Info
export const updateUserInfoApi = async (name, email, imageFile) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    let updateData = { name };

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
export const createConversation = async (message) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/conversation/create`,
      {
        message,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// send message to the conversation
export const sendMessageToConversation = async (id, message, stream = true) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/user/conversation/${id}/message/send`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include", // Equivalent to `withCredentials: true` in Axios
        body: JSON.stringify({ message, stream }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    return await response.json();
  } catch (error) {
    throw error.message || "An error occurred";
  }
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

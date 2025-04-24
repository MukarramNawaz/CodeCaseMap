// import { Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchUserInfo } from '../features/userSlice';
// import { getUserInfo } from '../services/api';
// import { useEffect } from 'react';
// const ProtectedRoute = ({ children }) => {
//   const dispatch = useDispatch();
//   const { userInfo, loading, error } = useSelector((state) => state.user);
//   useEffect(() => {
//     dispatch(fetchUserInfo());
//     console.log( userInfo)
//   }, [dispatch]);
  
//   useEffect(() => {
//     const checkAuth = async () => {
//       const isAuthenticated = await getUserInfo();
//       if (!isAuthenticated.success) {
//         return <Navigate to="/login" replace />;
//       }
//     };
//     console.log('checking auth');
//     checkAuth();
//   }, []);

//   return children;
// };

// export default ProtectedRoute;


import { Navigate } from 'react-router-dom';
import { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo } from '../features/userSlice'; // Import the Redux action
import Loading from './Loading';
const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  
  
  useEffect(() => {
    
    dispatch(fetchUserInfo());
    setTimeout(() => {
      setIsLoading(false);
      console.log('userInfo',userInfo)
      if (!userInfo) {
        setIsLoading(false);
      }
    }
    , 2000);
  }, [dispatch]);

  if (loading || isLoading) {
    
    return <Loading />;
  }

  if (error || !userInfo) {
   
    return <Navigate to="/login" replace />;
  }

  
  return children;
};

export default ProtectedRoute;
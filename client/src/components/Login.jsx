import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

import React from 'react'

const Login = () => {

    const [isLogin,setisLogin] =useState(true);
    const [formData,setFormData] =useState({username:'',password:'',role:'PATIENT',name:''});
    const[error,setError]=useState('');
    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setError('');

        try{
            if(isLogin){
                const res=await axios.post('http://localhos:8000/api/auth/signin',{
                    username:formData.username,
                    password:formData.password
                });
                localStorage.setItem('user',JSON.stringify(res.data));
                navigate('/dashboard');
            }else{
                await axios.post('http://localhost:8000/api/auth/signup',formData);
                setisLogin(true);
                setError("Registration successdull! Please Login");
            }
        }catch(err){
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

  return (
    <div className='flex justify-center items-center h-[calc(100vh-80px)] bg-slate-50'>

     <div className='w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all'>
<div className="p-8">
    <h2 className='text-3xl font-bold text-slate-800 text-center mb-2'>
        {!isLogin?'Welcome to lgin page':"Create Acount"}
    </h2>
    <p className='text-center text-slate-500 mm-8'>
        {isLogin ?'Enter your details to acces the account':'Sign Up to get started'}
    </p>
    {error&&(
        <div className={`p-4 rounded-lg mb-6 text-sm ${error.includes('successfull') ?'bg-green-50 text-green-700 borde-green-200':'bg-red-50 text-red-700 border border-red-200'}`}>{error}

        </div>
    )}
     <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="enter your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">I am a</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex-1 flex items-center justify-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                      <input type="radio" name="role" value="PATIENT" checked={formData.role === 'PATIENT'} onChange={(e) => setFormData({...formData, role: e.target.value})} className="hidden peer" />
                      <span className={formData.role === 'PATIENT' ? 'text-blue-700 font-semibold' : 'text-slate-600'}>Patient</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                      <input type="radio" name="role" value="DOCTOR" checked={formData.role === 'DOCTOR'} onChange={(e) => setFormData({...formData, role: e.target.value})} className="hidden peer" />
                      <span className={formData.role === 'DOCTOR' ? 'text-blue-700 font-semibold' : 'text-slate-600'}>Doctor</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="username123" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••" />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-blue-600 font-semibold hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
</div>
     </div>

    </div>
  )
}

export default Login
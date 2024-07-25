import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const loginUser = createAsyncThunk('user/login',async(postData, {rejectWithValue}) => {
    try{
        const response = await axios.post(`${API_URL}/user/login`, postData);
        return response.data;
    }catch(error){
        if(error.response){
            return rejectWithValue(error.response.data.message);
        }else if(error.request){
            return rejectWithValue('Network error');
        }else {
            return rejectWithValue(error.message);
        }
    }
})

export const authUser = createAsyncThunk('user/auth-user', async(token, {rejectWithValue}) => {
    try{
        const response = await axios.get(`${API_URL}/user/auth-user`,{headers:{Authorization : `Bearer ${token}`}})
        return response.data;
    }catch(error){
        const refreshToken = localStorage.getItem('refreshToken');
        try{
            const response = await axios.get(`${API_URL}/user/refresh-token`,{headers:{Authorization : `Bearer ${refreshToken}`}})
            return rejectWithValue(response.data);
        }catch(error){
            console.log(error);
            if(error.response){
                return rejectWithValue(error.response.data.message);
            }else if(error.request){
                return rejectWithValue('Network error');
            }else {
                return rejectWithValue(error.message);
            }
        }
         
    }
})

const initialState = {
    isLoading:false,
    isAuth: (localStorage.getItem('token')) ? true : false,
    token: localStorage.getItem('token') || '',
    refreshToken:localStorage.getItem('refreshToken') || '',
    authUser:'',
    message:'',
    error:''
}

const loginSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        clearMessage:(state) => {
            state.message = '';
        },
        clearError:(state) => {
            state.error = '';
        },
        logOut:(state) => {
            state.isAuth = false;
            state.token = '';
            state.refreshToken = '';
            state.authUser = '';
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }
    },
    extraReducers:(builder) => {
        builder.addCase(loginUser.pending, (state,action)=> {
            state.isLoading = true;
           
        })
        builder.addCase(loginUser.fulfilled, (state, action)=> {
            state.isLoading = false;
            state.isAuth = true;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.authUser = action.payload.authUser;
            state.message = action.payload.message;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken',action.payload.refreshToken);


        })
        builder.addCase(loginUser.rejected, (state,action)=> {
            state.isLoading = false;
            state.error = action.payload;
        })

        builder.addCase(authUser.pending, (state)=> {
            state.isLoading = true
        })
        builder.addCase(authUser.fulfilled, (state, action)=> {
            state.isLoading = false;
            state.isAuth = true;
            state.authUser = action.payload.authUser;
        })
        builder.addCase(authUser.rejected, (state,action)=> {
            if(action.payload.token){
                state.isLoading = false;
                state.isAuth = true;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.authUser = action.payload.authUser;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('refreshToken',action.payload.refreshToken);
            }else {
                state.isLoading = false;
                state.isAuth = false;
                state.token = '';
                state.refreshToken = '';
                state.authUser = '';
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            }      
        })
    }
});

const {actions,reducer} = loginSlice;
export default reducer;
export const {clearMessage, clearError, logOut} = actions;




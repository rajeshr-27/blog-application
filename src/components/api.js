import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getBlogs = async(token = null, url_query = null) =>{
    try {
        const response = await axios.get(`${API_URL}/blog/list${(url_query != null) ? url_query : ''}`, {headers:{Authorization:`Bearer ${token}`}});
        return response.data;
    }catch(error){
        return error.response.data;
    }
    
}

export const getBlogsAll = async(url_query = null) =>{
  
    try {
        const response = await axios.get(`${API_URL}/blog/all${(url_query != null) ? url_query : ''}`);
        return response.data;
    }catch(error){
        return error.response.data;
    }    
}

export const getBlog = async(token,id) =>{
    try {
        const response = await axios.get(`${API_URL}/blog/details/${id}`, {headers:{Authorization:`Bearer ${token}`}});
        return response.data;
    }catch(error){
        return error.response.data;
    }
    
}

export const getComments = async(blog_id) =>{
    try{
        const response = await axios.get(`${API_URL}/comment/list/${blog_id}`);
        return response.data
    }catch(error){
        return error.response.data;
    }
}
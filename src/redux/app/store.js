import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../features/loginSlice";

const store =configureStore({
    reducer:{
        user:loginReducer
    }
})

export default store;
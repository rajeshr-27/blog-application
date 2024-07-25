import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router , Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Register from './components/Register';
import Login from './components/Login';
import Blogs from './components/Blogs';
import Home from './components/Home';
import BlogDetails from './components/BlogDetails';
import { Provider } from 'react-redux';
import store from './redux/app/store';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="App">
        <Provider store={store}>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Header />}>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/blog-details/:id" element={<BlogDetails />} />
                        <Route path="/" element={<ProtectedRoute />}>
                            <Route path="/blogs" element={<Blogs />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
            <Footer />
        </Provider>
        <ToastContainer />
    </div>
  );
}

export default App;

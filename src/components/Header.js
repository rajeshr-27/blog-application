import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Outlet, Link } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { logOut } from '../redux/features/loginSlice';
import * as Icon from 'react-bootstrap-icons'

function Header() {
    const {isAuth,authUser} = useSelector((state)=> state.user);
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logOut());
    }
  return (
    <>
        <Navbar   bg="primary" data-bs-theme="dark">
        <Container>
            <Link  to="/" className='navbar-brand'> Blog Application</Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="">
                {
                    !isAuth &&
                    <>
                         <Link to="/register" className="nav-link"><Icon.PersonFill /> Register</Link>
                         <Link to="/login" className="nav-link"><Icon.KeyFill /> Login</Link>
                    </>

                }

                {
                    isAuth && 
                    <NavDropdown title={authUser.name} id="basic-nav-dropdown">
                        <Link to="/blogs" className='dropdown-item'>Blogs</Link> 
                        <Link onClick={handleLogout}  className='dropdown-item'>Logout</Link> 
                    </NavDropdown>
                }
               
                
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>
        <Outlet />
    </>
  );
}

export default Header;
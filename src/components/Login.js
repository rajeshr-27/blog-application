import React, {useState} from "react";
import { Col, Container, Row, Card, Form, Button } from "react-bootstrap";
import { useSelector,useDispatch } from "react-redux";
import { clearError, clearMessage, loginUser } from "../redux/features/loginSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
function Login() {
    const {message,error, isLoading} = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const naviate = useNavigate();
    const [frmData,setFrmData] = useState({
        email:'',
        password:''
    })
    const handleChange = (e) => {
        const {name,value} = e.target;
        setFrmData({
            ...frmData,
            [name]:value
        })
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser(frmData));
    }

    if(message){
        toast.success(message);
        dispatch(clearMessage());
        naviate('/blogs');
    }
    if(error){
        toast.error(error);
        dispatch(clearError());
    }
    return(
        <Container>
            <Row className="mt-5">
                <Col></Col>
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center">Login</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="text" value={FormData.email} onChange={handleChange}  name="email" placeholder="Enter Eamil"></Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" value={FormData.password} onChange={handleChange}  name="password" placeholder="Enter Password"></Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Button type="submit" variant="primary" className="float-end" disabled={isLoading}>{(isLoading)?'Loading...':'Login'}</Button>
                                </Form.Group>
                                <p className="small fw-bold mt-2 pt-1 mb-0">Don't have an account? <Link to="/register" className="link-danger">Register</Link></p> 

                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col></Col>
            </Row>
        </Container>
    )
}
export default Login;
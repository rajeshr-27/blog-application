import axios from "axios";
import React, { useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {

    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const initialData = {
        name:'',
        email:'',
        password:'',
        confirm_password :'',
        mobile_number :'',
        gender:'',
        country:'',
        state:'',
        city:'',
        address:'',
        photo:''
    }
    const [frmData,setFrmData] = useState(initialData);
    const[isLoading,setIsLoading] = useState(false);

    const handleChange = (e) => {
        const {name,value,files} = e.target;
        setFrmData({
            ...frmData,
            [name]:(files)? files[0]:value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const postData = new FormData();
        postData.append('photo', frmData.photo);
        postData.append('data', JSON.stringify(frmData));
        try{
            //register user api
            const response = await axios.post(`${API_URL}/user/add`, postData);
            toast.success(response.data.message);
            navigate('/login',{replace:true});
        }catch(error){
            toast.error(error.response.data.message);
        }finally{
            setIsLoading(false);
        }
    }
     return(
        <Container>
            <Row className="mt-5 mb-5">
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center">Registration Form</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name *</Form.Label>
                                            <Form.Control type="text" name="name" value={frmData.name} onChange={handleChange} placeholder="Enter Name" required></Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email *</Form.Label>
                                            <Form.Control type="text" name="email" value={frmData.email} onChange={handleChange} placeholder="Enter Email" required></Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password *</Form.Label>
                                            <Form.Control type="password" name="password" value={frmData.password} onChange={handleChange} placeholder="Enter Password" required></Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm Password *</Form.Label>
                                            <Form.Control type="password" name="confirm_password" value={frmData.confirm_password} onChange={handleChange} placeholder="Enter Confirm Password" required></Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mobile Number * </Form.Label>
                                            <Form.Control type="text" name="mobile_number" value={frmData.mobile_number} onChange={handleChange}  placeholder="Enter Mobile Number" required></Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Gender</Form.Label>
                                            <Form.Select name="gender" value={frmData.gener} onChange={handleChange}  >
                                                <option value="">---Select Gender---</option>
                                                <option value="Male">Male</option>
                                                <option value="FeMale">FeMale</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>country</Form.Label>
                                            <Form.Select name="country" value={frmData.country} onChange={handleChange}  >
                                                <option value="">---Select Country---</option>
                                                <option value="India">India</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>State</Form.Label>
                                            <Form.Select name="state" value={frmData.state} onChange={handleChange}  >
                                                <option value="">---Select State---</option>
                                                <option value="Tamilnadu">Tamilnadu</option>
                                            </Form.Select>
                                        </Form.Group>
                                        
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Select name="city" value={frmData.city} onChange={handleChange}  >
                                                <option value="">---Select City---</option>
                                                <option value="Erode">Erode</option>
                                            </Form.Select>
                                        </Form.Group> 

                                        <Form.Group className="mb-3">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control as="textarea" value={frmData.address} onChange={handleChange} name="address" placeholder="Enter Address"></Form.Control>
                                        </Form.Group> 
                                        <Form.Group className="mb-3">
                                            <Form.Label>Photo</Form.Label>
                                            <Form.Control type="file"  onChange={handleChange} name="photo" placeholder="Enter Name"></Form.Control>
                                        </Form.Group> <Form.Group className="mb-3 float-end">
                                            <div>
                                                <Button type="submt" variant="primary" disabled={isLoading}>{(isLoading) ? 'Loading...':'Register'}</Button>
                                            </div>
                                        
                                        </Form.Group>
                                        <div>
                                            <p className="small fw-bold mt-2 pt-1 mb-0">Do you have an account? <Link to="/login" className="link-danger">Login</Link></p>

                                            </div>
                                       
                                    </Col>
                                </Row>
                                 
                               
                            </Form>
                        </Card.Body>
                    </Card>
            </Row>
        </Container>
    )
}

export default Register;
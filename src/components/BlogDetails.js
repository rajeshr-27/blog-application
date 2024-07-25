import React, { useEffect, useState, useRef } from "react";
import { Container, Row,Col, Card, Form, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { authUser } from "../redux/features/loginSlice";
import { getBlog, getBlogsAll, getComments } from "./api";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";
function BlogDetails(){
    const API_URL = process.env.REACT_APP_API_URL;
    const {isAuth,token} = useSelector((state)=> state.user);
    const dispatch = useDispatch();

    const {id} = useParams();

    const [blog,setBlog] = useState('');
    const [latestBlogs,setLatestBlogs] = useState('');
    const [comments,setComments] = useState('');
    const [commentData,setCommentData] = useState('')

    const commentBoxRef = useRef(null)

    useEffect(()=> {
        const fetchBlog = async () => {
            const response = await getBlog(token,id);
            if(response.status === 1){
                setBlog(response.blog);
            }
        }
        fetchBlog();

        const fetchComments = async () => {
            const response = await getComments(id);
            if(response.status === 1){
                setComments(response.comments);
            }
        }
        fetchComments();

        //fetch latest blogs
        const fetchLatestBlogs = async () => {
            const response = await getBlogsAll('?limit=5');
            if(response.status === 1){
                setLatestBlogs(response.blogs)
            }
        }
        fetchLatestBlogs();
        
        if(isAuth){
            dispatch(authUser(token));
        }
    },[id,dispatch,isAuth,token])
    const formatDate = (date) => {
        return moment(date).format('MMMM DD, YYYY');
    } 

    const handleChange = (e) => {
        setCommentData(e.target.value);

    }
    const handleSubmit = async (e) =>{
        e.preventDefault();
        const postData = {};

        postData.comment = commentData;
        postData.blog_id = id;
        try{
            const response = await axios.post(`${API_URL}/comment/add`,postData,{headers:{Authorization:`Bearer ${token}`}});
            if(response.data.status === 1){
                setCommentData('');
                const fetchComments = await getComments(id);
                if(fetchComments.status === 1){
                    setComments(fetchComments.comments)
                    scrollTop();
                }
            }
        }catch(error){
            console.log(error);
        }
    }

    const scrollTop = () => {
        if(commentBoxRef.current){
            commentBoxRef.current.scrollTop = 0;
        }
    }

    const truncateString = (str, num) => {

        if(str.length <= num) return str;

        return str.slice(0,num)+"...";
    }

    return(
        <Container className="mt-3">
            <Row>
                <Col sm={8}>
                    {blog  &&
                          <Card>
                            <Card.Img variant="top" src={`${API_URL}/blogs/${blog.image}`} />
                            <Card.Body>
                                <Card.Title>{blog.title}</Card.Title>
                                <p dangerouslySetInnerHTML={{__html:blog.describtion}} />
                            </Card.Body>
                        </Card>
                    }
                  

                    {/*Comments*/}

                    <Card className="mt-5 mb-5">
                    
                    <Card.Body>
                    <Card.Title><h3>Comments {comments.length || ''}</h3></Card.Title>
                        <div className="comment-body scrollable-div" ref={commentBoxRef}>
                        {
                            comments &&
                            comments.map((comment_data, index)=>(
                                <ul class="comment-reply list-unstyled">
                                    <li class="row clearfix">
                                        <div className="icon-box col-md-2 col-4">
                                            <img class="img-fluid img-thumbnail" src={(Array.isArray(comment_data.user_data) && comment_data.user_data.length >0) ?`${API_URL}/${comment_data.user_data[0].photo}`:''} alt={comment_data.photo} />
                                        </div>
                                        <div class="text-box col-md-10 col-8 p-l-0 p-r0">
                                            <h5 class="m-b-0">{(Array.isArray(comment_data.user_data) && comment_data.user_data.length>0) ? comment_data.user_data[0].name:''}</h5>
                                            <p>{comment_data.comment}</p>
                                            <ul class="list-inline">
                                                <li><Link>{formatDate(comment_data.createdAt)}</Link></li>
                                                {/* <li><a href="javascript:void(0);">Reply</a></li> */}
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            ))
                        }
                        </div>

                        {
                            isAuth &&
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label></Form.Label>
                                    <Form.Control as="textarea" value={commentData} onChange={  handleChange} name="comment"></Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label></Form.Label>
                                    <Button type="submit" variant="primary" className="float-end">Submit</Button>
                                </Form.Group>
                            </Form>
                        }  

                        {
                            !isAuth &&
                            <p className="text-center">Click here to <Link to={'/register'} className="btn btn-sm btn-success">Create account</Link> or <Link to="/login" className="btn btn-sm btn-warning"> Login </Link></p>
                        }
                    </Card.Body>
                </Card>
                
                </Col>
                <Col sm={4}>
                    
                    <Card>
                    
                        <Card.Body>
                        <Card.Title><h3>Latest Posts</h3></Card.Title>
                        {latestBlogs && 
                            latestBlogs.map((blog_data) => (
                                <>
                                    <div key={blog_data._id} className="mb-5">
                                        <Link to={`/blog-details/${blog_data._id}`} >
                                            <p className="title">{truncateString(blog_data.title,20)}</p>
                                            <div className="date">{formatDate(blog_data.createdAt)}</div>
                                            <Card.Img variant="top" src={`${API_URL}/blogs/${blog_data.image}`} />
                                        </Link>
                                    </div>
                                </> 
                            ))
                        }
                       
                        </Card.Body>
                    </Card>
                </Col>

            </Row>
        </Container>
    )
}

export default BlogDetails;
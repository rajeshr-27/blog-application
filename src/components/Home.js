import React, {useEffect, useState} from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import * as Icon from 'react-bootstrap-icons';
import { useSelector,useDispatch } from 'react-redux';
import { authUser } from '../redux/features/loginSlice';
import {  getBlogsAll } from './api';
import moment from 'moment';
import ReactPaginate from 'react-paginate';


function Home() {
    const {isAuth, token} = useSelector((state) => state.user);
    const dispatch  = useDispatch();
    const [blogs,setBlogs] =  useState('');
    const API_URL = process.env.REACT_APP_API_URL;

    //paginate
    const [currentPage,setCurrentPage] = useState(1);
    const [pageCount,setPageCount] = useState(0);
    const itemPerPage = 9;
    let url_query = `?page=${currentPage}&limit=${itemPerPage}`;

    useEffect(() =>{
        const fetchBlogs= async () => {
            const response = await getBlogsAll(url_query);
            if(response.status === 1){
                setBlogs(response.blogs);
                setPageCount(Math.ceil(response.total/itemPerPage));
            }
        }
        fetchBlogs();
        if(isAuth){
            dispatch(authUser(token));
        }
    },[currentPage,dispatch,isAuth,token,url_query])

    const handlePageClick = (event) => {
        setCurrentPage(event.selected+1)
        window.scrollTo(0,0);

    }

    const truncateString = (str, num) => {
        if(str.length <= num) return str;

        return str.slice(0,num) +'...';
        
    }

    const formatDate = (date) => {
        return moment(date).format('DD, MMMM, YYYY');
    }
  return (
    <Container className='mt-5'>
        <Row>
        {
            blogs &&
            blogs.map( (blog_data, inde) => (
                <Col md={6} lg={4} className='mb-5'>
                    <Card style={{ width: '18rem' }}>
                    <Link to={`/blog-details/${blog_data._id}`}> 
                        <Card.Img variant="top" src={`${API_URL}/blogs/${blog_data.image}`} style={{'height':'224px'}} />
                        <Card.Body>
                            <Card.Title>{truncateString(blog_data.title, 20)}</Card.Title>
                            <Card.Text style={{'height':'112px'}}> 
                            <div dangerouslySetInnerHTML={{__html:blog_data.describtion && truncateString(blog_data.describtion, 100)}} />  
                            </Card.Text>
                        </Card.Body>
                        <div className="meta meta-style2">
                            <ul>
                                <li><Icon.Calendar2Fill />{formatDate(blog_data.createdAt)}</li>
                                <li><Icon.PersonFill />{ (Array.isArray(blog_data.user_data) && blog_data.user_data.length > 0) ? blog_data.user_data[0].name : '-' }</li>
                                <li><Icon.ChatFill />{(Array.isArray(blog_data.comment_data) && blog_data.comment_data.length >0) ?  blog_data.comment_data.length : 0}</li>
                            </ul>
                        </div>
                    </Link>
                    </Card>
                </Col>               
            ))
        }
        </Row>
        <ReactPaginate
            nextLabel="next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel="< previous"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            activeClassName="active"
            renderOnZeroPageCount={null}
        />
       
    </Container>
  );
}

export default Home;
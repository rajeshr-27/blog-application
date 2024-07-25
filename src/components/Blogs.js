import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Image, Modal, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getBlog, getBlogs } from "./api";
import moment from "moment";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";

function Blogs() {
    const {token} = useSelector((state)=> state.user);
    const API_URL = process.env.REACT_APP_API_URL;
    const [show, setShow] = useState(false);
    const [blogs,setBlogs] = useState('');

    const initialData = {title:'',describtion:'',author:'',image:''}
    const [frmData,setFrmData] = useState(initialData)
    const [isLoading,setIsLoading] = useState(false)
    
    //pagination 
    
    //react-paginate
    const [sno,setSno] = useState(0);
    const[pageCount, setPageCount] = useState(0);
    const [currentPage,setCurrentPage] = useState(1);
    const [totalCount,setTotalCount] = useState(0);
    const [filter,setFilter] = useState({title:'',author:'',date:''});
    const itemPerPage = 10;
    
    //side effect of the page
    useEffect(()=> {
        const fetchBlogs = async() => {
            const {title,author,date} = filter;
            let url_query = `?page=${currentPage}&limit=${itemPerPage}&title=${title}&author=${author}&date=${date}`;
            const response = await getBlogs(token,url_query);
            if(response.status === 1){
                setBlogs(response.blogs);
                setTotalCount(response.total)
                setPageCount(Math.ceil(response.total/itemPerPage));
                setSno((currentPage-1) * itemPerPage)
            }
        }
        fetchBlogs();
       
    },[token,currentPage,filter])

    const handlePageClick = (event) => {
        setCurrentPage(event.selected +1);    
        window.scrollTo(0,0);   
    }
    const handleFilterChange = (e) => {
        const {name,value} = e.target;
        setFilter({
            ...filter,
            [name]:value
        })
    }

 

    //Modal show and hide action
    const handleShow = async (id) => {
        if(id){
            const response = await getBlog(token, id);
            if(response.status ===1){
                setFrmData(response.blog);
            }
        }else {
            setFrmData(initialData)
        }
        setShow(true);
    };
    const handleClose = () => setShow(false);

    //Form field changes
    const handleChange = (e) => {
        const {name,value, files} = e.target;
        setFrmData({
            ...frmData,
            [name]:(files) ? files[0]:value
        })
    }

    //Form describtion changes
    const handleDescrChange = (value) => {
        setFrmData({
            ...frmData,
            describtion: value
        })
    }

    //For Submit Add and Edit Blog
    const handleSubmit = async (e) => {
        e.preventDefault();
        const postData = new FormData();
        postData.append('image', frmData.image);
        postData.append('data', JSON.stringify(frmData));
        setIsLoading(true)
        try{
            let response;
            if(frmData._id){
             response = await axios.put(`${API_URL}/blog/edit/${frmData._id}`,postData,{headers:{Authorization: `Bearer ${token}`}})

            }else {
              response = await axios.post(`${API_URL}/blog/add`,postData,{headers:{Authorization: `Bearer ${token}`}})

            }
            if(response){
                toast.success(response.data.message);
                setFrmData(initialData);
                const {title,author,date} = filter;
                let url_query = `?page=${currentPage}&limit=${itemPerPage}&title=${title}&author=${author}&date=${date}`;
                const blogList = await getBlogs(token, url_query);
                if(blogList.status === 1){
                    setBlogs(blogList.blogs);
                }
                setShow(false);
            }            
        }catch(error){
            toast.error(error.response.data.message)
        }finally{
            setIsLoading(false)
        }
    }

    //Delete Blog
    const handleDelete = async (id)  => {
        if(window.confirm('Are you sure you want to delete!')){
            try{
                const response = await axios.delete(`${API_URL}/blog/delete/${id}`, {headers:{Authorization:`Bearer ${token}`}});
                alert(response.data.message);
                const {title,author,date} = filter;
                let url_query = `?page=${currentPage}&limit=${itemPerPage}&title=${title}&author=${author}&date=${date}`;
                const blogList = await getBlogs(token, url_query);
                if(blogList.status === 1){
                    setBlogs(blogList.blogs);
                } 
            }catch(error){
                toast.error(error.response.data.message);
            }
        }
    }
    //Date Format Change
    const formatDate = (date) => {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
    }

    //String truncate
    const truncateString = (str,num) => {
        if(str.length <= num) return str;
        return str.slice(0,num) + '...';        
    }
    return (
        <Container>
            <Row className="mt-5">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Filter</Card.Title>
                            <Form>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control type="text" value={filter.title} onChange={handleFilterChange} name="title" placeholder="Enter Title"></Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Author</Form.Label>
                                            <Form.Control type="text"  value={filter.author} onChange={handleFilterChange}  name="author" placeholder="Enter Author"></Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control type="date"  value={filter.date} onChange={handleFilterChange}  name="date" placeholder="Choose Date"></Form.Control>
                                        </Form.Group>
                                        {/* <Button variant="primary" className="float-end" size={'sm'} type="submit">Filter</Button> */}
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th colSpan={6}>Total:{totalCount} <Button variant="success" size="sm" onClick={() => handleShow('')} className="float-end">Add Blog</Button></th>
                            </tr>
                            <tr>
                                <th>S.No</th>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr> 
                        </thead>
                        <tbody>
                            {blogs &&
                                blogs.map((blog_data, index) => (
                                    <tr key={blog_data._id}>
                                        <td>{sno+index+1}</td>
                                        <td><Image src={`${API_URL}/blogs/${blog_data.image}`} alt={blog_data.image} style={{'height':'64px'}} /></td>
                                        <td>{truncateString(blog_data.title, 20)}</td>
                                        <td>{blog_data.author}</td>
                                        <td>{formatDate(blog_data.createdAt)}</td>
                                        <td>
                                            <Link to={`/blog-details/${blog_data._id}`} className="btn btn-sm btn-info">View</Link> | 
                                            <Button variant="warning"  onClick={() => handleShow(blog_data._id)}  size="sm">Edit</Button> |
                                            <Button variant="danger" onClick={() => handleDelete(blog_data._id)} size="sm">Delete</Button> 
                                        </td>
                                    </tr>
                                ))
                            }
                            { blogs.length === 0 &&
                                <tr>
                                    <td colSpan={6} className="text-center">No Record Found</td>
                                </tr>
                            }
                           
                        </tbody>
                    </Table>
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
                
                </Col>
            </Row>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    Add/Update Blog
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title * </Form.Label>
                            <Form.Control type="text" name="title" value={frmData.title} onChange={handleChange} placeholder="Enter Title" required></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Describtion *</Form.Label>
                            <ReactQuill className="react-quill-custom" value={frmData.describtion} onChange={handleDescrChange} modules={Blogs.modules} formats={Blogs.formats}
                                placeholder="Enter Describtion" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Author *</Form.Label>
                            <Form.Control type="text" name="author" value={frmData.author} placeholder="Enter author"  onChange={handleChange} required></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Image *</Form.Label>
                            { frmData._id && <><Form.Control type="file" name="image"  onChange={handleChange} ></Form.Control></>}
                            { !frmData._id && <><Form.Control type="file" name="image" required  onChange={handleChange} ></Form.Control></>}
                            
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Button type="submit" variant="primary" className="float-end" disabled={isLoading}>{(isLoading)? 'Loading...':'Add Blog'}</Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    )
}
// Specify the modules to include in the toolbar
Blogs.modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };
  
  // Specify the formats
  Blogs.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];  

export default Blogs;
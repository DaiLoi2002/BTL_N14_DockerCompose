import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import AuthController from '../../controllers/AuthController';
import MainLayout from '../layout/MainLayout';
import ParticlesBackground from './ParticlesBackground.js';
import './Auth.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: ''
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Số điện thoại là bắt buộc'),
    password: Yup.string()
      .required('Mật khẩu là bắt buộc')
  });

  const handleLogin = async (formValue) => {
    const { email, password } = formValue;
    setError('');
    setLoading(true);

    try {
      const user = await AuthController.login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(typeof error === 'string' ? error : 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="auth-page login-page">
        <ParticlesBackground />
        
        <Container className="auth-container">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <Card className="auth-card">
                <Card.Header as="h4">Đăng nhập</Card.Header>
                <Card.Body>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleLogin}
                  >
                    {({ isSubmitting }) => (
                      <Form>
                        <div className="form-group mb-4">
                          <label htmlFor="email">
                            <FaUser className="me-2" />
                            Số điện thoại
                          </label>
                          <Field
                            name="email"
                            type="text"
                            className="form-control"
                            placeholder="Nhập số điện thoại của bạn"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-danger"
                          />
                        </div>

                        <div className="form-group mb-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <label htmlFor="password">
                              <FaLock className="me-2" />
                              Mật khẩu
                            </label>
                            <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu?</Link>
                          </div>
                          <Field
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="Nhập mật khẩu của bạn"
                          />
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="text-danger"
                          />
                        </div>

                        <div className="form-group text-center mt-4">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-100 btn-login"
                          >
                            {loading ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              "Đăng nhập"
                            )}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Card.Body>
                <Card.Footer>
                  <div>
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </MainLayout>
  );
};

export default Login; 
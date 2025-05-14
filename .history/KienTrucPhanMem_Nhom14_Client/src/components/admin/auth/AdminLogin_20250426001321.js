import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminAuth.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Kiểm tra xem đã đăng nhập chưa
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && (user.role === "admin" || user.role === "dev")) {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", error);
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra dữ liệu đầu vào
    if (!formData.phone || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      // Gọi API đăng nhập admin
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/v1/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Lỗi đăng nhập");
      }

      // Kiểm tra xem response có statusCode 200 (thành công) không
      if (data.statusCode !== 200) {
        throw new Error(data.message || "Lỗi đăng nhập");
      }

      // Kiểm tra xem có dữ liệu trả về không
      if (!data.data) {
        console.error("Không có dữ liệu trả về:", data);
        throw new Error("Không có dữ liệu trả về");
      }

      // Lấy thông tin người dùng và token
      const { user, token } = data.data;

      // Kiểm tra xem có thông tin người dùng không
      if (!user) {
        console.error("Không có thông tin người dùng:", data);
        throw new Error("Không có thông tin người dùng");
      }

      // Kiểm tra quyền admin
      if (user.role !== "admin" && user.role !== "dev") {
        throw new Error("Bạn không có quyền truy cập trang quản trị");
      }

      // Lưu thông tin đăng nhập
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));

      toast.success("Đăng nhập thành công!");
      console.log(userData.token);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setError(error.message || "Lỗi đăng nhập, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="admin-auth-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="admin-auth-title">Đăng nhập quản trị</h2>
                  <p className="admin-auth-subtitle">
                    Vui lòng đăng nhập để truy cập trang quản trị
                  </p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      className="admin-auth-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Đang đăng nhập...
                        </>
                      ) : (
                        "Đăng nhập"
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="text-center mt-4">
                  <Link to="/" className="admin-auth-link">
                    <i className="fas fa-arrow-left me-1"></i> Quay lại trang
                    chủ
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;

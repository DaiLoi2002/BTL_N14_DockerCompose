import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "/Users/ttcenter/Desktop/KTPM/KienTrucPhanMem_Nhom14_Client/src/services/AuthService.js"; // Hoặc đường dẫn tương ứng với file của bạn

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Carousel,
  Dropdown,
} from "react-bootstrap";
import "./HomePage.css";
import AuthController from "../../controllers/AuthController";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";

const HomePage = () => {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("accessToken")
  );

  // State for categories from backend
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Bút viết",
      icon: "fas fa-pen",
      slug: "but-viet",
      subcategories: [],
    },
    {
      id: 2,
      name: "Văn phòng phẩm",
      icon: "fas fa-paperclip",
      slug: "van-phong-pham",
      subcategories: [],
    },
    {
      id: 3,
      name: "Dụng Cụ Học Tập",
      icon: "fas fa-ruler-combined",
      slug: "dung-cu-hoc-tap",
      subcategories: [],
    },
    {
      id: 4,
      name: "Mỹ Thuật",
      icon: "fas fa-paint-brush",
      slug: "my-thuat",
      subcategories: [],
    },
    {
      id: 5,
      name: "Giấy In",
      icon: "fas fa-copy",
      slug: "giay-in",
      subcategories: [],
    },
    {
      id: 6,
      name: "Bút cao cấp",
      icon: "fas fa-pen-fancy",
      slug: "but-cao-cap",
      subcategories: [],
    },
    {
      id: 7,
      name: "STEAM & DIY",
      icon: "fas fa-tools",
      slug: "steam-diy",
      subcategories: [],
    },
    {
      id: 8,
      name: "Sách",
      icon: "fas fa-book",
      slug: "sach",
      subcategories: [],
    },
    {
      id: 9,
      name: "Quà tặng - Lifestyle",
      icon: "fas fa-gift",
      slug: "qua-tang",
      subcategories: [],
    },
  ]);

  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCurrentUser(null);
        return; // <- Quan trọng
      }

      try {
        const user = await AuthService.getProfile();
        setCurrentUser(user.data.name);
        console.log("User profile:", user.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.setItem("accessToken", "");

    setAuthToken(null); // <- thêm dòng này
    setCurrentUser(null);
    navigate("/");
  };

  const loadSubcategories = async (categorySlug) => {
    try {
      console.log("Loading subcategories for:", categorySlug);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/v1/categories/subcategories/${categorySlug}`
      );
      console.log("Subcategories data received:", response.data);

      setCategories((prevCategories) => {
        const newCategories = prevCategories.map((cat) => {
          if (cat.slug === categorySlug) {
            console.log(
              "Updating category:",
              cat.name,
              "with subcategories:",
              response.data
            );
            return {
              ...cat,
              subcategories: response.data,
            };
          }
          return cat;
        });
        console.log("New categories state:", newCategories);
        return newCategories;
      });
    } catch (error) {
      console.error(
        "Error loading subcategories:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleCategoryHover = (category) => {
    console.log("Category hovered:", category.name);
    setActiveCategory(category);
    if (category.subcategories.length === 0) {
      loadSubcategories(category.slug);
    } else {
      console.log("Using cached subcategories:", category.subcategories);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    navigate(`/subcategory/${subcategory.slug}`);
  };

  // Fetch categories from backend
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="homepage">
      <header className="main-header">
        <Container>
          <Row className="align-items-center">
            <Col md={2}>
              <Link to="/" className="logo">
                <img src="/logo.png" alt="N14 Shop" className="logo-img" />
              </Link>
            </Col>

            <Col md={5}>
              <Form
                className="search-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="search-wrapper">
                  <Form.Control
                    type="search"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <Button type="submit" className="search-button">
                    <i className="fas fa-search"></i>
                  </Button>
                </div>
              </Form>
            </Col>

            <Col md={5}>
              <div className="header-right">
                <div className="support-phone">
                  <a href="tel:1900866819" className="phone-link">
                    <i className="fas fa-phone-alt"></i>
                    <div className="phone-content">
                      <span className="phone-number">1900 866 819</span>
                      <span className="phone-text">Hỗ trợ khách hàng</span>
                    </div>
                  </a>
                </div>

                <div className="auth-section">
                  {currentUser ? (
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        id="dropdown-user"
                        className="user-dropdown"
                      >
                        <i className="fas fa-user-circle"></i>
                        <div className="dropdown-text">
                          <span className="username">{currentUser}</span>
                          <span className="account-text">Tài khoản</span>
                        </div>
                      </Dropdown.Toggle>

                      <Dropdown.Menu align="end" className="user-menu">
                        <Dropdown.Item as={Link} to="/profile">
                          <i className="fas fa-user"></i>Tài khoản của tôi
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/orders">
                          <i className="fas fa-shopping-bag"></i>Đơn hàng của
                          tôi
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/wishlist">
                          <i className="fas fa-heart"></i>Sản phẩm yêu thích
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt"></i>Đăng xuất
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <div className="auth-links">
                      <Link to="/login" className="auth-link">
                        <i className="fas fa-user-circle"></i>
                        <div className="auth-text">
                          <span>Đăng nhập</span>
                          <span>Đăng ký</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/cart" className="cart-link">
                  <div className="cart-icon">
                    <i className="fas fa-shopping-cart"></i>
                    {cartCount > 0 && (
                      <span className="cart-count">{cartCount}</span>
                    )}
                  </div>
                  <div className="cart-text">
                    <span className="cart-label">Giỏ hàng</span>
                    <span className="cart-items">{cartCount} sản phẩm</span>
                  </div>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      <div className="page-wrapper">
        {/* Side Navigation Menu */}
        <aside className="side-navigation">
          <div className="category-navigation">
            {loading ? (
              <div className="p-3 text-center">Đang tải danh mục...</div>
            ) : (
              <div className="categories-list">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="category-item"
                    onMouseEnter={() => handleCategoryHover(category)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div className="category-main">
                      <i className={category.icon}></i>
                      <span>{category.name}</span>
                    </div>

                    {activeCategory && activeCategory.id === category.id && (
                      <div className="subcategories-dropdown">
                        {category.subcategories &&
                        category.subcategories.length > 0 ? (
                          category.subcategories.map((sub) => (
                            <div
                              key={sub._id}
                              className="subcategory-item"
                              onClick={() => handleSubcategoryClick(sub)}
                            >
                              {sub.name}
                            </div>
                          ))
                        ) : (
                          <div className="subcategory-item">Loading...</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area with Footer */}
        <div className="main-content-wrapper">
          {/* Main Content */}
          <main className="main-content">
            <Container>
              {/* Banner Sliders */}
              <section className="banners-section">
                <Row>
                  <Col md={12} className="main-banner">
                    <div className="banner-slider">
                      <Carousel
                        interval={3000}
                        controls={true}
                        indicators={true}
                        fade={true}
                      >
                        <Carousel.Item>
                          <div className="banner-slide">
                            <div className="banner-content">
                              <div className="left-content">
                                <div className="discount-badge">
                                  <div className="top-text">GIẤY IN</div>
                                  <div className="middle-text">VĂN PHÒNG</div>
                                  <div className="bottom-text">
                                    GIẢM SÂU QUÁ XỊN
                                  </div>
                                </div>
                              </div>
                              <div className="right-content">
                                <div className="product-image-placeholder">
                                  <h3>Giấy In Văn Phòng</h3>
                                  <p>
                                    Chất lượng cao, phù hợp cho mọi nhu cầu in
                                    ấn
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="banner-btn">
                              <Button variant="danger" className="buy-now-btn">
                                MUA NGAY
                              </Button>
                            </div>
                          </div>
                        </Carousel.Item>
                        <Carousel.Item>
                          <div
                            className="banner-slide"
                            style={{ backgroundColor: "#e0f7fa" }}
                          >
                            <div className="banner-content">
                              <div className="left-content">
                                <div
                                  className="discount-badge"
                                  style={{ backgroundColor: "#0097a7" }}
                                >
                                  <div className="top-text">BÚT BI</div>
                                  <div className="middle-text">THIÊN LONG</div>
                                  <div className="bottom-text">
                                    MUA 3 TẶNG 1
                                  </div>
                                </div>
                              </div>
                              <div className="right-content">
                                <div className="product-image-placeholder">
                                  <h3>Bút Bi Thiên Long</h3>
                                  <p>
                                    Viết trơn, mực đẹp, sản phẩm chất lượng cao
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="banner-btn">
                              <Button variant="danger" className="buy-now-btn">
                                MUA NGAY
                              </Button>
                            </div>
                          </div>
                        </Carousel.Item>
                        <Carousel.Item>
                          <div
                            className="banner-slide"
                            style={{ backgroundColor: "#fff8e1" }}
                          >
                            <div className="banner-content">
                              <div className="left-content">
                                <div
                                  className="discount-badge"
                                  style={{ backgroundColor: "#ff8f00" }}
                                >
                                  <div className="top-text">TẬP VỞ</div>
                                  <div className="middle-text">
                                    BACK TO SCHOOL
                                  </div>
                                  <div className="bottom-text">
                                    GIẢM ĐẾN 30%
                                  </div>
                                </div>
                              </div>
                              <div className="right-content">
                                <div className="product-image-placeholder">
                                  <h3>Tập Vở Học Sinh</h3>
                                  <p>
                                    Chất lượng cao, bìa bền đẹp, phù hợp mọi cấp
                                    học
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="banner-btn">
                              <Button variant="danger" className="buy-now-btn">
                                MUA NGAY
                              </Button>
                            </div>
                          </div>
                        </Carousel.Item>
                      </Carousel>
                    </div>
                  </Col>
                </Row>
              </section>

              {/* Icon Categories */}
              <section className="icon-categories">
                <Row className="justify-content-center">
                  <Col xs={6} sm={4} md={3} lg className="icon-category">
                    <Link to="/category/cam-nang-uu-dai" className="icon-link">
                      <div className="icon-box">
                        <i className="fas fa-gift"></i>
                      </div>
                      <div className="icon-text">Cảm nang ưu đãi</div>
                    </Link>
                  </Col>
                  <Col xs={6} sm={4} md={3} lg className="icon-category">
                    <Link to="/category/san-pham-moi" className="icon-link">
                      <div className="icon-box">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="icon-text">Sản phẩm mới</div>
                    </Link>
                  </Col>
                  <Col xs={6} sm={4} md={3} lg className="icon-category">
                    <Link to="/category/outlet" className="icon-link">
                      <div className="icon-box">
                        <i className="fas fa-store"></i>
                      </div>
                      <div className="icon-text">Outlet chính hãng</div>
                    </Link>
                  </Col>
                  <Col xs={6} sm={4} md={3} lg className="icon-category">
                    <Link to="/category/giai-phap-in-an" className="icon-link">
                      <div className="icon-box">
                        <i className="fas fa-print"></i>
                      </div>
                      <div className="icon-text">Giải pháp in ấn</div>
                    </Link>
                  </Col>
                  <Col xs={6} sm={4} md={3} lg className="icon-category">
                    <Link
                      to="/category/van-phong-pham-doanh-nghiep"
                      className="icon-link"
                    >
                      <div className="icon-box">
                        <i className="fas fa-briefcase"></i>
                      </div>
                      <div className="icon-text">
                        Văn phòng phẩm doanh nghiệp
                      </div>
                    </Link>
                  </Col>
                  <Col xs={6} sm={4} md={3} lg className="icon-category">
                    <Link to="/category/top-sale" className="icon-link">
                      <div className="icon-box top-sale-icon">
                        <i className="fas fa-crown"></i>
                      </div>
                      <div className="icon-text">Top sale</div>
                    </Link>
                  </Col>
                  <Col xs={6} sm={4} md={3} lg className="icon-category">
                    <Link to="/track-order" className="icon-link">
                      <div className="icon-box">
                        <i className="fas fa-truck"></i>
                      </div>
                      <div className="icon-text">Kiểm tra đơn hàng</div>
                    </Link>
                  </Col>
                </Row>
              </section>
            </Container>
          </main>

          {/* Footer */}
          <footer className="main-footer">
            <Container>
              <Row>
                <Col md={3}>
                  <h5 className="footer-title">Về chúng tôi</h5>
                  <p>
                    N14 Shop - Cung cấp các sản phẩm văn phòng phẩm, dụng cụ học
                    tập chất lượng cao.
                  </p>
                  <div className="social-links">
                    <a href="#" className="social-link">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-tiktok"></i>
                    </a>
                  </div>
                </Col>
                <Col md={3}>
                  <h5 className="footer-title">Thông tin liên hệ</h5>
                  <ul className="footer-links">
                    <li>
                      <i className="fas fa-map-marker-alt"></i> 123 Đường ABC,
                      Quận XYZ, TP. HCM
                    </li>
                    <li>
                      <i className="fas fa-phone"></i> 1900 866 819
                    </li>
                    <li>
                      <i className="fas fa-envelope"></i> support@n14shop.com
                    </li>
                  </ul>
                </Col>
                <Col md={3}>
                  <h5 className="footer-title">Chính sách</h5>
                  <ul className="footer-links">
                    <li>
                      <a href="#">Chính sách bảo mật</a>
                    </li>
                    <li>
                      <a href="#">Chính sách vận chuyển</a>
                    </li>
                    <li>
                      <a href="#">Chính sách đổi trả</a>
                    </li>
                    <li>
                      <a href="#">Điều khoản dịch vụ</a>
                    </li>
                  </ul>
                </Col>
                <Col md={3}>
                  <h5 className="footer-title">Đăng ký nhận tin</h5>
                  <p>Nhận thông tin ưu đãi mới nhất từ N14 Shop.</p>
                  <Form className="subscribe-form">
                    <Form.Control
                      type="email"
                      placeholder="Email của bạn"
                      className="mb-2"
                    />
                    <Button variant="primary" type="submit" className="w-100">
                      Đăng ký
                    </Button>
                  </Form>
                </Col>
              </Row>
              <hr className="footer-divider" />
              <div className="footer-bottom">
                <p className="copyright">
                  © 2023 N14 Shop. Tất cả quyền được bảo lưu.
                </p>
              </div>
            </Container>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

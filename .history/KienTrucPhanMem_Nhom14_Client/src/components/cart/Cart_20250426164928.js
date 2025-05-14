import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Badge } from "react-bootstrap";
import {
  FaTrashAlt,
  FaGift,
  FaInfoCircle,
  FaShoppingBag,
  FaPlus,
  FaMinus,
  FaCheck,
} from "react-icons/fa";
import MainLayout from "../layout/MainLayout";
import { useCart } from "../../contexts/CartContext";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    addToCart,
    clearCart,
  } = useCart();

  // State for promotion code
  const [promoCode, setPromoCode] = useState("");

  // Function to add sample products to cart for testing
  const addSampleProducts = () => {
    // Clear existing cart first
    clearCart();

    // Add sample products
    const sampleProducts = [
      {
        id: "sp1",
        name: "Bút gel B - Minimalist Butter Gel Thiên Long",
        image: "/placeholder-bestseller1.jpg",
        price: 13500,
        quantity: 1,
      },
      {
        id: "sp2",
        name: "Túi 02 Ruột bút gel Platinum Preppy Long",
        image: "/placeholder-bestseller2.jpg",
        price: 9000,
        quantity: 2,
      },
      {
        id: "sp3",
        name: "Cặp chống gù Điểm Tĩnh Long - Balo học sinh tiểu học",
        image: "/placeholder-bestseller3.jpg",
        price: 342000,
        quantity: 1,
      },
    ];

    // Add each product to cart
    sampleProducts.forEach((product) => {
      addToCart(product, product.quantity);
    });

    alert("Đã thêm sản phẩm mẫu vào giỏ hàng!");
  };

  // Sample best-selling products - replace with actual data from API
  const bestSellingProducts = [
    {
      id: 1,
      name: "Túi 02 Ruột bút gel Platinum Preppy Long",
      image:
        "https://product.hstatic.net/1000230347/product/gr-026_2_624bf6be183f490abba363765d9b316b.jpg",
      price: 9000,
      originalPrice: 12000,
      discount: 25,
    },
    {
      id: 2,
      name: "Bút gel B - Minimalist Butter Gel Thiên Long - Phiên bản tối giản",
      image: "/placeholder-bestseller2.jpg",
      price: 13500,
      originalPrice: 18000,
      discount: 25,
    },
    {
      id: 3,
      name: "Cặp chống gù Điểm Tĩnh Long - Balo học sinh tiểu học",
      image: "/placeholder-bestseller3.jpg",
      price: 342000,
      originalPrice: 380000,
      discount: 10,
    },
    {
      id: 4,
      name: "Cặp chống gù Thiên Long - JungleDino - Galaxy",
      image: "/placeholder-bestseller4.jpg",
      price: 412500,
      originalPrice: 450000,
      discount: 10,
    },
    {
      id: 5,
      name: "Túi 03 Ruột bút gel mực Thiên Long Differerent GRE",
      image: "/placeholder-bestseller5.jpg",
      price: 17100,
      originalPrice: 19000,
      discount: 10,
    },
  ];

  // Handle quantity change
  const handleQuantityChange = (id, delta) => {
    updateQuantity(id, delta);
  };

  // Handle item removal
  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  // Get subtotal from context
  const subtotal = getSubtotal();

  // Available promotions - replace with actual data
  const promotions = [
    {
      id: 1,
      code: "GIẢM10K",
      description: "Mã Giảm 10K - Toàn Sàn",
      details:
        "Đơn hàng từ 130k - Không bao gồm giá trị của các sản phẩm sau Manga, Ngoại...",
      expiryDate: "30/04/2025",
      minimumPurchase: 130000,
    },
  ];

  return (
    <MainLayout>
      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <FaShoppingBag className="header-icon" />
            GIỎ HÀNG{" "}
            {cartItems.length > 0 ? `(${cartItems.length} sản phẩm)` : ""}
          </h1>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            {cartItems.length > 0 ? (
              <div className="cart-items-table">
                <div className="cart-item-header">
                  <div className="select-all">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={true} // You can implement select all logic
                      onChange={() => {}} // Add logic for select all
                    />
                    <label htmlFor="select-all">
                      <FaCheck className="check-icon" /> Chọn tất cả (
                      {cartItems.length} sản phẩm)
                    </label>
                  </div>
                  <div className="column-labels">
                    <span className="quantity-label">Số lượng</span>
                    <span className="price-label">Thành tiền</span>
                  </div>
                </div>

                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-select">
                      <input
                        type="checkbox"
                        checked={true} // You can implement individual select logic
                        onChange={() => {}} // Add logic for item selection
                      />
                    </div>
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                      {item.discount > 0 && (
                        <Badge className="item-discount-badge">
                          -{item.discount}%
                        </Badge>
                      )}
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-price">
                        <span className="current-price">
                          {item.price.toLocaleString("vi-VN")}đ
                        </span>
                        {item.originalPrice && (
                          <span className="original-price">
                            {item.originalPrice.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="item-quantity">
                      <div className="quantity-controls">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="quantity-btn"
                        >
                          <FaMinus />
                        </button>
                        <input type="number" value={item.quantity} readOnly />
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="quantity-btn"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <div className="item-subtotal">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Xóa sản phẩm"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <FaShoppingBag />
                </div>
                <p>Giỏ hàng của bạn đang trống</p>
                <button className="continue-shopping-btn">
                  Tiếp tục mua sắm
                </button>
                <button
                  className="btn btn-primary"
                  onClick={addSampleProducts}
                  style={{
                    marginTop: "15px",
                    fontSize: "14px",
                    padding: "8px 15px",
                  }}
                >
                  Thêm sản phẩm mẫu để test
                </button>
              </div>
            )}
          </div>

          <div className="cart-sidebar">
            <div className="promotions-section">
              <div className="promo-header">
                <h3>
                  <span className="promo-icon">🎁</span>
                  KHUYẾN MÃI
                  <button className="view-more-btn">Xem thêm</button>
                </h3>
              </div>

              {promotions.map((promo) => (
                <div key={promo.id} className="promotion-item">
                  <h4 className="promo-title">
                    <FaInfoCircle className="promo-info-icon" />
                    {promo.code}
                  </h4>
                  <p className="promo-description">{promo.description}</p>
                  <p className="promo-details">{promo.details}</p>
                  <p className="promo-expiry">HSD: {promo.expiryDate}</p>
                  <div className="promo-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (subtotal / promo.minimumPurchase) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="progress-text">
                      {subtotal < promo.minimumPurchase ? (
                        <>
                          Mua thêm{" "}
                          <span className="highlight">
                            {(promo.minimumPurchase - subtotal).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>{" "}
                          để áp dụng mã
                        </>
                      ) : (
                        <span className="eligible">
                          Bạn đủ điều kiện áp dụng mã này!
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    className={`apply-promo-btn ${
                      subtotal >= promo.minimumPurchase ? "eligible-btn" : ""
                    }`}
                  >
                    {subtotal >= promo.minimumPurchase
                      ? "Áp dụng ngay"
                      : "Mua thêm"}
                  </button>
                </div>
              ))}

              <div className="multiple-promos-note">
                <p>Có thể áp dụng đồng thời nhiều mã</p>
              </div>
            </div>

            <div className="gifts-section">
              <div className="gifts-header">
                <h3>
                  <FaGift className="gift-icon" />
                  Nhận quà
                  <button className="select-gift-btn">Chọn quà</button>
                </h3>
              </div>
              <div className="no-gift-message">
                Mua thêm sản phẩm để nhận quà
              </div>
            </div>

            <div className="order-summary">
              <div className="subtotal-row">
                <span>Thành tiền</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="total-row">
                <span>Tổng Số Tiền (gồm VAT)</span>
                <span className="total-amount">
                  {subtotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <button
                className="checkout-btn"
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert(
                      "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng."
                    );
                    return;
                  }
                  navigate("/payment");
                }}
              >
                THANH TOÁN
              </button>
              <p className="web-discount-note">
                (Giảm giá trên web chỉ áp dụng cho bán lẻ)
              </p>
            </div>
          </div>
        </div>

        {/* Best Selling Products Section */}
        <div className="bestselling-products-section">
          <Container>
            <div className="section-header">
              <h2>SẢN PHẨM BÁN CHẠY</h2>
            </div>

            <div className="products-flatlist">
              <Row>
                {bestSellingProducts.map((product) => (
                  <Col
                    xs={12}
                    sm={6}
                    md={4}
                    lg={2}
                    key={product.id}
                    className="product-item"
                  >
                    <div className="product-card">
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                        {product.discount > 0 && (
                          <div className="discount-badge">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price">
                          <span className="current-price">
                            {product.price.toLocaleString("vi-VN")}đ
                          </span>
                          {product.originalPrice && (
                            <span className="original-price">
                              {product.originalPrice.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="product-actions">
                        <button className="add-to-cart-btn">XEM NHANH</button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Container>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;

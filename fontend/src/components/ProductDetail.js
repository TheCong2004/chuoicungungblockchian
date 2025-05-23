// src/components/ProductDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct, getImageByTokenId } from "../services/contractService.js";
import { QRCodeCanvas } from "qrcode.react";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { tokenId } = useParams();
  const [productDetails, setProductDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const productData = await getProduct(tokenId);
        const imageData = await getImageByTokenId(tokenId);
        setProductDetails({ ...productData, image: imageData.ipfsUrl });
      } catch (err) {
        setError("Không tìm thấy sản phẩm hoặc ảnh với Token ID này.");
        setProductDetails(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [tokenId]);

  return (
    <div className="product-detail-page">
      <div className="product-detail-header">
        <h2 className="product-detail-title">Chi tiết sản phẩm</h2>
        <Link to="/" className="back-button">
          Quay lại Dashboard
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Đang tải...</div>}

      {productDetails && (
        <div className="product-details">
          <h4 className="product-details-title">Thông tin chi tiết sản phẩm</h4>
          <div className="product-detail-item">
            <span className="product-detail-label">Tên sản phẩm:</span>
            <span className="product-detail-value">{productDetails.name}</span>
          </div>
          <div className="product-detail-item">
            <span className="product-detail-label">Nguồn gốc:</span>
            <span className="product-detail-value">{productDetails.origin}</span>
          </div>
          <div className="product-detail-item">
            <span className="product-detail-label">Phương pháp sản xuất:</span>
            <span className="product-detail-value">{productDetails.productionMethod}</span>
          </div>
          <div className="product-detail-item">
            <span className="product-detail-label">Chứng nhận:</span>
            <span className="product-detail-value">{productDetails.certification}</span>
          </div>
          <div className="product-detail-item">
            <span className="product-detail-label">Nhà sản xuất:</span>
            <span className="product-detail-value">{productDetails.producer}</span>
          </div>
          {productDetails.image && (
            <div className="product-detail-item">
              <span className="product-detail-label">Ảnh sản phẩm:</span>
              <img
                src={productDetails.image}
                alt="Product"
                style={{ maxWidth: "200px", marginTop: "10px" }}
              />
            </div>
          )}
          <div className="product-detail-item">
            <span className="product-detail-label">Mã QR:</span>
            <div className="qr-code-container">
              <QRCodeCanvas value={tokenId} size={150} />
              <p className="qr-code-info">Quét mã QR này để truy cập nhanh thông tin sản phẩm</p>
            </div>
          </div>
          <div className="supply-chain-steps">
            <h5 className="steps-title">Các bước chuỗi cung ứng:</h5>
            {productDetails.supplyChainSteps.length > 0 ? (
              <ul className="steps-list">
                {productDetails.supplyChainSteps.map((step, index) => (
                  <li key={index} className="step-item">{step}</li>
                ))}
              </ul>
            ) : (
              <p>Chưa có thông tin về chuỗi cung ứng.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
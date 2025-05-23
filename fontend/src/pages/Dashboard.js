

// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import DOMPurify from "dompurify";
import { getProduct, getAllProducts, addSupplyChainStep } from "../services/contractService.js";
import { getImageByTokenId } from "../services/api.js";
import UploadForm from "./UploadForm.js";
import { QRCodeCanvas } from "qrcode.react";
import "./Dashboard.css";

const Dashboard = ({ account, token }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [step, setStep] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [viewTokenId, setViewTokenId] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [page, setPage] = useState(1);
  const productsPerPage = 10;

  // Utility function for setting messages
  const setMessage = (successMsg = "", errorMsg = "") => {
    setSuccessMessage(successMsg);
    setError(errorMsg);
  };

  // Validate Token ID (positive integer)
  const validateTokenId = (id) => {
    return /^\d+$/.test(id);
  };

  // Fetch product list with retry mechanism
  useEffect(() => {
    const fetchProducts = async (retryCount = 3) => {
      try {
        setLoading(true);
        const productList = await getAllProducts(account, token);
        setProducts(productList);
      } catch (err) {
        if (retryCount > 0) {
          setTimeout(() => fetchProducts(retryCount - 1), 2000);
        } else {
          setMessage("", "Không thể tải danh sách sản phẩm sau nhiều lần thử.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [account, token]);

  // Handle product creation
  const handleProductCreated = async (newTokenId) => {
    setTokenId(newTokenId);
    setMessage(`Sản phẩm đã được tạo thành công! Token ID: ${newTokenId}`);
    try {
      const productList = await getAllProducts(account, token);
      setProducts(productList);
    } catch (err) {
      console.error("Không thể cập nhật danh sách sản phẩm", err);
    }
  };

  // Handle adding supply chain step
  const handleAddStep = async (e) => {
    e.preventDefault();
    setMessage();
    if (!validateTokenId(tokenId)) {
      setMessage("", "Token ID phải là một số nguyên dương.");
      return;
    }
    const sanitizedStep = DOMPurify.sanitize(step);
    if (!sanitizedStep) {
      setMessage("", "Mô tả bước không hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      await addSupplyChainStep(account, tokenId, sanitizedStep);
      setMessage("Bước chuỗi cung ứng đã được thêm thành công!");
      setStep("");
      setTokenId("");
    } catch (err) {
      setMessage("", "Lỗi thêm bước chuỗi cung ứng. Vui lòng kiểm tra Token ID và thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing product details
const handleViewProduct = async (e) => {
  e.preventDefault();
  setMessage();
  if (!validateTokenId(viewTokenId)) {
    setMessage("", "Token ID phải là một số nguyên dương.");
    return;
  }
  setLoading(true);
  try {
    // Fetch product and image concurrently
    const [productData, imageData] = await Promise.all([
      getProduct(viewTokenId).catch((err) => {
        console.error("Error in getProduct:", err);
        throw new Error("Không tìm thấy sản phẩm.");
      }),
      getImageByTokenId(viewTokenId).catch((err) => {
        console.error("Error in getImageByTokenId:", err);
        return { ipfsUrl: null }; // Fallback to no image
      }),
    ]);
    if (!productData) {
      throw new Error("Dữ liệu sản phẩm không hợp lệ.");
    }
    setProductDetails({ ...productData, image: imageData?.ipfsUrl || null });
    setMessage("Thông tin sản phẩm đã được tải thành công!");
  } catch (err) {
    setMessage("", err.message || "Không tìm thấy sản phẩm hoặc ảnh với Token ID này.");
    setProductDetails(null);
    console.error("handleViewProduct error:", err);
  } finally {
    setLoading(false);
  }
};

  // Handle QR code scan
// Handle QR code scan
const handleQrScan = async (data) => {
  if (!data) return;
  setMessage();
  console.log("QR code scanned:", data); // Debug log
  if (!validateTokenId(data)) {
    setMessage("", "Mã QR không hợp lệ. Vui lòng kiểm tra mã QR.");
    return;
  }
  setLoading(true);
  try {
    const [productData, imageData] = await Promise.all([
      getProduct(data).catch((err) => {
        console.error("Error in getProduct (QR):", err);
        throw new Error("Không tìm thấy sản phẩm.");
      }),
      getImageByTokenId(data).catch((err) => {
        console.error("Error in getImageByTokenId (QR):", err);
        return { ipfsUrl: null }; // Fallback to no image
      }),
    ]);
    if (!productData) {
      throw new Error("Dữ liệu sản phẩm không hợp lệ.");
    }
    setQrResult({ ...productData, image: imageData?.ipfsUrl || null, tokenId: data });
    setMessage("Thông tin sản phẩm từ mã QR đã được tải thành công!");
  } catch (err) {
    setMessage("", err.message || "Không thể lấy thông tin sản phẩm từ mã QR.");
    setQrResult(null);
    console.error("handleQrScan error:", err);
  } finally {
    setLoading(false);
  }
};

// Handle QR code errors
const handleQrError = (err) => {
  let errorMessage = "Lỗi quét mã QR. Vui lòng thử lại.";
  if (err.message.includes("Permission denied")) {
    errorMessage = "Không có quyền truy cập máy ảnh. Vui lòng cấp quyền và thử lại.";
  } else if (err.message.includes("Invalid QR code")) {
    errorMessage = "Mã QR không hợp lệ. Vui lòng kiểm tra mã QR.";
  } else {
    console.error("QR scan error:", err); // Debug log
  }
  setMessage("", errorMessage);
};

  const displayedProducts = products.slice(0, page * productsPerPage);

  return (
    <div className="dashboard" role="main" aria-label="Quản lý chuỗi cung ứng hữu cơ">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Quản lý chuỗi cung ứng hữu cơ</h2>
      </div>

      <div className="dashboard-tabs" role="tablist">
        {["create", "add-step", "view", "qr"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`tabpanel-${tab}`}
          >
            {tab === "create" && "Tạo sản phẩm"}
            {tab === "add-step" && "Thêm bước chuỗi"}
            {tab === "view" && "Xem sản phẩm"}
            {tab === "qr" && "Quét mã QR"}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="success-message" role="status">
          {successMessage}
        </div>
      )}
      {loading && (
        <div className="loading-message" role="status">
          Đang xử lý...
        </div>
      )}

      <div className="tab-content">
        {/* Create Product */}
        {activeTab === "create" && (
          <div className="dashboard-form-container" role="tabpanel" id="tabpanel-create">
            <h3 className="dashboard-form-title">Tạo sản phẩm mới</h3>
            <UploadForm account={account} token={token} onProductCreated={handleProductCreated} />
          </div>
        )}

        {/* Add Supply Chain Step */}
        {activeTab === "add-step" && (
          <div className="dashboard-form-container" role="tabpanel" id="tabpanel-add-step">
            <h3 className="dashboard-form-title">Thêm bước chuỗi cung ứng</h3>
            <form onSubmit={handleAddStep}>
              <div className="form-group">
                <label htmlFor="token-id" aria-label="Token ID sản phẩm">
                  Token ID sản phẩm
                </label>
                <input
                  id="token-id"
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Nhập Token ID sản phẩm"
                  required
                  aria-describedby="token-id-help"
                />
                <small id="token-id-help" className="form-help-text">
                  Nhập Token ID của sản phẩm để thêm bước chuỗi cung ứng.
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="step-desc" aria-label="Mô tả bước chuỗi cung ứng">
                  Mô tả bước chuỗi cung ứng
                </label>
                <textarea
                  id="step-desc"
                  value={step}
                  onChange={(e) => setStep(e.target.value)}
                  placeholder="Mô tả chi tiết về bước chuỗi cung ứng này"
                  required
                  aria-describedby="step-desc-help"
                />
                <small id="step-desc-help" className="form-help-text">
                  Cung cấp chi tiết về bước chuỗi cung ứng (ví dụ: thu hoạch, vận chuyển).
                </small>
              </div>
              <button
                type="submit"
                className="form-submit-btn"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Đang thêm..." : "Thêm bước chuỗi"}
              </button>
            </form>
          </div>
        )}

        {/* View Products */}
        {activeTab === "view" && (
          <div className="dashboard-form-container" role="tabpanel" id="tabpanel-view">
            <h3 className="dashboard-form-title">Tra cứu thông tin sản phẩm</h3>
            <form onSubmit={handleViewProduct}>
              <div className="form-group">
                <label htmlFor="view-token-id" aria-label="Token ID sản phẩm">
                  Token ID sản phẩm
                </label>
                <input
                  id="view-token-id"
                  type="text"
                  value={viewTokenId}
                  onChange={(e) => setViewTokenId(e.target.value)}
                  placeholder="Nhập Token ID để tra cứu sản phẩm"
                  required
                  aria-describedby="view-token-id-help"
                />
                <small id="view-token-id-help" className="form-help-text">
                  Nhập Token ID để xem thông tin chi tiết sản phẩm.
                </small>
              </div>
              <button
                type="submit"
                className="form-submit-btn"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Đang tra cứu..." : "Tra cứu sản phẩm"}
              </button>
            </form>

            {productDetails && (
              <div className="product-details" aria-live="polite">
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
                      alt="Hình ảnh sản phẩm"
                      style={{ maxWidth: "200px", marginTop: "10px" }}
                    />
                  </div>
                )}
                <div className="product-detail-item">
                  <span className="product-detail-label">Mã QR:</span>
                  <div className="qr-code-container">
                    <QRCodeCanvas value={viewTokenId} size={150} />
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

            <div className="product-list-container">
              <h3 className="dashboard-form-title">Danh sách sản phẩm</h3>
              {loading ? (
                <p>Đang tải danh sách sản phẩm...</p>
              ) : displayedProducts.length > 0 ? (
                <>
                  <ul className="product-list">
                    {displayedProducts.map((product) => (
                      <li key={product.tokenId} className="product-item">
                        <p>
                          <strong>Token ID:</strong> {product.tokenId}
                        </p>
                        <p>
                          <strong>Tên sản phẩm:</strong> {product.name}
                        </p>
                        <p>
                          <strong>Nguồn gốc:</strong> {product.origin}
                        </p>
                        <p>
                          <strong>Nhà sản xuất:</strong> {product.producer}
                        </p>
                        <div className="product-qr-code">
                          <QRCodeCanvas value={product.tokenId} size={100} />
                          <p>Mã QR cho sản phẩm</p>
                        </div>
                        <Link
                          to={`/product/${product.tokenId}`}
                          className="view-product-btn"
                          aria-label={`Xem chi tiết sản phẩm ${product.name}`}
                        >
                          Xem chi tiết
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {products.length > displayedProducts.length && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="load-more-btn"
                      aria-label="Tải thêm sản phẩm"
                    >
                      Tải thêm
                    </button>
                  )}
                </>
              ) : (
                <p>Chưa có sản phẩm nào.</p>
              )}
            </div>
          </div>
        )}

        {/* QR Code Scanner */}
       {activeTab === "qr" && (
  <div className="dashboard-form-container" role="tabpanel" id="tabpanel-qr">
    <h3 className="dashboard-form-title">Quét mã QR</h3>
    <div className="qr-section">
      <QrReader
        delay={300}
        onResult={(result, error) => {
          if (result) {
            handleQrScan(result.text);
          }
          if (error) {
            handleQrError(error);
          }
        }}
        style={{ width: "300px" }}
      />
      <p className="qr-info">
        Sử dụng máy ảnh để quét mã QR của sản phẩm hữu cơ hoặc nhập Token ID thủ công. Vui lòng đảm bảo cấp quyền truy cập máy ảnh.
      </p>
      <div className="form-group">
        <label htmlFor="qr-manual-input" aria-label="Nhập Token ID thủ công">
          Nhập Token ID thủ công
        </label>
        <input
          id="qr-manual-input"
          type="text"
          onChange={(e) => handleQrScan(e.target.value)}
          placeholder="Nhập Token ID từ mã QR"
          aria-describedby="qr-manual-input-help"
        />
        <small id="qr-manual-input-help" className="form-help-text">
          Nhập Token ID nếu không thể quét mã QR.
        </small>
      </div>
    </div>
            {qrResult && (
              <div className="product-details" aria-live="polite">
                <h4 className="product-details-title">Thông tin sản phẩm từ mã QR</h4>
                <div className="product-detail-item">
                  <span className="product-detail-label">Tên sản phẩm:</span>
                  <span className="product-detail-value">{qrResult.name}</span>
                </div>
                <div className="product-detail-item">
                  <span className="product-detail-label">Nguồn gốc:</span>
                  <span className="product-detail-value">{qrResult.origin}</span>
                </div>
                <div className="product-detail-item">
                  <span className="product-detail-label">Phương pháp sản xuất:</span>
                  <span className="product-detail-value">{qrResult.productionMethod}</span>
                </div>
                <div className="product-detail-item">
                  <span className="product-detail-label">Chứng nhận:</span>
                  <span className="product-detail-value">{qrResult.certification}</span>
                </div>
                <div className="product-detail-item">
                  <span className="product-detail-label">Nhà sản xuất:</span>
                  <span className="product-detail-value">{qrResult.producer}</span>
                </div>
                {qrResult.image && (
                  <div className="product-detail-item">
                    <span className="product-detail-label">Ảnh sản phẩm:</span>
                    <img
                      src={qrResult.image}
                      alt="Hình ảnh sản phẩm từ mã QR"
                      style={{ maxWidth: "200px", marginTop: "10px" }}
                    />
                  </div>
                )}
                <div className="product-detail-item">
                  <span className="product-detail-label">Mã QR:</span>
                  <div className="qr-code-container">
                    <QRCodeCanvas value={qrResult.tokenId} size={150} />
                    <p className="qr-code-info">Mã QR của sản phẩm</p>
                  </div>
                </div>
                <div className="supply-chain-steps">
                  <h5 className="steps-title">Các bước chuỗi cung ứng:</h5>
                  {qrResult.supplyChainSteps.length > 0 ? (
                    <ul className="steps-list">
                      {qrResult.supplyChainSteps.map((step, index) => (
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;

// export default ProductList;
// src/components/ProductList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProduct } from "../services/contractService.js";
import { getImageByTokenId } from "../services/api.js";
import { contractAddress, contractABI } from "../constants/config.js";
import { getContract } from "../services/web3Service.js"; // 🔧 bỏ getWeb3 vì không dùng
import { QRCodeCanvas } from "qrcode.react";
import "./ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const contract = getContract(contractABI, contractAddress); // ✅ không cần web3
        const productCounter = await contract.methods.productCounter().call();
        console.log("Product counter:", productCounter);
        const productList = [];

        for (let i = 1; i <= productCounter; i++) {
          const product = await getProduct(i);
          const imageData = await getImageByTokenId(i);
          productList.push({
            tokenId: i,
            ...product,
            image: imageData.ipfsUrl,
          });
        }

        setProducts(productList);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối MetaMask và thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="product-list-container">
      <h3 className="product-list-title">Danh sách sản phẩm</h3>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <p>Đang tải danh sách sản phẩm...</p>
      ) : products.length > 0 ? (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.tokenId} className="product-item">
              <p><strong>Token ID:</strong> {product.tokenId}</p>
              <p><strong>Tên sản phẩm:</strong> {product.name}</p>
              <p><strong>Nguồn gốc:</strong> {product.origin}</p>
              <p><strong>Phương pháp sản xuất:</strong> {product.productionMethod}</p>
              <p><strong>Chứng nhận:</strong> {product.certification}</p>
              <p><strong>Nhà sản xuất:</strong> {product.producer}</p>
              <p>
                <strong>Các bước chuỗi cung ứng:</strong>{" "}
                {product.supplyChainSteps?.length > 0
                  ? product.supplyChainSteps.join(", ")
                  : "Chưa có"}
              </p>
              <div className="product-qr-code">
                <QRCodeCanvas value={product.image || product.tokenId} size={100} />
                <p>Quét mã QR để xem ảnh sản phẩm trên Pinata</p>
              </div>
              <Link to={`/product/${product.tokenId}`} className="view-product-btn">
                Xem chi tiết
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Chưa có sản phẩm nào.</p>
      )}
    </div>
  );
};

export default ProductList;

// // src/pase/UploadForm.jsx
// import React, { useState } from 'react';
// import axios from 'axios';

// const UploadForm = () => {
//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFile(e.target.files[0]);
//     setResult(null);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       alert('Vui lòng chọn file trước khi tải lên');
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       // Lấy token đã lưu
//       const token = localStorage.getItem('token');

//       const res = await axios.post(
//         'http://localhost:5000/api/ipfs/upload',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setResult(res.data);
//     } catch (err) {
//       console.error('Lỗi upload:', err.response?.data || err.message);
//       alert(
//         'Upload thất bại: ' +
//           (err.response?.data?.error || err.response?.data?.msg || err.message)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 500, margin: '0 auto' }}>
//       <input
//         type="file"
//         onChange={handleChange}
//         style={{ margin: '20px 0' }}
//       />
//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#007bff',
//           color: '#fff',
//           border: 'none',
//           borderRadius: 4,
//           cursor: loading ? 'not-allowed' : 'pointer',
//         }}
//       >
//         {loading ? 'Đang tải lên...' : 'Tải lên IPFS'}
//       </button>

//       {result && (
//         <div style={{ marginTop: 30, lineHeight: 1.6 }}>
//           <p>
//             <strong>CID:</strong> {result.cid}
//           </p>
//           <p>
//             <strong>IPFS URL:</strong>{' '}
//             <a
//               href={result.ipfsUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               {result.ipfsUrl}
//             </a>
//           </p>
//           <div style={{ marginTop: 20 }}>
//             <strong>QR Code:</strong>
//             <br />
//             <img
//               src={`http://localhost:5000${result.qrImage}`}
//               alt="QR Code"
//               width="200"
//               style={{ marginTop: 10 }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };



import React, { useState } from "react";
import { createProduct } from "../services/contractService.js";
import api, { uploadImage } from "../services/api.js";


const UploadForm = ({ account, token }) => {
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    productionMethod: "",
    certification: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [result, setResult] = useState(null);

  // Xử lý thay đổi input văn bản
  const handleChange = (e) => {
    if (e.target.type === "file") {
      setFile(e.target.files[0]);
      setResult(null);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    if (!file) {
      setError("Vui lòng chọn một file ảnh.");
      setLoading(false);
      return;
    }

    if (!account) {
      setError("Vui lòng kết nối MetaMask.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Vui lòng đăng nhập để lấy token xác thực.");
      setLoading(false);
      return;
    }

    try {
      // Upload ảnh lên IPFS qua backend
      const ipfsResult = await uploadImage(file, token);

      // Tạo sản phẩm trên blockchain
      const receipt = await createProduct(
        account,
        formData.name,
        formData.origin,
        formData.productionMethod,
        formData.certification
      );

      // Lưu ánh xạ tokenId và CID vào backend
      await api.post(
        "/ipfs/save",
        { tokenId: receipt.tokenId, cid: ipfsResult.cid },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(`Sản phẩm đã được tạo! Token ID: ${receipt.tokenId}`);
      setResult(ipfsResult);
      setFormData({ name: "", origin: "", productionMethod: "", certification: "" });
      setFile(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        "Không thể tạo sản phẩm hoặc tải ảnh. Vui lòng thử lại.";
      setError(errorMessage);
      console.error("Lỗi submit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Thêm sản phẩm mới</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Tên sản phẩm:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Nguồn gốc:
          </label>
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Phương pháp sản xuất:
          </label>
          <input
            type="text"
            name="productionMethod"
            value={formData.productionMethod}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Chứng nhận:
          </label>
          <input
            type="text"
            name="certification"
            value={formData.certification}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Ảnh sản phẩm:
          </label>
          <input
            type="file"
            onChange={handleChange}
            required
            style={{ width: "100%" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {success && (
        <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
      )}
      {result && (
        <div style={{ marginTop: 30, lineHeight: 1.6 }}>
          <p>
            <strong>CID:</strong> {result.cid}
          </p>
          <p>
            <strong>IPFS URL:</strong>{" "}
            <a href={result.ipfsUrl} target="_blank" rel="noopener noreferrer">
              {result.ipfsUrl}
            </a>
          </p>
          {result.qrImage && (
            <div style={{ marginTop: 20 }}>
              <strong>QR Code:</strong>
              <br />
              <img
                src={`http://localhost:5000${result.qrImage}`}
                alt="QR Code"
                width="200"
                style={{ marginTop: 10 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadForm;
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Result, Button } from "antd";
import queryString from "query-string";

export default function PaymentStatusPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = queryString.parse(location.search);

  const { orderCode, status, code, cancel } = query;

  const isCancelled = status === "CANCELLED" || cancel === "true";
  const isSuccess = code === "00" && !isCancelled;

  const isPopup = window.opener && window.opener !== window;

  const handleCloseOrBack = () => {
    if (isPopup) {
      window.close();
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <Card style={{ borderRadius: 12, padding: 20 }}>
        {isSuccess ? (
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle={`Mã giao dịch: ${orderCode}`}
            extra={[
              <Button type="primary" onClick={handleCloseOrBack}>
                {isPopup ? "Đóng cửa sổ" : "Quay lại"}
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Thanh toán thất bại hoặc bị hủy!"
            subTitle={`Mã giao dịch: ${orderCode}`}
            extra={[
              <Button type="primary" danger onClick={handleCloseOrBack}>
                {isPopup ? "Đóng cửa sổ" : "Thử lại"}
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
}

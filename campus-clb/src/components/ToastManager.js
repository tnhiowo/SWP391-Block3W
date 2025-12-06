import { useState,useEffect } from 'react';
import { createPortal } from 'react-dom';

export const useToast = () => {
    const [toasts,setToasts] = useState([]);

    const addToast = (message,type = 'info') => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random();
        const newToast = { id,message,type };
        console.log('🔔 Adding toast:',newToast);
        setToasts((prev) => [...prev,newToast]);

        // Auto remove với animation
        setTimeout(() => {
            removeToast(id);
        },3000);
    };

    const removeToast = (id) => {
        console.log('🔔 Removing toast:',id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const success = (msg) => addToast(msg,'success');
    const error = (msg) => addToast(msg,'error');
    const info = (msg) => addToast(msg,'info');

    return { toasts,success,error,info,removeToast };
};


export const ToastContainer = ({ toasts,removeToast }) => {
    const [mounted,setMounted] = useState(false);
    const [portalRoot,setPortalRoot] = useState(null);

    useEffect(() => {
        setMounted(true);
        setPortalRoot(document.body);
    },[]);

    if (!mounted || !portalRoot) return null;
    if (toasts.length === 0) return null;

    return createPortal(
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                pointerEvents: "auto",
            }}
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    style={{
                        padding: "12px 18px",
                        borderRadius: "8px",
                        color: "white",
                        background:
                            toast.type === "error"
                                ? "#ff4d4f"
                                : toast.type === "success"
                                    ? "#52c41a"
                                    : "#1890ff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        fontSize: "14px",
                        minWidth: "260px",
                    }}
                >
                    {toast.message}
                </div>
            ))}
        </div>,
        portalRoot
    );
};

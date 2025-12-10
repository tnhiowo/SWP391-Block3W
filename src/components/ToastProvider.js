import { createContext,useContext } from 'react';
import { useToast as useLocalToast,ToastContainer } from './ToastManager';


const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const toast = useLocalToast();

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import AppRoutes from './routes/AppRoutes.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Configure global Ant Design Theme to match Tailwind Dark Mode */}
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            // Emerald primary color
            colorPrimary: '#10b981',
            colorBgBase: '#0f172a', // Tailwind slate-900
            colorBgContainer: '#1e293b', // Tailwind slate-800
            colorBgElevated: '#334155', // Tailwind slate-700
            colorTextBase: '#f8fafc', // Tailwind slate-50
            borderRadius: 8, // Modern rounded corners
            fontFamily: "'Inter', sans-serif",
          },
          components: {
            Menu: {
              itemActiveBg: '#065f46', // emerald-800
              itemSelectedColor: '#34d399', // emerald-400
            },
            Table: {
              headerBg: '#1e293b', // slate-800
              rowHoverBg: 'rgba(51, 65, 85, 0.5)', // slate-700 with opacity
              colorTextHeading: '#94a3b8', // slate-400
              fontWeightStrong: 600,
            },
            Button: {
              colorPrimary: '#10b981', // emerald-500
              colorPrimaryHover: '#059669', // emerald-600
              colorPrimaryActive: '#047857', // emerald-700
              boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)', // Glowing shadow for primary
            },
            Input: {
              colorBorder: '#475569', // slate-600
              hoverBorderColor: '#10b981', // emerald-500
              activeBorderColor: '#10b981', // emerald-500
            },
            Select: {
              colorBorder: '#475569', // slate-600
            }
          },
        }}
      >
        <AppRoutes />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>
);

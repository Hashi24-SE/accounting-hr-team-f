import { ConfigProvider, theme, App as AntdApp } from 'antd';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#10b981',
          colorBgContainer: '#111827',
          colorBgElevated: '#1f2937',
          colorTextBase: '#f3f4f6',
          borderRadius: 8,
          fontFamily: "'DM Sans', 'Inter', 'Segoe UI', sans-serif",
          boxShadowSecondary: '0 8px 30px rgba(0, 0, 0, 0.4)',
        },
        components: {
          Notification: {
            zIndexPopup: 9999,
          },
        },
      }}
    >
      <AntdApp>
        <AppRoutes />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
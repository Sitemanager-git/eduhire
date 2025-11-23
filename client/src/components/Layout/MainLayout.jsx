import React from 'react';
import { Layout } from 'antd';
import Header from './Header';
import Footer from './Footer';
import CookieConsentBanner from '../CookieConsentBanner';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Content style={{ flex: 1 }}>
        {children}
      </Content>
      <Footer />
      <CookieConsentBanner />
    </Layout>
  );
};

export default MainLayout;

import React from 'react';
import { Layout } from 'antd';
import Header from './Header';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content>
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;

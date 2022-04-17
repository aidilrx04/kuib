import AuthProvider from '../components/AuthProvider';
import Navigation from '../components/Navigation';
import '../styles/globals.css';
import Layout from '../components/Layout';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../styles/navigation.scss';
import { SSRProvider } from 'react-bootstrap';
import './_iconLibrary'; // icon library
import NextNProgress from "nextjs-progressbar";


function MyApp( { Component, pageProps } )
{

  const getLayout = Component.getLayout || ( page => <Layout>{ page }</Layout> );

  return (
    <SSRProvider>
      <AuthProvider>
        <NextNProgress height={ 2 } color="#0d6efd" options={ { showSpinner: false, } } />
        { getLayout( <Component { ...pageProps } /> ) }
      </AuthProvider>
    </SSRProvider>
  );
}

export default MyApp;

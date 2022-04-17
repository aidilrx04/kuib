import NextNProgress from "nextjs-progressbar";
import { SSRProvider } from 'react-bootstrap';
import AuthProvider from '../components/AuthProvider';
import Layout from '../components/Layout';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import '../styles/navigation.scss';
import '../util/_iconLibrary'; // icon library


function MyApp({ Component, pageProps }) {

  const getLayout = Component.getLayout || (page => <Layout>{page}</Layout>);

  return (
    <SSRProvider>
      <AuthProvider>
        <NextNProgress height={2} color="#0d6efd" options={{ showSpinner: false, }} />
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </SSRProvider>
  );
}

export default MyApp;

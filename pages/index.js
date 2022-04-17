import axios from 'axios';
import server from '../config/server';
// import styles from '../styles/Home.module.css';
import DisplayKuibList from '../components/DisplayKuibList';


export default function Home( { kuib } )
{
  return (
    <div className='container py-3'>
      <DisplayKuibList kuib={ kuib } />
    </div>
  );
}

export async function getServerSideProps()
{
  const kuib = await axios( `${server}/api/kuib` );

  return {
    props: {
      kuib: kuib.data
    }
  };
}
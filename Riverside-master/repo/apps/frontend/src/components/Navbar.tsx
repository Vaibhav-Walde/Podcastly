import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ loggedIn = false }: { loggedIn?: boolean }) {
  const navigate = useNavigate();
  return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:100,height:68,
      display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 2rem',
      background:'rgba(5,5,5,0.92)',backdropFilter:'blur(24px)',borderBottom:'1px solid var(--border)',
    }}>
      <Link to="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
        <div style={{position:'relative',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'absolute',width:36,height:36,borderRadius:8,background:'var(--red)',opacity:0.15,animation:'pulse 2s ease-in-out infinite'}}/>
          <div style={{width:28,height:28,borderRadius:6,background:'var(--red)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1}}>
            <div style={{width:9,height:9,borderRadius:'50%',background:'white',boxShadow:'0 0 8px rgba(255,255,255,0.8)'}}/>
          </div>
        </div>
        <span style={{fontFamily:'var(--font-display)',fontSize:'1.6rem',letterSpacing:'0.06em',color:'var(--text)'}}>PODCASTLY</span>
        <div style={{padding:'2px 8px',borderRadius:4,background:'var(--red-dim)',border:'1px solid rgba(255,45,59,0.3)',fontFamily:'var(--font-mono)',fontSize:'0.6rem',letterSpacing:'0.1em',color:'var(--red)',display:'flex',alignItems:'center',gap:5}}>
          <div style={{width:5,height:5,borderRadius:'50%',background:'var(--red)',animation:'blink 1.4s ease-in-out infinite'}}/>
          LIVE
        </div>
      </Link>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        {loggedIn ? (<>
          <NavLk to="/dashboard">Dashboard</NavLk>
          <NavLk to="/createSession">New Session</NavLk>
          <button onClick={()=>{localStorage.removeItem('JWT');navigate('/')}} style={{padding:'8px 20px',borderRadius:6,background:'transparent',color:'var(--muted)',border:'1px solid var(--border2)',fontSize:'0.82rem',cursor:'pointer',fontFamily:'var(--font-body)'}}>Sign Out</button>
        </>) : (<>
          <NavLk to="/login">Sign In</NavLk>
          <Link to="/signup" style={{padding:'8px 20px',borderRadius:6,background:'var(--red)',color:'white',fontSize:'0.82rem',fontWeight:500,textDecoration:'none',fontFamily:'var(--font-body)',display:'inline-block'}}>Get Started →</Link>
        </>)}
      </div>
    </nav>
  );
}

function NavLk({to,children}:{to:string,children:React.ReactNode}){
  return <Link to={to} style={{padding:'7px 14px',borderRadius:6,fontSize:'0.82rem',color:'var(--muted)',textDecoration:'none',fontFamily:'var(--font-body)'}}>{children}</Link>;
}

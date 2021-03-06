class Home extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    componentDidMount() {
        if (getCookie('username')) {
            this.setState({username: getCookie('username'), loggedIn: true});
        }
    }
    render() {
        if (this.state.loggedIn) {
            return (
                <div>
                    <TopBar />
                    <div className="welcome-box">
                        <h1 style={{marginBottom: '15px', color: '#915AC5'}}>Hi, {this.state.username}!</h1>
                        <br/>
                        <p>click the plus to make a party</p>
                        <br/>
                        <p>or enter a code to join below</p>
                        <br/>
                        <Functions />
                    </div>
                </div> 
            );
        }
        else {
            return (
		<div>
		    <TopBar left='none' />
		    <div className='center'>
			<h1 style={{color: 'white', fontSize: '40px'}}>Welcome to spotify party!</h1>
			<LoginButton className='noselect' text='Log in with Spotify' />
		    </div>
		</div>
            );
        }
    }
}

ReactDOM.render(
    <Home />,
    document.getElementById('home-mount-point')
);

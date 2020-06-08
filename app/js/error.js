class ErrorPage extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    componentDidMount() {
        if (getCookie('username')){
            this.setState({loggedIn: true});
        }
    }
    render () {
        if (!this.state.loggedIn) {
            return <TopBar left="login" />
        }
        return (
            <TopBar />
        );
    }
}

ReactDOM.render(
    <ErrorPage />,
    document.getElementById('error-mount-point')
);

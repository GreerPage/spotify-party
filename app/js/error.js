class ErrorPage extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    render () {
	return (
	    <TopBar />
	);
    }
}

ReactDOM.render(
    <ErrorPage />,
    document.getElementById('error-mount-point')
);

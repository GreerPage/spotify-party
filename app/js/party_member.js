class PartyOwner extends React.Component {
    constructor() {
        super();
        this.state = {token: getCookie('token')};
    }
    componentDidMount() {
        document.cookie='party_id='+window.location.pathname.replace('/party/', '');
    }
    render() {
        return (
            <TopBar left='leave' />
        )
    }
}

ReactDOM.render(
    <PartyOwner />,
    document.getElementById('party-mount-point')
);
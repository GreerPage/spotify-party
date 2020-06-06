class PartyMember extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.token = getCookie('token');
        this.server = io();
    }
    updateListening(data) {
        if (!data.playing) {
            fetch('https://api.spotify.com/v1/me/player/pause', {
                method: 'PUT',
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            })
                .then((res) => res.text())
                .then((dat) => {
                    if (dat != '') {
                        let data1 = JSON.parse(dat);
                        if (data1.error) {
                            if (data1.error.status === 401){
                                if (data1.error.message === 'The access token expired') {
                                    console.log('refreshing token')
                                    refreshToken().then(t => {
                                        this.token = t;
                                        this.updateListening(data);
                                    });
                                    
                                }
                            }
                        }  
    
                    }
                });
        }
        else {
            let bodyData = {uris: [data.song_uri], position_ms: data.time}
            fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.token
                },
                body: JSON.stringify(bodyData)
            })
                .then((res) => res.text())
                .then((dat) => {
                    if (dat != '') {
                        let data1 = JSON.parse(dat);
                        if (data1.error) {
                            if (data1.error.status === 401){
                                if (data1.error.message === 'The access token expired') {
                                    console.log('refreshing token')
                                    refreshToken().then(t => {
                                        this.token = t;
                                        this.updateListening(data);
                                    });
                                    
                                }
                            }
                        }  
    
                    }
                });
        }
    }
    componentDidMount() {
        document.cookie='party_id='+window.location.pathname.replace('/party/', '');
        this.server.on('connect', () => {
            this.server.emit('join', {username: getCookie('username'), party_id: getCookie('party_id')});
            console.log('joined party');
        });
        this.server.on('update', (data) => {
            console.log('updating', data);
            this.updateListening(data);
        });
        window.onbeforeunload = () => {
            this.leave();
        }
    }
    leave() {
        this.server.emit('leave', {username: getCookie('username'), party_id: getCookie('party_id')});
        console.log('left party')
        delete_cookie('party_id');
    }
    button() {
        return <a href="/" id="logout-link" onClick={() => this.leave()}>leave party</a>
    }
    render() {
        return (
            <TopBar left='leave' elem={this.button()} />
        )
    }
}

ReactDOM.render(
    <PartyMember />,
    document.getElementById('party-mount-point')
);
class PartyMember extends React.Component {
    constructor() {
        super();
        this.state = {members: [getCookie('username')]};
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
                                if (data1.error.message === 'The access token expired' || data.error.message === 'Invalid access token') {
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
                                if (data1.error.message === 'The access token expired' || data.error.message === 'Invalid access token') {
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
        this.server.on('join', (data) => {
            if (data.username != getCookie('username')) {
                console.log(data.username + ' joined the party');
            }
            this.setState({members: data.members, owner: data.owner});
        });
        this.server.on('leave', (data) => {
            console.log(data.username + ' left the party')
            this.setState({members: data.members, owner: data.owner});
        });
        this.server.on('update', (data) => {
            console.log('updating', data);
            this.updateListening(data);
            this.setState({cover: data.cover, name: data.name, artist: data.artist});
        });
        this.server
        window.onbeforeunload = () => {
            this.leave();
        }
    }
    leave() {
        this.server.emit('leave', {username: getCookie('username'), party_id: getCookie('party_id')});
        console.log('left party');
        delete_cookie('party_id');
        window.location.pathname = '/';
    }
    button() {
        return <a href="#" id="logout-link" onClick={() => this.leave()}>leave party</a>
    }
    render() {
        return (
            <div>
                <TopBar left='leave' elem={this.button()} />
                <div className="party-info-container">
                    <Playing cover={this.state.cover} name={this.state.name} artist={this.state.artist} />
                    <MemberList members={this.state.members} owner={this.state.owner} />
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <PartyMember />,
    document.getElementById('party-mount-point')
);
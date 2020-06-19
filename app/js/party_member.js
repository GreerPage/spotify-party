class PartyMember extends React.Component {
    constructor() {
        super();
        this.state = {members: [getCookie('username')], songLoaded: false, membersLoaded: false};
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
                        this.checkForErrors(data, data1);
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
                        this.checkForErrors(data, data1);
                    }
                });
        }
    }
    checkForErrors(data, data1) {
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
            if (data1.error.reason) {
                if (data1.error.reason === "NO_ACTIVE_DEVICE") {
                    console.log('error: no active device');
                    this.setState({error: 'Error: no active device!!!', errorSub: 'open a Spotify client and start playing a track, then refresh!'});
                    return;
                }
                if (data1.errr.reason !== "NO_ACTIVE_DEVICE") {
                    this.setState({error: null, errorSub: null});
                    return;
                }
            }
        }
    }
    componentDidMount() {
        if (!this.token) {
            refreshToken().then(t => {
                this.token = t;
            });
        }
        document.cookie='party_id='+window.location.pathname.replace('/party/', '');
        this.server.on('connect', () => {
            this.server.emit('join', {username: getCookie('username'), party_id: getCookie('party_id')});
            console.log('joined party');
        });
        this.server.on('join', (data) => {
            if (data.username != getCookie('username')) {
                console.log(data.username + ' joined the party');
            }
            this.setState({members: data.members, membersLoaded: true});
        });
        this.server.on('leave', (data) => {
            console.log(data.username + ' left the party')
            this.setState({members: data.members, membersLoaded: true});
        });
        this.server.on('update', (data) => {
            if (data.user) {
                if (data.user === getCookie('username')) {
                    console.log('updating', data);
                    this.updateListening(data);
                    this.setState({cover: data.cover, song: data.song, artists: data.artists, songLoaded: true});
                    return;
                }
                else {
                    return;
                }
            }
            console.log('updating', data);
            this.updateListening(data);
            this.setState({cover: data.cover, song: data.song, artists: data.artists, songLoaded: true});
        });
        this.server.on('end', (data) => {
            console.log(data);
            this.setState({over: true});
        });
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
        return <a href="/" id="logout-link" onClick={() => this.leave()}>leave party</a>
    }
    render() {
        if (!this.state.over) {
            return (
                <div>
                    <TopBar left='leave' elem={this.button()} />
                    <div className="party-info-container">
                        {this.state.error ? 
                            <PartyError error={this.state.error} sub={this.state.errorSub} />
                            :
                            <Playing cover={this.state.cover} song={this.state.song} artists={this.state.artists} loaded={this.state.songLoaded} />
                        }
                        <MemberList members={this.state.members} loaded={this.state.membersLoaded} />
                    </div>
                </div>
            );
        }
        return (
            <div>    
                <TopBar left='leave' elem={this.button()} />
                <div className="center" style={{fontSize: '25px', color: 'white'}}>
                    This party has been ended by the owner 
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <PartyMember />,
    document.getElementById('party-mount-point')
);
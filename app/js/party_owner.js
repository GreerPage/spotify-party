class PartyOwner extends React.Component {
    constructor() {
        super();
        this.state = {members: [getCookie('username')], songLoaded: false, membersLoaded: false};
        this.token = getCookie('token')
    }
    updateListening() {
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {
            Authorization: 'Bearer ' + this.token
        }})
            .then(res =>  {
                if (res.status === 204) {
                    console.log('error: no active device');
                    this.setState({error: 'Error: no active device!!!', errorSub: 'open a spotify client and start playing a track!'});
                    return null;
                }
                else {    
                    if (this.state.error) {
                        this.setState({error: null, errorSub: null});
                        return this.getListening();
                    }
                    return res.json();
                }
            })
            .then(data => {
                if (!data) {
                    return;
                }
                if (data.error) {
                    if (data.error.status === 401){
                        if (data.error.message === 'The access token expired' || data.error.message === 'Invalid access token'){
                            console.log('refreshing token');
                            refreshToken().then(t => {
                                this.token = t;
                                this.updateListening();
                                console.log('token rereshed');
                            });
                            return;
                        }
                    }
                    if (data.error.message === 'Only valid bearer authentication supported') {
                        console.log('refreshing token');
                        refreshToken().then(t => {
                            this.token = t;
                            this.updateListening();
                            console.log('token rereshed');
                        });
                        return;
                    }
                }
                if(!this.data) {
                    this.data = data;
                }
                if (this.data.item.uri != data.item.uri) {
                    console.log('new', data);
                    data.party_id = getCookie('party_id');
                    data.party_key = getCookie('party_key');
                    this.server.emit('update', data)
                    this.data = data;
                    this.setPlaying(data);
                }
                else if (this.data.is_playing != data.is_playing) {
                    console.log('pause/play', data);
                    data.party_id = getCookie('party_id');
                    data.party_key = getCookie('party_key');
                    this.server.emit('update', data)
                    this.data = data;
                }
                else if (Math.round(data.progress_ms/1000) > Math.round(this.data.progress_ms/1000)+6) {
                    let today = new Date();
                    let h = today.getHours()*3600;
                    let s = today.getMinutes()*60;
                    var new_time =  h + s + today.getSeconds();
                    let elapsed = new_time - this.time;
                    let skip = Math.round(data.progress_ms/1000) - Math.round(this.data.progress_ms/1000);
                    if (skip > elapsed+1) {
                        console.log('forward', data);
                        console.log(skip, elapsed);
                        data.party_id = getCookie('party_id');
                        data.party_key = getCookie('party_key');
                        this.server.emit('update', data)
                    }
                    this.data = data;
                    this.time = new_time;
                }
                else if (data.progress_ms < this.data.progress_ms-2000) {
                    console.log('back', data);
                    data.party_id = getCookie('party_id');
                    data.party_key = getCookie('party_key');
                    this.server.emit('update', data);
                    this.data = data;
                }
                if (!this.state.song) {
                    this.setPlaying(data);
                }
                this.data = data;
            });
    }
    getListening(user) {
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {
            Authorization: 'Bearer ' + this.token
        }})
            .then(res => {
                    if (res.status === 204) {
                        console.log('error: no active device');
                        this.setState({error: 'Error: no active device!!!', errorSub: 'open a spotify client and start playing a track!'});
                        return null;
                    }
                    else {    
                        return res.json();
                    }
                })
            .then(data =>{
                if (!data) {
                    return
                }
                if (data.error) {
                    if (data.error.status === 401){
                        if (data.error.message === 'The access token expired' || data.error.message === 'Invalid access token'){
                            console.log('refreshing token');
                            refreshToken().then(t => {
                                this.token = t;
                                this.updateListening();
                                console.log('token refreshed');
                            });
                            return;
                        }
                    }
                }
                console.log('new', data);
                data.party_id = getCookie('party_id');
                data.party_key = getCookie('party_key');
                if (user) {
                    data.user = user;
                }
                this.data = data;
                this.server.emit('update', data);
                this.setPlaying(data);
            });
    }
    setPlaying(data) {
        let artists = [];
        let a = data.item.artists;
        for(i=0; i < a.length; i++) {
            artists.push({name: a[i].name, link: a[i].external_urls.spotify});
        }
        this.setState({
            cover: {img: data.item.album.images[1].url, link: data.item.album.external_urls.spotify}, 
            song: {name: data.item.name, link: data.item.album.external_urls.spotify + '?highlight=' + data.item.uri}, 
            artists: artists,
            songLoaded: true
        });
    }
    componentDidMount() {
        if (!getCookie('username')) {
            let p = window.location.pathname;
            window.location.pathname = '/login?redirect=' + p;
        }
        this.server = io();
        this.server.on('connect', () => console.log('connected'))
        this.server.on('join', (data) => {
            if (data.username != getCookie('username')) {
                console.log(data.username + ' joined your party');
                this.getListening(data.username);
            }
            this.setState({members: data.members, membersLoaded: true});
        });
        this.server.on('leave', (data) => {
            if (data.username != getCookie('username')) {
                console.log(data.username + ' left your party');
                this.setState({members: data.members, membersLoaded: true});
            }
        });
        this.server.emit('join', {username: getCookie('username'), party_id: getCookie('party_id')})
        let today = new Date();
        let h = today.getHours()*3600;
        let s = today.getMinutes()*60;
        this.time =  h + s + today.getSeconds();
        this.getListening();
        this.i = setInterval(() => {
            this.updateListening();
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.i);
    }
    
    end() {
        this.server.emit('end', {party_id: getCookie('party_id'), key: getCookie('party_key')});
    }
    render() {
        return (
            <div>
                <TopBar left='end'>
                    <a href={`/end/${window.location.pathname.replace('/party/', '')}`} onClick={() => this.end()} id="logout-link">end party</a>;
                </TopBar>
                <div className="party-info-container">
                    {this.state.error ? 
                        <PartyError error={this.state.error} sub={this.state.errorSub} />
                        :
                        <Playing cover={this.state.cover} song={this.state.song} artists={this.state.artists} loaded={this.state.songLoaded} />
                    }
                    <MemberList members={this.state.members} loaded={this.state.membersLoaded} />
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <PartyOwner />,
    document.getElementById('party-mount-point')
);
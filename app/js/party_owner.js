class PartyOwner extends React.Component {
    constructor() {
        super();
        this.state = {members: [getCookie('username')]};
        this.token = getCookie('token')
    }
    updateListening() {
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {
            Authorization: 'Bearer ' + this.token
        }})
            .then(res =>  res.json())
            .then(data =>{
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
                }
                if (!this.data) {
                    this.data = data;
                }
                if (this.data.item.uri != data.item.uri) {
                    console.log('new', data);
                    data.party_id = getCookie('party_id');
                    data.party_key = getCookie('party_key');
                    this.server.emit('update', data)
                    this.data = data;
                    this.setState({cover: data.item.album.images[1].url, name: data.item.name, artist: data.item.album.artists[0].name});
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
                    this.server.emit('update', data)
                    this.data = data;
                }
                if (!this.state.name) {
                    this.setState({cover: data.item.album.images[1].url, name: data.item.name, artist: data.item.album.artists[0].name});
                }
            })
    }
    getListening() {
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {
            Authorization: 'Bearer ' + this.token
        }})
            .then(res =>  res.json())
            .then(data =>{
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
                this.server.emit('update', data);
                this.setState({cover: data.item.album.images[1].url, name: data.item.name, artist: data.item.album.artists[0].name});
            });
    }
    componentDidMount() {
        this.server = io();
        this.server.on('connect', () => console.log('connected'))
        this.server.on('join', (data) => {
            if (data.username != getCookie('username')) {
                console.log(data.username + ' joined your party');
                this.getListening();
            }
            this.setState({members: data.members, owner: data.owner});
        });
        this.server.on('leave', (data) => {
            if (data.username != getCookie('username')) {
                console.log(data.username + ' left your party');
                this.setState({members: data.members, owner: data.owner});
            }
        });
        this.server.emit('join', {username: getCookie('username'), party_id: getCookie('party_id')})
        let today = new Date();
        let h = today.getHours()*3600;
        let s = today.getMinutes()*60;
        this.time =  h + s + today.getSeconds();
        this.i = setInterval(() => {
            this.updateListening();
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.i);
    }
    render() {
        return (
            <div>
                <TopBar left='end' />
                <div className="party-info-container">
                    
                    <MemberList members={this.state.members} owner={this.state.owner} />
                </div>
            </div>
        )
    }
}
//<Playing cover={this.state.cover} name={this.state.name} artist={this.state.artist} />
ReactDOM.render(
    <PartyOwner />,
    document.getElementById('party-mount-point')
);
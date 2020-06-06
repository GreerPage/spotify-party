class PartyOwner extends React.Component {
    constructor() {
        super();
        this.state = {token: getCookie('token')};
    }
    getListening() {
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {
            Authorization: 'Bearer ' + this.state.token
        }})
            .then(res =>  res.json())
            .then(data =>{
                if (data.error) {
                    if (data.error.status === 401){
                        if (data.error.message === 'The access token expired'){
                            console.log('refreshing token')
                            refreshToken().then(t => this.setState({token: t}));
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
            })
    }
    componentDidMount() {
        this.server = io();
        this.server.on('connect', () => console.log('connected'))
        this.server.on('join', (data) => {
            if (data.username != getCookie('username')) {
                console.log(data.username + ' joined your party');
            }
        })
        this.server.emit('join', {username: getCookie('username'), party_id: getCookie('party_id')})
        let today = new Date();
        let h = today.getHours()*3600;
        let s = today.getMinutes()*60;
        this.time =  h + s + today.getSeconds();
        this.getListening();
        this.i = setInterval(() => {
            this.getListening();
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.i);
    }
    render() {
        return (
            <TopBar left='end' />
        )
    }
}

ReactDOM.render(
    <PartyOwner />,
    document.getElementById('party-mount-point')
);
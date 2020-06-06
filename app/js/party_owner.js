class PartyOwner extends React.Component {
    constructor() {
        super();
        this.state = {token: getCookie('token')};
    }
    getListening() {
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {
            Authorization: 'Bearer ' + this.state.token
        }})
            .then(res => {
                if (res.ok) return res.json();
                else if (res.status === 401) {
                    throw Error(`Request rejected with status ${res.status}`);
                }
            })
            .then(data =>{
                if (!this.data) {
                    this.data = data;
                }
                var server = this.server
                if (this.data.item.uri != data.item.uri) {
                    var server = new WebSocket('ws://127.0.0.1:8765');
                    console.log('new', data);
                    data.party_id = getCookie('party_id');
                    data.party_key = getCookie('party_key');
                    server.onopen = () => {
                        server.send(JSON.stringify(data));
                        server.close();
                    }
                    this.data = data;
                }
                else if (this.data.is_playing != data.is_playing) {
                    var server = new WebSocket('ws://127.0.0.1:8765');
                    console.log('pause/play', data);
                    data.party_id = getCookie('party_id');
                    data.party_key = getCookie('party_key');
                    server.onopen = () => {
                        server.send(JSON.stringify(data));
                        server.close();
                    }
                    this.data = data;
                }
                else if (Math.round(data.progress_ms/1000) > Math.round(this.data.progress_ms/1000)+6) {
                    let today = new Date();
                    let h = today.getHours()*3600
                    let s = today.getMinutes()*60
                    var new_time =  h + s + today.getSeconds();
                    let elapsed = new_time - this.time;
                    let skip = Math.round(data.progress_ms/1000) - Math.round(this.data.progress_ms/1000);
                    if (skip > elapsed) {
                        var server = new WebSocket('ws://127.0.0.1:8765');
                        console.log('forward', data);
                        console.log(skip, elapsed);
                        data.party_id = getCookie('party_id');
                        data.party_key = getCookie('party_key');
                        server.onopen = () => {
                            server.send(JSON.stringify(data));
                            server.close();
                        }
                    }
                    this.data = data;
                    this.time = new_time;
                }
                else if (data.progress_ms < this.data.progress_ms-2000) {
                    var server = new WebSocket('ws://127.0.0.1:8765');
                    console.log('back', data);
                    data.party_id = getCookie('party_id');
                    data.party_key = getCookie('party_key');
                    server.onopen = () => {
                        server.send(JSON.stringify(data));
                        server.close();
                    }
                    this.data = data;
                }
            })
            .catch(() => {
                refreshToken().then(t => this.setState({token: t}));
            });
    }
    componentDidMount() {
        let today = new Date();
        let h = today.getHours()*3600
        let s = today.getMinutes()*60
        this.time =  h + s + today.getSeconds();
        this.getListening();
        this.i = setInterval(() => {
            this.getListening();
        }, 1000);
    }
    componentDidUpdate() {
        this.i = setInterval(() => {
            this.getListening();
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.i)
        this.server.close()
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
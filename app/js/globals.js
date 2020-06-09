function InviteButton() {
    return <span onClick={() => document.getElementById("invite-dropdown").classList.toggle("show")} className="noselect invite-button">+</span>
}

function InviteDropdown() {
	return (
	    <div id="invite-dropdown" className="dropdown-content">
		<input id="link-input" value={"https://" + window.location.hostname + "/party/" + getCookie("party_id")}></input>
		<div onClick={() => {
		    document.getElementById("link-input").select();
		    document.execCommand("copy");
		}}
		className="copy-button"><img className="copy-img" src="/static/images/copy.png"></img><span>Copy</span></div>
	    </div>
	);
}

function CreateButton() {
    return <a className="create-button" href='/create'>+</a>;
}

class JoinBox extends React.Component {
    constructor () {
        super();
        this.state = {};
    }
    enterPressed(event) {
        var code = event.keyCode || event.which;
        if(code === 13) { 
            window.location.pathname = '/party/' + this.state.code;
        } 
    }
    updateCode(event) {
        this.setState({code: event.target.value});
    }
    render() {
        return (
            <span>
                <input onChange={this.updateCode.bind(this)} onKeyPress={this.enterPressed.bind(this)} placeholder="Enter a code" className="code-box"/>
            </span>
        );
    }
}

function LoginButton(props) {
    if (props.redirect) {
        return <a className="login-button" href={`/login?redirect=${props.redirect}`}>{props.text}</a>;
    }
    let link = getCookie('link');
    delete_cookie('link');
    return <a className="login-button" href={link}>{props.text}</a>;
}

function TopBar(props) {
    if (!props.left) {
        var left = <a href="/logout" id="logout-link">logout</a>;
    }
    if (props.left === 'login') {
        var left = <a href="/login" id="logout-link">login</a>;
    }
    if (props.left === 'leave') {
        var left = props.elem;
    }
    if (props.left === 'end') {
        var left = <a href={`/end/${window.location.pathname.replace('/party/', '')}`} id="logout-link">end party</a>;
    }
    return (
        <div className='topbar'>
            <div>
                <a href='/' id="home-link"><img src="/static/images/icon.png"/></a>
                {left}
            </div>
        </div>
    );
}
function Functions() {
    return (
        <div>
            <CreateButton /> 
            <span style={{display: 'inline-block', width: '20px', height: '20px'}}></span>
            <JoinBox />
        </div>
    );
}
function MemberList(props) {
    var members = props.members
    var elems = Object.keys(members).map((member) => {
        if (members[member].owner) {
            return (
                <li key={member}><a className="spotify-link" href={members[member].link} target="_blank">{member}</a>
                    <span><img style={{height: '20px', paddingLeft: '10px'}} src="/static/images/crown.png"/></span>
                </li>
            );
        }
        return <li key={member}><a className="spotify-link" href={members[member].link} target="_blank">{member}</a></li>;
    });
    return (
        <div className="member-container">
	    <div className="dropdown">
		<InviteButton />
		<InviteDropdown />
	    </div>
            <h2 style={{color: 'white'}}>Members:</h2>
            <ul className="member-list">
                {elems}
            </ul>
        </div>
    );
}
function Playing(props) {
    var cover = props.cover;
    var song = props.song;
    var artists = props.artists;
    if (props.loaded){
        return (
            <div className="playing-display">
                <h2 style={{color: 'white'}}>Currently playing:</h2>
                <Cover cover={cover} />
                <SongTitle song={song} />
                <Artists artists={artists} />
            </div>
        );
    }
    return <div className="playing-display"/>;
}
function Cover(props) {
    return (
        <a href={props.cover.link} target="_blank">
            <img style={{borderRadius: '10px'}} src={props.cover.img}/>
        </a>
    );
}
function SongTitle(props) {
    return (
        <a href={props.song.link} target="_blank" className="spotify-link">
            <h3>{props.song.name}</h3>
        </a>
    );
}
function Artists(props) {
    return (
        <div>
            {props.artists.map((val, i) => {
                if (i===props.artists.length-1) {
                    return <Artist key={i} link={val.link} name={val.name} />
                }
                return (<span><Artist key={i} link={val.link} name={val.name} /><span style={{color: 'white'}}>{', '}</span></span>);
            })}
        </div>
    );
}

function Artist(props) {
    return (
        <span>
            <a className="spotify-link" href={props.link} target="_blank">{props.name}</a>
        </span>
    );
}

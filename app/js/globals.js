function InviteButton() {
    return <span onClick={() => document.getElementById("invite-dropdown").classList.toggle("show")} className="noselect invite-button">+</span>
}

function InviteDropdown() {
	return (
	    <div id="invite-dropdown" className="dropdown-content">
            <input spellCheck="false" readOnly={true} id="link-input" value={location.protocol + "//" + window.location.hostname + "/party/" + getCookie("party_id")}></input>
            <div onClick={() => {
                document.getElementById("link-input").select();
                document.execCommand("copy");
            }}
            className="copy-button"><img className="copy-img" src="/static/images/copy.png"></img><span>Copy</span></div>
	    </div>
	);
}

function CreateButton() {
    return <a className="create-button noselect" href='/create'>+</a>;
}

class JoinBox extends React.Component {
    constructor () {
        super();
        this.state = {classes: 'noselect hidden'};
    }
    enterPressed(event) {
        var code = event.keyCode || event.which;
        if(code === 13) { 
            this.submit();
        } 
    }
    submit() {
        if (this.state.code) {    
            window.location.pathname = '/party/' + this.state.code;
        }
    }
    updateCode(event) {
        if (event.target.value){  
            this.setState({code: event.target.value, classes: 'noselect'});
        }
        else {
            this.setState({code: null, classes: 'noselect hidden'});
        }
    }
    render() {
        return (
            <span>
                <input onChange={this.updateCode.bind(this)} onKeyPress={this.enterPressed.bind(this)} placeholder="Enter a code" className="code-box"/>
                <span id="join-button" className={this.state.classes} onClick={() => this.submit()}>join</span>
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
    if (props.left === 'none') {
	    var left = <span></span>
    }
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
        var left = <a href={`/end/${window.location.pathname.replace('/party/', '')}`} onClick={() => props.func()} id="logout-link">end party</a>;
    }
    if (props.children) {
        var left = props.children[0];
    }
    return (
        <div className='topbar noselect'>
            <div>
                <a href='/' id="home-link"><img draggable={false} src="/static/images/icon.png"/></a>
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
    var members = props.members;
    if (props.loaded) {
        elems = <Members members={members} />;
    }
    else {
        elems = <ul className="member-list"><li>loading...</li></ul>
    }
    return (
        <div className="member-container">
            <div className="dropdown">
                <InviteButton />
                <InviteDropdown />
            </div>
            <h2 className="noselect" style={{color: 'white'}}>Members:</h2>
            <div className="member-list-container custom-scrollbar">
                {elems}
            </div>
        </div>
    );
}

function Members(props) {
    var members = props.members;
    var elems = Object.keys(members).map((member) => {
        return <Member key={member} name={member} link={members[member].link} owner={members[member].owner} />
    });
    return (
        <ul className="member-list">
           {elems}
        </ul>
    );
}
function Member(props) {
    if (props.owner) {
        return (
            <li key={props.name}><a className="spotify-link" href={props.link} target="_blank">{props.name}</a>
                <span><img className="noselect" style={{height: '20px', marginLeft: '10px'}} draggable={false} src="/static/images/crown.png"/></span>
            </li>
        );
    }
    return <li key={props.name}><a className="spotify-link" href={props.link} target="_blank">{props.name}</a></li>;
}

function Playing(props) {
    var cover = props.cover;
    var song = props.song;
    var artists = props.artists;
    if (props.loaded){
        return (
            <div className="playing-display">
                <h2 className="noselect" style={{color: 'white'}}>Currently playing:</h2>
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
            <img className="noselect" style={{borderRadius: '10px'}} src={props.cover.img} draggable={false}/>
        </a>
    );
}
function SongTitle(props) {
    return (
        <h3>
            <a href={props.song.link} target="_blank" className="spotify-link" style={{width: 'fit-content'}}>
                {props.song.name}
            </a>
        </h3>
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
function PartyError(props) {
    return (
        <div className="playing-display">
            <img id="cat-gif" src="/static/images/cat.gif"/>
            <h3 style={{color: 'white'}}>{props.error}</h3>
            <p style={{color: 'white'}}>{props.sub}</p>
        </div>
    );
}

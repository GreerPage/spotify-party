function CreateButton() {
    return <a className="create-button" href='/create'>+</a>;
}

function JoinBox() {
    return (
        <span>
            <input placeholder="enter a code" className="code-box"/>
        </span>
    )
}

function LoginButton(props) {
    if (props.redirect) {
        return <a className="login-button" href={`/login?redirect=${props.redirect}`}>{props.text}</a>
    }
    if (props.submit) {
        let link = getCookie('link').replace('"', '').replace('"', '')
        delete_cookie('link')
        return <a className="login-button" href={link}>{props.text}</a>
    }
    return <a className="login-button" href="/login">{props.text}</a>
}
function TopBar(props) {
    if (!props.left) {
        var left = <a href="/logout" id="logout-link">logout</a>
    }
    if (props.left === 'leave') {
        var left = props.elem
    }
    if (props.left === 'end') {
        var left = <a href={`/end/${window.location.pathname.replace('/party/', '')}`} id="logout-link">end party</a>
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
    )
}
function MemberList(props) {
    var members = props.members
    var elems = members.map((member) => {
        if (member === props.owner){
            return <li key={member}>{member} <span><img style={{height: '20px', paddingLeft: '10px'}} src="/static/images/crown.png"/></span></li>;
        }
        return <li key={member}>{member}</li>;
    });
    return (
        <div className="member-container">
            <h2 style={{color: 'white'}}>Members:</h2>
            <ul className="member-list">
                {elems}
            </ul>
        </div>
    )
}
function Playing(props) {
    var cover = props.cover;
    var name = props.name;
    var artist = props.artist;
    return (
        <div className="playing-display">
            <h2 style={{color: 'white'}}>Currently playing:</h2>
            <Cover url={cover} />
            <Name name={name} />
            <Artist artist={artist} />
        </div>
    )
}
function Cover(props) {
    return <img style={{borderRadius: '10px'}} src={props.url}/>
}
function Name(props) {
    return <h3 style={{color: 'white'}}>{props.name}</h3>
}
function Artist(props) {
    return <p style={{color: 'white'}}>{props.artist}</p>
}
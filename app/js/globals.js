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
        var left = <a href="/" id="logout-link" onClick={() => delete_cookie('party_id')}>leave party</a>
    }
    if (props.left === 'end') {
        var left = <a href={`/end/${window.location.pathname.replace('/party/', '')}`} id="logout-link">end party</a>
    }
    return (
        <div className='topbar'>
            <div>
                <a href="/" id="home-link"><img src="/static/images/icon.png"/></a>
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
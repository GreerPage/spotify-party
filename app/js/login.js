function Login() {
    return (
        <div className='center'>
            <LoginButton text="Log in with Spotify" />
        </div>
    );
}
ReactDOM.render(
    <Login />,
    document.getElementById('login-mount-point')
);
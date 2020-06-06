function Login() {
    return (
        <div className='center'>
            <LoginButton text="login with spotify" submit={true} />
        </div>
    );
}

ReactDOM.render(
    <Login />,
    document.getElementById('login-mount-point')
);
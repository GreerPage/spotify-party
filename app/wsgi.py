try:
    from .app import socketio as application
except:
    from app import socketio as application
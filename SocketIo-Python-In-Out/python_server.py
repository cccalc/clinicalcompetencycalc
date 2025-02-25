import socketio
import eventlet
import threading

sio = socketio.Client()
server_sio = socketio.Server()
app = socketio.WSGIApp(server_sio)

connected = threading.Event()

@sio.event
def connect():
    print('connection established')
    connected.set() 

@sio.event
def message(data):
    print('\nmessage from Node.js server:', data)
    print('Enter a message: ', end='', flush=True)

@sio.event
def disconnect():
    print('disconnected from server')
    connected.clear()  

@server_sio.event
def connect(sid, environ):
    print('Node.js server connected')

@server_sio.event
def message(sid, data):
    print('\nmessage from Node.js server:', data)
    connected.wait()  
    sio.emit('message', data)
    print('Enter a message: ', end='', flush=True)

def send_message():
    while True:
        message = input('Enter a message: ')
        connected.wait()  
        sio.emit('message', message)

if __name__ == '__main__':
    threading.Thread(target=send_message).start()
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
    sio.connect('http://localhost:3000')
    sio.wait()